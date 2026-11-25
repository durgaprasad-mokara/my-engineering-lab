"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Cpu, ExternalLink, GitCompare, Plus, Wifi } from "lucide-react";
import type { CatalogueMcu } from "@/lib/data/types";
import { filterMcus, MAX_COMPARE_SENSORS, toggleCompareSlug } from "@/lib/knowledge/filters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { CatalogueFilter } from "./catalogue-filter";
import { ProvenanceBadge } from "./provenance-badge";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function formatMemoryKb(kb: number | null): string {
  if (kb === null) return "—";
  if (kb >= 1024) {
    const mb = kb / 1024;
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

export function BoardSelector({ items }: { items: CatalogueMcu[] }) {
  const [query, setQuery] = React.useState("");
  const [vendor, setVendor] = React.useState("all");
  const [wirelessRequired, setWirelessRequired] = React.useState<"any" | "yes" | "no">("any");
  const [wirelessProtocol, setWirelessProtocol] = React.useState("all");
  const [minFlashKb, setMinFlashKb] = React.useState<string>("0");
  const [minRamKb, setMinRamKb] = React.useState<string>("0");
  const [minGpio, setMinGpio] = React.useState<string>("0");
  const [compareSlugs, setCompareSlugs] = React.useState<string[]>([]);

  const vendors = React.useMemo(
    () => [...new Set(items.map((m) => m.vendor))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const wirelessProtocols = React.useMemo(
    () => [...new Set(items.flatMap((m) => m.wireless))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filtered = React.useMemo(
    () =>
      filterMcus(items, {
        query,
        vendor,
        wirelessRequired,
        wirelessProtocol,
        minFlashKb: Number(minFlashKb) > 0 ? Number(minFlashKb) : null,
        minRamKb: Number(minRamKb) > 0 ? Number(minRamKb) : null,
        minGpio: Number(minGpio) > 0 ? Number(minGpio) : null,
      }),
    [items, query, vendor, wirelessRequired, wirelessProtocol, minFlashKb, minRamKb, minGpio],
  );

  const comparedBoards = React.useMemo(
    () =>
      compareSlugs
        .map((slug) => items.find((m) => m.slug === slug))
        .filter((m): m is CatalogueMcu => Boolean(m)),
    [compareSlugs, items],
  );

  const hasActiveFilters = Boolean(
    query.trim() ||
      vendor !== "all" ||
      wirelessRequired !== "any" ||
      wirelessProtocol !== "all" ||
      minFlashKb !== "0" ||
      minRamKb !== "0" ||
      minGpio !== "0",
  );

  const reset = () => {
    setQuery("");
    setVendor("all");
    setWirelessRequired("any");
    setWirelessProtocol("all");
    setMinFlashKb("0");
    setMinRamKb("0");
    setMinGpio("0");
  };

  return (
    <div className="space-y-4">
      <CatalogueFilter
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search boards, CPU cores, architectures, languages or applications…"
        searchLabel="Search microcontrollers"
        selects={[
          {
            id: "vendor",
            label: "Filter by vendor",
            value: vendor,
            onChange: setVendor,
            options: [
              { value: "all", label: "All vendors" },
              ...vendors.map((v) => ({ value: v, label: v })),
            ],
          },
          {
            id: "wireless-required",
            label: "Wireless requirement",
            value: wirelessRequired,
            onChange: (v) => setWirelessRequired(v as "any" | "yes" | "no"),
            options: [
              { value: "any", label: "Wireless: Any" },
              { value: "yes", label: "Wireless required" },
              { value: "no", label: "Wired / no radio" },
            ],
          },
          {
            id: "wireless-protocol",
            label: "Wireless protocol",
            value: wirelessProtocol,
            onChange: setWirelessProtocol,
            options: [
              { value: "all", label: "Any radio protocol" },
              ...wirelessProtocols.map((p) => ({ value: p, label: p })),
            ],
          },
        ]}
        resultCount={filtered.length}
        totalCount={items.length}
        itemLabel="boards & MCUs"
        hasActiveFilters={hasActiveFilters}
        onReset={reset}
        actions={
          <span className="font-mono text-[11px] text-muted-foreground">
            Compare slots: {compareSlugs.length}/{MAX_COMPARE_SENSORS}
          </span>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Cpu className="size-3.5 text-accent" />
              Requirement-driven board selector
            </CardTitle>
            <CardDescription>
              Filter MCUs by minimum Flash, SRAM and GPIO pin budgets alongside wireless capabilities.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="min-flash" className="block text-[11px] font-medium text-muted-foreground">
              Minimum Flash
            </label>
            <Select id="min-flash" value={minFlashKb} onChange={(e) => setMinFlashKb(e.target.value)}>
              <option value="0">Any Flash</option>
              <option value="32">≥ 32 KB (ATmega class)</option>
              <option value="64">≥ 64 KB</option>
              <option value="256">≥ 256 KB</option>
              <option value="1024">≥ 1 MB</option>
              <option value="2048">≥ 2 MB</option>
              <option value="4096">≥ 4 MB</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label htmlFor="min-ram" className="block text-[11px] font-medium text-muted-foreground">
              Minimum RAM
            </label>
            <Select id="min-ram" value={minRamKb} onChange={(e) => setMinRamKb(e.target.value)}>
              <option value="0">Any RAM</option>
              <option value="2">≥ 2 KB</option>
              <option value="20">≥ 20 KB</option>
              <option value="64">≥ 64 KB</option>
              <option value="256">≥ 256 KB</option>
              <option value="512">≥ 512 KB</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label htmlFor="min-gpio" className="block text-[11px] font-medium text-muted-foreground">
              Minimum GPIO count
            </label>
            <Select id="min-gpio" value={minGpio} onChange={(e) => setMinGpio(e.target.value)}>
              <option value="0">Any GPIO count</option>
              <option value="14">≥ 14 GPIOs</option>
              <option value="26">≥ 26 GPIOs</option>
              <option value="32">≥ 32 GPIOs</option>
              <option value="34">≥ 34 GPIOs</option>
              <option value="48">≥ 48 GPIOs</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {comparedBoards.length > 0 && (
        <Card className="border-accent/30">
          <CardHeader className="flex-col gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="size-4 text-accent" />
                Side-by-side MCU comparison ({comparedBoards.length})
              </CardTitle>
              <CardDescription>Architecture, memory, GPIO, wireless and power comparison.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setCompareSlugs([])}>
              Clear comparison
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
              <thead className="border-b bg-surface-raised/60">
                <tr>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Specification</th>
                  {comparedBoards.map((b) => (
                    <th key={b.slug} className="px-3 py-2 font-semibold">
                      <Link href={`/microcontrollers/${b.slug}`} className="hover:text-accent">
                        {b.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Vendor</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2">
                      {b.vendor}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">CPU / Architecture</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2">
                      {b.cpu ?? b.architecture ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Max Clock</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2 font-mono tabular-nums">
                      {b.maxClockMhz !== null ? `${b.maxClockMhz} MHz` : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Flash / RAM</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2 font-mono tabular-nums">
                      {formatMemoryKb(b.flashKb)} / {formatMemoryKb(b.ramKb)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">GPIO pins</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2 font-mono tabular-nums">
                      {b.gpioCount ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Wireless</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2">
                      {b.wireless.length > 0 ? b.wireless.join(", ") : "None (wired)"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Supply voltage</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2 font-mono tabular-nums">
                      {b.power?.supplyVoltageMin !== null &&
                      b.power?.supplyVoltageMin !== undefined &&
                      b.power?.supplyVoltageMax !== null &&
                      b.power?.supplyVoltageMax !== undefined
                        ? `${b.power.supplyVoltageMin}–${b.power.supplyVoltageMax} V`
                        : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">Deep sleep</td>
                  {comparedBoards.map((b) => (
                    <td key={b.slug} className="px-3 py-2 font-mono tabular-nums">
                      {b.power?.deepSleepUa !== null && b.power?.deepSleepUa !== undefined
                        ? `${b.power.deepSleepUa} µA`
                        : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No boards meet all selected hardware requirements. Try lowering minimum Flash, RAM or GPIO thresholds.
          </p>
          {hasActiveFilters && (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={reset}>
              Reset filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mcu) => {
            const isCompared = compareSlugs.includes(mcu.slug);
            const atLimit = !isCompared && compareSlugs.length >= MAX_COMPARE_SENSORS;
            return (
              <Card
                key={mcu.id}
                className={cn("flex flex-col transition-colors", isCompared && "border-accent/50")}
              >
                <CardHeader className="pb-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{mcu.vendor}</Badge>
                      <ProvenanceBadge status={mcu.verificationStatus} />
                    </div>
                    <CardTitle className="text-base">
                      <Link href={`/microcontrollers/${mcu.slug}`} className="hover:text-accent">
                        {mcu.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {mcu.cpu ?? mcu.architecture ?? "Processor details"}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-1">
                  <dl className="grid grid-cols-2 gap-2 rounded-md border bg-surface-raised/40 p-2.5 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase text-muted-foreground">Clock</dt>
                      <dd className="font-mono tabular-nums font-medium">
                        {mcu.maxClockMhz !== null ? `${mcu.maxClockMhz} MHz` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-muted-foreground">GPIO</dt>
                      <dd className="font-mono tabular-nums font-medium">{mcu.gpioCount ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-muted-foreground">Flash</dt>
                      <dd className="font-mono tabular-nums font-medium">{formatMemoryKb(mcu.flashKb)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-muted-foreground">RAM</dt>
                      <dd className="font-mono tabular-nums font-medium">{formatMemoryKb(mcu.ramKb)}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center gap-1">
                    {mcu.wireless.length > 0 ? (
                      mcu.wireless.map((radio) => (
                        <span
                          key={radio}
                          className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent"
                        >
                          <Wifi className="size-2.5" aria-hidden />
                          {radio}
                        </span>
                      ))
                    ) : (
                      <span className="rounded border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        Wired only
                      </span>
                    )}
                    {mcu.languages.slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className="rounded bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={isCompared ? "accent" : "outline"}
                      disabled={atLimit}
                      aria-pressed={isCompared}
                      onClick={() =>
                        setCompareSlugs((cur) => toggleCompareSlug(cur, mcu.slug, MAX_COMPARE_SENSORS))
                      }
                      className="h-7 px-2.5 text-[11px]"
                    >
                      {isCompared ? <Check className="size-3" /> : <Plus className="size-3" />}
                      {isCompared ? "Compared" : "Compare"}
                    </Button>
                    {isSafeHttpUrl(mcu.sourceUrl) && (
                      <a
                        href={mcu.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Datasheet
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/microcontrollers/${mcu.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    Board sheet
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
