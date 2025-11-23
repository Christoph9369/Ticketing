import request from "supertest";
import { app } from "../../app";

// ---------------------------
// SIGNOUT ROUTE TESTS
// ---------------------------

describe("POST /api/users/signout", () => {
  it("clears the cookie after signing out", async () => {
    // 1️⃣ First signup a user
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    // 2️⃣ Now signout the user
    const response = await request(app)
      .post("/api/users/signout")
      .send({})
      .expect(200);

    // 3️⃣ Check that the cookie is cleared
    expect(response.get("Set-Cookie")).toBeDefined();
    const cookies = response.get("Set-Cookie")!;
    expect(cookies[0]).toMatch(/session=;/); // Cookie should be cleared
  });
});
