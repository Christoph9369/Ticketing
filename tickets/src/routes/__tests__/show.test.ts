import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("returns 404 if the ticket is not found", async () => {
  const response = await request(app).get("/api/tickets/nonexistentid").send();

  expect(response.status).toBe(404);
});
it("returns the ticket if found", async () => {
  const ticket = await Ticket.build({
    title: "Test Ticket",
    price: 100,
    userId: "testUserId",
  }).save();

  const response = await request(app).get(`/api/tickets/${ticket.id}`).send();

  expect(response.status).toBe(200);
  expect(response.body.title).toEqual(ticket.title);
  expect(response.body.price).toEqual(ticket.price);
});
