import { Request, Response } from "express";
import Session, { LLMModel } from "./session.model.js";
import User from "../user/user.model.js";
import Message from "../message/message.model.js";
import { generateUserSummary } from "../../services/jwt/llm.services.js";

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
  body: {
    model?: "thinking" | "quick";
    pin?: boolean;
  };
}

const mapModelToLLMModel = (model: "thinking" | "quick"): LLMModel => {
  switch (model) {
    case "thinking":
      return "gpt-4o";
    case "quick":
      return "gpt-3.5-turbo";
    default:
      return "gpt-3.5-turbo";
  }
};

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    let { model = "quick" } = req.body;
    const userId = req.user._id;

    // Check for existing empty session
    const existingEmptySession = await Session.findOne({
      userId,
      title: null,
      active: true,
    });

    if (existingEmptySession) {
      // Update the model if it's different
      const newModel = mapModelToLLMModel(model);
      if (existingEmptySession.model !== newModel) {
        existingEmptySession.set("model", newModel);
        await existingEmptySession.save();
      }
      return res.json(existingEmptySession);
    }

    const llmModel = mapModelToLLMModel(model);
    console.log("Creating session with model:", llmModel);

    const session = await Session.create({
      userId,
      model: llmModel,
    });

    const messages = await Message.find({ userId }).sort({ createdAt: 1 });

    // Optional: only use last 50 messages to avoid token overload
    const limitedMessages = messages.slice(-50);

    const allText = limitedMessages
      .map(
        (m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    if (allText.trim().length > 0) {
      const summary = await generateUserSummary(allText, llmModel);

      await User.findByIdAndUpdate(userId, { summary });
      console.log("User profile summary updated");
    } else {
      console.log("Not enough content to generate summary");
    }

    res.json(session);
  } catch (err) {
    console.error("Session creation error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
};

export const getSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({ userId, active: true }).sort({
      createdAt: -1,
    });

    res.json(sessions);
  } catch (err) {
    console.error("Fetching sessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const updateSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.id;
    const { model, pin } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      userId,
      active: true,
    });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (model) session.set("model", mapModelToLLMModel(model));
    if (pin != undefined) session.pin = pin;

    await session.save();

    res.json({ success: true, model: session.model });
  } catch (err) {
    console.error("Update model error:", err);
    res.status(500).json({ error: "Failed to update model" });
  }
};

export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.id;

    const session = await Session.findOne({
      _id: sessionId,
      userId,
      active: true,
    });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Soft delete by setting active to false
    session.active = false;
    await session.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
};
