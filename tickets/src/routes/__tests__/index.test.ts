import request from "supertest";
import { app } from "../../app";

const createTicket = async (cookie: string[]) => {
  return await request(app).post("/api/tickets").set("Cookie", cookie).send({
    title: "Concert",
    price: 20,
  });
};

describe("Ticket Routes", () => {
  it("can fetch a list of tickets", async () => {
    const cookie = global.signin();
    await createTicket(cookie);
    await createTicket(cookie);

    const response = await request(app)
      .get("/api/tickets")
      .set("Cookie", cookie)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
