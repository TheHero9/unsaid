// nondit-juror.jsx — the HERO surface: fast juror capture + always-present pitch switcher
const SENT = {
  pos: { tone: "var(--pos)", wash: "var(--pos-wash)", bd: "var(--pos-bd)", faint: "var(--pos-faint)" },
  neg: { tone: "var(--neg)", wash: "var(--neg-wash)", bd: "var(--neg-bd)", faint: "var(--neg-faint)" },
  neu: { tone: "var(--neu)", wash: "var(--neu-wash)", bd: "var(--neu-bd)", faint: "var(--neu-faint)" },
};
const chipById = (id) => CHIPS.find((c) => c.id === id);

// ── sentiment-colored toggle chip ──
function Chip({ label, s, active, onClick, removable, onRemove }) {
  const c = SENT[s] || SENT.neu;
  const press = usePress();
  return (
    <button onClick={onClick} {...press.handlers}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: active ? "9px 13px 9px 11px" : "9px 14px", minHeight: 40,
        borderRadius: 999, cursor: "pointer", font: "inherit",
        fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap",
        color: active ? c.tone : "var(--text-2)",
        background: active ? c.wash : "transparent",
        border: `1.5px solid ${active ? c.bd : c.faint}`,
        transform: press.pressed ? "scale(0.96)" : "scale(1)",
        transition: "transform .08s ease, background .15s, border-color .15s, color .15s",
      }}>
      {active && <Icon name="check" size={15} sw={2.6} />}
      {label}
      {removable && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ marginLeft: 1, opacity: .55, display: "inline-flex" }}>
          <Icon name="x" size={13} sw={2.4} />
        </span>
      )}
    </button>
  );
}

// ── 1-5 cumulative rating, tap-again-clears ──
function Rating({ value, onSet }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value != null && n <= value;
        const head = value === n;
        return (
          <button key={n} onClick={() => onSet(value === n ? null : n)}
            style={{
              height: 42, borderRadius: 10, cursor: "pointer", font: "inherit",
              fontSize: 15, fontWeight: 600,
              color: filled ? "var(--text)" : "var(--text-3)",
              background: filled ? "var(--surface-3)" : "transparent",
              border: `1.5px solid ${head ? "var(--border-strong)" : filled ? "transparent" : "var(--border)"}`,
              transition: "background .12s, color .12s, border-color .12s",
            }}>{n}</button>
        );
      })}
    </div>
  );
}

// ── sticky pitch switcher (prev / center pill / next) ──
function Switcher({ idx, total, pitch, doneSet, onPrev, onNext, onOpen, live }) {
  const arrow = (name, dis, fn) => (
    <button onClick={fn} disabled={dis}
      style={{
        width: 44, height: 44, flexShrink: 0, borderRadius: 12, cursor: dis ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface-2)", border: "1px solid var(--border)",
        color: dis ? "var(--text-4)" : "var(--text-2)", opacity: dis ? .4 : 1,
        transition: "opacity .12s",
      }}>
      <Icon name={name} size={20} />
    </button>
  );
  return (
    <div style={{ padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 8,
      background: "linear-gradient(var(--bg) 70%, transparent)", flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        {arrow("chevron-left", idx === 0, onPrev)}
        <button onClick={onOpen} style={{
          flex: 1, minWidth: 0, height: 44, padding: "0 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12,
        }}>
          {live ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <span className="live-dot" /><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", color: "var(--neg)" }}>LIVE</span>
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "var(--text-3)", flexShrink: 0 }}>
              {String(idx + 1).padStart(2, "0")}<span style={{ opacity: .5 }}>/{String(total).padStart(2, "0")}</span>
            </span>
          )}
          <span style={{ flex: 1, minWidth: 0, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            fontFamily: "var(--serif)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>
            {pitch.name}
          </span>
          <Icon name="chevron-down" size={18} style={{ color: "var(--text-3)" }} />
        </button>
        {arrow("chevron-right", idx === total - 1, onNext)}
      </div>
      {/* progress segments */}
      <div style={{ display: "flex", gap: 3, padding: "0 2px" }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i === idx ? "var(--text)" : doneSet.has(i) ? "var(--pos)" : "var(--border-strong)",
            opacity: i === idx ? 1 : doneSet.has(i) ? .8 : 1,
            transition: "background .2s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── jump-to-pitch bottom sheet ──
function JumpSheet({ idx, onPick, onClose, fb }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} className="fade-in" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)" }} />
      <div className="sheet-up" style={{
        position: "relative", maxHeight: "78%", display: "flex", flexDirection: "column",
        background: "var(--surface)", borderTop: "1px solid var(--border-2)",
        borderRadius: "22px 22px 0 0", paddingBottom: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 4, background: "var(--border-strong)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px 8px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>Jump to pitch</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-3)", color: "var(--text-2)" }}>
            <Icon name="x" size={17} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "2px 12px 4px" }}>
          {PITCHES.map((p, i) => {
            const live = i === LIVE_INDEX;
            const f = fb[p.id];
            const done = f && f.submitted;
            const sel = i === idx;
            return (
              <button key={p.id} onClick={() => onPick(i)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                padding: "11px 12px", borderRadius: 12, marginBottom: 2, cursor: "pointer",
                background: sel ? "var(--surface-3)" : "transparent",
                border: `1px solid ${sel ? "var(--border-2)" : "transparent"}`,
              }}>
                <span style={{
                  width: 30, height: 30, flexShrink: 0, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)",
                  background: done ? "var(--pos-wash)" : "var(--surface-2)",
                  color: done ? "var(--pos)" : "var(--text-3)", border: "1px solid var(--border)",
                }}>
                  {done ? <Icon name="check" size={16} sw={2.6} /> : p.order}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{p.name}</span>
                    {live && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999, background: "var(--neg-wash)" }}>
                      <span className="live-dot" /><span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: "var(--neg)" }}>LIVE</span>
                    </span>}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{p.founder}</span>
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: done ? "var(--pos)" : "var(--text-4)", flexShrink: 0 }}>
                  {done ? "done" : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── add-your-own chip inline ──
function AddChip({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const [s, setS] = useState("pos");
  const ref = useRef();
  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", minHeight: 40,
      borderRadius: 999, cursor: "pointer", fontSize: 14.5, fontWeight: 500, color: "var(--text-3)",
      background: "transparent", border: "1.5px dashed var(--border-strong)",
    }}><Icon name="plus" size={15} sw={2.4} />add your own</button>
  );
  const submit = () => { const v = val.trim(); if (v) onAdd(v, s); setVal(""); setOpen(false); };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: 5, borderRadius: 999, background: "var(--surface-2)", border: "1.5px solid var(--border-2)" }}>
      {["pos", "neu", "neg"].map((k) => (
        <button key={k} onClick={() => setS(k)} title={k} style={{
          width: 18, height: 18, borderRadius: 999, cursor: "pointer",
          background: s === k ? SENT[k].tone : "transparent",
          border: `2px solid ${SENT[k].tone}`, opacity: s === k ? 1 : .5,
        }} />
      ))}
      <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
        placeholder="add a chip" style={{
          width: 110, background: "transparent", border: "none", outline: "none", color: "var(--text)",
          font: "inherit", fontSize: 14.5,
        }} />
      <button onClick={submit} style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--text)", color: "var(--bg)" }}>
        <Icon name="check" size={16} sw={2.6} />
      </button>
    </span>
  );
}

Object.assign(window, { Chip, Rating, Switcher, JumpSheet, AddChip, SENT, chipById });
