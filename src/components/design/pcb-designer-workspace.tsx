"use client";

import * as React from "react";
import { CircuitBoard, Download, Info, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_CIRCUIT_EDGES,
  DEFAULT_CIRCUIT_NODES,
  DEFAULT_PCB_STACKUP,
} from "@/lib/design/default-circuit";
import { generateKicadNetlist, generatePlacementCsv } from "@/lib/design/netlist";
import type { CircuitNode, PcbStackup } from "@/lib/design/types";

export function PcbDesignerWorkspace() {
  const [stackup, setStackup] = React.useState<PcbStackup>(DEFAULT_PCB_STACKUP);
  const [nodes, setNodes] = React.useState<CircuitNode[]>(DEFAULT_CIRCUIT_NODES);
  const [projectName, setProjectName] = React.useState("Smart_Water_Meter_RevA");

  const netlistText = React.useMemo(
    () => generateKicadNetlist(projectName, nodes, DEFAULT_CIRCUIT_EDGES),
    [projectName, nodes],
  );

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3.5 text-xs">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        <div>
          <strong className="text-foreground">PCB Preparation Workspace:</strong> Configure board outline, layer stack-up, and component footprints, then export a KiCad S-expression netlist (<code>.net</code>) and pick-and-place CSV. Final copper routing and Gerber generation stay in KiCad / Altium.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Stack-up & Board Outline Settings (4 cols) */}
        <Card className="xl:col-span-4">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="size-4 text-accent" />
              Board Outline & Stack-up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-xs">
            <div>
              <label htmlFor="pcb-proj-name" className="mb-1 block text-muted-foreground">
                Board / Project Name
              </label>
              <Input
                id="pcb-proj-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="pcb-w" className="mb-1 block text-muted-foreground">Width (mm)</label>
                <Input
                  id="pcb-w"
                  type="number"
                  value={stackup.boardWidthMm}
                  onChange={(e) => setStackup((s) => ({ ...s, boardWidthMm: Math.max(20, Number(e.target.value) || 85) }))}
                />
              </div>
              <div>
                <label htmlFor="pcb-h" className="mb-1 block text-muted-foreground">Height (mm)</label>
                <Input
                  id="pcb-h"
                  type="number"
                  value={stackup.boardHeightMm}
                  onChange={(e) => setStackup((s) => ({ ...s, boardHeightMm: Math.max(20, Number(e.target.value) || 55) }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {([2, 4] as const).map((layers) => (
                <button
                  key={layers}
                  type="button"
                  onClick={() => setStackup((s) => ({ ...s, layers }))}
                  className={`flex-1 rounded-md border py-2 text-xs font-medium ${
                    stackup.layers === layers
                      ? "border-accent bg-accent/15 text-accent"
                      : "bg-surface-raised text-muted-foreground"
                  }`}
                >
                  {layers}-Layer {layers === 4 ? "(Recommended RF)" : ""}
                </button>
              ))}
            </div>

            <div className="rounded-md border bg-surface-raised/40 p-3 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Substrate:</span>
                <span>{stackup.substrate} ({stackup.thicknessMm} mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Copper Weight:</span>
                <span>{stackup.copperOz} oz outer / 0.5 oz inner</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">50 Ω Microstrip:</span>
                <span className={stackup.layers === 4 ? "text-success" : "text-warning"}>
                  {stackup.layers === 4 ? "Supported (L1→L2 Ref)" : "Wide trace on 2-layer"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => downloadFile(`${projectName}.net`, netlistText, "text/plain;charset=utf-8")}
              >
                <Download className="size-3.5" /> Download KiCad Netlist (.net)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadFile(
                    `${projectName}-placement.csv`,
                    generatePlacementCsv(nodes, stackup),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Download className="size-3.5" /> Export Placement CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footprint Assignment & Placement Preview (8 cols) */}
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader className="border-b pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CircuitBoard className="size-4 text-accent" />
                  Footprint Assignment & Board Preview ({stackup.boardWidthMm} × {stackup.boardHeightMm} mm)
                </CardTitle>
                <CardDescription>Verify KiCad library footprints prior to netlist export.</CardDescription>
              </div>
              <Badge variant="outline">{nodes.length} Footprints</Badge>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-surface-raised/40 text-muted-foreground">
                      <th className="p-2">Ref</th>
                      <th className="p-2">Component</th>
                      <th className="p-2">KiCad Footprint</th>
                      <th className="p-2">X / Y (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {nodes.map((n, idx) => (
                      <tr key={n.id}>
                        <td className="p-2 font-mono font-semibold text-accent">U{idx + 1}</td>
                        <td className="p-2 font-medium">{n.label}</td>
                        <td className="p-2">
                          <Input
                            value={n.footprint}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((item) =>
                                  item.id === n.id ? { ...item, footprint: e.target.value } : item,
                                ),
                              )
                            }
                            className="h-7 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-2 font-mono text-[11px] text-muted-foreground">
                          {((n.x / 600) * stackup.boardWidthMm).toFixed(1)},{" "}
                          {((n.y / 380) * stackup.boardHeightMm).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  KiCad Netlist Preview (.net)
                </div>
                <pre className="max-h-52 overflow-auto rounded-md border bg-[#060a14] p-3 font-mono text-[11px] text-emerald-300">
                  {netlistText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

