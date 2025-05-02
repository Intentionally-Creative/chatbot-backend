import { Request, Response } from "express";
import Session from "./session.model.js";

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
  body: {
    model?: string;
  };
}

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { model } = req.body;
    const userId = req.user._id;

    console.log("Creating session with model:", model);

    const session = await Session.create({
      userId,
      model: model || "gpt-3.5-turbo",
    });

    res.json(session);
  } catch (err) {
    console.error("Session creation error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
};

export const getSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error("Fetching sessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const togglePin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.id;

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.pin = !session.pin;
    await session.save();

    res.json({ success: true, pin: session.pin });
  } catch (err) {
    console.error("Toggle pin error:", err);
    res.status(500).json({ error: "Failed to toggle pin" });
  }
};
