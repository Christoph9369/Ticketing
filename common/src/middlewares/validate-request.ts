import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error.js";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Pull validation errors from express-validator
  const errors = validationResult(req);

  // If errors exist, throw custom error
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};
