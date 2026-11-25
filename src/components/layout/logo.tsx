import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="mel-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(189 94% 53%)" />
          <stop offset="1" stopColor="hsl(217 91% 60%)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="hsl(223 42% 12%)" stroke="url(#mel-g)" strokeWidth="1.5" />
      <rect x="10" y="10" width="12" height="12" rx="2" fill="none" stroke="url(#mel-g)" strokeWidth="1.8" />
      {[13, 16, 19].map((p) => (
        <g key={p} stroke="url(#mel-g)" strokeWidth="1.4" strokeLinecap="round">
          <line x1={p} y1="5.5" x2={p} y2="10" />
          <line x1={p} y1="22" x2={p} y2="26.5" />
          <line x1="5.5" y1={p} x2="10" y2={p} />
          <line x1="22" y1={p} x2="26.5" y2={p} />
        </g>
      ))}
      <circle cx="16" cy="16" r="2.2" fill="hsl(189 94% 53%)" />
    </svg>
  );
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-[0.08em]">MY ENGINEERING LAB</div>
          <div className="text-[10px] text-muted-foreground">IoT · Robotics · Electronics</div>
        </div>
      )}
    </div>
  );
}
