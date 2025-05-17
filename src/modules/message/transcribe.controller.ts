import { Request, Response } from "express";
import { OpenAI } from "openai";
import * as fs from "fs";
import Session from "../session/session.model.js";
import Message from "./message.model.js";
import path from "path";
import {
  generateFollowUpResponse,
  generateResponse,
} from "../../services/jwt/llm.services.js";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { envVariables } from "../../env-config.js";

import {
  AUDIO_UPLOAD_DIR,
  MAX_FILE_SIZE,
  SUPPORTED_AUDIO_TYPES,
  TITLE_MAX_LENGTH,
} from "../../config/multer.js";

const openai = new OpenAI({ apiKey: envVariables.OPENAI_API_KEY });

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
  try {
    console.log("🔧 Received transcription request");

    const file = req.file; // written to disk by multer
    const sessionId = req.body.sessionId;
    const userId = req.user?._id;

    /* 1️⃣ Validate ---------------------------------------------------- */
    validateRequest(file, sessionId, userId);

    // inside transcribeAudio, right after you validate
    const userIdStr = userId!.toString();
    let filePath = file!.path; // undefined in memory mode
    let filename = "";

    if (!filePath) {
      // We’re on memoryStorage → write it manually
      const dir = path.join(AUDIO_UPLOAD_DIR, userIdStr);
      fs.mkdirSync(dir, { recursive: true });

      filename = `${Date.now()}-${file!.originalname.replace(/\s+/g, "_")}`;
      filePath = path.join(dir, filename);

      fs.writeFileSync(filePath, file!.buffer);
      console.log("💾 Manually saved:", filePath);
    } else {
      filename = path.basename(filePath);
    }
    console.log(`💾 Stored: ${filePath} (${file!.mimetype}, ${file!.size} B)`);

    /* 2️⃣ Whisper transcription -------------------------------------- */
    const { text: transcribedText } = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(filePath),
      response_format: "json",
    });

    if (!transcribedText) throw new Error("No text was transcribed from audio");
    console.log("✅ Transcribed:", transcribedText);

    /* 3️⃣ Verify session owner --------------------------------------- */
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session)
      throw new Error("Session not found or does not belong to user");

    if (!session.title) {
      session.title = transcribedText.slice(0, TITLE_MAX_LENGTH);
      await session.save();
    }

    /* 4️⃣ Save user message ------------------------------------------ */
    const userMessage = await Message.create({
      sessionId,
      userId,
      role: "user",
      content: transcribedText,
      metadata: {
        type: "audio",
        transcribedText,
        audioUrl: `${envVariables.API_BASE_URL}/uploads/audio/${userIdStr}/${filename}`,
        audioFileName: filename,
      },
    });

    /* 5️⃣ Build context & get assistant reply ------------------------ */
    const previous = await Message.find({ sessionId }).sort({ createdAt: 1 });

    const context: ChatCompletionMessageParam[] = previous.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const modelToUse = session.model || "gpt-3.5-turbo";
    console.log("🤖 Generating LLM reply…");
    const botReply = await generateResponse(context, modelToUse);
    if (!botReply) throw new Error("Failed to generate AI response");

    /* Generate follow-up questions ----------------------------------- */
    console.log("🤔 Generating follow-up questions…");
    // Format history text for follow-up generation
    const historyText = previous
      .map(
        (m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`
      )
      .join("\n");

    // Get previous assistant questions to avoid repetition
    const previousQuestions = previous
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase());

    // Generate follow-up questions
    const followUps = await generateFollowUpResponse(
      historyText,
      previousQuestions,
      modelToUse
    );

    const assistantMessage = await Message.create({
      sessionId,
      userId,
      role: "assistant",
      content: botReply,
      followUps,
    });

    /* 6️⃣ Respond to client ------------------------------------------ */
    return res.json({
      reply: botReply,
      userMessageId: userMessage._id,
      assistantMessageId: assistantMessage._id,
      audioUrl: userMessage.metadata!.audioUrl,
      followUps,
    });
  } catch (error) {
    console.error("❌ Transcription error:", error);

    if (error instanceof Error) {
      if (error.message.includes("No file uploaded"))
        return res.status(400).json({ error: error.message });
      if (error.message.includes("Session not found"))
        return res.status(404).json({ error: error.message });
      if (error.message.includes("Unsupported audio format"))
        return res.status(400).json({ error: error.message });
      if (error.message.includes("File size exceeds"))
        return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: "Transcription and message flow failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
