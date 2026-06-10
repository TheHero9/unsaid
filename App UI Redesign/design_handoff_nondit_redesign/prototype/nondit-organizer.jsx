// nondit-organizer.jsx — organizer dashboard: codes/QR first, config collapsed

function CopyBtn({ text, label, full }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
    setDone(true); setTimeout(() => setDone(false), 1300);
  };
  if (full) return (
    <button onClick={copy} style={{ width: "100%", height: 46, borderRadius: 12, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit",
      background: done ? "var(--pos-wash)" : "var(--surface-3)", color: done ? "var(--pos)" : "var(--text)", border: `1px solid ${done ? "var(--pos-bd)" : "var(--border-2)"}`, transition: "all .15s" }}>
      <Icon name={done ? "check" : "copy"} size={16} sw={done ? 2.6 : 2} />{done ? "Copied" : label}
    </button>
  );
  return (
    <button onClick={copy} title={label} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 11, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: done ? "var(--pos-wash)" : "var(--surface-2)", color: done ? "var(--pos)" : "var(--text-2)",
      border: `1px solid ${done ? "var(--pos-bd)" : "var(--border)"}`, transition: "all .15s" }}>
      <Icon name={done ? "check" : "copy"} size={17} sw={done ? 2.6 : 2} />
    </button>
  );
}

function Collapsible({ icon, title, sub, count, children, open, onToggle }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-3)", color: "var(--text-2)" }}>
          <Icon name={icon} size={18} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: "var(--text)" }}>{title}</span>
            {count != null && <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: "var(--mono)", color: "var(--text-3)", background: "var(--surface-3)", padding: "1px 7px", borderRadius: 999 }}>{count}</span>}
          </span>
          {sub && <span style={{ display: "block", fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{sub}</span>}
        </span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} style={{ color: "var(--text-3)" }} />
      </button>
      {open && <div style={{ padding: "0 16px 18px" }}>{children}</div>}
    </div>
  );
}

