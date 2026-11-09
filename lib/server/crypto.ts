import { createHash, randomBytes } from "crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashIp(ip: string, pepper: string): string {
  return sha256Hex(`${ip}${pepper}`);
}

export function hashResultToken(token: string): string {
  return sha256Hex(token);
}

/** High-entropy URL-safe token (raw). Only ever put in successUrl / email. */
export function generateResultToken(): string {
  return randomBytes(32).toString("base64url");
}

export function generateId(prefix = ""): string {
  const id = randomBytes(16).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}
