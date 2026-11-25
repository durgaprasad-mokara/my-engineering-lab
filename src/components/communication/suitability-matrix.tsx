"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ApplicationDomain,
  CatalogueCommunicationModule,
  SuitabilityScore,
} from "@/lib/data/types";

const DOMAINS: { id: ApplicationDomain; label: string; icon: string; description: string }[] = [
  {
    id: "smart_water_meter",
    label: "Smart Water Metering",
    icon: "💧",
    description: "Underground pit or basement installation, battery-operated (10–15 year requirement), periodic small payload bursts, deep penetration needed.",
  },
  {
    id: "smart_energy_meter",
    label: "Smart Energy Metering",
    icon: "⚡",
    description: "Mains-powered, bidirectional command & telemetry, 15-minute load curves, remote connect/disconnect, DLMS/COSEM compliance, high cybersecurity.",
  },
  {
    id: "railway_track",
    label: "Railway Track Monitoring",
    icon: "🛤️",
    description: "Long linear infrastructure corridors, solar/battery nodes, extreme temperature and vibration, remote territory with intermittent carrier coverage.",
  },
  {
    id: "railway_bridge",
    label: "Railway Bridge Load Monitoring",
    icon: "🌉",
    description: "Multi-sensor synchronized strain, vibration and deflection telemetry, high burst data rate during train crossing events, high EMI resilience.",
  },
  {
    id: "agriculture",
    label: "Precision Agriculture",
    icon: "🌱",
    description: "Expansive rural acreage, crop canopy RF attenuation, solar/battery powered soil & microclimate nodes, gateway-to-cloud backhaul.",
  },
  {
    id: "industrial_telemetry",
    label: "Industrial Automation & Telemetry",
    icon: "🏭",
    description: "Harsh factory environment, heavy electrical noise / EMI, deterministic latency, fail-safe operation, PLC / SCADA integration.",
  },
];

function scoreColor(score: SuitabilityScore) {
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

export function SuitabilityMatrix({ items }: { items: CatalogueCommunicationModule[] }) {
  const [selectedDomain, setSelectedDomain] = useState<ApplicationDomain>("smart_water_meter");

  const currentDomainInfo = DOMAINS.find((d) => d.id === selectedDomain)!;

  // Rank items for the selected domain
  const rankedItems = [...items]
    .map((item) => {
      const match = item.suitability.find((s) => s.domain === selectedDomain);
      return {
        item,
        score: match?.score ?? 1,
        label: match?.label ?? "Unsuitable",
        rationale: match?.rationale ?? "No specific evaluation.",
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Domain Selection Tabs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOMAINS.map((domain) => {
          const isSelected = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => setSelectedDomain(domain.id)}
              className={`flex flex-col items-start rounded-lg border p-3.5 text-left transition-all ${isSelected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "bg-surface hover:bg-surface-raised"
                }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <span className="text-lg">{domain.icon}</span>
                <span className="text-sm font-semibold">{domain.label}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{domain.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Domain Ranking Detail Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{currentDomainInfo.icon}</span>
                <span>{currentDomainInfo.label} — Communication Suitability Ranking</span>
              </CardTitle>
              <CardDescription>{currentDomainInfo.description}</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              Ranked by Engineering Fit
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-surface-raised/40 text-muted-foreground">
                  <th className="p-3">Protocol / Standard</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Suitability Score</th>
                  <th className="p-3">Engineering Rationale</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rankedItems.map(({ item, score, label, rationale }) => (
                  <tr key={item.id} className="hover:bg-surface-raised/30 transition-colors">
                    <td className="p-3 font-medium">
                      <Link href={`/communication/${item.slug}`} className="hover:text-accent font-semibold text-foreground">
                        {item.name}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{item.standard}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${scoreColor(score as SuitabilityScore)}`}>
                          <Star className="size-3 fill-current" />
                          {score} / 5
                        </span>
                        <span className="font-medium text-muted-foreground text-[11px]">{label}</span>
                      </div>
                    </td>
                    <td className="p-3 max-w-md text-muted-foreground">
                      {rationale}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Link href={`/communication/${item.slug}`} className="text-accent hover:underline text-[11px]">
                        Specs &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

