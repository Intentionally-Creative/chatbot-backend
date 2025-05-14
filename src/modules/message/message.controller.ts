import { Request, Response } from "express";
import Message from "./message.model.js";
import Session from "../session/session.model.js";
import {
  generateFollowUpResponse,
  generateResponse,
} from "../../services/jwt/llm.services.js"; // Import the service
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { sessionId, content } = req.body;

    // 1. Check session exists and belongs to user
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // 2. Set title if not already set
    if (!session.title) {
      session.title = content.slice(0, 50);
      await session.save();
    }

    // 3. Save user message
    await Message.create({
      sessionId,
      userId,
      role: "user",
      content,
    });

    // 4. Fetch previous messages
    const previousMessages = await Message.find({ sessionId }).sort({
      createdAt: 1,
    });

    // Format messages for the LLM service
    const context: ChatCompletionMessageParam[] = previousMessages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })
    );

    // 5. Get model from session
    const modelToUse = session.model || "gpt-3.5-turbo";

    // 6. Call the LLM service
    const botReply = await generateResponse(context, modelToUse);

    // 7. Save assistant response
    await Message.create({
      sessionId,
      userId,
      role: "assistant",
      content: botReply,
    });

    // 8. Return reply
    res.json({ reply: botReply });
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.sessionId;

    // 1. Ensure session belongs to user
    const session = await Session.findOne({ _id: sessionId, userId }).lean();
    if (!session) return res.status(404).json({ error: "Session not found" });

    // 2. Fetch latest n messages in order
    const MAX_MESSAGES = 50;
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 }) // chronological
      .limit(MAX_MESSAGES)
      .lean(); // plain objects, not full Mongoose docs

    res.json(messages);
  } catch (err) {
    console.error("Message fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const defaultFollowUps = [
  "How can I optimize my inventory turnover?",
  "What are the best methods for training new employees quickly?",
  "How do I manage staff scheduling during holiday seasons?",
  "What are the best strategies for upselling premium spirits?",
  "How can I track and reduce inventory shrinkage?",
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
      return res
        .status(400)
        .json({ error: "sessionId and user ID are required" });
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

    const historyText = messages
      .map(
        (m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    const previousQuestions = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase());

    const model = "gpt-3.5-turbo";

    const followUps = await generateFollowUpResponse(
      historyText,
      previousQuestions,
      model
    );

    return res.json({ followUps });
  } catch (err) {
    console.error("❌ Error in generateFollowUpQuestions:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate follow-up questions" });
  }
};
