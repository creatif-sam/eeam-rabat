// Server only: imported from server actions (node:crypto keeps it out of client bundles).
import { randomInt } from "node:crypto"

// No look-alike characters (0/O, 1/l/I) so it can be read out or retyped easily.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const LOWER = "abcdefghijkmnpqrstuvwxyz"
const DIGITS = "23456789"
const ALPHABET = UPPER + LOWER + DIGITS

/**
 * One-time password such as "Hq7k-Tm3x-9bPr": 12 random characters
 * (~67 bits) from a cryptographic source, grouped for readability, always
 * containing an upper-case letter, a lower-case letter, a digit and a symbol.
 */
export function generateTempPassword(): string {
  for (;;) {
    const chars = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")
    if (/[A-Z]/.test(chars) && /[a-z]/.test(chars) && /[0-9]/.test(chars)) {
      return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`
    }
  }
}
