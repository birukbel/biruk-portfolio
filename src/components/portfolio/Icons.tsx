import type { ReactNode } from "react";

const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

const paths: Record<string, ReactNode> = {
  learn: <><path d="M3 9l9-5 9 5-9 5-9-5z" /><path d="M7 11.5V16c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4.5" /></>,
  code: <><path d="M8 7l-5 5 5 5" /><path d="M16 7l5 5-5 5" /><path d="M14 4l-4 16" /></>,
  chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
  spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5a3 3 0 010 6" /><path d="M18 14.5c1.8.8 3 2.6 3 5.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  link: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>,
  download: <><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      {paths[name] ?? paths.spark}
    </svg>
  );
}

/** Soft Ethiopian-inspired cross ornament (simplified four-lobed processional cross). Decorative only. */
export function CrossDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-accent2/80 ${className ?? ""}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M14 2v6M14 20v6M2 14h6M20 14h6" />
        <circle cx="14" cy="14" r="4" />
        <circle cx="14" cy="14" r="1" fill="currentColor" />
        <path d="M14 8l2 2-2 2-2-2 2-2zM14 16l2 2-2 2-2-2 2-2zM8 14l2-2 2 2-2 2-2-2zM16 14l2-2 2 2-2 2-2-2z" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
    </div>
  );
}
