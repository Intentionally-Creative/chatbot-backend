import express from "express";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { submitFeedback } from "./feedback.controller.js";

const router = express.Router();

router.post("/", asyncWrapper(submitFeedback));

export { router as feedbackRoute };
