import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";

//
// TEST SUITE FOR SIGNUP ROUTE
//
describe("POST /api/users/signup", () => {
  it("returns 201 on successful signup", async () => {
    // Send a valid signup request
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201); // Expect success

    // Validate response structure
    expect(response.body.email).toEqual("test@test.com"); // email returned
    expect(response.body.id).toBeDefined(); // id returned
    expect(response.body.password).not.toBeDefined(); // password removed by toJSON()
    expect(response.get("Set-Cookie")).toBeDefined(); // JWT cookie sent
  });

  it("returns 400 with invalid email", async () => {
    // Bad email should trigger validation error
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "invalid-email",
        password: "password",
      })
      .expect(400);
  });

  it("returns 400 with password less than 4 characters", async () => {
    // Too short password should fail validation
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "123",
      })
      .expect(400);
  });

  it("returns 400 with password more than 20 characters", async () => {
    // Too long password should fail validation
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "123456789012345678901", // 21 chars
      })
      .expect(400);
  });

  it("returns 400 with missing email and password", async () => {
    // Missing both fields should fail immediately
    await request(app).post("/api/users/signup").send({}).expect(400);
  });

  it("returns 400 with missing email", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        password: "password",
      })
      .expect(400);
  });

  it("returns 400 with missing password", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
      })
      .expect(400);
  });

  it("disallows duplicate emails", async () => {
    // First signup should succeed
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // Second signup with same email should fail
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(400);
  });

  it("sets a cookie after successful signup", async () => {
    // Signup should return a Set-Cookie header with JWT session
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    const cookie = response.get("Set-Cookie");
    expect(cookie).toBeDefined(); // Cookie exists
    expect(cookie![0]).toMatch(/session=/); // Cookie contains session key
  });

  it("creates a user in the database", async () => {
    const email = "test@test.com";
    const password = "password";

    await request(app)
      .post("/api/users/signup")
      .send({ email, password })
      .expect(201);

    // Verify user saved in MongoDB
    const users = await User.find({ email });
    expect(users).toHaveLength(1); // Only 1 user
    expect(users[0].email).toEqual(email);
  });

  it("password is hashed in database", async () => {
    const email = "test@test.com";
    const password = "password";

    // Signup request
    await request(app)
      .post("/api/users/signup")
      .send({ email, password })
      .expect(201);

    const user = await User.findOne({ email });
    expect(user).toBeDefined();

    // Ensure password was NOT stored in plain text
    expect(user!.password).not.toEqual(password);

    // Ensure hashed password has significant length (not short)
    expect(user!.password.length).toBeGreaterThan(10);

    // Ensure hash structure looks correct (hex + salt format)
    expect(user!.password).toMatch(/^[a-f0-9.]+$/i);
  });

  it("JWT token contains correct payload", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    const cookie = response.get("Set-Cookie");
    expect(cookie).toBeDefined();

    // Extract base64 session cookie value
    const sessionValue = cookie![0].split(";")[0].split("=")[1];

    // Decode session → { jwt: "..." }
    const session = JSON.parse(Buffer.from(sessionValue, "base64").toString());

    // Ensure token exists
    expect(session.jwt).toBeDefined();
  });
});
