interface TaskCardProps {
  subject: string;
  title: string;
  note: string;
  duration: string;
  priority: "must" | "should" | "could";
  done?: boolean;
}

const borderColors = {
  must: "border-l-error",
  should: "border-l-tertiary-fixed-dim",
  could: "border-l-transparent border border-outline-variant/30",
};

export default function TaskCard({ subject, title, note, duration, priority, done }: TaskCardProps) {
  const borderClass = borderColors[priority];
  return (
    <div
      className={`bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow ${
        priority !== "could" ? `border-l-4 ${borderClass}` : borderClass
      } ${done ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`bg-surface-container-high text-on-surface px-2.5 py-1 rounded text-[12px] font-semibold uppercase tracking-wider ${done ? "line-through" : ""}`}>
          {subject}
        </span>
        {done ? (
          <span className="text-secondary text-[14px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Done
          </span>
        ) : (
          <span className="text-on-surface-variant text-[14px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span> {duration}
          </span>
        )}
      </div>
      <h4 className={`font-[family-name:var(--font-lexend)] text-[18px] font-semibold text-on-surface mb-2 leading-tight ${done ? "line-through" : ""}`}>
        {title}
      </h4>
      <p className={`text-[14px] text-on-surface-variant mb-4 ${done ? "line-through" : ""} ${priority === "must" && !done ? "text-error flex items-center gap-1" : ""}`}>
        {priority === "must" && !done && <span className="material-symbols-outlined text-[14px]">warning</span>}
        {note}
      </p>
      {done ? (
        <button className="w-full bg-surface-container text-on-surface text-[14px] font-semibold py-2.5 rounded-lg border border-outline-variant/30" disabled>
          Completed
        </button>
      ) : priority === "must" ? (
        <button className="w-full bg-primary text-on-primary text-[14px] font-semibold py-2.5 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm">
          Start Task
        </button>
      ) : priority === "should" ? (
        <button className="w-full border-2 border-secondary text-secondary text-[14px] font-semibold py-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
          Start Task
        </button>
      ) : (
        <button className="w-full bg-transparent text-primary text-[14px] font-semibold py-2.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container transition-colors">
          Start Task
        </button>
      )}
    </div>
  );
}
