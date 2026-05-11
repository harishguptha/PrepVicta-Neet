interface ProgressBarProps {
  value: number;
  color?: string;
  bgColor?: string;
  height?: string;
}

export default function ProgressBar({
  value,
  color = "bg-secondary",
  bgColor = "bg-surface-variant",
  height = "h-2",
}: ProgressBarProps) {
  return (
    <div className={`${height} ${bgColor} rounded-full overflow-hidden`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
