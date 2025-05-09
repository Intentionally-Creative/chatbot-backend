import { Request, Response } from "express";
import { OpenAI } from "openai";
import * as fs from "fs";
import Session from "../session/session.model.js";
import Message from "../message/message.model.js";
import multer from "multer";
import path from "path";
import { generateResponse } from "../../services/jwt/llm.services.js";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_AUDIO_TYPES = [
  "audio/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];
const TITLE_MAX_LENGTH = 50;
const AUDIO_UPLOAD_DIR = path.join(process.cwd(), "uploads", "audio");

// Ensure upload directory exists
if (!fs.existsSync(AUDIO_UPLOAD_DIR)) {
  fs.mkdirSync(AUDIO_UPLOAD_DIR, { recursive: true });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_, file, cb) => {
    if (SUPPORTED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only audio files are allowed. Supported types: ${SUPPORTED_AUDIO_TYPES.join(
            ", "
          )}`
        )
      );
    }
  },
});

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

/**
 * Validates the request parameters
 * @throws Error if validation fails
 */
const validateRequest = (
  file: Express.Multer.File | undefined,
  sessionId: string | undefined,
  userId: string | undefined
) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!SUPPORTED_AUDIO_TYPES.includes(file.mimetype)) {
    throw new Error(
      `Unsupported audio format. Supported types: ${SUPPORTED_AUDIO_TYPES.join(
        ", "
      )}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }
};

/**
 * Handles audio transcription and generates AI response
 */
export const transcribeAudio = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  let filePath: string | null = null;

  try {
    console.log("🔧 Received transcription request");

    const file = req.file;
    const sessionId = req.body.sessionId;
    const userId = req.user?._id;

    // Validate request parameters
    validateRequest(file, sessionId, userId);

    console.log(`📦 File received: ${file!.originalname} (${file!.mimetype})`);
    console.log(`📏 File size: ${file!.size} bytes`);

    // Save the file to disk with a unique name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file!.originalname}`;
    filePath = path.join(AUDIO_UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, file!.buffer);
    console.log(`💾 Saved file: ${filePath}`);

    // Transcribe the audio using OpenAI Whisper
    console.log("🎙️ Starting transcription with OpenAI Whisper...");
    const transcriptionResponse = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(filePath),
    });

    const transcribedText = transcriptionResponse.text;
    if (!transcribedText) {
      throw new Error("No text was transcribed from the audio");
    }
    console.log("✅ Transcription success:", transcribedText);

    // Find and validate session
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error("Session not found or does not belong to user");
    }

    // Update session title if not set
    if (!session.title) {
      session.title = transcribedText.slice(0, TITLE_MAX_LENGTH);
      await session.save();
    }

    // Save the audio message with file information
    const userMessage = await Message.create({
      sessionId,
      userId,
      role: "user",
      content: transcribedText,
      metadata: {
        type: "audio",
        transcribedText: transcribedText,
        audioUrl: `/api/audio/${filename}`,
        audioFileName: filename,
      },
    });

    // Get conversation context
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

    // Get model from session and generate response
    const modelToUse = session.model || "gpt-3.5-turbo";
    console.log("🤖 Getting AI response using the LLM service...");
    const botReply = await generateResponse(context, modelToUse);
    if (!botReply) {
      throw new Error("Failed to generate AI response");
    }
    console.log("✅ AI response received");

    // Save AI response
    const assistantMessage = await Message.create({
      sessionId,
      userId,
      role: "assistant",
      content: botReply,
    });

    // Return response with message IDs and audio URL for frontend state management
    return res.json({
      reply: botReply,
      userMessageId: userMessage._id,
      assistantMessageId: assistantMessage._id,
      audioUrl: userMessage.metadata?.audioUrl,
    });
  } catch (error) {
    console.error("❌ Error during transcription process:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("No file uploaded")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Session not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Unsupported audio format")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("File size exceeds")) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(500).json({
      error: "Transcription and message flow failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // Clean up temporary file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("🧹 Deleted temporary file");
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }
  }
};

// Export the multer middleware for use in routes
export const uploadMiddleware = upload.single("audio");
