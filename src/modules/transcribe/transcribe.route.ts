import express from "express";
import { transcribeAudio, uploadMiddleware } from "./transcribe.controller.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";

const router = express.Router();

/**
 * POST /api/transcribe
 * Body: multipart/form-data { audio, sessionId }
 */
router.post(
  "/",
  isAuthenticated,
  uploadMiddleware, // writes file to /uploads/audio
  asyncWrapper(transcribeAudio) // returns { reply, audioUrl, … }
);

export { router as transcribeRoute };
