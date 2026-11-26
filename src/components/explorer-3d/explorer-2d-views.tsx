"use client";

import { ArrowRight, Cpu, Layers, ShieldAlert, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PIN_SIGNAL_COLORS,
  type Explorer3DModel,
  type ExplorerViewMode,
} from "@/lib/knowledge/explorer-3d";

export function Explorer2DView({
  model,
  viewMode,
  selectedPin,
  onSelectPin,
}: {
  model: Explorer3DModel;
  viewMode: Extract<ExplorerViewMode, "circuit" | "pcb" | "wiring" | "architecture">;
  selectedPin: string | null;
  onSelectPin: (pin: string) => void;
}) {
  if (viewMode === "pcb") {
    const { widthMm, heightMm, pitchMm, packageName, keepoutNote } = model.pcbFootprint;
    return (
      <div className="flex h-full flex-col justify-between gap-4 overflow-y-auto p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">PCB Footprint & Courtyard</h3>
            <p className="text-xs text-muted-foreground">{packageName}</p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <Badge variant="outline">{widthMm} × {heightMm} mm</Badge>
            <Badge variant="accent">Pitch: {pitchMm} mm</Badge>
          </div>
        </div>

        {/* SVG Top-Down PCB Courtyard & Pads */}
        <div className="flex flex-1 items-center justify-center rounded-md border bg-[#06120e] p-4">
          <svg viewBox="0 0 360 200" className="h-full max-h-64 w-full max-w-lg">
            {/* Courtyard dashed outline */}
            <rect
              x="25"
              y="20"
              width="310"
              height="160"
              rx="6"
              fill="none"
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {/* PCB Silkscreen Outline */}
            <rect
              x="40"
              y="35"
              width="280"
              height="130"
              rx="4"
              fill="#064e3b"
              fillOpacity="0.45"
              stroke="#10b981"
              strokeWidth="2"
            />
            {/* Pin 1 Indicator */}
            <circle cx="52" cy="48" r="4" fill="#f59e0b" />
            <text x="62" y="51" className="fill-amber-400 font-mono text-[9px]">PIN 1</text>

            {/* Dimension callout */}
            <text x="180" y="18" textAnchor="middle" className="fill-slate-400 font-mono text-[10px]">
              {widthMm} mm
            </text>
            <text x="180" y="104" textAnchor="middle" className="fill-emerald-200 font-mono text-[11px] font-semibold">
              {model.name}
            </text>
            <text x="180" y="120" textAnchor="middle" className="fill-emerald-400/80 font-mono text-[9px]">
              {packageName}
            </text>

            {/* Copper Pads along top/bottom */}
            {model.pins.slice(0, 14).map((p, idx) => {
              const isTop = idx % 2 === 1;
              const col = Math.floor(idx / 2);
              const px = 62 + col * 36;
              const py = isTop ? 40 : 150;
              const active = selectedPin === p.pin;
              return (
                <g
                  key={p.pin}
                  onClick={() => onSelectPin(p.pin)}
                  className="cursor-pointer"
                >
                  <rect
                    x={px - 7}
                    y={py}
                    width="14"
                    height="10"
                    rx="2"
                    fill={active ? "#13d3f2" : "#eab308"}
                    stroke={active ? "#ffffff" : "#ca8a04"}
                    strokeWidth={active ? "1.5" : "0.75"}
                  />
                  <text
                    x={px}
                    y={isTop ? 33 : 172}
                    textAnchor="middle"
                    className="fill-slate-300 font-mono text-[8px]"
                  >
                    {p.pin}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <span className="font-semibold">Layout & Keepout Rule: </span>
            <span className="text-foreground/90">{keepoutNote}</span>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "circuit") {
    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Schematic & Signal Conditioning View</h3>
            <p className="text-xs text-muted-foreground">
              Pin-level electrical interface groups and decoupling/protection notes.
            </p>
          </div>
          <Badge variant="outline">Illustrative Schematic</Badge>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          {model.pins.map((pin) => {
            const meta = PIN_SIGNAL_COLORS[pin.signalType];
            const active = selectedPin === pin.pin;
            return (
              <button
                key={pin.pin}
                type="button"
                onClick={() => onSelectPin(pin.pin)}
                className={`flex items-center justify-between rounded-md border p-2.5 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent/10"
                    : "bg-surface-raised/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex size-6 items-center justify-center rounded font-mono text-[10px] font-bold text-white"
                    style={{ backgroundColor: meta.hex }}
                  >
                    {pin.pin}
                  </span>
                  <div>
                    <div className="font-mono text-xs font-semibold text-foreground">{pin.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{pin.description}</div>
                  </div>
                </div>
                <span className="ml-2 shrink-0 font-mono text-[11px] text-accent">{pin.voltage}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (viewMode === "wiring") {
    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Point-to-Point Wiring Harness</h3>
            <p className="text-xs text-muted-foreground">
              Power rails, bus interconnects, and signal routing for {model.name}.
            </p>
          </div>
          <Badge variant="outline">
            <Workflow className="mr-1 size-3" /> {model.wiring.length} Connections
          </Badge>
        </div>

        <div className="space-y-3">
          {model.wiring.map((w, idx) => (
            <div
              key={`${w.from}-${w.to}-${idx}`}
              className="flex flex-col gap-2 rounded-lg border bg-surface-raised/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded border bg-background px-2.5 py-1 font-mono font-semibold text-foreground">
                  {w.from}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: w.color }}>
                  <span className="inline-block h-0.5 w-6" style={{ backgroundColor: w.color }} />
                  <ArrowRight className="size-3.5" />
                </span>
                <span className="rounded border bg-background px-2.5 py-1 font-mono font-semibold text-foreground">
                  {w.to}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {w.signal}
                </Badge>
                <span className="text-muted-foreground">{w.protocol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Architecture view
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">System Architecture Hierarchy</h3>
          <p className="text-xs text-muted-foreground">
            Layered functional breakdown for {model.name}.
          </p>
        </div>
        <Badge variant="outline">
          <Layers className="mr-1 size-3" /> {model.architecture.length} Layers
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {model.architecture.map((block, idx) => (
          <div key={block.layer} className="rounded-lg border bg-surface-raised/40 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="accent" className="text-[10px]">
                Layer {idx + 1} · {block.layer}
              </Badge>
              <Cpu className="size-4 text-muted-foreground" />
            </div>
            <div className="text-sm font-semibold text-foreground pt-1">{block.title}</div>
            <p className="text-xs leading-relaxed text-muted-foreground">{block.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

