import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error.js";

export const globalErrorHandler = (
  err: CustomError,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  const statusCode = err.statusCode ? err.statusCode : 500;

  let message = err.message;

  // mongoose duplicate fields error
  // @ts-ignore
  if (err.code === 11000) {
    message = generateDuplicateFieldMessage(err);
  }

  // TODO: Create and send alerts to slack channel

  return res.status(statusCode).json({
    message,
  });
};

function generateDuplicateFieldMessage(errorResponse: any): string {
  const key = Object.keys(errorResponse.keyPattern)[0];
  const value = errorResponse.keyValue[key];

  return `The ${key} ${value} already exists.`;
}
