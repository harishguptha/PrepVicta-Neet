import Link from "next/link";

interface LearningToolCardProps {
  href: string;
  icon: string;
  label: string;
  description?: string;
}

export default function LearningToolCard({ href, icon, label, description }: LearningToolCardProps) {
  return (
    <Link
      href={href}
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md flex flex-col items-center text-center gap-sm hover:shadow-md hover:border-secondary/30 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container transition-colors">
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary text-[24px] transition-colors">
          {icon}
        </span>
      </div>
      <span className="text-[14px] font-semibold tracking-[0.05em] text-on-surface">{label}</span>
      {description && <span className="text-[12px] text-on-surface-variant">{description}</span>}
    </Link>
  );
}
