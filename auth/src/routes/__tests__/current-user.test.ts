import request from "supertest";
import { app } from "../../app";
import jwt from "jsonwebtoken";

describe("GET /api/users/currentuser", () => {
  it("returns null if not authenticated", async () => {
    // No cookie sent → user is not logged in
    const response = await request(app)
      .get("/api/users/currentuser")
      .send()
      .expect(200);

    expect(response.body.currentUser).toBeNull();
  });

  it("returns the current user if authenticated", async () => {
    // Build a JWT payload (fake user)
    const payload = {
      id: "12345",
      email: "test@test.com",
    };

    // Create JWT using same secret as app
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object containing the JWT
    const session = { jwt: token };

    // Encode session object as base64
    const base64 = Buffer.from(JSON.stringify(session)).toString("base64");

    // Build the cookie string that Supertest will send
    const cookie = [`session=${base64}`];

    // Send request with cookie to authenticate
    const response = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie)
      .send()
      .expect(200);

    // Expect the same payload returned from currentUser middleware
    expect(response.body.currentUser.email).toEqual("test@test.com");
    expect(response.body.currentUser.id).toEqual("12345");
  });

  it("returns null with an invalid JWT", async () => {
    // A corrupted or invalid session cookie
    const fakeCookie = [`session=invalidToken123`];

    const response = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", fakeCookie)
      .send()
      .expect(200);

    // Middleware should fail gracefully
    expect(response.body.currentUser).toBeNull();
  });
});
