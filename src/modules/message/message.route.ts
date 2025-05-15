import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import express from "express";
import { getMessages, sendMessage } from "./message.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, asyncWrapper(sendMessage));
router.get("/:sessionId", isAuthenticated, asyncWrapper(getMessages));

export { router as messageRoute };
