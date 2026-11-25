import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BatteryCharging,
  Code2,
  Cpu,
  ExternalLink,
  Info,
  Wifi,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getMicrocontrollerBySlugResult } from "@/lib/data/microcontrollers";

export const dynamic = "force-dynamic";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function formatMemoryKb(kb: number | null): string {
  if (kb === null) return "—";
  if (kb >= 1024) {
    const mb = kb / 1024;
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB (${kb} KB)`;
  }
  return `${kb} KB`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getMicrocontrollerBySlugResult(slug);
  return { title: item ? `${item.name} — Microcontrollers` : "Microcontroller not found" };
}

export default async function MicrocontrollerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, mode, error } = await getMicrocontrollerBySlugResult(slug);

  if (error && !item) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/microcontrollers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All microcontrollers
        </Link>
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load microcontroller details: {error}
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  const sourceHref = isSafeHttpUrl(item.sourceUrl) ? item.sourceUrl : null;
  const peripheralEntries = item.peripherals ? Object.entries(item.peripherals) : [];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/microcontrollers"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Microcontrollers
      </Link>

      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">{item.vendor}</Badge>
            <ProvenanceBadge status={item.verificationStatus} />
          </div>
        }
        title={item.name}
        description={[item.architecture, item.cpu].filter(Boolean).join(" · ") || undefined}
        actions={
          sourceHref ? (
            <Button asChild size="sm">
              <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                Official Datasheet / Docs
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Max clock</div>
          <div className="mt-1 font-mono text-base font-semibold tabular-nums">
            {item.maxClockMhz !== null ? `${item.maxClockMhz} MHz` : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Flash memory</div>
          <div className="mt-1 font-mono text-base font-semibold tabular-nums">
            {formatMemoryKb(item.flashKb)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">SRAM</div>
          <div className="mt-1 font-mono text-base font-semibold tabular-nums">
            {formatMemoryKb(item.ramKb)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">GPIO count</div>
          <div className="mt-1 font-mono text-base font-semibold tabular-nums">
            {item.gpioCount ?? "—"}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="size-4 text-accent" />
                Peripherals &amp; analogue I/O
              </CardTitle>
              <CardDescription>On-chip converters and serial buses</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-surface-raised/40 p-3 text-xs">
              <div>
                <div className="text-muted-foreground">ADC</div>
                <div className="mt-0.5 font-mono font-medium">
                  {item.adc
                    ? `${item.adc.channels ?? "?"} ch · ${item.adc.bits ?? "?"}-bit`
                    : "None"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">DAC</div>
                <div className="mt-0.5 font-mono font-medium">
                  {item.dac
                    ? `${item.dac.channels ?? "?"} ch · ${item.dac.bits ?? "?"}-bit`
                    : "None (PWM only)"}
                </div>
              </div>
            </div>

            {peripheralEntries.length > 0 ? (
              <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {peripheralEntries.map(([key, val]) => (
                  <div key={key} className="rounded-md border px-3 py-2">
                    <dt className="font-mono text-[10px] uppercase text-muted-foreground">{key}</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-foreground">{String(val)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-muted-foreground">No peripheral map recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <BatteryCharging className="size-4 text-accent" />
                Power profile
              </CardTitle>
              <CardDescription>Supply envelope and typical active/sleep current</CardDescription>
            </div>
            {item.power && <ProvenanceBadge status={item.power.verificationStatus} />}
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {item.power ? (
              <>
                <dl className="grid grid-cols-3 gap-3 rounded-md border bg-surface-raised/40 p-3">
                  <div>
                    <dt className="text-muted-foreground">Supply range</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums">
                      {item.power.supplyVoltageMin !== null && item.power.supplyVoltageMax !== null
                        ? `${item.power.supplyVoltageMin}–${item.power.supplyVoltageMax} V`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Active current</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums">
                      {item.power.activeMa !== null ? `${item.power.activeMa} mA` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Deep sleep</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums">
                      {item.power.deepSleepUa !== null ? `${item.power.deepSleepUa} µA` : "—"}
                    </dd>
                  </div>
                </dl>
                {isSafeHttpUrl(item.power.source) && (
                  <a
                    href={item.power.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Power specification source
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No power profile recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="size-4 text-accent" />
              Wireless radios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.wireless.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.wireless.map((w) => (
                  <Badge key={w} variant="accent">
                    {w}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No integrated wireless radio (wired interfaces only).</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="size-4 text-accent" />
              Toolchains &amp; languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Languages</div>
              <div className="flex flex-wrap gap-1">
                {item.languages.map((lang) => (
                  <span key={lang} className="rounded border bg-surface-raised px-2 py-0.5 font-mono">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Dev tools</div>
              <div className="flex flex-wrap gap-1">
                {item.devTools.map((tool) => (
                  <span key={tool} className="rounded border bg-surface-raised px-2 py-0.5">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {item.applications.map((app) => (
                <li key={app}>{app}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Info className="size-3.5 text-accent" />
            Provenance &amp; source attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>
              Status: <ProvenanceBadge status={item.verificationStatus} className="ml-1" />
            </div>
            {(item.sourceTitle || item.documentRev) && (
              <div>
                Reference: {[item.sourceTitle, item.documentRev].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          {sourceHref && (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-accent hover:underline"
            >
              {sourceHref}
              <ExternalLink className="size-3" />
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
