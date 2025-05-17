import axios from "axios";
import { envVariables } from "../../env-config.js";
import { TicketType } from "../../modules/ticket/ticket.model.js";

interface CreateJiraIssueParams {
  type: TicketType;
  subject: string;
  description: string;
  reporter: string;
}

interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
}

export class JiraService {
  private static instance: JiraService;
  private readonly baseUrl: string | undefined;
  private readonly auth: {
    username: string | undefined;
    password: string | undefined;
  };
  private readonly isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = envVariables.NODE_ENV === "development";
    this.baseUrl = envVariables.JIRA_HOST;
    this.auth = {
      username: envVariables.JIRA_EMAIL,
      password: envVariables.JIRA_API_TOKEN,
    };
  }

  public static getInstance(): JiraService {
    if (!JiraService.instance) {
      JiraService.instance = new JiraService();
    }
    return JiraService.instance;
  }

  private getProjectKey(): string {
    return "SUP";
  }

  private getIssueType(type: TicketType): string {
    return type === "support" ? "Task" : "[System] Change";
  }

  async createIssue({
    type,
    subject,
    description,
    reporter,
  }: CreateJiraIssueParams) {
    // In development mode, return a mock response if Jira credentials are missing
    if (
      this.isDevelopment &&
      (!this.baseUrl || !this.auth.username || !this.auth.password)
    ) {
      console.log("Development mode: Returning mock Jira issue response");
      return {
        id: "mock-id",
        key: "MOCK-1",
        url: "https://mock-jira-url/browse/MOCK-1",
      };
    }

    // Ensure all required credentials are available
    if (!this.baseUrl || !this.auth.username || !this.auth.password) {
      throw new Error(
        "Missing Jira configuration. Check your environment variables."
      );
    }

    try {
      const response = await axios.post<JiraIssueResponse>(
        `${this.baseUrl}/rest/api/3/issue`,
        {
          fields: {
            project: {
              key: this.getProjectKey(),
            },
            summary: subject,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: description,
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `\nReported by: ${reporter}`,
                    },
                  ],
                },
              ],
            },
            issuetype: {
              name: this.getIssueType(type),
            },
          },
        },
        {
          auth: {
            username: this.auth.username!,
            password: this.auth.password!,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return {
        id: response.data.id,
        key: response.data.key,
        url: `${this.baseUrl}/browse/${response.data.key}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Jira API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(
          `Failed to create Jira issue: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      console.error("Unexpected error creating Jira issue:", error);
      throw new Error("Failed to create Jira issue due to an unexpected error");
    }
  }
}
