import crypto from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_COST = 16384;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, storedValue) {
  if (!storedValue) return false;
  // Supports legacy development records once, then they are rehashed on password change.
  if (!storedValue.startsWith("scrypt$")) {
    return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedValue));
  }
  const [, salt, expected] = storedValue.split("$");
  const actual = crypto.scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function createTemporaryPassword() {
  return `${crypto.randomBytes(6).toString("base64url")}Aa1!`;
}
