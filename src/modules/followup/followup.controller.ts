import { Request, Response } from "express";
import Session from "../session/session.model.js";
import Message from "../message/message.model.js";
import { generateFollowUpResponse } from "../../services/jwt/llm.services.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

const defaultFollowUps = [
  "How can I optimize my inventory turnover?",
  "What are the best methods for training new employees quickly?",
  "How do I manage staff scheduling during holiday seasons?",
  "What are the best strategies for upselling premium spirits?",
  "How can I track and reduce inventory shrinkage?"
];

/**
 * Generates follow-up questions for a chat session
 * POST /api/followup
 * Body: { sessionId: string }
 */
export const generateFollowUpQuestions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: "sessionId and user ID are required" });
    }

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      console.warn("⚠️ Session not found — returning default follow-ups");
      return res.json({ followUps: defaultFollowUps });
    }

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.json({ followUps: defaultFollowUps });
    }

    const historyText = messages.map((m) =>
      `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`
    ).join("\n");

    const previousQuestions = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase());

    const model = "gpt-3.5-turbo";

    const followUps = await generateFollowUpResponse(historyText, previousQuestions, model);

    return res.json({ followUps });
  } catch (err) {
    console.error("❌ Error in generateFollowUpQuestions:", err);
    return res.status(500).json({ error: "Failed to generate follow-up questions" });
  }
};
