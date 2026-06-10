// nondit-capture.jsx — JurorSurface: join → capture, swipe, submit→auto-advance
const LS_KEY = "nondit-juror-v2";
const blankFb = () => ({ chips: [], custom: [], ratings: {}, note: "", submitted: false });
function loadJuror() {
  try { const r = JSON.parse(localStorage.getItem(LS_KEY)); if (r && r.fb) return r; } catch (e) {}
  return { name: "", idx: LIVE_INDEX, fb: {} };
}

function SectionLabel({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 11px" }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-3)" }}>{children}</span>
      {hint && <span style={{ fontSize: 12, color: "var(--text-4)" }}>{hint}</span>}
    </div>
  );
}

// ── Join ──
function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const livePitch = PITCHES[LIVE_INDEX];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "0 22px", boxSizing: "border-box" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "var(--neg)" }}>LIVE NOW</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".04em", color: "var(--text-3)", marginBottom: 6 }}>{EVENT.name.toUpperCase()}</div>
        <h1 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>
          You're judging<br /><span style={{ color: "var(--text)" }}>{livePitch.name}</span>.
        </h1>
        <p style={{ margin: "14px 0 30px", fontSize: 15.5, lineHeight: 1.5, color: "var(--text-2)", maxWidth: 320 }}>
          Tap what you notice as each founder pitches. It's anonymous — they only ever see the totals, never who said what.
        </p>
        <label style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-3)" }}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Rivera"
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onJoin(name.trim()); }}
          style={{ marginTop: 9, height: 52, padding: "0 16px", fontSize: 16, color: "var(--text)",
            background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 13, outline: "none" }} />
      </div>
      <button onClick={() => name.trim() && onJoin(name.trim())} disabled={!name.trim()}
        style={{ marginBottom: 14, height: 54, borderRadius: 14, cursor: name.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontSize: 16.5, fontWeight: 600, fontFamily: "inherit",
          background: name.trim() ? "var(--text)" : "var(--surface-3)",
          color: name.trim() ? "var(--bg)" : "var(--text-4)", border: "none",
          transition: "background .15s, color .15s" }}>
        Start judging<Icon name="arrowRight" size={19} />
      </button>
    </div>
  );
}

// ── Capture body for one pitch ──
function CaptureBody({ pitch, fb, set }) {
  const grouped = { pos: [], neu: [], neg: [] };
  CHIPS.forEach((c) => grouped[c.s].push(c));
  const ordered = [...grouped.pos, ...grouped.neu, ...grouped.neg];
  const toggle = (id) => set((f) => ({ ...f, chips: f.chips.includes(id) ? f.chips.filter((x) => x !== id) : [...f.chips, id] }));
  const addCustom = (label, s) => set((f) => ({ ...f, custom: [...f.custom, { label, s, id: "c-" + Date.now() }] }));
  const rmCustom = (id) => set((f) => ({ ...f, custom: f.custom.filter((c) => c.id !== id) }));
  const noticed = fb.chips.length + fb.custom.length;

  return (
    <div style={{ padding: "4px 18px 20px" }}>
      <div style={{ marginBottom: 20, marginTop: 2 }}>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: "var(--text-2)" }}>{pitch.one}</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-4)" }}>{pitch.founder}</p>
      </div>

      <SectionLabel hint={noticed ? `${noticed} selected` : "the priority"}>Tap what you noticed</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {ordered.map((c) => (
          <Chip key={c.id} label={c.label} s={c.s} active={fb.chips.includes(c.id)} onClick={() => toggle(c.id)} />
        ))}
        {fb.custom.map((c) => (
          <Chip key={c.id} label={c.label} s={c.s} active removable onClick={() => {}} onRemove={() => rmCustom(c.id)} />
        ))}
        <AddChip onAdd={addCustom} />
      </div>

      <SectionLabel hint="optional · tap again to clear">Rate the pitch</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {CRITERIA.map((cr) => (
          <div key={cr.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)" }}>{cr.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--mono)", color: fb.ratings[cr.id] ? "var(--text-2)" : "var(--text-4)" }}>
                {fb.ratings[cr.id] ? `${fb.ratings[cr.id]}/5` : "—"}
              </span>
            </div>
            <Rating value={fb.ratings[cr.id] ?? null} onSet={(v) => set((f) => ({ ...f, ratings: { ...f.ratings, [cr.id]: v } }))} />
          </div>
        ))}
      </div>

      <SectionLabel hint="optional">Add a one-line note</SectionLabel>
      <input value={fb.note} onChange={(e) => set((f) => ({ ...f, note: e.target.value }))}
        placeholder="One honest sentence they'd never hear otherwise…"
        style={{ width: "100%", boxSizing: "border-box", height: 50, padding: "0 15px", fontSize: 15, color: "var(--text)",
          background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, outline: "none" }} />
    </div>
  );
}

