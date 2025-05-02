import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import express from "express";
import { createSession, getSessions, togglePin } from "./session.controller.js";

const router = express.Router();

router.patch("/sessions/:id/pin", isAuthenticated, asyncWrapper(togglePin));

router.post("/", isAuthenticated, asyncWrapper(createSession));
router.get("/", isAuthenticated, asyncWrapper(getSessions));

export { router as sessionRoute };
