import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Layers,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { RadiationPattern } from "@/components/antennas/radiation-pattern";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getAntennaBySlugResult } from "@/lib/data/antennas";

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
  const { item } = await getAntennaBySlugResult(slug);
  return { title: item ? `${item.name} — Antennas Library` : "Antenna not found" };
}

export default async function AntennaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, mode, error } = await getAntennaBySlugResult(slug);

  if (error && !item) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/antennas"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All antennas
        </Link>
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load antenna details: {error}
        </div>
      </div>
    );
  }

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/antennas"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All antennas
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
              {item.antennaType}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {item.manufacturer} · {item.partNumber}
            </span>
          </div>
        }
        title={item.name}
        description={item.description}
        actions={
          isSafeHttpUrl(item.sourceUrl) ? (
            <Button variant="outline" size="sm" asChild>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                <FileText className="size-3.5" />
                Datasheet
                <ExternalLink className="size-3 opacity-70" />
              </a>
            </Button>
          ) : undefined
        }
      />

      {/* Main Grid: Radiation Pattern + Key RF Specs */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5 flex flex-col justify-center">
          <RadiationPattern
            patternData={item.patternData}
            peakGainDbi={item.peakGainDbi}
            patternType={item.radiationPatternType}
          />
        </div>

        <div className="md:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">RF Performance Ratings</CardTitle>
              <CardDescription>Measured parameters from manufacturer chamber test data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Frequency Coverage</span>
                  <span className="font-bold text-foreground text-sm">
                    {item.freqMinMhz} – {item.freqMaxMhz} MHz
                  </span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Peak Gain</span>
                  <span className="font-bold text-accent text-sm">+{item.peakGainDbi} dBi</span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Maximum VSWR</span>
                  <span className="font-bold text-foreground text-sm">&le; {item.vswrMax}:1</span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Return Loss (S11)</span>
                  <span className="font-bold text-foreground text-sm">{item.returnLossDb ? `${item.returnLossDb} dB` : "N/A"}</span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Characteristic Impedance</span>
                  <span className="font-bold text-foreground text-sm">{item.impedanceOhm} &Omega;</span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-sans">Radiation Efficiency</span>
                  <span className="font-bold text-success text-sm">{item.efficiencyPercent ? `${item.efficiencyPercent}%` : "N/A"}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">RF Polarization</span>
                  <span className="font-semibold text-foreground">{item.polarization}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Connector Type</span>
                  <span className="font-semibold font-mono text-foreground">{item.connector}</span>
                </div>
                {item.cableLengthMm && (
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Coaxial Cable Length</span>
                    <span className="font-semibold font-mono text-foreground">{item.cableLengthMm} mm</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Physical Dimensions</span>
                  <span className="font-semibold font-mono text-foreground">{item.dimensionsMm}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Supported Wireless Standards</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.services.map((srv) => (
                    <Badge key={srv} variant="default" className="text-xs bg-primary/20 text-accent">
                      {srv}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mechanical & Ground Plane Integration Rules */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-accent" />
              Ground Plane & Clearance Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-md border bg-surface-raised p-3">
              <span className="text-muted-foreground block text-[10px]">Ground Plane Rule</span>
              <p className="font-medium text-foreground mt-0.5">{item.groundPlane}</p>
            </div>
            <div className="rounded-md border bg-surface-raised p-3">
              <span className="text-muted-foreground block text-[10px]">Matching Circuit Notes</span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">{item.matchingNotes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              RF Integration Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {item.designConsiderations.map((consideration) => (
                <li key={consideration} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Applications */}
      {item.applications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="size-4 text-accent" />
              Typical IoT & Engineering Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {item.applications.map((app) => (
                <Badge key={app} variant="outline" className="text-xs">
                  {app}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

