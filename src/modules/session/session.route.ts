import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import express from "express";
import {
  createSession,
  getSessions,
  updateSession,
  deleteSession,
} from "./session.controller.js";

const router = express.Router();

router.patch("/:id", isAuthenticated, asyncWrapper(updateSession));
router.delete("/:id", isAuthenticated, asyncWrapper(deleteSession));

router.post("/", isAuthenticated, asyncWrapper(createSession));
router.get("/", isAuthenticated, asyncWrapper(getSessions));

export { router as sessionRoute };
