import { Request, Response } from "express";
import { OpenAI } from "openai";
import * as fs from "fs";
import Session from "../session/session.model.js";
import Message from "../message/message.model.js";
import axios from "axios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

export const transcribeAudio = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("🔧 Received transcription request");

    const file = req.file;
    const sessionId = req.body.sessionId;
    //const userId = req.user?._id;

    if (!file) {
      console.warn("⚠️ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    const userId = "68151144dd2468d7ca3307aa"

    if (!userId) {
        return res.status(400).json({ error: "user ID is required." });
      }

    console.log(`📦 File received: ${file.originalname} (${file.mimetype})`);
    console.log(`📏 File size: ${file.size} bytes`);

    if (!file.mimetype.startsWith("audio/")) {
      console.warn("⚠️ Invalid file type");
      return res.status(400).json({ error: "Please upload a valid audio file." });
    }

    const filePath = `./tmp-${Date.now()}.webm`;
    fs.writeFileSync(filePath, file.buffer);
    console.log(`💾 Saved temporary file: ${filePath}`);

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(filePath),
    });

    fs.unlinkSync(filePath);
    console.log("🧹 Deleted temporary file");

    const transcribedText = response.text;
    console.log("✅ Transcription success:", transcribedText);

    // 💬 Continue normal chat flow
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: "Session not found or does not belong to user." });
    }

    if (!session.title) {
      session.title = transcribedText.slice(0, 50);
      await session.save();
    }

    await Message.create({
      sessionId,
      userId,
      role: "user",
      content: transcribedText,
    });

    const previousMessages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    const context = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    context.push({ role: "user", content: transcribedText });

    const modelToUse = session.model || "gpt-3.5-turbo";
    const llmResponse = await axios.post("http://127.0.0.1:8000/chat", {
      model: modelToUse,
      messages: context,
    });

    const botReply = llmResponse.data.reply;

    await Message.create({
      sessionId,
      userId,
      role: "assistant",
      content: botReply,
    });

    return res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Transcription error:", error);
    return res.status(500).json({ error: "Transcription and message flow failed." });
  }
};
