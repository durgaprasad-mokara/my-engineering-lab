import { Badge } from "./badge";
import type { DataSource } from "@/lib/data/types";

const META: Record<DataSource | "none" | "reference" | "rule-based", { label: string; title: string; variant: "live" | "demo" | "illustrative" | "outline" | "accent" }> = {
  live: { label: "Live", title: "Read from your Supabase database", variant: "live" },
  demo: { label: "Demo data", title: "Sample data shown because Supabase is not configured", variant: "demo" },
  illustrative: { label: "Illustrative", title: "Simplified visual — not manufacturer CAD or measured data", variant: "illustrative" },
  none: { label: "No data", title: "Nothing recorded yet", variant: "outline" },
  reference: { label: "Reference", title: "Generic reference architecture for learning", variant: "accent" },
  "rule-based": { label: "Rule-based", title: "Deterministic suggestions — AI recommendations arrive in Phase 10", variant: "outline" },
};

export type BadgeSource = keyof typeof META;

export function DataSourceBadge({ source }: { source: BadgeSource }) {
  const m = META[source];
  return (
    <Badge variant={m.variant} title={m.title}>
      {source === "live" && <span className="size-1.5 animate-pulse-dot rounded-full bg-current" aria-hidden />}
      {m.label}
    </Badge>
  );
}
