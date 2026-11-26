"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DESIGN_CRITERIA,
  type BomItem,
  type DesignCriterionKey,
} from "@/lib/design/types";
import {
  DESIGN_PRESETS,
  bomToCsv,
  calculateBomTotal,
  isPriceStale,
  rankConfigurations,
} from "@/lib/design/configurations";

export function HardwareArchitectureWorkspace() {
  const preset = DESIGN_PRESETS[0]!;
  const [requirement, setRequirement] = React.useState(preset.requirement);
  const [selectedConfigId, setSelectedConfigId] = React.useState(preset.configs[0]!.id);
  const [weights, setWeights] = React.useState<Record<DesignCriterionKey, number>>({
    cost: 2,
    compatibility: 2,
    performance: 1,
    power: 3,
    batteryLife: 3,
    accuracy: 2,
    scalability: 2,
    availability: 1,
    maintainability: 1,
    compliance: 2,
  });

  const [bom, setBom] = React.useState<BomItem[]>(preset.defaultBom);
  const [newPart, setNewPart] = React.useState({ designator: "R1", partNumber: "RC0805FR-0710KL", description: "10kΩ 1% 0805 Resistor", manufacturer: "Yageo", quantity: 2, unitPriceUsd: "0.02" });

  const rankedConfigs = React.useMemo(
    () => rankConfigurations(preset.configs, weights),
    [preset.configs, weights],
  );

  const selectedConfig = rankedConfigs.find((c) => c.id === selectedConfigId) ?? rankedConfigs[0]!;
  const bomSummary = React.useMemo(() => calculateBomTotal(bom), [bom]);

  const handleAddBomRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.partNumber.trim()) return;
    const price = Number(newPart.unitPriceUsd);
    const item: BomItem = {
      id: `bom-${Date.now()}`,
      designator: newPart.designator.trim() || "U?",
      partNumber: newPart.partNumber.trim(),
      description: newPart.description.trim() || "Custom component",
      manufacturer: newPart.manufacturer.trim() || "TBD",
      category: "Custom",
      quantity: Math.max(1, Number(newPart.quantity) || 1),
      unitPriceUsd: Number.isFinite(price) && price >= 0 ? price : null,
      availability: "Unknown",
      datasheetUrl: null,
      retrievedAt: new Date().toISOString().slice(0, 10),
      verificationStatus: "user_provided",
    };
    setBom((prev) => [...prev, item]);
    setNewPart({ designator: "", partNumber: "", description: "", manufacturer: "", quantity: 1, unitPriceUsd: "" });
  };

  const handleDownloadCsv = () => {
    const csv = bomToCsv(bom);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hardware-bom.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Requirement & Criteria Weighting */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="size-4 text-accent" />
              System Requirement & Priority Weights
            </CardTitle>
            <CardDescription>
              Adjust engineering priorities (1 = low, 3 = critical) to re-rank the 5 candidate hardware configurations across 10 criteria.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="req-input" className="mb-1 block text-xs font-medium text-muted-foreground">
              Target System Requirement
            </label>
            <Input
              id="req-input"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {DESIGN_CRITERIA.map((c) => (
              <div key={c.key} className="rounded-md border bg-surface-raised/40 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{c.label}</span>
                  <span className="font-mono text-accent">×{weights[c.key]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  aria-label={`${c.label} priority weight`}
                  value={weights[c.key]}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))
                  }
                  className="mt-1.5 w-full accent-[#13d3f2]"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5 Configurations x 10 Criteria Matrix */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Five Hardware Configurations × Ten Criteria</CardTitle>
            <CardDescription>
              Click any row to inspect its 8-subsystem architecture and select it for your BOM.
            </CardDescription>
          </div>
          <Badge variant="outline">5 Ranked Alternatives</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-surface-raised/40 text-muted-foreground">
                <th className="p-2.5">Configuration</th>
                <th className="p-2.5 text-center">Fit</th>
                {DESIGN_CRITERIA.map((c) => (
                  <th key={c.key} className="p-2 text-center font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="p-2.5 text-right">Est. BOM</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rankedConfigs.map((cfg, idx) => {
                const isSelected = cfg.id === selectedConfig.id;
                return (
                  <tr
                    key={cfg.id}
                    onClick={() => setSelectedConfigId(cfg.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/15" : "hover:bg-surface-raised/30"
                    }`}
                  >
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">#{idx + 1}</span>
                        <span className="font-semibold text-foreground">{cfg.name}</span>
                        {isSelected && <CheckCircle2 className="size-3.5 text-success" />}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{cfg.summary}</div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-accent">
                      {cfg.weightedPercent}%
                    </td>
                    {DESIGN_CRITERIA.map((c) => (
                      <td key={c.key} className="p-2 text-center font-mono">
                        <span
                          className={`inline-block w-6 rounded py-0.5 text-[11px] ${
                            cfg.scores[c.key] >= 5
                              ? "bg-success/20 text-success"
                              : cfg.scores[c.key] >= 4
                                ? "bg-accent/15 text-accent"
                                : cfg.scores[c.key] <= 2
                                  ? "bg-warning/20 text-warning"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {cfg.scores[c.key]}
                        </span>
                      </td>
                    ))}
                    <td className="p-2.5 text-right font-mono">
                      {cfg.estimatedUnitBomUsd ? `$${cfg.estimatedUnitBomUsd.toFixed(2)}` : "TBD"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Selected Configuration Subsystem Breakdown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">{selectedConfig.name} — Subsystem Breakdown</CardTitle>
            <CardDescription>{selectedConfig.summary}</CardDescription>
          </div>
          <Badge variant="accent">Weighted Score: {selectedConfig.weightedPercent}%</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {selectedConfig.subsystems.map((s) => (
              <div key={s.subsystem} className="rounded-md border bg-surface-raised/30 p-3 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {s.subsystem}
                </span>
                <div className="text-xs font-semibold text-foreground">{s.part}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.rationale}</p>
              </div>
            ))}
          </div>

          {selectedConfig.tradeoffs.length > 0 && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs">
              <span className="font-semibold text-warning">Key Trade-offs: </span>
              <span className="text-foreground/90">{selectedConfig.tradeoffs.join(" · ")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable BOM */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Editable Bill of Materials (BOM)</CardTitle>
            <CardDescription>
              Prices older than 90 days or missing datasheets are automatically flagged per engineering quality rules.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              Known Total: ${bomSummary.knownTotalUsd.toFixed(2)}
            </Badge>
            {bomSummary.stalePriceCount > 0 && (
              <Badge variant="warning">
                {bomSummary.stalePriceCount} Stale / Unverified Price{bomSummary.stalePriceCount > 1 ? "s" : ""}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={handleDownloadCsv}>
              <Download className="size-3.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-surface-raised/40 text-muted-foreground">
                  <th className="p-2.5">Ref</th>
                  <th className="p-2.5">Part Number</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Unit USD</th>
                  <th className="p-2.5">Provenance & Freshness</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bom.map((item) => {
                  const stale = isPriceStale(item.retrievedAt);
                  return (
                    <tr key={item.id} className="hover:bg-surface-raised/20">
                      <td className="p-2.5 font-mono font-semibold text-accent">{item.designator}</td>
                      <td className="p-2.5">
                        <div className="font-mono font-semibold text-foreground">{item.partNumber}</div>
                        <div className="text-[11px] text-muted-foreground">{item.manufacturer}</div>
                      </td>
                      <td className="p-2.5 max-w-xs text-muted-foreground">{item.description}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min={1}
                          aria-label={`Quantity for ${item.partNumber}`}
                          value={item.quantity}
                          onChange={(e) => {
                            const q = Math.max(1, Number(e.target.value) || 1);
                            setBom((prev) => prev.map((r) => (r.id === item.id ? { ...r, quantity: q } : r)));
                          }}
                          className="w-14 rounded border bg-surface-raised px-2 py-1 font-mono text-xs"
                        />
                      </td>
                      <td className="p-2.5 font-mono">
                        {item.unitPriceUsd !== null ? (
                          <span>${item.unitPriceUsd.toFixed(2)}</span>
                        ) : (
                          <span className="text-warning">Unverified</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ProvenanceBadge status={item.verificationStatus} />
                          {stale && (
                            <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] text-warning">
                              <AlertTriangle className="size-2.5" />
                              {item.retrievedAt ? "Stale (>90d)" : "No price date"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {item.datasheetUrl && (
                            <a
                              href={item.datasheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline"
                              title="Open datasheet"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setBom((prev) => prev.filter((r) => r.id !== item.id))}
                            className="text-muted-foreground hover:text-danger"
                            aria-label={`Remove ${item.partNumber}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add BOM Line Form */}
          <form onSubmit={handleAddBomRow} className="grid gap-2 rounded-md border bg-surface-raised/30 p-3 sm:grid-cols-6">
            <Input
              placeholder="Ref (e.g. R1)"
              value={newPart.designator}
              onChange={(e) => setNewPart((p) => ({ ...p, designator: e.target.value }))}
            />
            <Input
              placeholder="Part Number"
              value={newPart.partNumber}
              onChange={(e) => setNewPart((p) => ({ ...p, partNumber: e.target.value }))}
            />
            <Input
              placeholder="Description"
              value={newPart.description}
              onChange={(e) => setNewPart((p) => ({ ...p, description: e.target.value }))}
              className="sm:col-span-2"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Unit $"
              value={newPart.unitPriceUsd}
              onChange={(e) => setNewPart((p) => ({ ...p, unitPriceUsd: e.target.value }))}
            />
            <Button type="submit" size="sm" className="h-9">
              <Plus className="size-3.5" /> Add Part
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

