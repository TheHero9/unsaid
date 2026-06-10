// nondit-founder.jsx — founder payoff page; proportional chip summary is the hero

function aggregate(pitchId) {
  const seed = SEED[pitchId] || { jurors: 0, chips: {}, scores: {}, notes: [], custom: [] };
  let jurors = seed.jurors;
  const chips = { ...seed.chips };
  const scores = {}; CRITERIA.forEach((c) => (scores[c.id] = [...(seed.scores[c.id] || [])]));
  const notes = [...seed.notes];
  const custom = [...seed.custom];
  // merge the demo juror's own submission if they judged this pitch
  try {
    const j = JSON.parse(localStorage.getItem("nondit-juror-v2"));
    const f = j && j.fb && j.fb[pitchId];
    if (f && f.submitted) {
      jurors += 1;
      f.chips.forEach((id) => (chips[id] = (chips[id] || 0) + 1));
      (f.custom || []).forEach((c) => custom.push({ label: c.label, s: c.s }));
      Object.entries(f.ratings || {}).forEach(([k, v]) => { if (v != null) (scores[k] = scores[k] || []).push(v); });
      if ((f.note || "").trim()) notes.unshift({ t: f.note.trim(), ago: "just now" });
    }
  } catch (e) {}

  const items = []; // {label, s, n}
  Object.entries(chips).forEach(([id, n]) => { const c = chipById(id); if (c && n > 0) items.push({ label: c.label, s: c.s, n }); });
  custom.forEach((c) => { const ex = items.find((i) => i.label === c.label); if (ex) ex.n += 1; else items.push({ label: c.label, s: c.s, n: 1 }); });
  items.sort((a, b) => b.n - a.n);
  const tot = { pos: 0, neg: 0, neu: 0 }; items.forEach((i) => (tot[i.s] += i.n));
  return { jurors, items, scores, notes, tot };
}

function StackBar({ tot }) {
  const total = tot.pos + tot.neu + tot.neg || 1;
  const seg = (n, color) => n > 0 && (
    <div style={{ width: `${(n / total) * 100}%`, background: color, height: "100%" }} />
  );
  return (
    <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", background: "var(--surface-3)", gap: 2 }}>
      {seg(tot.pos, "var(--pos)")}{seg(tot.neu, "var(--neu)")}{seg(tot.neg, "var(--neg)")}
    </div>
  );
}

