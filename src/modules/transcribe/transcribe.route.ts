import express from "express";
import { transcribeAudio, uploadMiddleware } from "./transcribe.controller.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  uploadMiddleware,
  asyncWrapper(transcribeAudio)
);

export { router as transcribeRoute };
