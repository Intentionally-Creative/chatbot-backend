import { verifyJwtToken } from "../services/jwt/jwt.service.js";
import { NextFunction, Response } from "express";
import { asyncWrapper } from "../utils/async-wrapper.js";
import User from "../modules/user/user.model.js";

export const attachUserToReq = asyncWrapper(
  async (req: any, _: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        const decodedToken = verifyJwtToken(token);

        if (decodedToken) {
          const user = await User.findById(decodedToken?._id);
          if (user) req.user = user;
        }
      }

      next();
    } catch (error) {
      next();
    }
  }
);
