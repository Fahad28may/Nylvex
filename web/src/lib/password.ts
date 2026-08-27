import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  // Buffers must be equal length for timingSafeEqual — a mismatched length
  // means the hash is malformed/tampered, so treat it as a failed verify.
  if (derivedKey.length !== expectedKey.length) return false;
  return timingSafeEqual(derivedKey, expectedKey);
}
