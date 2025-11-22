import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";

import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";

import { User } from "../models/user";
import jwt from "jsonwebtoken"; // ✅ Correct import (NOT Jwt)

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    // Validate email
    body("email").isEmail().withMessage("Enter a valid email"),

    // Validate password length
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    // 3️⃣ Create a new user (password hashing is done in the model hook)
    const user = User.build({ email, password });

    try {
      await user.save();
    } catch (err) {
      console.error("❌ Error saving user:", err);
      throw new DatabaseConnectionError();
    }

    // 4️⃣ Create a JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY! // ! = tell TS we know this exists
    );

    // 5️⃣ Store JWT inside session cookie
    req.session = {
      jwt: userJwt,
    };

    // 6️⃣ Send user (password removed automatically via toJSON)
    res.status(201).send(user);
  }
);

export { router as signupRouter };
