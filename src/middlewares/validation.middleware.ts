import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type ValidateFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

function createValidator(
  schema: z.ZodSchema,
  accessor: (req: Request) => any
): ValidateFunction {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = accessor(req);
      const validatedData = schema.parse(data);
      Object.assign(data, validatedData);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((issue) => `${issue.path.join(".")} is ${issue.message}`)
          .join(", ");

        res.status(400).json({ message: errorMessages });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
}

export const validateReqBody = (schema: z.ZodSchema): ValidateFunction =>
  createValidator(schema, (req) => req.body);

export const validateReqQuery = (schema: z.ZodSchema): ValidateFunction =>
  createValidator(schema, (req) => req.query);
