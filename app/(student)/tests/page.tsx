import Link from "next/link";

const testTypes = [
  {
    title: "Subject Test",
    description: "Focus on one subject at a time",
    icon: "science",
    questions: 45,
    time: "45 min",
  },
  {
    title: "Weekly Mixed",
    description: "Cross-subject questions from this week's syllabus",
    icon: "shuffle",
    questions: 30,
    time: "30 min",
  },
  {
    title: "Topic-Wise Test",
    description: "Deep dive into specific chapters",
    icon: "topic",
    questions: 20,
    time: "20 min",
  },
];

export default function TestEnginePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] tracking-tight text-on-surface">Revision Test</h1>
          <p className="text-[16px] text-on-surface-variant mt-xs">Practice, assess, and track revision readiness.</p>
        </div>
        <Link
          href="/tests/results"
          className="hidden md:flex items-center gap-xs bg-primary-container text-on-primary-container text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-primary-container/80 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          View Results
        </Link>
      </div>

      {/* Featured: Full NEET Mock */}
      <div className="bg-primary-container rounded-2xl p-md md:p-lg text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-sm mb-base">
            <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            <span className="text-[12px] font-medium text-on-primary-container uppercase tracking-wider">Full Mock Test</span>
          </div>
          <h2 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] text-white mb-sm">Full NEET Mock</h2>
          <p className="text-[16px] text-on-primary-container mb-lg">180 Questions &bull; 3 Hours &bull; Physics, Chemistry & Biology</p>
          <div className="flex flex-wrap gap-md items-center">
            <button className="bg-secondary text-on-secondary text-[14px] font-semibold tracking-[0.05em] px-8 py-3 rounded-lg hover:bg-on-secondary-fixed-variant transition-colors shadow-sm">
              Start Mock Test
            </button>
            <span className="text-[14px] text-on-primary-container">Next scheduled: Tomorrow, 10:00 AM</span>
          </div>
        </div>
      </div>

      {/* Test Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
            <span className="text-[14px] font-semibold tracking-[0.05em] uppercase">Test Readiness</span>
          </div>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold text-on-surface">82%</div>
          <p className="text-[14px] text-on-surface-variant mt-xs">Based on your last performance</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
            <span className="text-[14px] font-semibold tracking-[0.05em] uppercase">Accuracy</span>
          </div>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold text-on-surface">88%</div>
          <p className="text-[14px] text-on-surface-variant mt-xs">Average across all tests</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-tertiary-fixed-dim">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span className="text-[14px] font-semibold tracking-[0.05em] uppercase">Avg. Time/Q</span>
          </div>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold text-on-surface">1m 12s</div>
          <p className="text-[14px] text-on-surface-variant mt-xs">Target: under 1 min</p>
        </div>
      </div>

      {/* Test Types Grid */}
      <section className="flex flex-col gap-md">
        <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Quick Revision Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {testTypes.map((test) => (
            <div key={test.title} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">{test.icon}</span>
              </div>
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-xs">{test.title}</h3>
              <p className="text-[14px] text-on-surface-variant mb-sm">{test.description}</p>
              <div className="flex items-center gap-md text-[12px] text-on-surface-variant mb-md">
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">help</span> {test.questions}Q
                </span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> {test.time}
                </span>
              </div>
              <button className="w-full border-2 border-secondary text-secondary text-[14px] font-semibold tracking-[0.05em] py-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                Start Test
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
