import { customAlphabet } from "nanoid";

/**
 * Capability-code generators (see specs/03-architecture/01-architecture.md).
 * Pure functions - no DB, no React. Possession of a code IS the authorization,
 * so private codes must be unguessable and non-enumerable.
 */

/**
 * Crockford base32 minus the ambiguous 0/O/1/I (and L/U per Crockford):
 * typeable on a phone, readable from a projected slide.
 */
export const PUBLIC_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
export const PUBLIC_CODE_LENGTH = 6;

/** URL-safe alphanumerics. 62^14 ≈ 2^83 - unguessable, non-enumerable. */
export const PRIVATE_CODE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const PRIVATE_CODE_LENGTH = 14;

const publicNanoid = customAlphabet(PUBLIC_CODE_ALPHABET, PUBLIC_CODE_LENGTH);
const privateNanoid = customAlphabet(
  PRIVATE_CODE_ALPHABET,
  PRIVATE_CODE_LENGTH
);

/** 6-char public event code - shared openly with the jury. */
export function generatePublicCode(): string {
  return publicNanoid();
}

/** 14-char private code - founder feedback keys and organizer manage codes. */
export function generatePrivateCode(): string {
  return privateNanoid();
}
