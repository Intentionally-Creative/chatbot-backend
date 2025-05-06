import { asyncWrapper } from "../../utils/async-wrapper.js";
import express from "express";
import { register, login, refreshToken } from "./user.controller.js";

const router = express.Router();

// Routes
router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/refresh-token", asyncWrapper(refreshToken));

export { router as userRoute };
