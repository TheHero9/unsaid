/**
 * Client-side juror identity cache (localStorage).
 *
 * The httpOnly cookie is the server-trusted capability token, but it can be
 * dropped across some mobile refreshes / re-opens. We mirror the juror id +
 * name here, keyed by the public event code, so the join screen can silently
 * re-establish the session (see `resumeJuror`) and a juror keeps the name they
 * walked in with. This is the same trust boundary as the cookie - same device,
 * same person - and never leaves the browser except to re-set the cookie.
 */

export interface StoredJuror {
  jurorId: string;
  name: string;
}

function key(eventCode: string): string {
  return `nondit_juror_${eventCode.trim().toUpperCase()}`;
}

export function loadStoredJuror(eventCode: string): StoredJuror | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(eventCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredJuror>;
    if (parsed && typeof parsed.jurorId === "string" && typeof parsed.name === "string") {
      return { jurorId: parsed.jurorId, name: parsed.name };
    }
  } catch {
    // Corrupt/blocked storage - fall back to the join form.
  }
  return null;
}

export function saveStoredJuror(eventCode: string, juror: StoredJuror): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(eventCode), JSON.stringify(juror));
  } catch {
    // Private mode / storage full - non-fatal, the cookie still works for now.
  }
}

export function clearStoredJuror(eventCode: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(eventCode));
  } catch {
    // ignore
  }
}
