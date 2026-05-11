const backlogItems = [
  {
    subject: "Physics",
    title: "Rotational Motion: Rolling without slipping",
    reason: "Missed from yesterday's must-do list",
    impact: "~12 marks at risk",
    priority: "High",
  },
  {
    subject: "Chemistry",
    title: "Organic Basics: GOC error log",
    reason: "Accuracy below 45% in last two mocks",
    impact: "~6 marks at risk",
    priority: "High",
  },
  {
    subject: "Biology",
    title: "Human Physiology spaced cycle",
    reason: "Revision due today",
    impact: "Memory decay window",
    priority: "Medium",
  },
];

export default function BacklogPage() {
  return (
    <>
      <div className="pv-screen-hdr">
        <div>
          <div className="pv-h1">Backlog</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
            Missed, delayed, and high-risk tasks that need recovery.
          </div>
        </div>
        <span style={{ fontSize: 11, padding: "5px 12px", background: "var(--fire-bg)", color: "var(--fire)", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(200,82,72,0.2)" }}>
          3 pending
        </span>
      </div>

      <div className="pv-battle-col" style={{ maxWidth: 760 }}>
        <div className="pv-bc-head">
          <div className="pv-bch-dot" style={{ background: "var(--fire)" }}></div>
          <div className="pv-bch-label">Recovery Queue</div>
          <div className="pv-bch-meta">Do before bonus tasks</div>
        </div>

        {backlogItems.map((item) => (
          <div key={item.title} className="pv-task-card must">
            <div className="pv-tc-top">
              <div className="pv-tc-subj">{item.subject}</div>
              <span style={{ fontSize: 9, fontWeight: 800, color: item.priority === "High" ? "var(--fire)" : "var(--gold)", background: item.priority === "High" ? "var(--fire-bg)" : "var(--gold-bg)", borderRadius: 999, padding: "3px 8px" }}>
                {item.priority}
              </span>
            </div>
            <div className="pv-tc-title">{item.title}</div>
            <div className="pv-tc-why">{item.reason}</div>
            <div className="pv-tc-skip">{item.impact}</div>
            <button className="pv-tc-btn pv-tc-btn-primary">Recover task</button>
          </div>
        ))}
      </div>
    </>
  );
}
