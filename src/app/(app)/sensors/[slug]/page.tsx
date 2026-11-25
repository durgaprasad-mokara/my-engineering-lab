import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  ExternalLink,
  GitCompare,
  Info,
  Layers,
  ShieldAlert,
  Thermometer,
  Wrench,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { sensorSpecsToRows, SpecTable } from "@/components/knowledge/spec-table";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getSensorBySlugResult } from "@/lib/data/sensors";
import { labelForSensorGroup } from "@/lib/knowledge/filters";

export const dynamic = "force-dynamic";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getSensorBySlugResult(slug);
  return { title: item ? `${item.name} — Sensors Library` : "Sensor not found" };
}

export default async function SensorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, mode, error } = await getSensorBySlugResult(slug);

  if (error && !item) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/sensors"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All sensors
        </Link>
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load sensor details: {error}
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  const sourceHref = isSafeHttpUrl(item.sourceUrl) ? item.sourceUrl : null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/sensors"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Sensors Library
      </Link>

      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">{labelForSensorGroup(item.sensorGroup)}</Badge>
            {item.outputType && (
              <Badge variant="default" className="lowercase">
                {item.outputType.replace("_", " ")}
              </Badge>
            )}
            <ProvenanceBadge status={item.verificationStatus} />
          </div>
        }
        title={item.name}
        description={
          item.measurementPrinciple
            ? `Measurand: ${item.measurand} · ${item.measurementPrinciple}`
            : `Measurand: ${item.measurand}`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/sensors?compare=${encodeURIComponent(item.slug)}`}>
                <GitCompare className="size-3.5" />
                Compare in library
              </Link>
            </Button>
            {sourceHref && (
              <Button asChild size="sm">
                <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                  Manufacturer Reference
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Measurand</div>
          <div className="mt-1 text-sm font-semibold capitalize">{item.measurand}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Sensor group</div>
          <div className="mt-1 text-sm font-semibold">{labelForSensorGroup(item.sensorGroup)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Output type</div>
          <div className="mt-1 text-sm font-semibold capitalize">
            {item.outputType ? item.outputType.replace("_", " ") : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Protocols / Bus</div>
          <div className="mt-1 font-mono text-xs font-semibold">
            {item.protocols.length > 0 ? item.protocols.join(" · ") : "—"}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Compass className="size-4 text-accent" />
                How it works
              </CardTitle>
              <CardDescription>{item.measurementPrinciple ?? "Sensing physics and signal path"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.howItWorks ?? "No operating explanation recorded yet."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-4 text-accent" />
                Internal construction
              </CardTitle>
              <CardDescription>Transducer element, packaging and signal conditioning</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.internalConstruction ?? "No construction note recorded yet."}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quantitative specifications</CardTitle>
            <CardDescription>
              Per-parameter min/typ/max figures with test conditions and verification provenance.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SpecTable rows={sensorSpecsToRows(item.specs)} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="size-4 text-accent" />
              Calibration procedure
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.calibrationProcedure ?? "Follow manufacturer datasheet calibration instructions."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="size-4 text-warning" />
              Environmental limits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.environmentalLimits ?? "Observe rated ambient operating temperature and ingress limits."}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {item.applications.map((app) => (
                <li key={app}>{app}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {item.advantages.map((adv) => (
                <li key={adv}>{adv}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              Disadvantages &amp; failure modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {item.disadvantages.map((dis) => (
                <li key={dis}>{dis}</li>
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
