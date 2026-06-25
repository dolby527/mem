import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcrypt";

export function hashIngestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyIngestToken(
  token: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!storedHash || !token) return false;
  if (storedHash.length === 64 && /^[a-f0-9]+$/.test(storedHash)) {
    return hashIngestToken(token) === storedHash;
  }
  return compare(token, storedHash);
}

export function generateIngestToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashAgentToken(token: string): Promise<string> {
  return hash(token, 10);
}
