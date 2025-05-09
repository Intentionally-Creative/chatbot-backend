import express, { Request, Response } from "express";
import { transcribeAudio, uploadMiddleware } from "./transcribe.controller.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Single endpoint that handles both transcription and audio file serving
router.post(
  "/",
  isAuthenticated,
  asyncWrapper(async (req: Request, res: Response) => {
    // If it's a GET request for an audio file
    if (req.query.audio) {
      const filename = req.query.audio as string;
      const audioPath = path.join(process.cwd(), "uploads", "audio", filename);

      // Check if file exists
      if (!fs.existsSync(audioPath)) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      // Stream the audio file
      return res.sendFile(audioPath);
    }

    // Otherwise, handle transcription
    return uploadMiddleware(req, res, async () => {
      await transcribeAudio(req, res);
    });
  })
);

export { router as transcribeRoute };
