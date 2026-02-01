import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});
it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).toEqual(401);
});
it("returns an error if an Invalid price is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Concert",
      price: -20,
    });
  expect(response.status).toEqual(400);
});
// it("returns an error if the price is provided", async () => {
//   const response = await request(app).post("/api/tickets").send({});
//   expect(response.status).toEqual(400);
// });
// it("returns an error if price is provided", async () => {
//   const response = await request(app).post("/api/tickets").send({});
//   expect(response.status).toEqual(400);
// });
it("creates a ticket with valid inputs", async () => {
  //add in a check to make sure the ticket was created
  const tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Concert",
      price: 20,
    });
  expect(response.status).toEqual(201);
});
