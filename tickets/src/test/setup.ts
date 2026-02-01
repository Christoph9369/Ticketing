// ❗ Jest setup file
// - Starts in-memory MongoDB
// - Provides global auth helpers
// - Cleans DB between tests

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../app";

// Ensure test environment variables are set
process.env.NODE_ENV = "test";
process.env.JWT_KEY = "testsecret";

// Extend Node's global object with test helpers
declare global {
  var signin: (id?: string, email?: string) => string[];
  var signup: (email?: string, password?: string) => Promise<string[]>;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  // Connect mongoose to the in-memory database
  await mongoose.connect(mongoUri);

  if (!mongoose.connection.db) {
    throw new Error("MongoDB failed to initialize");
  }
});

beforeEach(async () => {
  // Clear all collections to ensure test isolation
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not established");

  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Close DB connection and stop MongoDB
  await mongoose.connection.close();
  await mongo.stop();
});

// 🔐 SIGNIN helper
// Creates a fake JWT and returns a session cookie
global.signin = (id?: string, email?: string): string[] => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: email || "test@test.com",
  };

  // Sign JWT using test secret
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Match cookie-session format
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};

// 📝 SIGNUP helper
// Calls real signup endpoint and returns auth cookie
global.signup = async (
  email?: string,
  password?: string,
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
