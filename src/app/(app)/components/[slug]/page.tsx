import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Package,
  ShieldAlert,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { componentRatingsToRows, SpecTable } from "@/components/knowledge/spec-table";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getComponentBySlugResult, recordComponentView } from "@/lib/data/components";

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
  const { item } = await getComponentBySlugResult(slug);
  return { title: item ? `${item.name} — Components Library` : "Component not found" };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item, mode, error } = await getComponentBySlugResult(slug);

  if (error && !item) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/components"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All components
        </Link>
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Could not load component details: {error}
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  await recordComponentView(item.id);

  const datasheetHref = isSafeHttpUrl(item.datasheetUrl) ? item.datasheetUrl : null;
  const sourceHref = isSafeHttpUrl(item.sourceUrl) ? item.sourceUrl : null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/components"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Components Library
      </Link>

      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">{item.category}</Badge>
            <ProvenanceBadge status={item.verificationStatus} />
            {item.package && (
              <Badge variant="default" className="font-mono">
                {item.package}
              </Badge>
            )}
          </div>
        }
        title={item.name}
        description={item.description ?? undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            {datasheetHref && (
              <Button asChild size="sm">
                <a href={datasheetHref} target="_blank" rel="noopener noreferrer">
                  <FileText className="size-3.5" />
                  Manufacturer Datasheet
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
            {sourceHref && sourceHref !== datasheetHref && (
              <Button asChild variant="outline" size="sm">
                <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                  Product Reference
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Part number</div>
          <div className="mt-1 font-mono text-sm font-semibold">{item.partNumber ?? "Generic reference"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Manufacturer</div>
          <div className="mt-1 text-sm font-semibold">{item.manufacturer ?? "Multi-source"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Package</div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold">
            <Package className="size-3.5 text-accent" aria-hidden />
            {item.package ?? "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Interfaces</div>
          <div className="mt-1 text-sm font-semibold">
            {item.interfaces.length > 0 ? item.interfaces.join(" · ") : "—"}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="size-4 text-accent" />
                Operating principle
              </CardTitle>
              <CardDescription>Electrical behaviour and transfer mechanism</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.operatingPrinciple ?? "No operating principle note recorded yet."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="size-4 text-accent" />
                Internal structure
              </CardTitle>
              <CardDescription>Physical construction and silicon or passive topology</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {item.internalStructure ?? "No internal structure note recorded yet."}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Electrical ratings &amp; limits</CardTitle>
            <CardDescription>
              Each parameter carries explicit provenance and manufacturer reference attribution.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SpecTable rows={componentRatingsToRows(item.ratings ?? [])} />
        </CardContent>
      </Card>

      {item.pinout && item.pinout.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pinout &amp; terminals</CardTitle>
              <CardDescription>Terminal assignment and electrical function</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                <thead className="border-b bg-surface-raised/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="w-24 px-3 py-2 font-semibold">Pin</th>
                    <th className="w-40 px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {item.pinout.map((p, idx) => (
                    <tr key={`${p.pin}-${idx}`} className="hover:bg-surface-raised/30">
                      <td className="px-3 py-2 font-mono font-medium text-accent">{p.pin}</td>
                      <td className="px-3 py-2 font-mono text-foreground">{p.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.function}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Typical applications</CardTitle>
          </CardHeader>
          <CardContent>
            {item.applications.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                {item.applications.map((app) => (
                  <li key={app}>{app}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
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
            {item.advantages.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                {item.advantages.map((adv) => (
                  <li key={adv}>{adv}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-warning" />
              Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.limitations.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                {item.limitations.map((lim) => (
                  <li key={lim}>{lim}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {item.alternatives && item.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compatible &amp; alternative parts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {item.alternatives.map((alt) => (
              <Link
                key={`${alt.relation}-${alt.slug}`}
                href={`/components/${alt.slug}`}
                className="flex items-center justify-between gap-2 rounded-md border bg-surface-raised/40 p-3 text-xs hover:border-accent/40"
              >
                <div>
                  <div className="font-medium text-foreground">{alt.name}</div>
                  {alt.notes && <div className="mt-0.5 text-muted-foreground">{alt.notes}</div>}
                </div>
                <Badge variant="outline" className="capitalize">
                  {alt.relation}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

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
