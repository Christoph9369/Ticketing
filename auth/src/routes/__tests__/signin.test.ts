import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";

// ---------------------------
// SIGNIN ROUTE TESTS
// ---------------------------

describe("POST /api/users/signin", () => {
  it("fails when email does NOT exist", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "notexist@test.com",
        password: "password",
      })
      .expect(400); // Bad request error
  });

  it("fails when incorrect password is provided", async () => {
    // 1️⃣ First signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // 2️⃣ Now try signin with wrong password
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
        password: "wrongpass",
      })
      .expect(400);
  });

  it("responds with a cookie when valid credentials are provided", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(200);

    // Look for Set-Cookie header
    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns 400 with invalid email", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "invalid-email",
        password: "password",
      })
      .expect(400);
  });

  it("returns 400 when missing email & password", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "",
        password: "",
      })
      .expect(400);
  });

  it("allows global signin() helper to return a cookie", async () => {
    const cookie = global.signin(); // use helper
    expect(cookie.length).toBe(1); // we should get a cookie array
  });
});
