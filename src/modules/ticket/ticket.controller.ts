import { Request, Response } from "express";
import { sendSlackMessage } from "../../lib/slack.js";
import Ticket from "./ticket.model.js";
import { JiraService } from "../../services/jira/jira.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
  };
}

export const createTicket = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { type, subject, message } = req.body;
    const userId = req.user?._id;
    const userEmail = req.user?.email || "Anonymous";

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!type || !subject || !message) {
      return res.status(400).json({
        error: "Type, subject, and message are required",
      });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      userId,
      type,
      subject,
      message,
    });

    // Create Jira issue
    try {
      // TODO: integrate with Jira
      const jiraService = JiraService.getInstance();
      const jiraIssue = await jiraService.createIssue({
        type,
        subject,
        description: message,
        reporter: userEmail,
      });

      // Update ticket with Jira information
      ticket.jiraIssueId = jiraIssue.id;
      ticket.jiraIssueUrl = jiraIssue.url;
      await ticket.save();
    } catch (jiraError) {
      console.error("Failed to create Jira issue:", jiraError);
      // Continue with the response even if Jira creation fails
    }

    // Format the message for Slack
    const slackMessage = `🎫 New ${
      type === "support" ? "Support Ticket" : "Feedback"
    } from ${userEmail}:\nSubject: ${subject}\nMessage: ${message}\nTicket ID: ${
      ticket._id
    }${ticket.jiraIssueUrl ? `\nJira: ${ticket.jiraIssueUrl}` : ""}`;

    // Send to Slack
    await sendSlackMessage(slackMessage);

    res.status(201).json({
      message: `${
        type === "support" ? "Support ticket" : "Feedback"
      } created successfully`,
      ticket,
    });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// export const getTickets = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const userId = req.user?._id;
//     const { type } = req.query;

//     if (!userId) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const query: any = { userId };
//     if (type) {
//       query.type = type;
//     }

//     const tickets = await Ticket.find(query)
//       .sort({ createdAt: -1 })
//       .select("-__v");

//     res.json(tickets);
//   } catch (err) {
//     console.error("Error fetching tickets:", err);
//     res.status(500).json({ error: "Failed to fetch tickets" });
//   }
// };
