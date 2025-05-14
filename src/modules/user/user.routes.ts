import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  updateUserSettings,
} from "./user.controller.js";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";

const router = Router();

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/refresh-token", asyncWrapper(refreshToken));
router.put("/update", isAuthenticated, asyncWrapper(updateUserSettings));

export default router;
