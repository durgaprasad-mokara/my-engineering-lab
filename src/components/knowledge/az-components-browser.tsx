"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Download,
  ExternalLink,
  FolderPlus,
  GitCompare,
  History,
  LayoutGrid,
  List,
  PackagePlus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ComponentVisual } from "@/components/knowledge/component-visual";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AZ_CATEGORIES, type AzCategory, type AzComponentRecord } from "@/lib/components/az-types";

const FAVORITES_KEY = "mel_az_favorites_v1";
const RECENT_KEY = "mel_az_recent_v1";
const BOM_KEY = "mel_az_bom_v1";
const PROJECT_KEY = "mel_az_project_parts_v1";

interface AzComponentsBrowserProps {
  items: AzComponentRecord[];
  letterCounts: Record<string, number>;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function AzComponentsBrowser({ items, letterCounts }: AzComponentsBrowserProps) {
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<AzCategory | "ALL">("ALL");
  const [mcuFilter, setMcuFilter] = useState<string>("ALL");
  const [sensorTypeFilter, setSensorTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [bomSlugs, setBomSlugs] = useState<string[]>([]);
  const [projectSlugs, setProjectSlugs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const fav = localStorage.getItem(FAVORITES_KEY);
      if (fav) setFavorites(JSON.parse(fav) as string[]);
      const rec = localStorage.getItem(RECENT_KEY);
      if (rec) setRecentSlugs(JSON.parse(rec) as string[]);
      const bom = localStorage.getItem(BOM_KEY);
      if (bom) setBomSlugs(JSON.parse(bom) as string[]);
      const proj = localStorage.getItem(PROJECT_KEY);
      if (proj) setProjectSlugs(JSON.parse(proj) as string[]);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((curr) => (curr === msg ? null : curr)), 2800);
  }

  function toggleFavorite(slug: string) {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) {
        showToast("Compare up to 3 components at a time.");
        return prev;
      }
      return [...prev, slug];
    });
  }

  function addToBom(item: AzComponentRecord) {
    setBomSlugs((prev) => {
      const next = prev.includes(item.slug) ? prev : [...prev, item.slug];
      try {
        localStorage.setItem(BOM_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Added ${item.name} to Bill of Materials (${bomSlugs.includes(item.slug) ? bomSlugs.length : bomSlugs.length + 1} items).`);
  }

  function addToProject(item: AzComponentRecord) {
    setProjectSlugs((prev) => {
      const next = prev.includes(item.slug) ? prev : [...prev, item.slug];
      try {
        localStorage.setItem(PROJECT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Linked ${item.name} to active engineering project.`);
  }

  const mcuOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const mcu of item.compatibleMcus) {
        set.add(mcu);
      }
    }
    return Array.from(set).sort();
  }, [items]);

  const sensorSubcategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category === "Sensors") {
        set.add(item.subcategory);
      }
    }
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedLetter !== "ALL" && item.letter !== selectedLetter) return false;
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
      if (onlyFavorites && !favorites.includes(item.slug)) return false;
      if (mcuFilter !== "ALL" && !item.compatibleMcus.includes(mcuFilter)) return false;
      if (sensorTypeFilter !== "ALL" && item.subcategory !== sensorTypeFilter) return false;
      if (!q) return true;
      const haystack = [
        item.name,
        item.category,
        item.subcategory,
        item.manufacturer,
        item.partNumber,
        item.operatingVoltage,
        item.protocols.join(" "),
        item.applications.join(" "),
        item.description,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query, selectedLetter, selectedCategory, onlyFavorites, favorites, mcuFilter, sensorTypeFilter]);

  const compareItems = useMemo(
    () => compareSlugs.map((slug) => items.find((i) => i.slug === slug)).filter(Boolean) as AzComponentRecord[],
    [compareSlugs, items],
  );

  const recentItems = useMemo(
    () => recentSlugs.map((slug) => items.find((i) => i.slug === slug)).filter(Boolean) as AzComponentRecord[],
    [recentSlugs, items],
  );

  function exportSpecs(format: "json" | "csv") {
    const target = filtered.length > 0 ? filtered : items;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(target, null, 2)], { type: "application/json" });
      triggerDownload(blob, `az-components-${selectedLetter.toLowerCase()}.json`);
    } else {
      const headers = [
        "Letter",
        "Name",
        "Category",
        "Subcategory",
        "Manufacturer",
        "PartNumber",
        "Package",
        "OperatingVoltage",
        "OperatingCurrent",
        "Protocols",
        "EstimatedCostUSD",
        "VerificationStatus",
      ];
      const rows = target.map((c) => [
        c.letter,
        c.name,
        c.category,
        c.subcategory,
        c.manufacturer,
        c.partNumber,
        c.packageType,
        c.operatingVoltage,
        c.operatingCurrent,
        c.protocols.join("; "),
        c.estimatedCostUsd ?? "",
        c.verificationStatus,
      ]);
      const csv = [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      triggerDownload(blob, `az-components-${selectedLetter.toLowerCase()}.csv`);
    }
    showToast(`Exported ${target.length} component specifications (${format.toUpperCase()}).`);
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg"
        >
          <Check className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* A-Z Alphabetical Bar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">A–Z Alphabetical Index</CardTitle>
              <CardDescription className="text-xs">
                {items.length} engineered component entries across all 26 letters and {AZ_CATEGORIES.length} categories
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">BOM: {bomSlugs.length}</Badge>
              <Badge variant="outline">Project: {projectSlugs.length}</Badge>
              <Button variant="outline" size="sm" onClick={() => exportSpecs("csv")}>
                <Download className="size-3.5" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportSpecs("json")}>
                <Download className="size-3.5" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={selectedLetter === "ALL" ? "default" : "outline"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setSelectedLetter("ALL")}
            >
              All ({items.length})
            </Button>
            {LETTERS.map((letter) => {
              const count = letterCounts[letter] ?? 0;
              const active = selectedLetter === letter;
              return (
                <Button
                  key={letter}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  disabled={count === 0}
                  className="h-7 min-w-[2.1rem] px-1.5 font-mono text-xs"
                  onClick={() => setSelectedLetter(letter)}
                  title={`${letter}: ${count} components`}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Controls */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, category, manufacturer, interface (I2C/SPI), voltage, application..."
                className="pl-8"
                aria-label="Search A-Z components"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={mcuFilter}
                onChange={(e) => setMcuFilter(e.target.value)}
                aria-label="Filter by microcontroller compatibility"
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ALL">All MCU Compatibility</option>
                {mcuOptions.map((mcu) => (
                  <option key={mcu} value={mcu}>
                    Compatible: {mcu}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sensorTypeFilter}
                onChange={(e) => setSensorTypeFilter(e.target.value)}
                aria-label="Filter by sensor type"
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ALL">All Sensor Types</option>
                {sensorSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-1.5 md:col-span-2">
              <Button
                size="sm"
                variant={onlyFavorites ? "default" : "outline"}
                onClick={() => setOnlyFavorites((v) => !v)}
                title="Show favorites only"
              >
                <BookmarkCheck className="size-3.5" />
                {favorites.length}
              </Button>
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* 14 Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={selectedCategory === "ALL" ? "default" : "outline"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setSelectedCategory("ALL")}
            >
              All Categories
            </Button>
            {AZ_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Viewed Strip */}
      {recentItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
            <History className="size-3.5" />
            Recently viewed:
          </span>
          {recentItems.slice(0, 6).map((item) => (
            <Link
              key={item.slug}
              href={`/components/${item.slug}`}
              className="rounded border border-border bg-background px-2 py-0.5 text-foreground hover:border-primary/50 hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Comparison Panel */}
      {compareItems.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <GitCompare className="size-4 text-primary" />
                Component Comparison ({compareItems.length}/3)
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setCompareSlugs([])}>
                <X className="size-3.5" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">Attribute</th>
                  {compareItems.map((c) => (
                    <th key={c.slug} className="py-1.5 pr-4 font-semibold text-foreground">
                      <Link href={`/components/${c.slug}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Category</td>
                  {compareItems.map((c) => (
                    <td key={c.slug} className="py-1.5 pr-4">
                      {c.category} · {c.subcategory}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Voltage / Current</td>
                  {compareItems.map((c) => (
                    <td key={c.slug} className="py-1.5 pr-4 font-mono">
                      {c.operatingVoltage} / {c.operatingCurrent}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Interfaces</td>
                  {compareItems.map((c) => (
                    <td key={c.slug} className="py-1.5 pr-4">
                      {c.protocols.join(", ") || "Analog / Discrete"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Package</td>
                  {compareItems.map((c) => (
                    <td key={c.slug} className="py-1.5 pr-4">
                      {c.packageType} ({c.dimensions})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Est. Cost</td>
                  {compareItems.map((c) => (
                    <td key={c.slug} className="py-1.5 pr-4 font-mono">
                      {c.estimatedCostUsd !== null ? `$${c.estimatedCostUsd.toFixed(2)}` : "Unverified"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filtered.length}</strong> of {items.length} components
          {selectedLetter !== "ALL" ? ` starting with "${selectedLetter}"` : ""}
          {selectedCategory !== "ALL" ? ` in ${selectedCategory}` : ""}
        </span>
        {(query || selectedLetter !== "ALL" || selectedCategory !== "ALL" || mcuFilter !== "ALL" || sensorTypeFilter !== "ALL" || onlyFavorites) && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setQuery("");
              setSelectedLetter("ALL");
              setSelectedCategory("ALL");
              setMcuFilter("ALL");
              setSensorTypeFilter("ALL");
              setOnlyFavorites(false);
            }}
          >
            Reset all filters
          </Button>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No components match your active filters</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              Try clearing the search query, selecting &quot;All&quot; in the A–Z bar, or switching MCU compatibility filters.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const isFav = favorites.includes(item.slug);
            const isCompared = compareSlugs.includes(item.slug);
            return (
              <Card key={item.slug} className="flex flex-col justify-between overflow-hidden transition-colors hover:border-primary/40">
                <div>
                  <Link href={`/components/${item.slug}`} className="block border-b border-border/70 bg-background/60 p-2">
                    <ComponentVisual component={item} role="main" className="h-36 w-full" />
                  </Link>
                  <CardHeader className="space-y-1.5 pb-2 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.letter} · {item.category}
                      </Badge>
                      <ProvenanceBadge status={item.verificationStatus} />
                    </div>
                    <CardTitle className="text-base leading-snug">
                      <Link href={`/components/${item.slug}`} className="hover:text-primary hover:underline">
                        {item.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-3 text-xs">
                    <div className="grid grid-cols-2 gap-1.5 rounded-md bg-muted/40 p-2 font-mono text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Vin:</span> {item.operatingVoltage}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pkg:</span> {item.packageType}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.protocols.slice(0, 3).map((p) => (
                        <Badge key={p} variant="default" className="text-[10px]">
                          {p}
                        </Badge>
                      ))}
                      {item.estimatedCostUsd !== null && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          ~${item.estimatedCostUsd.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="flex items-center justify-between gap-1 border-t border-border/70 bg-muted/20 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={isFav ? "default" : "ghost"}
                      className="h-7 px-2"
                      onClick={() => toggleFavorite(item.slug)}
                      title="Toggle favorite"
                    >
                      <Bookmark className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isCompared ? "default" : "ghost"}
                      className="h-7 px-2"
                      onClick={() => toggleCompare(item.slug)}
                      title="Compare component"
                    >
                      <GitCompare className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => addToBom(item)}
                      title="Add to Bill of Materials"
                    >
                      <PackagePlus className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => addToProject(item)}
                      title="Add to Project"
                    >
                      <FolderPlus className="size-3.5" />
                    </Button>
                  </div>
                  <Link
                    href={`/components/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Details
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isFav = favorites.includes(item.slug);
            const isCompared = compareSlugs.includes(item.slug);
            return (
              <Card key={item.slug} className="overflow-hidden">
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/components/${item.slug}`} className="shrink-0 rounded border border-border bg-background p-1">
                      <ComponentVisual component={item} role="main" className="h-16 w-24" />
                    </Link>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {item.letter}
                        </Badge>
                        <Link href={`/components/${item.slug}`} className="text-sm font-semibold hover:text-primary hover:underline">
                          {item.name}
                        </Link>
                        <ProvenanceBadge status={item.verificationStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.category} · {item.manufacturer} · {item.operatingVoltage} · {item.packageType}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant={isFav ? "default" : "outline"} onClick={() => toggleFavorite(item.slug)}>
                      <Bookmark className="size-3.5" />
                    </Button>
                    <Button size="sm" variant={isCompared ? "default" : "outline"} onClick={() => toggleCompare(item.slug)}>
                      <GitCompare className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addToBom(item)}>
                      <PackagePlus className="size-3.5" />
                      BOM
                    </Button>
                    <Link href={`/components/${item.slug}`}>
                      <Button size="sm">Open Specs</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

