export default function RevisionPage() {
  return (
    <>
      {/* Screen header */}
      <div className="pv-screen-hdr">
        <div>
          <div className="pv-h1">Revision</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
            3 chapters curated today · Spaced repetition active · Memory wins ahead
          </div>
        </div>
        <span style={{ fontSize: 11, padding: "5px 12px", background: "var(--jade-bg)", color: "var(--jade)", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(37,131,111,0.2)" }}>
          Goal: 45 / 60 min
        </span>
      </div>

      {/* Focus rail */}
      <div className="pv-focus-rail" style={{ marginBottom: 14 }}>
        <div className="pv-focus-copy">
          <span className="pv-step-kicker">Small win available</span>
          <strong>Recover one memory loop in 15 minutes.</strong>
          <span>You will leave this screen with a named concept recovered, not a vague feeling of studying.</span>
        </div>
        <button className="pv-primary-action">Start memory win</button>
      </div>

      {/* Rev hero */}
      <div className="pv-rev-hero" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>
            Today&apos;s curated revision
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
            2 weak chapters to rescue + 1 scheduled cycle
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>
            Do these before starting new chapters. Every one recovers marks.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { num: "3", label: "Due today", color: "#fff" },
            { num: "78%", label: "On schedule", color: "var(--jade)" },
            { num: "25", label: "Tracked", color: "#fff" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Win Mode card */}
      <div className="pv-mem-win-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--jade)" }}>Memory Win Mode</div>
          <span style={{ fontSize: 9, fontWeight: 700, background: "var(--jade)", color: "#fff", borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Active</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--jade-dim)", marginBottom: 6 }}>Human Physiology · Day 7 Revision</div>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
          After this session, you&apos;ll see exactly what you recovered — and what to hit again.
        </div>

        {/* Before / After */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "var(--fire-bg)", border: "1px solid rgba(200,82,72,0.18)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--fire)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Before</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontStyle: "italic" }}>&quot;I need to revise Human Physiology.&quot;</div>
          </div>
          <div style={{ background: "var(--jade-bg)", border: "1px solid rgba(37,131,111,0.2)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--jade)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>After</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontStyle: "italic" }}>&quot;I recovered cardiac cycle timing and hormonal regulation.&quot;</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="pv-btn-jade" style={{ flex: 1, padding: "11px 16px", fontSize: 13, borderRadius: 9, fontWeight: 700 }}>
            Start 15-min revision session →
          </button>
          <div className="pv-fast-recall" style={{ flex: "0 0 auto", padding: "11px 16px", margin: 0 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>Fast Recall</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>3 min mode</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fast Recall standalone */}
      <div className="pv-fast-recall">
        <span style={{ fontSize: 20 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 3 }}>Fast Recall Mode — bad day version</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
            Only 3 minutes? We&apos;ll cover the 5 highest-yield concepts across all your due topics. No guilt. Still counts.
          </div>
        </div>
        <button style={{ fontSize: 11, padding: "6px 12px", background: "var(--gold-bg)", color: "var(--gold)", border: "1px solid rgba(185,120,22,0.25)", borderRadius: 8, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          Start 3-min mode
        </button>
      </div>

      {/* Weak topic rescue + Subject-wise */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
        {/* Weak topic rescue */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="pv-h2">Weak topic rescue</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fire)", background: "var(--fire-bg)", borderRadius: 999, padding: "3px 10px" }}>~18 marks at stake</span>
          </div>
          <div className="pv-col">
            <div className="pv-weak-card">
              <div className="pv-wc-subj">Physics</div>
              <div className="pv-wc-title">Rotational Motion</div>
              <div className="pv-wc-cost">Costs ~12 marks · Fix this week</div>
              <div className="pv-wc-acc">Test accuracy: 32% · 3 missed in last mock</div>
              <div className="pv-prog" style={{ marginBottom: 10 }}><div className="pv-prog-fill pv-prog-fire" style={{ width: "32%" }}></div></div>
              <button className="pv-btn-ink" style={{ width: "100%", padding: "9px", fontSize: 12, borderRadius: 8, fontWeight: 700 }}>⚡ Intensive Revision (20 min)</button>
            </div>
            <div className="pv-weak-card">
              <div className="pv-wc-subj">Chemistry</div>
              <div className="pv-wc-title">Organic Basics</div>
              <div className="pv-wc-cost">Costs ~6 marks · Improving</div>
              <div className="pv-wc-acc">Test accuracy: 41% · Up from 28% last week</div>
              <div className="pv-prog" style={{ marginBottom: 10 }}><div className="pv-prog-fill pv-prog-gold" style={{ width: "41%" }}></div></div>
              <button className="pv-btn-ink" style={{ width: "100%", padding: "9px", fontSize: 12, borderRadius: 8, fontWeight: 700 }}>⚡ Intensive Revision (15 min)</button>
            </div>
          </div>
        </div>

        {/* Subject-wise + Cycles */}
        <div className="pv-col">
          <div className="pv-h2">Subject-wise revision</div>
          <div className="pv-col" style={{ gap: 7 }}>
            {[
              { icon: "🧬", subj: "Biology", due: "12 topics due", pct: 75, color: "var(--jade-bg)", progClass: "" },
              { icon: "⚗️", subj: "Chemistry", due: "8 topics due", pct: 55, color: "var(--gold-bg)", progClass: " pv-prog-gold" },
              { icon: "⚡", subj: "Physics", due: "5 topics due", pct: 40, color: "var(--paper-3)", progClass: " pv-prog-fire" },
            ].map((s) => (
              <div key={s.subj} className="pv-subj-row">
                <div style={{ width: 32, height: 32, background: s.color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{s.subj}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)" }}>{s.due}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="pv-prog" style={{ width: 70 }}><div className={`pv-prog-fill${s.progClass}`} style={{ width: `${s.pct}%` }}></div></div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", width: 28 }}>{s.pct}%</div>
                </div>
                <button className="pv-btn-jade" style={{ padding: "5px 12px", fontSize: 11, borderRadius: 7, fontWeight: 700 }}>Start</button>
              </div>
            ))}
          </div>

          {/* Spaced revision cycles */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
            <div className="pv-label" style={{ marginBottom: 8 }}>Human Physiology · Spaced revision cycles</div>
            <div className="pv-cycle-grid">
              {[
                { num: "1", lbl: "Day 1", cls: "done" },
                { num: "3", lbl: "Day 3", cls: "done" },
                { num: "7", lbl: "Today ●", cls: "now" },
                { num: "14", lbl: "Day 14", cls: "pending" },
                { num: "30", lbl: "Day 30", cls: "pending" },
              ].map((c) => (
                <div key={c.lbl} className={`pv-cycle ${c.cls}`}>
                  <div className="pv-cy-num">{c.num}</div>
                  <div className="pv-cy-lbl">{c.lbl}</div>
                </div>
              ))}
            </div>
            <button className="pv-btn-jade" style={{ marginTop: 10, width: "100%", padding: "9px", fontSize: 12, borderRadius: 8, fontWeight: 700 }}>
              Revise Human Physiology now (15 min) →
            </button>
          </div>
        </div>
      </div>

      {/* Chain nudge */}
      <div className="pv-chain-nudge" style={{ marginTop: 14 }}>
        <div className="pv-cn-dot"></div>
        <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>
          After revision, <strong>start a Rotational Motion study session</strong> to lock in what you just learned.
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--jade)", flexShrink: 0 }}>
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
}
