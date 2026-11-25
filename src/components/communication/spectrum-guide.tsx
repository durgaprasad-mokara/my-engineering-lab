"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpectrumRegulationEntry } from "@/lib/data/types";

interface Props {
  regulations: SpectrumRegulationEntry[];
}

export function SpectrumGuide({ regulations }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const regions = ["All", ...Array.from(new Set(regulations.map((r) => r.region)))];

  const filtered = selectedRegion === "All"
    ? regulations
    : regulations.filter((r) => r.region === selectedRegion);

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="space-y-1 text-xs">
              <h4 className="font-semibold text-foreground">Radio Spectrum Compliance & De-licensed Bands</h4>
              <p className="text-muted-foreground leading-relaxed">
                Wireless IoT devices must comply with the National Frequency Allocation Plan of their target operating country.
                In India, unlicensed short-range operations are governed by the Wireless Planning & Coordination (WPC) Wing of the Ministry of Communications, with equipment type approval (ETA) and mandatory TEC MTCTE testing for telecom-interfacing gear.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {regions.map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setSelectedRegion(reg)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedRegion === reg
                ? "bg-primary text-primary-foreground"
                : "bg-surface border text-muted-foreground hover:text-foreground"
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Regulations Table */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px]">
                    {item.region}
                  </Badge>
                  <CardTitle className="mt-1.5 text-base font-semibold">
                    {item.bandName}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-foreground/80">
                    {item.frequencyRange}
                  </CardDescription>
                </div>
                <Badge
                  variant={item.licensedStatus.includes("De-licensed") ? "success" : "default"}
                  className="text-[10px]"
                >
                  {item.licensedStatus.split(" ")[0]}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-md bg-surface-raised p-2.5 font-mono text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-sans">Max Radiated Power</span>
                  <span className="font-semibold text-accent">{item.maxEirpPower}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-sans">Duty Cycle Cap</span>
                  <span className="font-semibold">{item.dutyCycleLimit}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Mandatory Certification</span>
                <p className="mt-0.5 text-foreground">{item.mandatoryCert}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Regulatory Gazette / Reference</span>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.regulatoryRef}</p>
              </div>

              <div className="rounded-md border p-2 text-muted-foreground text-[11px] bg-surface">
                {item.notes}
              </div>

              {item.keyApplications.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.keyApplications.map((app) => (
                    <Badge key={app} variant="outline" className="text-[9px]">
                      {app}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

