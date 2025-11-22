import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  // Hash a password using scrypt
  static async toHash(password: string) {
    // Generate a unique random salt
    const salt = randomBytes(8).toString("hex");

    // Derive a key using scrypt (takes password + salt → hash)
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    // Store "hash.salt"
    return `${buf.toString("hex")}.${salt}`;
  }

  // Compare stored hashed password with a supplied password
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");

    // Hash the incoming password using the same salt
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
