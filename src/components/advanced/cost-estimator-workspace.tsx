"use client";

import { useState } from "react";
import { Calculator, Download, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { estimatePrototypeCost, type CostEstimateInput, type CostEstimateResult } from "@/lib/advanced/engines";

const INITIAL_COST_INPUT: CostEstimateInput = {
  projectName: "IoT Sensor Hub Prototype",
  items: [
    { name: "ESP32-WROOM-32 Module", unitCostUsd: 3.4, qty: 1 },
    { name: "BME280 Environmental Sensor", unitCostUsd: 2.8, qty: 1 },
    { name: "AMS1117-3.3 LDO + Passives", unitCostUsd: 0.95, qty: 1 },
    { name: "JST-XH Connectors & Headers", unitCostUsd: 1.2, qty: 2 },
  ],
  pcbAreaCm2: 36,
  pcbLayers: 2,
  prototypeQty: 10,
  enclosureCostUsd: 4.5,
  shippingAndNreUsd: 24,
};

export function CostEstimatorWorkspace() {
  const [input, setInput] = useState<CostEstimateInput>(INITIAL_COST_INPUT);
  const [result, setResult] = useState<CostEstimateResult>(() => estimatePrototypeCost(INITIAL_COST_INPUT));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recalculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cost-estimator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as CostEstimateResult & { error?: string };
      if (!res.ok) setError(data.error ?? "Cost calculation failed.");
      else setResult(data);
    } catch {
      setError("Network error contacting cost estimator API.");
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setInput((prev) => ({
      ...prev,
      items: [...prev.items, { name: "New Component", unitCostUsd: 1.5, qty: 1 }],
    }));
  }

  function exportCsv() {
    const lines = [
      "Item,UnitCostUSD,Qty,SubtotalUSD",
      ...input.items.map((i) => `"${i.name}",${i.unitCostUsd},${i.qty},${(i.unitCostUsd * i.qty).toFixed(2)}`),
      `PCB Fab Per Unit,${result.pcbFabPerUnitUsd},1,${result.pcbFabPerUnitUsd}`,
      `Assembly Per Unit,${result.assemblyPerUnitUsd},1,${result.assemblyPerUnitUsd}`,
      `Total Per Unit (Qty ${input.prototypeQty}),${result.totalPerUnitUsd},1,${result.totalPerUnitUsd}`,
      `Total Batch,${result.totalBatchUsd},1,${result.totalBatchUsd}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prototype-cost-estimate.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">BOM / Unit</div>
          <div className="mt-1 font-mono text-lg font-semibold">${result.bomPerUnitUsd.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">PCB + Assembly / Unit</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            ${(result.pcbFabPerUnitUsd + result.assemblyPerUnitUsd).toFixed(2)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Landed / Unit (Qty {input.prototypeQty})</div>
          <div className="mt-1 font-mono text-lg font-semibold text-primary">${result.totalPerUnitUsd.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Total Batch Estimate</div>
          <div className="mt-1 font-mono text-lg font-semibold">${result.totalBatchUsd.toFixed(2)}</div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Prototype Cost Parameters
                <Badge variant="illustrative">Estimated Pricing</Badge>
              </CardTitle>
              <CardDescription className="text-xs">{result.note}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="size-3.5" />
                Export CSV
              </Button>
              <Button size="sm" disabled={loading} onClick={recalculate}>
                <Calculator className="size-3.5" />
                {loading ? "Calculating..." : "Calculate Estimate"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">PCB Area (cm²)</label>
              <Input
                type="number"
                value={input.pcbAreaCm2}
                onChange={(e) => setInput({ ...input, pcbAreaCm2: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Layers</label>
              <select
                value={input.pcbLayers}
                onChange={(e) => setInput({ ...input, pcbLayers: Number(e.target.value) as 2 | 4 | 6 })}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value={2}>2-Layer FR4</option>
                <option value={4}>4-Layer FR4</option>
                <option value={6}>6-Layer FR4</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Prototype Qty</label>
              <Input
                type="number"
                value={input.prototypeQty}
                onChange={(e) => setInput({ ...input, prototypeQty: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Enclosure / Unit ($)</label>
              <Input
                type="number"
                step="0.5"
                value={input.enclosureCostUsd}
                onChange={(e) => setInput({ ...input, enclosureCostUsd: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Shipping &amp; NRE ($)</label>
              <Input
                type="number"
                value={input.shippingAndNreUsd}
                onChange={(e) => setInput({ ...input, shippingAndNreUsd: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                BOM Line Items ({input.items.length})
              </h4>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-3.5" />
                Add Line Item
              </Button>
            </div>
            {input.items.map((item, idx) => (
              <div key={idx} className="grid items-center gap-2 sm:grid-cols-12">
                <Input
                  className="sm:col-span-6"
                  value={item.name}
                  onChange={(e) => {
                    const next = [...input.items];
                    next[idx] = { ...item, name: e.target.value };
                    setInput({ ...input, items: next });
                  }}
                />
                <Input
                  type="number"
                  step="0.05"
                  className="sm:col-span-3"
                  value={item.unitCostUsd}
                  onChange={(e) => {
                    const next = [...input.items];
                    next[idx] = { ...item, unitCostUsd: Number(e.target.value) };
                    setInput({ ...input, items: next });
                  }}
                />
                <Input
                  type="number"
                  className="sm:col-span-2"
                  value={item.qty}
                  onChange={(e) => {
                    const next = [...input.items];
                    next[idx] = { ...item, qty: Number(e.target.value) };
                    setInput({ ...input, items: next });
                  }}
                />
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={input.items.length <= 1}
                    onClick={() => setInput({ ...input, items: input.items.filter((_, i) => i !== idx) })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Volume Tier Breakpoints (Estimated)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          {result.tiers.map((tier) => (
            <div key={tier.qty} className="rounded-lg border border-border p-3 text-xs">
              <div className="text-muted-foreground">Batch Qty {tier.qty}</div>
              <div className="mt-1 font-mono text-base font-semibold text-foreground">${tier.perUnitUsd.toFixed(2)} / unit</div>
              <div className="font-mono text-[11px] text-muted-foreground">Total: ${tier.totalUsd.toFixed(2)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

