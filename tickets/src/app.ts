import express from "express";
import "express-async-errors";
import { showTicketRouter } from "./routes/show";

import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@cfticketing/common";
import { createTicketRouter } from "./routes/new";
import { updateTicketRouter } from "./routes/update";
import { indexTicketRouter } from "./routes/index";

const app = express();
// Parse incoming JSON requests
app.use(express.json());

// Trust proxy for cookie session
app.set("trust proxy", true);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }),
);
// Middleware to extract current user from session
app.use(currentUser);

// Ticket routes
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);
app.use(indexTicketRouter);

// Catch-all route for undefined routes
app.all("*", async (req, res) => {
  throw new NotFoundError();
});
// Global error handler
app.use(errorHandler);

export { app };
