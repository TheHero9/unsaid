/**
 * Juror-identity cookie helpers (no login - see
 * specs/03-architecture/01-architecture.md "Juror identity").
 *
 * The cookie is scoped per-event so a single browser can hold a distinct
 * juror identity per event it has joined. Value = the `u_jurors.id` (uuid),
 * which doubles as the capability token verified server-side on every action.
 */

/** Max age for the juror cookie - one event-day. */
export const JUROR_COOKIE_MAX_AGE = 60 * 60 * 24; // 24h in seconds

/** Cookie name for a juror's identity within one event. */
export function jurorCookieName(eventId: string): string {
  return `nondit_juror_${eventId}`;
}
