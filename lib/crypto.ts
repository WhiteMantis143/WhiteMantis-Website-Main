import crypto from "crypto";

/**
 * AES-256-GCM Encryption / Decryption Utility
 * ------------------------------------------
 * - Uses 256-bit key from ENCRYPTION_KEY env
 * - Authenticated encryption (prevents tampering)
 * - Output is base64 string (safe for cookies)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Recommended for GCM
const TAG_LENGTH = 16;

// ENCRYPTION_KEY must be 32 bytes (64 hex chars)
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

/**
 * Encrypts a JS object into a base64 string
 */
export function encrypt(payload: object): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Layout: [iv][tag][encrypted]
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypts a base64 string back into original object
 */
export function decrypt<T = any>(token: string): T {
  const buffer = Buffer.from(token, "base64");

  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}
