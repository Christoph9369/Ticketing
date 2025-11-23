// ❗ Jest setup file for in-memory MongoDB + auth helpers

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../app"; // Your Express app

// Add this at the top of your setup file
process.env.NODE_ENV = "test";
process.env.JWT_KEY = "testsecret";

// ... rest of your setup code

// Declare global helpers for tests
declare global {
  var signin: (id?: string, email?: string) => string[];
  var signup: (email?: string, password?: string) => Promise<string[]>;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Set fake JWT secret
  process.env.JWT_KEY = "testsecret";

  // Start in-memory MongoDB
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);

  if (!mongoose.connection.db) {
    throw new Error("MongoDB failed to initialize");
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not established");

  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

// 🌟 SIGNIN helper: returns a JWT session cookie
global.signin = (id?: string, email?: string): string[] => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: email || "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};

// 🌟 SIGNUP helper: calls /api/users/signup and returns cookie
global.signup = async (
  email?: string,
  password?: string
): Promise<string[]> => {
  const testEmail = email || "test@test.com";
  const testPassword = password || "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: testEmail, password: testPassword })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  if (!cookie) {
    throw new Error("Signup did not return a cookie");
  }

  return cookie;
};
