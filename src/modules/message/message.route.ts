import express, { Router } from "express";
import {
  sendMessage,
  getMessages,
  updateMessage,
} from "./message.controller.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get messages for a session
router.get("/:sessionId", asyncWrapper(getMessages));

// Send a new message
router.post("/", asyncWrapper(sendMessage));

// Update a message (rating or remember status)
router.patch("/:messageId", asyncWrapper(updateMessage));

export const messageRoute = router;
export default messageRoute;