// ── Whole juror surface ──
function JurorSurface() {
  const [st, setSt] = useState(loadJuror);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(null);
  const [anim, setAnim] = useState(null); // 'r' | 'l' | null — only set mid-transition
  const scrollRef = useRef();
  const touch = useRef(null);

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(st)); }, [st]);

  const join = (name) => setSt((s) => ({ ...s, name, idx: LIVE_INDEX }));
  const fbFor = (pid) => st.fb[pid] || blankFb();
  const setFb = (pid, updater) => setSt((s) => ({ ...s, fb: { ...s.fb, [pid]: updater(s.fb[pid] || blankFb()) } }));

  const doneSet = new Set(PITCHES.map((p, i) => (st.fb[p.id] && st.fb[p.id].submitted ? i : -1)).filter((i) => i >= 0));

  const go = (next) => {
    if (next === st.idx || next < 0 || next >= PITCHES.length) return;
    setAnim(next > st.idx ? "r" : "l");
    setSt((s) => ({ ...s, idx: next }));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setTimeout(() => setAnim(null), 320);
  };

  const submit = () => {
    const pid = PITCHES[st.idx].id;
    setFb(pid, (f) => ({ ...f, submitted: true }));
    // find next un-submitted pitch
    let nextIdx = -1;
    for (let k = 1; k <= PITCHES.length; k++) {
      const cand = (st.idx + k) % PITCHES.length;
      const f = st.fb[PITCHES[cand].id];
      if (!(f && f.submitted)) { nextIdx = cand; break; }
    }
    const allDone = nextIdx === -1;
    setToast(allDone ? { type: "all" } : { type: "next", name: PITCHES[nextIdx].name });
    setTimeout(() => setToast(null), 1700);
    if (!allDone) setTimeout(() => go(nextIdx), 480);
  };

  // swipe
  const onDown = (e) => { touch.current = { x: e.clientX, y: e.clientY, t: Date.now() }; };
  const onUp = (e) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x, dy = e.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) go(Math.min(st.idx + 1, PITCHES.length - 1));
      else go(Math.max(st.idx - 1, 0));
    }
  };

  if (!st.name) return <JoinScreen onJoin={join} />;

  const pitch = PITCHES[st.idx];
  const fb = fbFor(pitch.id);
  const noticed = fb.chips.length + fb.custom.length;
  const rated = Object.values(fb.ratings).filter((v) => v != null).length;
  const live = st.idx === LIVE_INDEX;
  const canSubmit = noticed > 0 || rated > 0 || (fb.note || "").trim();

  return (
    <div className="phone-root">
      <div style={{ height: "100%", paddingTop: 50, paddingBottom: 22, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <Switcher idx={st.idx} total={PITCHES.length} pitch={pitch} doneSet={doneSet} live={live}
          onPrev={() => go(st.idx - 1)} onNext={() => go(st.idx + 1)} onOpen={() => setSheet(true)} />
        <div ref={scrollRef} className="scroll" style={{ flex: 1, overflowY: "auto" }}
          onPointerDown={onDown} onPointerUp={onUp}>
          <div key={st.idx} className={anim === "r" ? "slide-r" : anim === "l" ? "slide-l" : ""}>
            <CaptureBody pitch={pitch} fb={fb} set={(u) => setFb(pitch.id, u)} />
          </div>
        </div>
        {/* submit bar */}
        <div style={{ flexShrink: 0, padding: "10px 16px 4px", background: "linear-gradient(transparent, var(--bg) 26%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ minWidth: 0, flexShrink: 0 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 500, whiteSpace: "nowrap" }}>
                {fb.submitted ? "Submitted" : noticed || rated ? `${noticed} noticed · ${rated} rated` : "Tap a chip to start"}
              </div>
            </div>
            <button onClick={submit} disabled={!canSubmit}
              style={{ flex: 1, height: 52, borderRadius: 14, cursor: canSubmit ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 16, fontWeight: 600, fontFamily: "inherit", border: "none",
                background: canSubmit ? "var(--text)" : "var(--surface-3)",
                color: canSubmit ? "var(--bg)" : "var(--text-4)",
                transition: "background .15s, color .15s" }}>
              {fb.submitted ? "Update & next" : "Submit & next"}<Icon name="send" size={17} />
            </button>
          </div>
        </div>
      </div>

      {sheet && <JumpSheet idx={st.idx} fb={st.fb} onClose={() => setSheet(false)} onPick={(i) => { setSheet(false); go(i); }} />}
      {toast && (
        <div className="toast-pop" style={{ position: "absolute", left: 16, right: 16, bottom: 86, zIndex: 50,
          display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderRadius: 14,
          background: "var(--surface-3)", border: "1px solid var(--border-2)", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pos-wash)", color: "var(--pos)" }}>
            <Icon name={toast.type === "all" ? "check-check" : "check"} size={18} sw={2.6} />
          </span>
          <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--text)" }}>
            {toast.type === "all" ? "All caught up — every pitch logged." : <>Saved. Next up: <b style={{ fontWeight: 700 }}>{toast.name}</b></>}
          </span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { JurorSurface, JoinScreen, SectionLabel });
