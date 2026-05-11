import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";

const subjectBreakdown = [
  { subject: "Physics", score: 160, total: 180, accuracy: 82, color: "bg-primary-container" },
  { subject: "Chemistry", score: 170, total: 180, accuracy: 88, color: "bg-tertiary-fixed-dim" },
  { subject: "Biology", score: 285, total: 360, accuracy: 85, color: "bg-secondary" },
];

const aiActionPlan = [
  { icon: "priority_high", text: "Revise Rotational Motion — you lost 12 marks from careless errors", priority: "high" },
  { icon: "auto_stories", text: "Re-read Chemical Kinetics — your accuracy dropped 15% since Mock 10", priority: "high" },
  { icon: "timer", text: "Practice time management in Physics — avg 1m 28s/question (target: 1m)", priority: "medium" },
  { icon: "psychology", text: "Strong performance in Genetics! Consider moving to advanced NCERT problems", priority: "low" },
  { icon: "event", text: "Schedule a full mock within 3 days to reinforce improvements", priority: "medium" },
];

export default function TestResultsPage() {
  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Link href="/tests" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Performance Analysis</p>
          <h1 className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold leading-[1.25] tracking-tight text-on-surface">Mock Test 12 Results</h1>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-primary-container rounded-xl p-md text-white">
          <span className="text-[12px] font-medium text-on-primary-container uppercase tracking-wider">Total Score</span>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold leading-[1.2] mt-xs">615<span className="text-[24px] text-on-primary-container">/720</span></div>
          <div className="mt-md h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full w-[85%]" />
          </div>
          <p className="text-[14px] text-on-primary-container mt-xs">85.4% — Excellent performance</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Overall Accuracy</span>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold leading-[1.2] text-secondary mt-xs">85%</div>
          <p className="text-[14px] text-on-surface-variant mt-xs">153/180 correct answers</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Avg. Time per Question</span>
          <div className="font-[family-name:var(--font-lexend)] text-[48px] font-bold leading-[1.2] text-on-surface mt-xs">55s</div>
          <p className="text-[14px] text-on-surface-variant mt-xs">Within target range</p>
        </div>
      </div>

      {/* Subject Breakdown */}
      <section className="flex flex-col gap-md">
        <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">Subject Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {subjectBreakdown.map((s) => (
            <div key={s.subject} className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
              <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-sm">{s.subject}</h3>
              <div className="flex justify-between items-baseline mb-xs">
                <span className="font-[family-name:var(--font-lexend)] text-[32px] font-semibold text-on-surface">{s.score}</span>
                <span className="text-[14px] text-on-surface-variant">/{s.total}</span>
              </div>
              <ProgressBar value={s.accuracy} color={s.color} />
              <p className="text-[14px] text-on-surface-variant mt-xs">{s.accuracy}% accuracy</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts Placeholder */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-md">Chapter Analysis</h3>
          <div className="h-48 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-outline text-[48px]">bar_chart</span>
              <p className="text-[14px] text-on-surface-variant mt-sm">Chapter-wise performance breakdown</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
          <h3 className="font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-md">Score Trajectory</h3>
          <div className="h-48 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-outline text-[48px]">show_chart</span>
              <p className="text-[14px] text-on-surface-variant mt-sm">Mock score trend over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Action Plan */}
      <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-sm mb-md">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold leading-[1.3] text-on-surface">AI Action Plan</h2>
        </div>
        <div className="space-y-sm">
          {aiActionPlan.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-sm p-sm rounded-lg ${
                item.priority === "high" ? "bg-error-container/20 border border-error/10" :
                item.priority === "medium" ? "bg-tertiary-fixed/20 border border-tertiary-fixed-dim/10" :
                "bg-secondary-container/20 border border-secondary/10"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                item.priority === "high" ? "text-error" :
                item.priority === "medium" ? "text-tertiary-fixed-dim" :
                "text-secondary"
              }`}>{item.icon}</span>
              <p className="text-[14px] text-on-surface">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
