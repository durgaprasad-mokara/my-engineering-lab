"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Package } from "lucide-react";
import type { CatalogueComponent, VerificationStatus } from "@/lib/data/types";
import { filterComponents, getComponentCategories } from "@/lib/knowledge/filters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CatalogueFilter } from "./catalogue-filter";
import { ProvenanceBadge } from "./provenance-badge";

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function ComponentsBrowser({ items }: { items: CatalogueComponent[] }) {
  const [query, setQuery] = React.useState("");
  const [categorySlug, setCategorySlug] = React.useState("all");
  const [status, setStatus] = React.useState<VerificationStatus | "all">("all");

  const categories = React.useMemo(() => getComponentCategories(items), [items]);
  const filtered = React.useMemo(
    () => filterComponents(items, { query, categorySlug, status }),
    [items, query, categorySlug, status],
  );

  const hasActiveFilters = Boolean(query.trim() || categorySlug !== "all" || status !== "all");

  const reset = () => {
    setQuery("");
    setCategorySlug("all");
    setStatus("all");
  };

  return (
    <div className="space-y-4">
      <CatalogueFilter
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by part number, name, manufacturer, package or application…"
        searchLabel="Search components"
        selects={[
          {
            id: "category",
            label: "Filter by category",
            value: categorySlug,
            onChange: setCategorySlug,
            options: [
              { value: "all", label: `All categories (${items.length})` },
              ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.count})` })),
            ],
          },
          {
            id: "provenance",
            label: "Filter by provenance",
            value: status,
            onChange: (v) => setStatus(v as VerificationStatus | "all"),
            options: [
              { value: "all", label: "All provenance levels" },
              { value: "verified", label: "Verified" },
              { value: "typical", label: "Typical" },
              { value: "estimated", label: "Estimated" },
              { value: "unverified", label: "Unverified" },
            ],
          },
        ]}
        resultCount={filtered.length}
        totalCount={items.length}
        itemLabel="components"
        hasActiveFilters={hasActiveFilters}
        onReset={reset}
      />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Component categories">
        <button
          type="button"
          onClick={() => setCategorySlug("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            categorySlug === "all"
              ? "border-primary/40 bg-primary/15 text-primary"
              : "bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategorySlug(cat.slug === categorySlug ? "all" : cat.slug)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              categorySlug === cat.slug
                ? "border-primary/40 bg-primary/15 text-primary"
                : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No components match your current filter criteria.</p>
          {hasActiveFilters && (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={reset}>
              Reset filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((component) => {
            const docUrl = component.datasheetUrl ?? component.sourceUrl;
            return (
              <Card key={component.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{component.category}</Badge>
                      <ProvenanceBadge status={component.verificationStatus} />
                    </div>
                    <CardTitle className="text-base">
                      <Link href={`/components/${component.slug}`} className="hover:text-accent">
                        {component.name}
                      </Link>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
                      <span>{component.partNumber ?? "Generic reference"}</span>
                      {component.manufacturer && <span>· {component.manufacturer}</span>}
                      {component.package && (
                        <span className="inline-flex items-center gap-1">
                          · <Package className="size-3" aria-hidden /> {component.package}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-1">
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {component.description ?? component.operatingPrinciple ?? "No summary recorded."}
                  </p>
                  {component.interfaces.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {component.interfaces.slice(0, 4).map((iface) => (
                        <span
                          key={iface}
                          className="rounded border bg-surface-raised/60 px-2 py-0.5 font-mono text-[10px] text-foreground/80"
                        >
                          {iface}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="justify-between gap-2 text-xs">
                  <Link
                    href={`/components/${component.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    View specifications
                    <ArrowRight className="size-3.5" />
                  </Link>
                  {isSafeHttpUrl(docUrl) && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      Datasheet
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
