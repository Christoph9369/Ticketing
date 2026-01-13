import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define the shape of the JWT payload
interface UserPayload {
  id: string;
  email: string;
}

// Extend Express Request to include currentUser
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// Middleware to extract current user from JWT in session cookie
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If no session or no JWT, skip
  if (!req.session || !req.session.jwt) {
    return next();
  }

  try {
    // Verify JWT using the secret key
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    // Attach current user info to request object
    req.currentUser = payload;
  } catch (err) {
    console.warn("JWT verification failed:", err);
    // Do not block request; just leave currentUser undefined
  }

  next();
};
