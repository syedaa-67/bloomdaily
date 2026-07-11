/**
 * Small dependency-free unique ID generator. Good enough for local-only
 * record keys (tasks, habits, journal entries) — not intended as a
 * cryptographic UUID. Avoids pulling in the `uuid` + polyfill packages.
 */
export function generateId(): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${time}-${random}`;
}
