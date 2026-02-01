import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { NotFoundError } from "@cfticketing/common";
import mongoose from "mongoose";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // ✅ Prevent mongoose CastError
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError();
  }

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.status(200).send(ticket);
});

export { router as showTicketRouter };
