import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@cfticketing/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth, // 🔐 Ensure user is authenticated
  [
    body("title").not().isEmpty().withMessage("Title is required"),

    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
  ],
  validateRequest, // 🚨 Sends 400 if validation errors exist
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    // ✅ Type-safe ticket creation
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id, // provided by requireAuth middleware
    });

    await ticket.save(); // 💾 Persist to MongoDB

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };
