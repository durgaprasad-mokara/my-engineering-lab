"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Radio,
  Search,
  ShieldCheck,
  Table,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  ApplicationDomain,
  CatalogueCommunicationModule,
  CommunicationCategory,
  SpectrumRegulationEntry,
} from "@/lib/data/types";
import { SuitabilityMatrix } from "./suitability-matrix";
import { SpectrumGuide } from "./spectrum-guide";

const CATEGORIES: { id: "all" | CommunicationCategory; label: string }[] = [
  { id: "all", label: "All Protocols" },
  { id: "cellular", label: "Cellular (4G/5G/NB-IoT)" },
  { id: "lpwan", label: "LPWAN (LoRa/BLE/Zigbee)" },
  { id: "wired", label: "Wired & Fieldbus" },
  { id: "application", label: "Application Layer" },
];

interface Props {
  items: CatalogueCommunicationModule[];
  regulations: SpectrumRegulationEntry[];
}

export function CommunicationBrowser({ items, regulations }: Props) {
  const searchInputId = useId();
  const [activeTab, setActiveTab] = useState<"library" | "matrix" | "spectrum">("library");
  const [selectedCategory, setSelectedCategory] = useState<"all" | CommunicationCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<ApplicationDomain | "all">("all");

  const filtered = items.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedDomain !== "all") {
      const suit = item.suitability.find((s) => s.domain === selectedDomain);
      if (!suit || suit.score < 3) return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.standard.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.typicalHardware.toLowerCase().includes(q) ||
      item.frequencyBands.some((b) => b.toLowerCase().includes(q)) ||
      item.applications.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeTab === "library" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("library")}
            className="gap-2"
          >
            <Radio className="size-4" />
            Protocol Library ({items.length})
          </Button>
          <Button
            variant={activeTab === "matrix" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("matrix")}
            className="gap-2"
          >
            <Table className="size-4" />
            Application Suitability Matrix
          </Button>
          <Button
            variant={activeTab === "spectrum" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("spectrum")}
            className="gap-2"
          >
            <ShieldCheck className="size-4" />
            India (WPC) & Global Spectrum
          </Button>
        </div>
      </div>

      {activeTab === "matrix" && (
        <SuitabilityMatrix items={items} />
      )}

      {activeTab === "spectrum" && (
        <SpectrumGuide regulations={regulations} />
      )}

      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col gap-3 rounded-lg border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <label htmlFor={searchInputId} className="sr-only">
                Search protocols, standards, bands, hardware...
              </label>
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id={searchInputId}
                type="search"
                placeholder="Search protocols, standards, bands, hardware..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filtered.length} of {items.length} communication technologies
            </span>
            {(query || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                  setSelectedDomain("all");
                }}
                className="text-accent hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Grid of Protocols */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {item.category}
                          </Badge>
                          <ProvenanceBadge status={item.verificationStatus} />
                        </div>
                        <CardTitle className="mt-2 text-base font-semibold">
                          <Link href={`/communication/${item.slug}`} className="hover:text-accent">
                            {item.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-1">{item.standard}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    <p className="line-clamp-2 text-muted-foreground">{item.description}</p>

                    <div className="grid grid-cols-2 gap-2 rounded-md bg-surface-raised/60 p-2.5 font-mono text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px] font-sans">Data Rate</span>
                        <span className="font-semibold">{item.dataRate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] font-sans">Range</span>
                        <span className="font-semibold">{item.typicalRange}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] font-sans">Topology</span>
                        <span>{item.topology}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] font-sans">Power</span>
                        <span className="truncate">{item.powerConsumption.split(" ")[0]}</span>
                      </div>
                    </div>

                    {item.typicalHardware && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Cpu className="size-3.5 shrink-0 text-accent" />
                        <span className="truncate">Hardware: {item.typicalHardware}</span>
                      </div>
                    )}

                    {item.suitability && item.suitability.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Suitability</span>
                        <div className="flex flex-wrap gap-1">
                          {item.suitability
                            .filter((s) => s.score >= 4)
                            .slice(0, 3)
                            .map((s) => (
                              <Badge key={s.domain} variant="default" className="text-[9px] lowercase bg-primary/20 text-accent">
                                {s.domain.replace(/_/g, " ")} ({s.score}/5)
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="border-t p-4 pt-3">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between text-xs">
                    <Link href={`/communication/${item.slug}`}>
                      <span>View Specifications & Suitability</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

