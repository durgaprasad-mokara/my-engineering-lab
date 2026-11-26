"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_CIRCUIT_EDGES,
  DEFAULT_CIRCUIT_NODES,
} from "@/lib/design/default-circuit";
import { runElectricalRuleChecks } from "@/lib/design/erc";
import { generateKicadNetlist } from "@/lib/design/netlist";
import type { CircuitEdge, CircuitNode, CircuitViewKind } from "@/lib/design/types";

const VIEW_KINDS: { id: CircuitViewKind; label: string; desc: string }[] = [
  { id: "block", label: "Block Diagram", desc: "High-level subsystem functional blocks & data flow" },
  { id: "wiring", label: "Wiring Diagram", desc: "Physical point-to-point harness & pin labels" },
  { id: "schematic", label: "Schematic View", desc: "Electrical rails, voltage levels & bus signals" },
  { id: "pcb_layout", label: "PCB Footprint Prep", desc: "Footprint packages & placement coordinates" },
];

const PROTOCOL_COLORS: Record<CircuitEdge["protocol"], string> = {
  power: "#ef4444",
  ground: "#64748b",
  i2c: "#13d3f2",
  spi: "#22c55e",
  uart: "#3b82f6",
  analog: "#f59e0b",
  rf: "#a855f7",
};

