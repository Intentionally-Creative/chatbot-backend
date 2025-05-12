import express from "express";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import { generateFollowUpQuestions } from "./followup.controller.js";

const router = express.Router();

/**
 * POST /api/followup
 * Body: { sessionId: string }
 * Returns: { followUps: string[] }
 */
router.post(
  "/",
  isAuthenticated,
  asyncWrapper(generateFollowUpQuestions)
);

export { router as followupRoute };
