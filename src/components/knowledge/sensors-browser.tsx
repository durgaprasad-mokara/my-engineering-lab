"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Plus } from "lucide-react";
import type { CatalogueSensor } from "@/lib/data/types";
import {
  filterSensors,
  formatCompareParam,
  formatSpecRange,
  getSensorGroups,
  labelForSensorGroup,
  labelForSpecKey,
  MAX_COMPARE_SENSORS,
  toggleCompareSlug,
} from "@/lib/knowledge/filters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CatalogueFilter } from "./catalogue-filter";
import { ComparePanel } from "./compare-panel";
import { ProvenanceBadge } from "./provenance-badge";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function SensorsBrowser({
  items,
  initialCompareSlugs,
}: {
  items: CatalogueSensor[];
  initialCompareSlugs: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [group, setGroup] = React.useState("all");
  const [outputType, setOutputType] = React.useState("all");
  const [compareSlugs, setCompareSlugs] = React.useState<string[]>(initialCompareSlugs);

  const groups = React.useMemo(() => getSensorGroups(items), [items]);
  const outputTypes = React.useMemo(
    () =>
      [...new Set(items.map((s) => s.outputType).filter((x): x is string => Boolean(x)))].sort(),
    [items],
  );

  const filtered = React.useMemo(
    () => filterSensors(items, { query, group, outputType }),
    [items, query, group, outputType],
  );

  const selectedSensors = React.useMemo(
    () =>
      compareSlugs
        .map((slug) => items.find((s) => s.slug === slug))
        .filter((s): s is CatalogueSensor => Boolean(s)),
    [compareSlugs, items],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const param = formatCompareParam(compareSlugs);
    if (param) {
      url.searchParams.set("compare", param);
    } else {
      url.searchParams.delete("compare");
    }
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [compareSlugs]);

  const hasActiveFilters = Boolean(query.trim() || group !== "all" || outputType !== "all");

  const resetFilters = () => {
    setQuery("");
    setGroup("all");
    setOutputType("all");
  };

  return (
    <div className="space-y-4">
      <ComparePanel
        sensors={selectedSensors}
        onRemove={(slug) => setCompareSlugs((cur) => cur.filter((s) => s !== slug))}
        onClear={() => setCompareSlugs([])}
      />

      <CatalogueFilter
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by sensor, measurand, principle, protocol (I2C, ultrasonic, Hall)…"
        searchLabel="Search sensors"
        selects={[
          {
            id: "sensor-group",
            label: "Filter by sensor group",
            value: group,
            onChange: setGroup,
            options: [
              { value: "all", label: `All sensor groups (${items.length})` },
              ...groups.map((g) => ({ value: g.group, label: `${g.label} (${g.count})` })),
            ],
          },
          {
            id: "output-type",
            label: "Filter by output type",
            value: outputType,
            onChange: setOutputType,
            options: [
              { value: "all", label: "All output types" },
              ...outputTypes.map((ot) => ({ value: ot, label: ot.replace("_", " ") })),
            ],
          },
        ]}
        resultCount={filtered.length}
        totalCount={items.length}
        itemLabel="sensors"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        actions={
          <span className="font-mono text-[11px] text-muted-foreground">
            Compare slots: {compareSlugs.length}/{MAX_COMPARE_SENSORS}
          </span>
        }
      />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sensor groups">
        <button
          type="button"
          onClick={() => setGroup("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            group === "all"
              ? "border-primary/40 bg-primary/15 text-primary"
              : "bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          All ({items.length})
        </button>
        {groups.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setGroup(g.group === group ? "all" : g.group)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              group === g.group
                ? "border-primary/40 bg-primary/15 text-primary"
                : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {g.label} ({g.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No sensors match your current filter criteria.</p>
          {hasActiveFilters && (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
              Reset filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sensor) => {
            const isCompared = compareSlugs.includes(sensor.slug);
            const atLimit = !isCompared && compareSlugs.length >= MAX_COMPARE_SENSORS;
            return (
              <Card
                key={sensor.id}
                className={cn("flex flex-col transition-colors", isCompared && "border-accent/50")}
              >
                <CardHeader className="pb-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{labelForSensorGroup(sensor.sensorGroup)}</Badge>
                      {sensor.outputType && (
                        <Badge variant="default" className="lowercase">
                          {sensor.outputType.replace("_", " ")}
                        </Badge>
                      )}
                      <ProvenanceBadge status={sensor.verificationStatus} />
                    </div>
                    <CardTitle className="text-base">
                      <Link href={`/sensors/${sensor.slug}`} className="hover:text-accent">
                        {sensor.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Measures <span className="text-foreground">{sensor.measurand}</span>
                      {sensor.measurementPrinciple ? ` · ${sensor.measurementPrinciple}` : ""}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-1">
                  {sensor.specs.length > 0 && (
                    <dl className="space-y-1 rounded-md border bg-surface-raised/40 p-2.5 text-xs">
                      {sensor.specs.slice(0, 3).map((sp) => (
                        <div key={sp.key} className="flex items-baseline justify-between gap-2">
                          <dt className="text-muted-foreground">{labelForSpecKey(sp.key)}</dt>
                          <dd className="text-right font-mono tabular-nums text-foreground">
                            {formatSpecRange(sp)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {sensor.protocols.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sensor.protocols.map((proto) => (
                        <span
                          key={proto}
                          className="rounded border bg-surface-raised/60 px-2 py-0.5 font-mono text-[10px] text-foreground/80"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={isCompared ? "accent" : "outline"}
                      disabled={atLimit}
                      aria-pressed={isCompared}
                      title={
                        atLimit
                          ? `Maximum of ${MAX_COMPARE_SENSORS} sensors can be compared at once`
                          : isCompared
                            ? "Remove from comparison"
                            : "Add to 5-way comparison"
                      }
                      onClick={() =>
                        setCompareSlugs((cur) => toggleCompareSlug(cur, sensor.slug, MAX_COMPARE_SENSORS))
                      }
                      className="h-7 px-2.5 text-[11px]"
                    >
                      {isCompared ? <Check className="size-3" /> : <Plus className="size-3" />}
                      {isCompared ? "Compared" : "Compare"}
                    </Button>
                    {isSafeHttpUrl(sensor.sourceUrl) && (
                      <a
                        href={sensor.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Ref
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/sensors/${sensor.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    Details
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
