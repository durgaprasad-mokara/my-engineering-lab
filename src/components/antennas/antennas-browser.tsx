"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AntennaType, CatalogueAntenna } from "@/lib/data/types";

const ANTENNA_TYPES: { id: "all" | AntennaType; label: string }[] = [
  { id: "all", label: "All Antennas" },
  { id: "fpc", label: "FPC Flexible" },
  { id: "dipole", label: "Dipole" },
  { id: "ceramic", label: "Ceramic Chip" },
  { id: "patch", label: "Patch (GNSS)" },
  { id: "combo", label: "Combo Puck" },
  { id: "yagi", label: "Yagi Directional" },
  { id: "pcb", label: "PCB Trace" },
  { id: "helical", label: "Helical Spring" },
];

const SERVICE_FILTERS = [
  "All",
  "LTE",
  "5G NR",
  "LoRa",
  "GNSS",
  "Wi-Fi",
  "BLE",
];

export function AntennasBrowser({ items }: { items: CatalogueAntenna[] }) {
  const searchInputId = useId();
  const [selectedType, setSelectedType] = useState<"all" | AntennaType>("all");
  const [selectedService, setSelectedService] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = items.filter((item) => {
    if (selectedType !== "all" && item.antennaType !== selectedType) return false;
    if (selectedService !== "All" && !item.services.some((s) => s.toLowerCase().includes(selectedService.toLowerCase()))) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.partNumber.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q) ||
      item.connector.toLowerCase().includes(q) ||
      item.groundPlane.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-lg border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor={searchInputId} className="sr-only">
            Search antennas by part number, connector, frequency, manufacturer...
          </label>
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            id={searchInputId}
            type="search"
            placeholder="Search antennas by part number, connector, frequency, manufacturer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Service tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1 hidden lg:inline">Service:</span>
          {SERVICE_FILTERS.map((srv) => (
            <button
              key={srv}
              type="button"
              onClick={() => setSelectedService(srv)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedService === srv
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {srv}
            </button>
          ))}
        </div>
      </div>

      {/* Antenna Type Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {ANTENNA_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedType === type.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface border text-muted-foreground hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filtered.length} of {items.length} antennas
        </span>
        {(query || selectedType !== "all" || selectedService !== "All") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedType("all");
              setSelectedService("All");
            }}
            className="text-accent hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Antennas Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {item.antennaType}
                      </Badge>
                      <ProvenanceBadge status={item.verificationStatus} />
                    </div>
                    <CardTitle className="mt-2 text-base font-semibold">
                      <Link href={`/antennas/${item.slug}`} className="hover:text-accent">
                        {item.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-1 font-mono text-[11px]">
                      {item.manufacturer} · {item.partNumber}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs font-mono font-semibold text-accent">
                    +{item.peakGainDbi} dBi
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <p className="line-clamp-2 text-muted-foreground">{item.description}</p>

                <div className="grid grid-cols-2 gap-2 rounded-md bg-surface-raised/60 p-2.5 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">Frequency Range</span>
                    <span className="font-semibold text-foreground">
                      {item.freqMinMhz}–{item.freqMaxMhz} MHz
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">VSWR Max</span>
                    <span className="font-semibold text-foreground">&le; {item.vswrMax}:1</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">Connector</span>
                    <span className="truncate">{item.connector}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">Pattern</span>
                    <span className="capitalize">{item.radiationPatternType}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Supported Services</span>
                  <div className="flex flex-wrap gap-1">
                    {item.services.map((srv) => (
                      <Badge key={srv} variant="default" className="text-[9px] bg-primary/20 text-accent">
                        {srv}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  <span className="font-medium text-foreground">Ground Plane:</span> {item.groundPlane}
                </div>
              </CardContent>
            </div>

            <div className="border-t p-4 pt-3">
              <Button variant="ghost" size="sm" asChild className="w-full justify-between text-xs">
                <Link href={`/antennas/${item.slug}`}>
                  <span>Inspect Radiation Pattern & Specs</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

