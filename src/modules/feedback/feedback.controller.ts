import { Request, Response } from "express";
import { sendSlackMessage } from "../../lib/slack.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
  };
}

export const submitFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { feedback } = req.body;
    const userEmail = req.user?.email || "Anonymous";

    if (!feedback) {
      return res.status(400).json({ error: "Feedback is required" });
    }

    // Format the message for Slack
    const message = `📝 New Feedback from ${userEmail}:\n${feedback}`;

    // Send to Slack
    await sendSlackMessage(message);

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};
