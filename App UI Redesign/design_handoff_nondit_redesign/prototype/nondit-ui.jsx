// nondit-ui.jsx — shared primitives: Icon (lucide), QRCode, helpers
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ── Lucide-style icons (24×24, stroke 2, round caps, currentColor) ──
const PATHS = {
  "chevron-left":  "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
  "chevron-down":  "M6 9l6 6 6-6",
  "chevron-up":    "M18 15l-6-6-6 6",
  check:           "M20 6L9 17l-5-5",
  "check-check":   "M18 6L7 17l-3-3 M22 10l-7.5 7.5L13 16",
  plus:            "M12 5v14 M5 12h14",
  minus:           "M5 12h14",
  x:               "M18 6L6 18 M6 6l12 12",
  send:            "M14.54 4.46a1 1 0 011.5 1.32l-4.6 13.1a1 1 0 01-1.87.06l-2.3-5.4-5.4-2.3a1 1 0 01.06-1.87z",
  users:           "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M13 7a4 4 0 11-8 0 4 4 0 018 0 M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  tag:             "M12.59 2.59A2 2 0 0011.17 2H4a2 2 0 00-2 2v7.17a2 2 0 00.59 1.42l8.83 8.83a2 2 0 002.83 0l7.17-7.17a2 2 0 000-2.83z M7 7h.01",
  sliders:         "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  quote:           "M3 21c3 0 7-1 7-8V5a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h2 M14 21c3 0 7-1 7-8V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h2",
  share:           "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8 M16 6l-4-4-4 4 M12 2v13",
  copy:            "M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2z M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
  trash:           "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M10 11v6 M14 11v6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  pencil:          "M17 3a2.85 2.85 0 014 4L7.5 20.5 2 22l1.5-5.5z",
  calendar:        "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  sparkles:        "M9.94 5.5L12 2l2.06 3.5L18 7l-3.5 2.06L12 12l-2.06-3.5L6 7zM19 13l.8 1.8L21 16l-1.2.8L19 19l-1-1.8L16 16l1.2-.8zM5 14l.6 1.4L7 16l-1.4.6L5 18l-.6-1.4L3 16l1.4-.6z",
  "badge-check":   "M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76 M9 12l2 2 4-4",
  info:            "M12 16v-4 M12 8h.01 M12 22a10 10 0 100-20 10 10 0 000 20z",
  search:          "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
  arrowRight:      "M5 12h14 M12 5l7 7-7 7",
  "corner-down":   "M9 10l-5 5 5 5 M20 4v7a4 4 0 01-4 4H4",
  grip:            "M5 9h14 M5 15h14",
  link:            "M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7 M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7",
};

function Icon({ name, size = 20, sw = 2, style, ...rest }) {
  const d = PATHS[name];
  const multi = (d || "").includes(" M") || (d || "").trim().split(" M").length > 1;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }} {...rest}>
      {(d || "").split(/ (?=M)/).filter(Boolean).map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
}

// ── Deterministic pseudo-QR (decorative, looks like the real ones) ──
function mulberry(seed) {
  let a = 0; for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function QRCode({ value = "x", size = 168, fg = "#fafafa", bg = "transparent", quiet = 2 }) {
  const N = 25;
  const rng = mulberry(value);
  const cell = size / (N + quiet * 2);
  const on = [];
  const inFinder = (r, c) => {
    const f = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return f(0, 0) || f(0, N - 7) || f(N - 7, 0);
  };
  const finderCell = (r, c) => {
    const local = (br, bc) => { const rr = r - br, cc = c - bc; const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6; const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4; return edge || core; };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= N - 7) return local(0, N - 7);
    if (r >= N - 7 && c < 7) return local(N - 7, 0);
    return false;
  };
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (inFinder(r, c)) { if (finderCell(r, c)) on.push([r, c]); continue; }
    if (rng() > 0.55) on.push([r, c]);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }} shapeRendering="crispEdges">
      {bg !== "transparent" && <rect width={size} height={size} fill={bg} />}
      {on.map(([r, c], i) => (
        <rect key={i} x={(c + quiet) * cell} y={(r + quiet) * cell} width={cell + 0.5} height={cell + 0.5} fill={fg} />
      ))}
    </svg>
  );
}

// ── small helpers ──
const avg = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);
function usePress() {
  const [d, setD] = useState(false);
  return { down: () => setD(true), up: () => setD(false), leave: () => setD(false), pressed: d,
    handlers: { onPointerDown: () => setD(true), onPointerUp: () => setD(false), onPointerLeave: () => setD(false), onPointerCancel: () => setD(false) } };
}

Object.assign(window, { Icon, QRCode, avg, sum, usePress });
