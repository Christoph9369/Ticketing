import { CustomError } from "./custom-error.js";
import type { ValidationError } from "express-validator";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      if (err.type === "field") {
        return { message: err.msg, field: err.path };
      }

      // Generic fallback: for other error types
      return { message: err.msg };
    });
  }
}
