// Server-only helper for the password gate in front of the public
// attendance/commission-request forms. The correct code lives in
// PUBLIC_FORMS_ACCESS_CODE (no NEXT_PUBLIC_ prefix) so it is never sent to
// the browser — the previous implementation hardcoded it in client
// components, where anyone could read it from devtools.

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 10;

// Best-effort only: this in-memory map resets on redeploy/restart and isn't
// shared across serverless instances. It blunts casual brute-forcing but is
// not a substitute for a real auth system.
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS_PER_WINDOW;
}

export function verifyAccessCode(code: unknown): boolean {
  const expected = process.env.PUBLIC_FORMS_ACCESS_CODE;
  if (!expected) return false;
  return typeof code === "string" && code === expected;
}

export function clientKeyFrom(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
