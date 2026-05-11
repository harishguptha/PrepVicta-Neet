interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  iconBg?: string;
  iconColor?: string;
  children?: React.ReactNode;
}

export default function StatCard({ icon, label, value, subtitle, iconBg = "bg-surface-container-high", iconColor = "text-secondary", children }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30 flex items-center gap-md">
      <div className={`w-16 h-16 shrink-0 ${iconBg} rounded-full flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[32px] ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="text-[16px] font-medium text-on-surface">{label}</div>
        {children ?? (
          <>
            <div className="font-[family-name:var(--font-lexend)] text-[24px] font-semibold text-on-surface mt-xs">{value}</div>
            {subtitle && <div className="text-[14px] text-on-surface-variant mt-xs">{subtitle}</div>}
          </>
        )}
      </div>
    </div>
  );
}
