import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";

const orderCodeAlphabet = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  8
);

export function createOrderCode(): string {
  return `VID-${orderCodeAlphabet()}`;
}

export function createAccessToken(): string {
  return randomBytes(24).toString("hex");
}
