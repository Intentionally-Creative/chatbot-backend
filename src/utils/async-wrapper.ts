import { Request, Response, NextFunction } from "express";

// this function handles the error and passed it to the global error handler
// instead of handling it in every controller alone
export const asyncWrapper = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
