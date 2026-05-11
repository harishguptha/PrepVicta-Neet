import Link from "next/link";

const tools = [
  { href: "/learn/deep-learning", icon: "menu_book", label: "Deep Read", desc: "Guided chunks with focus mode" },
  { href: "/learn/audio", icon: "headphones", label: "Audio", desc: "Listen and revise on the go" },
  { href: "/revision", icon: "psychology", label: "Active Recall", desc: "Retrieval rounds from weak areas" },
  { href: "/learn/mindmap", icon: "account_tree", label: "AI Mindmap", desc: "Visual links between concepts" },
  { href: "/prepai", icon: "schema", label: "AI Flowchart", desc: "Process flows and logic chains" },
  { href: "/learn/mnemonic", icon: "emoji_objects", label: "Mnemonic", desc: "Memory hooks for heavy facts" },
  { href: "/learn/feynman", icon: "record_voice_over", label: "Feynman", desc: "Explain a topic in plain words" },
  { href: "/prepai", icon: "edit_note", label: "Smart Notes", desc: "Structured notes from material" },
];

const outcomes = [
  "Torque meaning: why force turns an object.",
  "Formula use: when tau = rF sin theta applies.",
  "Common traps: sign convention and angle choice.",
];

const learningPaths = [
  {
    href: "/learn/deep-learning",
    icon: "menu_book",
    label: "Study",
    desc: "Guided chapter session with outcomes, material, and focused reading blocks.",
    meta: "Current block: Rotational Motion",
    action: "Open study",
  },
  {
    href: "/revision",
    icon: "restart_alt",
    label: "Revision",
    desc: "Active recall, spaced cycles, and short memory wins for weak topics.",
    meta: "Due today: 3 revision tasks",
    action: "Open revision",
  },
];

export default function LearningCentrePage() {
  return (
    <div className="pv-study-page">
      <section className="pv-study-hero">
        <div className="pv-study-hero-copy">
          <span className="pv-study-kicker">Learning Center</span>
          <h1>Rotational Motion focus block</h1>
          <p>
            Start from the next planned chapter, preview the exact outcomes, then move into one clean study session.
          </p>
          <div className="pv-study-actions">
            <Link href="/learn/deep-learning" className="pv-study-primary">
              <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
              Start focus session
            </Link>
            <Link href="/planner" className="pv-study-secondary">
              <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
              Back to plan
            </Link>
          </div>
        </div>

        <div className="pv-study-session-card" aria-label="Current study session">
          <div className="pv-session-top">
            <span className="material-symbols-outlined" aria-hidden="true">timer</span>
            <div>
              <strong>18 min</strong>
              <span>Chunk 1 ready</span>
            </div>
          </div>
          <div className="pv-session-topic">Mission: Torque Basics</div>
          <div className="pv-session-progress">
            <span style={{ width: "64%" }} />
          </div>
          <div className="pv-session-stats">
            <div><strong>High</strong><span>NEET weightage</span></div>
            <div><strong>3</strong><span>Exam traps</span></div>
            <div><strong>4</strong><span>Chunks</span></div>
          </div>
        </div>
      </section>

      <section className="pv-learning-hub" aria-label="Learning Center paths">
        <div className="pv-learning-hub-head">
          <div>
            <span className="pv-study-kicker">Learning Center</span>
            <h2>Choose how you want to work now</h2>
          </div>
          <span className="pv-learning-hub-status">2 modes</span>
        </div>

        <div className="pv-learning-paths">
          {learningPaths.map((path) => (
            <Link key={path.label} href={path.href} className="pv-learning-path-card">
              <span className="material-symbols-outlined pv-learning-path-icon" aria-hidden="true">{path.icon}</span>
              <div className="pv-learning-path-copy">
                <div className="pv-learning-path-top">
                  <div className="pv-learning-path-label">{path.label}</div>
                  <span>{path.action}</span>
                </div>
                <p>{path.desc}</p>
                <div className="pv-learning-path-meta">{path.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pv-study-layout">
        <div className="pv-study-main">
          <div className="pv-study-panel pv-study-panel-strong">
            <div className="pv-study-panel-head">
              <div>
                <span className="pv-study-kicker">Preview before reading</span>
                <h2>What to hunt for in this chapter</h2>
              </div>
              <div className="pv-formula-chip">tau = r x F</div>
            </div>

            <p className="pv-study-copy">
              Read with a target. This block turns the chapter into concrete outcomes before opening the full material.
            </p>

            <div className="pv-outcome-list">
              {outcomes.map((item, index) => (
                <div className="pv-outcome-item" key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className="pv-exam-callout">
              <span className="material-symbols-outlined" aria-hidden="true">target</span>
              <p><strong>NEET often tests:</strong> torque can be zero even with a large force when the line of action passes through the pivot.</p>
            </div>
          </div>

          <div className="pv-study-panel">
            <div className="pv-study-panel-head">
              <div>
                <span className="pv-study-kicker">Add learning material</span>
                <h2>Build today&apos;s source stack</h2>
              </div>
            </div>
            <div className="pv-source-grid">
              <button className="pv-source-action">
                <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                Choose files
              </button>
              <button className="pv-source-action">
                <span className="material-symbols-outlined" aria-hidden="true">link</span>
                Add link
              </button>
              <button className="pv-source-action">
                <span className="material-symbols-outlined" aria-hidden="true">smart_display</span>
                Add video
              </button>
            </div>
            <div className="pv-study-input-row">
              <input placeholder="Paste content, link, video, or article URL" />
              <button>Add</button>
            </div>
          </div>
        </div>

        <aside className="pv-study-side">
          <div className="pv-study-panel">
            <span className="pv-study-kicker">Source queue</span>
            <div className="pv-source-item"><strong>Class notes PDF</strong><span>4 guided chunks extracted.</span></div>
            <div className="pv-source-item"><strong>YouTube lecture</strong><span>18 min torque segment queued.</span></div>
            <div className="pv-source-item"><strong>Coaching link</strong><span>Formula traps added to Exam Lens.</span></div>
          </div>
          <div className="pv-study-panel pv-study-next-card">
            <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
            <strong>Next best action</strong>
            <p>Finish chunk 1, then do one active recall pass before switching tools.</p>
          </div>
        </aside>
      </section>

      <section>
        <div className="pv-study-tools-head">
          <div>
            <span className="pv-study-kicker">Learning tools</span>
            <h2>Pick a mode</h2>
          </div>
        </div>
        <div className="pv-tool-grid">
          {tools.map((tool) => (
            <Link key={tool.label} href={`/learn/select-syllabus?next=${encodeURIComponent(tool.href)}&label=${encodeURIComponent(tool.label)}`} className="pv-tool-card">
              <span className="material-symbols-outlined pv-tool-icon" aria-hidden="true">{tool.icon}</span>
              <div className="pv-tool-label">{tool.label}</div>
              <div className="pv-tool-desc">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
