import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  ShieldAlert,
  Star,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getCommunicationBySlugResult } from "@/lib/data/communication";
import type { SuitabilityScore } from "@/lib/data/types";

export const dynamic = "force-dynamic";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function scoreBadgeClass(score: SuitabilityScore) {
  switch (score) {
    case 5:
      return "bg-success/20 text-success border-success/40";
    case 4:
      return "bg-accent/20 text-accent border-accent/40";
    case 3:
      return "bg-primary/20 text-primary border-primary/40";
    case 2:
      return "bg-warning/20 text-warning border-warning/40";
    case 1:
    default:
      return "bg-danger/20 text-danger border-danger/40";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getCommunicationBySlugResult(slug);
  return { title: item ? `${item.name} — Communication Technologies` : "Protocol not found" };
}

export default async function CommunicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, mode, error } = await getCommunicationBySlugResult(slug);

  if (error && !item) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/communication"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All communication technologies
        </Link>
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load communication technology: {error}
        </div>
      </div>
    );
  }

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/communication"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All communication technologies
        </Link>
        <div className="flex items-center gap-2">
          <DataSourceBadge source={mode} />
          <ProvenanceBadge status={item.verificationStatus} />
        </div>
      </div>

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase">
              {item.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{item.standard}</span>
          </div>
        }
        title={item.name}
        description={item.description}
        actions={
          isSafeHttpUrl(item.sourceUrl) ? (
            <Button variant="outline" size="sm" asChild>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                <FileText className="size-3.5" />
                Specification
                <ExternalLink className="size-3 opacity-70" />
              </a>
            </Button>
          ) : undefined
        }
      />

      {/* Primary Technical Specifications Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technical Specifications</CardTitle>
          <CardDescription>Key RF and transmission attributes from standard specifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Data Rate</span>
              <span className="font-mono text-sm font-semibold">{item.dataRate}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Typical Range</span>
              <span className="font-mono text-sm font-semibold">{item.typicalRange}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Network Topology</span>
              <span className="font-mono text-sm font-semibold">{item.topology}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Power Consumption</span>
              <span className="font-mono text-sm font-semibold">{item.powerConsumption}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Transmission Latency</span>
              <span className="font-mono text-sm font-semibold">{item.latency}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Payload Size</span>
              <span className="font-mono text-sm font-semibold">{item.payloadSize}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3 sm:col-span-2">
              <span className="text-[11px] text-muted-foreground block font-sans">Security Architecture</span>
              <span className="font-mono text-sm font-semibold text-accent">{item.security}</span>
            </div>
            <div className="rounded-md border bg-surface-raised/40 p-3">
              <span className="text-[11px] text-muted-foreground block font-sans">Deployment Cost</span>
              <span className="font-mono text-sm font-semibold">{item.deploymentCost}</span>
            </div>
          </div>

          {item.frequencyBands.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency Bands</span>
              <div className="flex flex-wrap gap-1.5">
                {item.frequencyBands.map((band) => (
                  <Badge key={band} variant="outline" className="font-mono text-xs">
                    {band}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.typicalHardware && (
            <div className="mt-4 rounded-md border border-accent/30 bg-accent/5 p-3 text-xs">
              <div className="flex items-center gap-2 font-medium text-accent">
                <Cpu className="size-4" />
                <span>Reference Hardware Modules & Transceivers</span>
              </div>
              <p className="mt-1 font-mono text-foreground">{item.typicalHardware}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Suitability Evaluation */}
      {item.suitability && item.suitability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Suitability Matrix</CardTitle>
            <CardDescription>Domain-specific fit evaluated against industrial and IoT operational criteria.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {item.suitability.map((s) => (
                <div key={s.domain} className="rounded-lg border bg-surface-raised/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-sm">
                      {s.domain.replace(/_/g, " ")}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(s.score)}`}>
                      <Star className="size-3 fill-current" />
                      {s.score} / 5 · {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.rationale}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Spectrum Notes */}
      {item.regionalBands && item.regionalBands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-accent" />
              <span>Regional Spectrum Allocations</span>
            </CardTitle>
            <CardDescription>Bands and frequency allocations across India (WPC), Europe (ETSI), and North America (FCC).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {item.regionalBands.map((rb) => (
                <div key={rb.region} className="rounded-md border p-3 bg-surface-raised/20 space-y-1">
                  <span className="text-xs font-semibold text-accent block">{rb.region}</span>
                  <div className="font-mono text-xs font-semibold">{rb.band}</div>
                  <p className="text-[11px] text-muted-foreground">{rb.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advantages and Limitations */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-success flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              Key Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {item.advantages.map((adv) => (
                <li key={adv} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-warning flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              Engineering Limitations & Trade-offs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {item.limitations.map((lim) => (
                <li key={lim} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-warning shrink-0" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

