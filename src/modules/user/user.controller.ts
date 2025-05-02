import { Request, Response } from "express";
import User from "./user.model.js";
import { doesPasswordsMatch } from "../../lib/password-utils.js";
import { generateAccessToken } from "../../services/jwt/jwt.service.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create user
    const user = await User.create({ email, password });

    // Generate token
    const token = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await doesPasswordsMatch(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateAccessToken({ _id: user._id, email: user.email });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
};
