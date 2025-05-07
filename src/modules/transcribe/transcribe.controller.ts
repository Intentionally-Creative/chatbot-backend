import { Request, Response } from "express";
import { OpenAI } from "openai";
import * as fs from "fs";
import Session from "../session/session.model.js";
import Message from "../message/message.model.js";
import axios from "axios";
import multer from "multer";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

export const transcribeAudio = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("🔧 Received transcription request");

    const file = req.file;
    const sessionId = req.body.sessionId;
    const userId = req.user?._id;

    if (!file) {
      console.warn("⚠️ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!sessionId) {
      console.warn("⚠️ No session ID provided");
      return res.status(400).json({ error: "Session ID is required." });
    }

    if (!userId) {
      console.warn("⚠️ No user ID found in request");
      return res.status(400).json({ error: "User ID is required." });
    }

    console.log(`📦 File received: ${file.originalname} (${file.mimetype})`);
    console.log(`📏 File size: ${file.size} bytes`);

    // Create a temporary file
    const filePath = path.join("/tmp", `audio-${Date.now()}.webm`);
    try {
      fs.writeFileSync(filePath, file.buffer);
      console.log(`💾 Saved temporary file: ${filePath}`);

      // Transcribe the audio using OpenAI Whisper
      console.log("🎙️ Starting transcription with OpenAI Whisper...");
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(filePath),
      });

      const transcribedText = response.text;
      console.log("✅ Transcription success:", transcribedText);

      // Find the session
      const session = await Session.findOne({ _id: sessionId, userId });
      if (!session) {
        console.warn(`⚠️ Session not found: ${sessionId} for user: ${userId}`);
        return res
          .status(404)
          .json({ error: "Session not found or does not belong to user." });
      }

      // Update session title if not set
      if (!session.title) {
        session.title = transcribedText.slice(0, 50);
        await session.save();
      }

      // Save the audio message
      await Message.create({
        sessionId,
        userId,
        role: "user",
        content: "🎤 Audio message",
        metadata: {
          type: "audio",
          transcribedText: transcribedText,
        },
      });

      // Get conversation context
      const previousMessages = await Message.find({ sessionId }).sort({
        createdAt: 1,
      });
      const context = previousMessages.map((msg) => ({
        role: msg.role,
        content:
          msg.metadata?.type === "audio"
            ? msg.metadata.transcribedText
            : msg.content,
      }));
      context.push({ role: "user", content: transcribedText });

      // Get AI response
      console.log("🤖 Getting AI response...");
      const modelToUse = session.model || "gpt-3.5-turbo";
      const llmResponse = await axios.post(
        `${process.env.LLM_BASE_PATH}/chat`,
        {
          model: modelToUse,
          messages: context,
        }
      );

      const botReply = llmResponse.data.reply;
      console.log("✅ AI response received");

      // Save AI response
      await Message.create({
        sessionId,
        userId,
        role: "assistant",
        content: botReply,
      });

      return res.json({ reply: botReply });
    } catch (error) {
      console.error("❌ Error during transcription process:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Transcription failed",
          details: error.message,
        });
      }
      return res
        .status(500)
        .json({ error: "Transcription and message flow failed." });
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🧹 Deleted temporary file");
        }
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }
  } catch (error) {
    console.error("❌ Transcription error:", error);
    return res.status(500).json({
      error: "Transcription and message flow failed.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Export the multer middleware for use in routes
export const uploadMiddleware = upload.single("audio");
