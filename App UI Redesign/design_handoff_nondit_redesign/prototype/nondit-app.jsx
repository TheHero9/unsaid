// nondit-app.jsx — prototype shell: role navigator + device frame
function RoleTab({ active, label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "9px 6px 8px", borderRadius: 11, cursor: "pointer", textAlign: "center",
      background: active ? "var(--surface-3)" : "transparent",
      border: `1px solid ${active ? "var(--border-2)" : "transparent"}`,
      transition: "background .15s, border-color .15s",
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: active ? "var(--text)" : "var(--text-3)" }}>{label}</div>
      <div style={{ fontSize: 10.5, color: active ? "var(--text-3)" : "var(--text-4)", marginTop: 1 }}>{sub}</div>
    </button>
  );
}

function App() {
  const [role, setRole] = React.useState("juror");
  const [fp, setFp] = React.useState("p1");
  const [jurorKey, setJurorKey] = React.useState(0);

  const resetJuror = () => {
    try { localStorage.removeItem("nondit-juror-v2"); } catch (e) {}
    setJurorKey((k) => k + 1);
  };

  return (
    <div className="stage">
      <div className="chrome">
        <div className="brand">
          <span className="brand-mark">N</span>
          <div>
            <div className="brand-name">Nondit</div>
            <div className="brand-sub">Redesign prototype · mobile-first</div>
          </div>
        </div>

        <div className="rolebar">
          <RoleTab active={role === "juror"} label="Juror" sub="capture, live" onClick={() => setRole("juror")} />
          <RoleTab active={role === "founder"} label="Founder" sub="the payoff" onClick={() => setRole("founder")} />
          <RoleTab active={role === "organizer"} label="Organizer" sub="hand out codes" onClick={() => setRole("organizer")} />
        </div>

        {role === "juror" && (
          <div className="ctx">
            <span className="ctx-text">The hero. Switch pitches in one tap — arrows, the picker, or swipe the card.</span>
            <button className="ctx-btn" onClick={resetJuror}>Reset join</button>
          </div>
        )}
        {role === "founder" && (
          <div className="ctx col">
            <span className="ctx-text">Each founder opens only their own private page. Preview any:</span>
            <div className="pitchpick">
              {PITCHES.map((p) => (
                <button key={p.id} onClick={() => setFp(p.id)} className={"pp" + (fp === p.id ? " on" : "")}>
                  {p.name}{(SEED[p.id] && SEED[p.id].jurors === 0) ? <span className="pp-empty"> · empty</span> : null}
                </button>
              ))}
            </div>
          </div>
        )}
        {role === "organizer" && (
          <div className="ctx">
            <span className="ctx-text">What they hand out comes first; chips &amp; criteria collapse below.</span>
          </div>
        )}
      </div>

      <div className="device-wrap">
        <IOSDevice dark width={390} height={844}>
          {role === "juror" && <JurorSurface key={jurorKey} />}
          {role === "founder" && <FounderSurface pitchId={fp} />}
          {role === "organizer" && <OrganizerSurface />}
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
