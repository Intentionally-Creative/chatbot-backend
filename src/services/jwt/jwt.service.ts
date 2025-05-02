import JWT from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_EXPIRATION,
  JWT_REFRESH_TOKEN_EXPIRATION,
  JWT_REFRESH_TOKEN_EXPIRATION_EXTENDED,
  JWT_SECRET,
} from "./jwt.constants.js";
import RefreshToken from "./refresh-token.model.js";
import mongoose from "mongoose";

interface JwtPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
}

export function generateAccessToken({
  _id,
  email,
}: {
  _id: mongoose.Types.ObjectId;
  email: string;
}) {
  return JWT.sign(
    {
      _id,
      email,
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION }
  );
}

export function generateRefreshToken({
  _id,
  email,
  shouldExtend = false,
}: {
  _id: mongoose.Types.ObjectId;
  email: string;
  shouldExtend?: boolean;
}) {
  return JWT.sign(
    {
      _id,
      email,
    },
    JWT_SECRET,
    {
      expiresIn: shouldExtend
        ? JWT_REFRESH_TOKEN_EXPIRATION_EXTENDED
        : JWT_REFRESH_TOKEN_EXPIRATION,
    }
  );
}

export function verifyJwtToken(token: string): JwtPayload | null {
  return JWT.verify(token, JWT_SECRET) as JwtPayload;
}

export async function saveRefreshToken({
  _id,
  token,
}: {
  _id: mongoose.Types.ObjectId;
  token: string;
}) {
  await RefreshToken.create({
    user: _id,
    token,
  });
}

export async function deleteRefreshToken({
  _id,
  token,
}: {
  _id: mongoose.Types.ObjectId;
  token: string;
}) {
  await RefreshToken.findOneAndDelete({
    user: _id,
    token,
  });
}
