type Props = { variant?: "dark" | "light"; className?: string };

export default function Logo({ variant = "dark", className = "" }: Props) {
  const text = variant === "dark" ? "text-apex-900" : "text-white";
  const sub = variant === "dark" ? "text-apex-600" : "text-apex-200";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#12A15F" />
        {/* Apex: the peak of the "A" */}
        <path d="M9.5 30 20 9l10.5 21" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* Signal: a pulse line forming the crossbar */}
        <path d="M13.5 24.5h4l2.5-5 2.6 7.5 2-2.5h2.4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-lg font-extrabold tracking-tight ${text}`}>Trust</span>
        <span className={`text-[11px] font-semibold tracking-wide ${sub}`}>Signal Trade</span>
      </span>
    </span>
  );
}