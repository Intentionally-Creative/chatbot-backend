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
  private readonly baseUrl: string;
  private readonly auth: {
    username: string;
    password: string;
  };

  private constructor() {
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

  private getProjectKey(type: TicketType): string {
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
    try {
      const response = await axios.post<JiraIssueResponse>(
        `${this.baseUrl}/rest/api/3/issue`,
        {
          fields: {
            project: {
              key: this.getProjectKey(type),
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
          auth: this.auth,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return {
        id: response.data.id,
        key: response.data.key,
        url: `${envVariables.JIRA_HOST}/browse/${response.data.key}`,
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
