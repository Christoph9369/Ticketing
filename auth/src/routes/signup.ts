import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],

  // Request handler

  async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    // If validation errors exist, throw RequestValidationError

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
    console.log("Creating a user...");
    throw new DatabaseConnectionError();
    res.send({});
  }
);

export { router as signupRouter };
