import { Request, Response } from "express";
import User from "./user.model.js";
import { doesPasswordsMatch, hashPassword } from "../../lib/password-utils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyJwtToken,
  saveRefreshToken,
  deleteRefreshToken,
} from "../../services/jwt/jwt.service.js";
import { RefreshAccessTokenDto } from "./dto/refresh-access-token.dto.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      storeName,
      liquorAddress, // Expect: { country, city, state, postalCode }
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !storeName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password before saving
    const hashed = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashed,
      name,
      storeName,
      liquorAddress,
    });

    // Generate token
    const token = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    res.json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          storeName: user.storeName,
          liquorAddress: user.liquorAddress,
        },
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "no user found" });
    }

    // Check password
    const isMatch = await doesPasswordsMatch(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "wrong pass" });
    }

    // Generate token
    const token = generateAccessToken({ _id: user._id, email: user.email });

    res.json({
      message: "User logged in successfully",
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          storeName: user.storeName,
          liquorAddress: user.liquorAddress,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as RefreshAccessTokenDto;

    // Verify the refresh token
    const decodedToken = verifyJwtToken(refreshToken);
    if (!decodedToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Find the user
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    const newRefreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
    });

    // Save the new refresh token and delete the old one
    await deleteRefreshToken({ _id: user._id, token: refreshToken });
    await saveRefreshToken({ _id: user._id, token: newRefreshToken });

    res.json({
      message: "Tokens refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during token refresh" });
  }
};
