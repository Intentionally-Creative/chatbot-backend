import express from "express";
import multer from "multer";
import { transcribeAudio } from "./transcribe.controller.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("audio"), asyncWrapper(transcribeAudio));

export { router as transcribeRoute };