export function CircuitDesignerWorkspace() {
  const [nodes, setNodes] = React.useState<CircuitNode[]>(DEFAULT_CIRCUIT_NODES);
  const [edges, setEdges] = React.useState<CircuitEdge[]>(DEFAULT_CIRCUIT_EDGES);
  const [viewKind, setViewKind] = React.useState<CircuitViewKind>("schematic");
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("mcu-1");
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const ercIssues = React.useMemo(() => runElectricalRuleChecks(nodes, edges), [nodes, edges]);
  const errorCount = ercIssues.filter((i) => i.severity === "error").length;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const handleAdd5vSensor = () => {
    if (nodes.some((n) => n.id === "hcsr04-5v")) return;
    const sensorNode: CircuitNode = {
      id: "hcsr04-5v",
      label: "HC-SR04 (5V Ultrasonic)",
      kind: "sensor",
      voltageV: 5.0,
      maxInputV: 5.5,
      currentDrawMa: 15,
      busTypes: ["GPIO"],
      x: 70,
      y: 260,
      footprint: "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm",
    };
    const edge: CircuitEdge = {
      id: `e-hcsr04-${Date.now()}`,
      fromNodeId: "hcsr04-5v",
      fromPin: "ECHO",
      toNodeId: "mcu-1",
      toPin: "GPIO34",
      signal: "ECHO_5V_DIRECT",
      protocol: "analog",
      voltageV: 5.0,
      hasLevelShifter: false,
    };
    setNodes((prev) => [...prev, sensorNode]);
    setEdges((prev) => [...prev, edge]);
    setSelectedNodeId("hcsr04-5v");
  };

  const handleToggleLevelShifter = () => {
    setEdges((prev) =>
      prev.map((e) =>
        e.fromNodeId === "hcsr04-5v" ? { ...e, hasLevelShifter: !e.hasLevelShifter } : e,
      ),
    );
  };

  const handleExportNetlist = () => {
    const net = generateKicadNetlist("Smart_Water_Meter_Node", nodes, edges);
    const blob = new Blob([net], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "circuit-design.net";
    a.click();
    URL.revokeObjectURL(url);
  };

  const has5vSensor = nodes.some((n) => n.id === "hcsr04-5v");
  const hcsr04Edge = edges.find((e) => e.fromNodeId === "hcsr04-5v");

  return (
    <div className="space-y-4">
      {/* Diagram Kind Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Diagram view kind">
          {VIEW_KINDS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={viewKind === v.id}
              onClick={() => setViewKind(v.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewKind === v.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!has5vSensor ? (
            <Button size="sm" variant="outline" onClick={handleAdd5vSensor}>
              <Plus className="size-3.5" /> Add 5V Sensor (Test ERC)
            </Button>
          ) : (
            <Button size="sm" variant="accent" onClick={handleToggleLevelShifter}>
              <Zap className="size-3.5" />
              {hcsr04Edge?.hasLevelShifter ? "Remove Level Shifter" : "Insert 5V→3.3V Divider"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleExportNetlist}>
            <Download className="size-3.5" /> Export Netlist
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setNodes(DEFAULT_CIRCUIT_NODES);
              setEdges(DEFAULT_CIRCUIT_EDGES);
            }}
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Interactive Node-Wire Canvas (8 cols) */}
        <Card className="xl:col-span-8">
          <CardHeader className="border-b pb-3">
            <div>
              <CardTitle className="text-base">
                {VIEW_KINDS.find((v) => v.id === viewKind)?.label}
              </CardTitle>
              <CardDescription>
                {VIEW_KINDS.find((v) => v.id === viewKind)?.desc}. Drag nodes to rearrange.
              </CardDescription>
            </div>
            <Badge variant={errorCount > 0 ? "danger" : "warning"}>
              {errorCount > 0 ? `${errorCount} ERC Error(s)` : "ERC Static Pass · Unsimulated"}
            </Badge>
          </CardHeader>

          <CardContent className="p-4">
            <div
              className="grid-bg relative h-[400px] w-full overflow-hidden rounded-md border bg-background/80 select-none"
              onPointerMove={(e) => {
                if (!draggingId) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = Math.max(20, Math.min(rect.width - 150, e.clientX - rect.left - 65));
                const ny = Math.max(20, Math.min(rect.height - 70, e.clientY - rect.top - 25));
                setNodes((prev) =>
                  prev.map((n) => (n.id === draggingId ? { ...n, x: Math.round(nx), y: Math.round(ny) } : n)),
                );
              }}
              onPointerUp={() => setDraggingId(null)}
              onPointerLeave={() => setDraggingId(null)}
            >
              {/* SVG Wires Layer */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {edges.map((edge) => {
                  const from = nodes.find((n) => n.id === edge.fromNodeId);
                  const to = nodes.find((n) => n.id === edge.toNodeId);
                  if (!from || !to) return null;
                  const x1 = from.x + 70;
                  const y1 = from.y + 30;
                  const x2 = to.x + 70;
                  const y2 = to.y + 30;
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  const color = PROTOCOL_COLORS[edge.protocol];
                  const hasErr = ercIssues.some((i) => i.id === `erc-volt-${edge.id}` || i.id === `erc-pin-${edge.id}`);

                  return (
                    <g key={edge.id}>
                      <path
                        d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={hasErr ? "#ef4444" : color}
                        strokeWidth={hasErr ? 2.5 : 1.75}
                        strokeDasharray={edge.protocol === "ground" ? "4 3" : undefined}
                      />
                      <rect
                        x={mx - 36}
                        y={my - 9}
                        width="72"
                        height="16"
                        rx="3"
                        fill="#080d1a"
                        stroke={hasErr ? "#ef4444" : color}
                        strokeWidth="0.75"
                      />
                      <text
                        x={mx}
                        y={my + 2}
                        textAnchor="middle"
                        className="fill-slate-200 font-mono text-[8px]"
                      >
                        {viewKind === "wiring"
                          ? `${edge.fromPin}→${edge.toPin}`
                          : edge.hasLevelShifter
                            ? `${edge.signal} (÷)`
                            : edge.signal}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Draggable Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const hasIssue = ercIssues.some((i) => i.severity === "error" && i.nodeIds.includes(node.id));
                return (
                  <div
                    key={node.id}
                    onPointerDown={() => {
                      setDraggingId(node.id);
                      setSelectedNodeId(node.id);
                    }}
                    style={{ left: node.x, top: node.y }}
                    className={`absolute w-36 cursor-grab rounded-md border bg-surface p-2 shadow-md transition-shadow active:cursor-grabbing ${
                      hasIssue
                        ? "border-danger shadow-danger/20"
                        : isSelected
                          ? "border-accent shadow-glow"
                          : "border-border hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono uppercase text-muted-foreground">{node.kind}</span>
                      <span className="font-mono font-semibold text-accent">{node.voltageV}V</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs font-semibold text-foreground">{node.label}</div>
                    {viewKind === "pcb_layout" ? (
                      <div className="mt-1 truncate font-mono text-[9px] text-emerald-400">
                        {node.footprint.split(":")[1] ?? node.footprint}
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
                        <span>{node.currentDrawMa < 0 ? `Max ${Math.abs(node.currentDrawMa)}mA` : `${node.currentDrawMa}mA`}</span>
                        <span>{node.busTypes.slice(0, 2).join("/")}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Electrical Rule Check & Node Inspector (4 cols) */}
        <div className="space-y-4 xl:col-span-4">
          <Card>
            <CardHeader className="border-b pb-3">
              <div>
                <CardTitle className="text-sm">Electrical Rule Checks (ERC)</CardTitle>
                <CardDescription>Static rule checks — not SPICE simulation</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 p-4">
              {ercIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`flex items-start gap-2 rounded-md border p-2.5 text-xs ${
                    issue.severity === "error"
                      ? "border-danger/40 bg-danger/10 text-danger"
                      : issue.severity === "warning"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-accent/30 bg-accent/10 text-accent"
                  }`}
                >
                  {issue.severity === "error" ? (
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  ) : issue.severity === "warning" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  )}
                  <div>
                    <span className="font-mono text-[10px] font-bold">{issue.code}: </span>
                    <span className="text-foreground/90">{issue.message}</span>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2 rounded border bg-surface-raised/40 p-2.5 text-[11px] text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>
                  Per engineering policy, designs are never labelled &ldquo;electrically validated&rdquo; until a transient simulation or bench test has run.
                </span>
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex w-full items-center justify-between">
                  <CardTitle className="text-sm">{selectedNode.label}</CardTitle>
                  {nodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
                        setEdges((prev) =>
                          prev.filter((e) => e.fromNodeId !== selectedNode.id && e.toNodeId !== selectedNode.id),
                        );
                        setSelectedNodeId(null);
                      }}
                      className="text-muted-foreground hover:text-danger"
                      aria-label={`Delete ${selectedNode.label}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="rounded bg-surface-raised/50 p-2">
                    <span className="block font-sans text-[10px] text-muted-foreground">Nominal / Max</span>
                    <span>{selectedNode.voltageV}V / {selectedNode.maxInputV}V</span>
                  </div>
                  <div className="rounded bg-surface-raised/50 p-2">
                    <span className="block font-sans text-[10px] text-muted-foreground">Current</span>
                    <span>
                      {selectedNode.currentDrawMa < 0
                        ? `Supplies ${Math.abs(selectedNode.currentDrawMa)} mA`
                        : `Draws ${selectedNode.currentDrawMa} mA`}
                    </span>
                  </div>
                </div>
                <div className="rounded bg-surface-raised/50 p-2 font-mono text-[10px] text-muted-foreground">
                  <span className="block font-sans text-muted-foreground">KiCad Footprint</span>
                  <span className="text-foreground">{selectedNode.footprint}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

