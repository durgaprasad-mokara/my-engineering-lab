import Link from "next/link";
import { Check, Layers } from "lucide-react";
import type { ConfigurationSummary } from "@/lib/data/types";
import type { AppMode } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

const CRITERIA = [
  ["cost", "Cost"],
  ["power", "Power"],
  ["performance", "Perf."],
  ["compatibility", "Compat."],
  ["scalability", "Scale"],
] as const;

function Score({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${v} of 5`} title={`${v} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-2.5 rounded-sm ${i <= v ? "bg-accent" : "bg-border"}`} />
      ))}
    </div>
  );
}

export function ConfigComparison({
  configs,
  project,
  mode,
}: {
  configs: ConfigurationSummary[];
  project: string | null;
  mode: AppMode;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Layers className="size-4 text-accent" /> Five-configuration comparison</CardTitle>
          <CardDescription>
            {project ? `${project} · relative scores, 5 = best` : "Relative scores, 5 = best"}
          </CardDescription>
        </div>
        <DataSourceBadge source={mode === "demo" ? "demo" : configs.length ? "live" : "none"} />
      </CardHeader>
      <CardContent className="flex-1">
        {configs.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
            No saved configurations yet. The configuration engine that generates and scores five alternatives arrives in{" "}
            <Link href="/hardware-architecture" className="text-accent hover:underline">Phase 5</Link>.
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Configuration</th>
                  {CRITERIA.map(([, l]) => (
                    <th key={l} className="pb-2 font-medium">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {configs.map((c) => (
                  <tr key={c.id} className={c.selected ? "bg-primary/5" : undefined}>
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-1.5">
                        {c.selected && <Check className="size-3.5 text-success" aria-label="Selected" />}
                        <span className={c.selected ? "font-medium" : ""}>{c.name}</span>
                      </span>
                    </td>
                    {CRITERIA.map(([k]) => (
                      <td key={k} className="py-2 pr-2"><Score v={c.scores[k]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {mode === "demo" && (
              <p className="mt-3 text-[10px] text-muted-foreground">
                Demo scores illustrate the comparison layout only; they are not an engineering assessment.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