function OrganizerSurface() {
  const [tab, setTab] = useState("public");
  const [openP, setOpenP] = useState(true);
  const [openChips, setOpenChips] = useState(false);
  const [openCrit, setOpenCrit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="phone-root"><div className="scroll" style={{ height: "100%", overflowY: "auto", paddingTop: 54, paddingBottom: 40, boxSizing: "border-box" }}>
      <div style={{ padding: "0 18px" }}>
        {/* header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--text-3)", textTransform: "uppercase" }}>Nondit</div>
          <h1 style={{ margin: "5px 0 8px", fontFamily: "var(--serif)", fontSize: 34, lineHeight: 1.04, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>{EVENT.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-3)" }}>
            <Icon name="calendar" size={14} /><span style={{ fontSize: 13 }}>{EVENT.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--text-4)" }} />
            <span style={{ fontSize: 13 }}>{PITCHES.length} pitches</span>
          </div>
        </div>

        {/* HERO: the codes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 18, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg)", borderRadius: 11, marginBottom: 14 }}>
            {[["public", "Event code"], ["private", "Founder links"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, height: 36, borderRadius: 9, cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
                background: tab === k ? "var(--surface-3)" : "transparent", color: tab === k ? "var(--text)" : "var(--text-3)", border: tab === k ? "1px solid var(--border-2)" : "1px solid transparent", transition: "all .15s" }}>{lbl}</button>
            ))}
          </div>

          {tab === "public" ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-3)", marginBottom: 4 }}>
                <Icon name="users" size={15} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>Hand this to the room</span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.45, color: "var(--text-3)" }}>Anyone with this code can give feedback. They can never read it.</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 8px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "var(--text-3)", marginBottom: 12 }}>EVENT CODE</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 38, fontWeight: 700, letterSpacing: ".18em", color: "var(--text)", marginBottom: 18, paddingLeft: ".18em" }}>{EVENT.eventCode}</div>
                <div style={{ padding: 12, background: "#fff", borderRadius: 12 }}><QRCode value={EVENT.url} size={170} fg="#0b0b0d" /></div>
              </div>
              <div style={{ display: "flex", gap: 8, margin: "16px 0 10px" }}>
                <div style={{ flex: 1, minWidth: 0, height: 44, display: "flex", alignItems: "center", padding: "0 13px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 11 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{EVENT.url}</span>
                </div>
                <CopyBtn text={"https://" + EVENT.url} label="Copy link" />
              </div>
              <CopyBtn text={EVENT.eventCode} label="Copy code" full />
            </div>
          ) : (
            <div>
              <p style={{ margin: "2px 0 14px", fontSize: 13, lineHeight: 1.45, color: "var(--text-3)" }}>Each pitch gets a private link only its founder can open to read their results.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PITCHES.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: 11, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 13 }}>
                    <div style={{ padding: 5, background: "#fff", borderRadius: 8, flexShrink: 0 }}><QRCode value={p.priv} size={46} fg="#0b0b0d" quiet={1} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>nondit.app/f/{p.priv}</div>
                    </div>
                    <CopyBtn text={`https://nondit.app/f/${p.priv}`} label="Copy founder link" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pitches */}
        <div style={{ marginBottom: 14 }}>
          <Collapsible icon="users" title="Pitches" count={PITCHES.length} sub="The running order for the night" open={openP} onToggle={() => setOpenP((v) => !v)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PITCHES.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }}>
                  <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 700, color: "var(--text-3)", background: "var(--surface-3)" }}>{p.order}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      {i === LIVE_INDEX && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 999, background: "var(--neg-wash)" }}><span className="live-dot" /><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".07em", color: "var(--neg)" }}>LIVE</span></span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.founder}</div>
                  </div>
                  <button style={{ width: 32, height: 32, borderRadius: 8, color: "var(--text-4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="trash" size={16} /></button>
                </div>
              ))}
            </div>
            {!openAdd ? (
              <button onClick={() => setOpenAdd(true)} style={{ marginTop: 10, width: "100%", height: 46, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 14.5, fontWeight: 600, color: "var(--text-2)", background: "transparent", border: "1.5px dashed var(--border-strong)" }}>
                <Icon name="plus" size={17} />Add a pitch
              </button>
            ) : (
              <div style={{ marginTop: 10, padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 13 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {[["Product name", "e.g. Acme AI"], ["One-liner", "One line about the product"], ["Founder email", "founder@example.com"]].map(([l, ph]) => (
                    <div key={l}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)" }}>{l}</label>
                      <input placeholder={ph} style={{ marginTop: 4, width: "100%", boxSizing: "border-box", height: 44, padding: "0 13px", fontSize: 14.5, color: "var(--text)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, outline: "none" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => setOpenAdd(false)} style={{ flex: 1, height: 44, borderRadius: 11, cursor: "pointer", fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", background: "transparent", color: "var(--text-2)", border: "1px solid var(--border-2)" }}>Cancel</button>
                    <button onClick={() => setOpenAdd(false)} style={{ flex: 1, height: 44, borderRadius: 11, cursor: "pointer", fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", background: "var(--text)", color: "var(--bg)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="plus" size={16} />Add pitch</button>
                  </div>
                </div>
              </div>
            )}
          </Collapsible>
        </div>

        {/* demoted config */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--text-4)", textTransform: "uppercase", margin: "4px 4px 10px" }}>Configuration</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Collapsible icon="tag" title="Feedback chips" count={CHIPS.length} sub="What every juror taps to react" open={openChips} onToggle={() => setOpenChips((v) => !v)}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CHIPS.map((c) => (
                  <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 999, fontSize: 13.5, fontWeight: 500, color: SENT[c.s].tone, background: SENT[c.s].wash, border: `1px solid ${SENT[c.s].bd}` }}>
                    {c.label}<span style={{ opacity: .5, display: "inline-flex" }}><Icon name="trash" size={12} /></span>
                  </span>
                ))}
              </div>
            </Collapsible>
            <Collapsible icon="sliders" title="Rating criteria" count={CRITERIA.length} sub="1–5 scales founders see averaged" open={openCrit} onToggle={() => setOpenCrit((v) => !v)}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CRITERIA.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 11 }}>
                    <Icon name="sliders" size={15} style={{ color: "var(--text-4)" }} />
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{c.label}</span>
                    <span style={{ color: "var(--text-4)", display: "flex" }}><Icon name="trash" size={15} /></span>
                  </div>
                ))}
              </div>
            </Collapsible>
          </div>
        </div>
      </div>
    </div></div>
  );
}

Object.assign(window, { OrganizerSurface });
