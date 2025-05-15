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

    // Generate follow-up questions
    const historyText = previousMessages
      .map(
        (m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    const previousQuestions = previousMessages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase());

    const followUps = await generateFollowUpResponse(
      historyText,
      previousQuestions,
      modelToUse
    );

    // 7. Save assistant response
    await Message.create({
      sessionId,
      userId,
      role: "assistant",
      content: botReply,
      followUps,
    });

    // 8. Return
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

export const updateMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { rating, remembered } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only allow updating assistant messages
    if (message.role !== "assistant") {
      return res
        .status(400)
        .json({ message: "Can only update assistant messages" });
    }

    // Update rating if provided
    if (rating !== undefined) {
      if (!["up", "down"].includes(rating)) {
        return res.status(400).json({ message: "Invalid rating value" });
      }
      message.rating = rating;
    }

    // Update remembered status if provided
    if (remembered !== undefined) {
      message.remembered = remembered;
    }

    await message.save();

    res.json({ message: "Message updated successfully" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Error updating message" });
  }
};
