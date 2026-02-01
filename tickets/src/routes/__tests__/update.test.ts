import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket does not exist", async () => {
  // Generate a valid MongoDB ObjectId that does NOT exist in the database
  const id = new mongoose.Types.ObjectId().toHexString();

  // Attempt to update a non-existent ticket
  // User is authenticated, but the resource is missing
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Updated Ticket",
      price: 100,
    })
    .expect(404); // Expect "Not Found"
});

it("returns a 401 if the user is not authenticated", async () => {
  // Generate a valid ticket id
  const id = new mongoose.Types.ObjectId().toHexString();

  // Attempt to update a ticket WITHOUT authentication
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Updated Ticket",
      price: 100,
    })
    .expect(401); // Expect "Unauthorized"
});

it("returns a 200 if the user owns the ticket and inputs are valid", async () => {
  // Sign in and store authentication cookie
  const cookie = global.signin();

  // 1️⃣ Create a ticket as the authenticated user
  const createResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Original title",
      price: 20,
    })
    .expect(201);

  // 2️⃣ Update the same ticket using the SAME user
  const updateResponse = await request(app)
    .put(`/api/tickets/${createResponse.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Updated Ticket",
      price: 100,
    })
    .expect(200); // Update succeeds

  // 3️⃣ Verify the ticket was actually updated
  expect(updateResponse.body.title).toEqual("Updated Ticket");
  expect(updateResponse.body.price).toEqual(100);
});
