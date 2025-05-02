import { asyncWrapper } from "../../utils/async-wrapper.js";
import express from "express";
import { register, login } from "./user.controller.js";

const router = express.Router();

// Routes
router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));

export { router as userRoute };

// router.delete(
//   "/:id",
//   isAuthenticated,
//   isAdmin,
//   asyncWrapper(userController.deleteUser)
// );