function FounderSurface({ pitchId }) {
  const pitch = PITCHES.find((p) => p.id === pitchId) || PITCHES[0];
  const a = aggregate(pitchId);
  const max = Math.max(1, ...a.items.map((i) => i.n));
  const topPos = a.items.find((i) => i.s === "pos");
  const topNeg = a.items.find((i) => i.s === "neg");
  const posShare = a.tot.pos / (a.tot.pos + a.tot.neg || 1);
  const verdict = a.jurors === 0 ? null : posShare >= 0.62 ? "Mostly positive" : posShare <= 0.38 ? "Mostly critical" : "A mixed read";
  const vColor = verdict === "Mostly positive" ? "var(--pos)" : verdict === "Mostly critical" ? "var(--neg)" : "var(--neu)";

  if (a.jurors === 0) {
    return (
      <div className="phone-root"><div style={{ height: "100%", paddingTop: 56, paddingBottom: 30, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <FounderHeader pitch={pitch} jurors={0} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 36px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)", marginBottom: 18 }}>
            <Icon name="users" size={26} />
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>No feedback yet</div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: "var(--text-3)" }}>When jurors start tapping during your pitch, their honest read shows up here — anonymous, and yours alone.</p>
        </div>
      </div></div>
    );
  }

  return (
    <div className="phone-root"><div className="scroll" style={{ height: "100%", overflowY: "auto", paddingTop: 56, paddingBottom: 40, boxSizing: "border-box" }}>
      <FounderHeader pitch={pitch} jurors={a.jurors} />
      <div style={{ padding: "0 22px" }}>
        {/* HERO summary */}
        <div style={{ marginTop: 22, marginBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: vColor }} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".03em", color: vColor }}>{verdict}</span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 27, lineHeight: 1.18, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>
            {topPos && <>Jurors noticed your <span style={{ color: "var(--pos)" }}>{topPos.label}</span></>}
            {topPos && topNeg && <>, and flagged the <span style={{ color: "var(--neg)" }}>{topNeg.label}</span></>}
            {topPos ? "." : "Here's what jurors noticed."}
          </h2>
          <div style={{ marginTop: 18 }}><StackBar tot={a.tot} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: "var(--pos)" }}>{a.tot.pos} positive</span>
            {a.tot.neu > 0 && <span style={{ color: "var(--neu)" }}>{a.tot.neu} neutral</span>}
            <span style={{ color: "var(--neg)" }}>{a.tot.neg} critical</span>
          </div>
        </div>

        {/* chip bars */}
        <div style={{ marginTop: 28 }}>
          <SectionLabel>What jurors noticed</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {a.items.map((it, i) => {
              const c = SENT[it.s];
              return (
                <div key={i} className="bar-row" style={{ position: "relative", display: "flex", alignItems: "center", gap: 11, height: 46, borderRadius: 12, overflow: "hidden",
                  background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(it.n / max) * 100}%`, background: c.wash, borderRight: `2px solid ${c.tone}` }} />
                  <span style={{ position: "relative", marginLeft: 14, fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: c.tone, minWidth: 14 }}>{it.n}</span>
                  <span style={{ position: "relative", fontSize: 14.5, fontWeight: 500, color: "var(--text)" }}>{it.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* scores */}
        <div style={{ marginTop: 28 }}>
          <SectionLabel hint="1–5 average">Scores</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CRITERIA.map((cr) => {
              const arr = a.scores[cr.id] || [];
              const v = avg(arr);
              return (
                <div key={cr.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{cr.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: arr.length ? "var(--text)" : "var(--text-4)" }}>
                      {arr.length ? v.toFixed(1) : "—"}<span style={{ color: "var(--text-4)", fontWeight: 500 }}>/5</span>
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
                    <div style={{ width: `${(v / 5) * 100}%`, height: "100%", background: "var(--text)", borderRadius: 999, transition: "width .5s var(--ease)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* notes */}
        {a.notes.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <SectionLabel>Notes <span style={{ color: "var(--text-4)" }}>({a.notes.length})</span></SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {a.notes.map((n, i) => (
                <div key={i} style={{ padding: "14px 15px", borderRadius: 13, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "var(--text-4)", flexShrink: 0, marginTop: 1 }}><Icon name="quote" size={16} /></span>
                    <div>
                      <div style={{ fontSize: 14.5, lineHeight: 1.45, color: "var(--text)" }}>{n.t}</div>
                      <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 5 }}>{n.ago}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-4)", lineHeight: 1.5 }}>Anonymous by design. No names, no ranking — just the honest read, handed back to you.</p>
        </div>
      </div>
    </div></div>
  );
}

function FounderHeader({ pitch, jurors }) {
  const [shared, setShared] = useState(false);
  return (
    <div style={{ padding: "0 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--text-3)", textTransform: "uppercase" }}>{EVENT.name}</div>
          <h1 style={{ margin: "5px 0 0", fontFamily: "var(--serif)", fontSize: 38, lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>{pitch.name}</h1>
        </div>
        <button onClick={() => { setShared(true); setTimeout(() => setShared(false), 1400); }}
          style={{ width: 42, height: 42, flexShrink: 0, marginTop: 4, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface-2)", border: "1px solid var(--border)", color: shared ? "var(--pos)" : "var(--text-2)", cursor: "pointer", transition: "color .15s" }}>
          <Icon name={shared ? "check" : "share"} size={18} />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, color: "var(--text-3)" }}>
        <Icon name="users" size={15} />
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>Feedback from {jurors} {jurors === 1 ? "juror" : "jurors"}</span>
      </div>
    </div>
  );
}

Object.assign(window, { FounderSurface, aggregate });
