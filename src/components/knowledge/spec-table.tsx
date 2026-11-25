import { ExternalLink } from "lucide-react";
import type { ComponentRating, SensorSpec, VerificationStatus } from "@/lib/data/types";
import { labelForSpecKey } from "@/lib/knowledge/filters";
import { ProvenanceBadge } from "./provenance-badge";

export interface SpecTableRow {
  key: string;
  label: string;
  min: number | null;
  typ: number | null;
  max: number | null;
  unit: string;
  conditions: string | null;
  verificationStatus: VerificationStatus;
  source: string | null;
}

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function fmtNum(v: number | null): string {
  return v === null ? "—" : String(v);
}

export function sensorSpecsToRows(specs: SensorSpec[]): SpecTableRow[] {
  return specs.map((s) => ({
    key: s.key,
    label: labelForSpecKey(s.key),
    min: s.minValue,
    typ: s.typValue,
    max: s.maxValue,
    unit: s.unit,
    conditions: s.conditions,
    verificationStatus: s.verificationStatus,
    source: s.source ?? null,
  }));
}

export function componentRatingsToRows(ratings: ComponentRating[]): SpecTableRow[] {
  return ratings.map((r) => ({
    key: r.key,
    label: r.label,
    min: r.min,
    typ: r.typ,
    max: r.max,
    unit: r.unit,
    conditions: r.conditions,
    verificationStatus: r.verificationStatus,
    source: r.source || null,
  }));
}

export function SpecTable({
  rows,
  emptyMessage = "No structured specifications recorded yet.",
}: {
  rows: SpecTableRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-5 text-center text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[640px] border-collapse text-left text-xs">
        <thead className="border-b bg-surface-raised/60 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Parameter</th>
            <th className="px-3 py-2.5 text-right font-semibold">Min</th>
            <th className="px-3 py-2.5 text-right font-semibold">Typ</th>
            <th className="px-3 py-2.5 text-right font-semibold">Max</th>
            <th className="px-3 py-2.5 font-semibold">Unit</th>
            <th className="px-3 py-2.5 font-semibold">Conditions</th>
            <th className="px-3 py-2.5 font-semibold">Provenance</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, idx) => (
            <tr key={`${r.key}-${idx}`} className="hover:bg-surface-raised/30">
              <td className="px-3 py-2.5 font-medium text-foreground">{r.label}</td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                {fmtNum(r.min)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium text-foreground">
                {fmtNum(r.typ)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                {fmtNum(r.max)}
              </td>
              <td className="px-3 py-2.5 font-mono text-accent">{r.unit || "—"}</td>
              <td className="max-w-xs px-3 py-2.5 text-muted-foreground">{r.conditions ?? "—"}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <ProvenanceBadge status={r.verificationStatus} />
                  {isSafeHttpUrl(r.source) && (
                    <a
                      href={r.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open manufacturer source reference"
                      aria-label={`Source for ${r.label}`}
                      className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      Source
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
