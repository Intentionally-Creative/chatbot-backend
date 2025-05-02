import { CustomError } from "../utils/custom-error.js";
import { NextFunction, Response } from "express";
import { asyncWrapper } from "../utils/async-wrapper.js";

export const isAuthenticated = asyncWrapper(
  async (req: any, _: Response, next: NextFunction) => {
    if (!req.user) next(new CustomError("Unauthenticated", 401));
    else next();
  }
);
