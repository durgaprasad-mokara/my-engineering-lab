"use client";

import Link from "next/link";
import { ExternalLink, GitCompare, X } from "lucide-react";
import type { CatalogueSensor } from "@/lib/data/types";
import {
  buildSensorComparisonMatrix,
  formatSpecRange,
  labelForSensorGroup,
  MAX_COMPARE_SENSORS,
} from "@/lib/knowledge/filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvenanceBadge } from "./provenance-badge";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function ComparePanel({
  sensors,
  onRemove,
  onClear,
}: {
  sensors: CatalogueSensor[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  if (sensors.length === 0) return null;

  const { rows } = buildSensorComparisonMatrix(sensors);

  return (
    <Card className="border-accent/30">
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="size-4 text-accent" />
            Five-way sensor comparison
          </CardTitle>
          <CardDescription>
            Comparing {sensors.length} of up to {MAX_COMPARE_SENSORS} sensors side by side. Shareable via URL query
            parameter (<code className="font-mono text-[11px]">?compare=…</code>).
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">
            {sensors.length} / {MAX_COMPARE_SENSORS} selected
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            Clear comparison
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {sensors.map((s) => (
            <span
              key={s.slug}
              className="inline-flex items-center gap-1.5 rounded-full border bg-surface-raised px-2.5 py-1 text-xs"
            >
              <Link href={`/sensors/${s.slug}`} className="font-medium hover:text-accent">
                {s.name}
              </Link>
              <button
                type="button"
                onClick={() => onRemove(s.slug)}
                aria-label={`Remove ${s.name} from comparison`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        {sensors.length === 1 && (
          <p className="rounded-md border border-dashed bg-surface-raised/30 px-3 py-2 text-xs text-muted-foreground">
            Select up to {MAX_COMPARE_SENSORS - 1} more sensors below to compare measurement principles, ranges,
            interfaces and tolerances side by side.
          </p>
        )}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[620px] border-collapse text-left text-xs">
            <thead className="border-b bg-surface-raised/60">
              <tr>
                <th className="w-44 px-3 py-2.5 font-semibold text-muted-foreground">Attribute / Spec</th>
                {sensors.map((s) => (
                  <th key={s.slug} className="min-w-[170px] px-3 py-2.5 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/sensors/${s.slug}`} className="text-sm font-semibold text-foreground hover:text-accent">
                          {s.name}
                        </Link>
                        <div className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                          {labelForSensorGroup(s.sensorGroup)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(s.slug)}
                        aria-label={`Remove ${s.name}`}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Measurand</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2 capitalize">
                    {s.measurand}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Principle</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2">
                    {s.measurementPrinciple ?? "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Output &amp; protocols</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.outputType && (
                        <Badge variant="outline" className="text-[10px]">
                          {s.outputType}
                        </Badge>
                      )}
                      {s.protocols.map((p) => (
                        <span key={p} className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[10px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Record provenance</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ProvenanceBadge status={s.verificationStatus} />
                      {isSafeHttpUrl(s.sourceUrl) && (
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline"
                        >
                          Ref
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-surface-raised/30">
                  <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                  {sensors.map((s) => {
                    const spec = row.values[s.slug] ?? null;
                    if (!spec) {
                      return (
                        <td key={s.slug} className="px-3 py-2 text-muted-foreground">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={s.slug} className="px-3 py-2 align-top">
                        <div className="font-mono tabular-nums text-foreground">{formatSpecRange(spec)}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <ProvenanceBadge status={spec.verificationStatus} showIcon={false} />
                          {spec.conditions && (
                            <span className="text-[10px] text-muted-foreground">{spec.conditions}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Key advantages</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2 align-top">
                    <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                      {s.advantages.slice(0, 3).map((adv) => (
                        <li key={adv}>{adv}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">Key limitations</td>
                {sensors.map((s) => (
                  <td key={s.slug} className="px-3 py-2 align-top">
                    <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                      {s.disadvantages.slice(0, 3).map((dis) => (
                        <li key={dis}>{dis}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
