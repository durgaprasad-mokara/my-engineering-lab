"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Box,
  Cpu,
  ExternalLink,
  Eye,
  Grid3X3,
  Layers,
  Pin,
  RotateCcw,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import {
  EXPLORER_3D_MODELS,
  EXPLORER_VIEW_MODES,
  PIN_SIGNAL_COLORS,
  getExplorerModel,
  type ExplorerViewMode,
} from "@/lib/knowledge/explorer-3d";
import type { CameraPreset } from "./explorer-scene";
import { Explorer2DView } from "./explorer-2d-views";

const ExplorerScene = dynamic(() => import("./explorer-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Initializing 3D WebGL viewport…
    </div>
  ),
});

export function ExplorerWorkspace({ initialModelSlug }: { initialModelSlug?: string }) {
  const [modelSlug, setModelSlug] = React.useState(getExplorerModel(initialModelSlug).slug);
  const [viewMode, setViewMode] = React.useState<ExplorerViewMode>("3d");
  const [selectedPartId, setSelectedPartId] = React.useState<string | null>(null);
  const [selectedPin, setSelectedPin] = React.useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = React.useState<"parts" | "pins">("parts");

  const [showLabels, setShowLabels] = React.useState(false);
  const [showPins, setShowPins] = React.useState(false);
  const [wireframe, setWireframe] = React.useState(false);
  const [cameraPreset, setCameraPreset] = React.useState<CameraPreset>("isometric");
  const [resetNonce, setResetNonce] = React.useState(0);

  const model = React.useMemo(() => getExplorerModel(modelSlug), [modelSlug]);

  // Reset selections when switching models
  React.useEffect(() => {
    setSelectedPartId(model.parts[0]?.id ?? null);
    setSelectedPin(model.pins[0]?.pin ?? null);
  }, [model]);

  const handleSelectMode = (mode: ExplorerViewMode) => {
    setViewMode(mode);
    if (mode === "pinout") {
      setShowPins(true);
      setInspectorTab("pins");
    } else if (mode === "exploded" || mode === "3d") {
      setInspectorTab("parts");
    }
  };

  const handleSelectPin = (pinNum: string) => {
    setSelectedPin(pinNum);
    setInspectorTab("pins");
  };

  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId);
    setInspectorTab("parts");
  };

  const is3DViewport = viewMode === "3d" || viewMode === "exploded" || viewMode === "pinout";
  const selectedPart = model.parts.find((p) => p.id === selectedPartId) ?? model.parts[0];
  const activePin = model.pins.find((p) => p.pin === selectedPin) ?? model.pins[0];
  const currentViewMeta = EXPLORER_VIEW_MODES.find((v) => v.id === viewMode)!;

  return (
    <div className="space-y-4">
      {/* Model Selector Strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-surface p-3">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Assembly / Component:</span>
        {EXPLORER_3D_MODELS.map((m) => (
          <button
            key={m.slug}
            type="button"
            onClick={() => setModelSlug(m.slug)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              model.slug === m.slug
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 7 View Modes Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Explorer view modes">
          {EXPLORER_VIEW_MODES.map((mode, idx) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={viewMode === mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === mode.id
                  ? "border border-accent/50 bg-accent/15 text-accent"
                  : "bg-surface-raised/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="mr-1 font-mono text-[10px] opacity-60">{idx + 1}.</span>
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DataSourceBadge source={model.sourceLabel} />
          <Badge variant="outline" className="font-mono text-[10px]">
            {model.dimensionsSummary}
          </Badge>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Viewport Card (8 cols) */}
        <Card className="flex flex-col xl:col-span-8">
          <CardHeader className="border-b pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Box className="size-4 text-accent" />
                {model.name} — {currentViewMeta.label}
              </CardTitle>
              <CardDescription>{currentViewMeta.description}</CardDescription>
            </div>
            {model.kbHref && (
              <Button variant="outline" size="sm" asChild>
                <Link href={model.kbHref} className="gap-1.5 text-xs">
                  KB Datasheet <ExternalLink className="size-3" />
                </Link>
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            {/* Viewport Canvas / 2D View */}
            <div className="grid-bg relative h-[430px] w-full overflow-hidden rounded-md border bg-background/70">
              {is3DViewport ? (
                <ExplorerScene
                  model={model}
                  viewMode={viewMode}
                  selectedPartId={selectedPartId}
                  selectedPin={selectedPin}
                  showLabels={showLabels}
                  showPins={showPins}
                  wireframe={wireframe}
                  cameraPreset={cameraPreset}
                  resetNonce={resetNonce}
                  onSelectPart={handleSelectPart}
                  onSelectPin={handleSelectPin}
                />
              ) : (
                <Explorer2DView
                  model={model}
                  viewMode={viewMode}
                  selectedPin={selectedPin}
                  onSelectPin={handleSelectPin}
                />
              )}

              {/* Floating 3D Controls */}
              {is3DViewport && (
                <>
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant={showLabels ? "accent" : "secondary"}
                      onClick={() => setShowLabels((v) => !v)}
                      aria-pressed={showLabels}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Tag className="size-3" /> Labels
                    </Button>
                    <Button
                      size="sm"
                      variant={showPins || viewMode === "pinout" ? "accent" : "secondary"}
                      onClick={() => setShowPins((v) => !v)}
                      aria-pressed={showPins || viewMode === "pinout"}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Pin className="size-3" /> Pins ({model.pins.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={wireframe ? "accent" : "secondary"}
                      onClick={() => setWireframe((v) => !v)}
                      aria-pressed={wireframe}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Grid3X3 className="size-3" /> Wireframe
                    </Button>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
                    {(["isometric", "top", "front", "side"] as CameraPreset[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setCameraPreset(p);
                          setResetNonce((n) => n + 1);
                        }}
                        className={`rounded border px-2 py-1 text-[10px] font-medium capitalize transition-colors ${
                          cameraPreset === p
                            ? "border-accent bg-accent/20 text-accent"
                            : "border-border bg-background/85 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCameraPreset("isometric");
                        setResetNonce((n) => n + 1);
                      }}
                      className="inline-flex items-center gap-1 rounded border border-border bg-background/85 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                      title="Reset camera"
                    >
                      <RotateCcw className="size-3" /> Reset
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Fidelity Disclosure */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-surface-raised/30 px-3 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="size-3.5 text-violet" />
                <span>
                  <strong className="text-foreground">Model fidelity:</strong>{" "}
                  {model.fidelity === "illustrative" ? "Illustrative parametric geometry" : "Manufacturer CAD"} —{" "}
                  {model.fidelityNote}
                </span>
              </div>
              <span className="font-mono text-[10px]">Drag: orbit · Scroll: zoom · Right-drag: pan</span>
            </div>
          </CardContent>
        </Card>

        {/* Right-Hand Inspector Panel (4 cols) */}
        <Card className="flex flex-col xl:col-span-4">
          <CardHeader className="border-b pb-3">
            <div className="flex w-full items-center justify-between">
              <CardTitle className="text-sm">Component & Pin Inspector</CardTitle>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setInspectorTab("parts")}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    inspectorTab === "parts"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="mr-1 inline size-3" />
                  Parts ({model.parts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab("pins")}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    inspectorTab === "pins"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Cpu className="mr-1 inline size-3" />
                  Pins ({model.pins.length})
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            {inspectorTab === "parts" ? (
              <>
                {selectedPart && (
                  <div className="rounded-md border border-accent/30 bg-accent/5 p-3 space-y-1.5">
                    <div className="text-xs font-semibold text-accent">{selectedPart.name}</div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{selectedPart.role}</p>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                      <div>
                        <span className="block text-muted-foreground font-sans">Material</span>
                        <span className="text-foreground">{selectedPart.material}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-sans">Dimensions</span>
                        <span className="text-foreground">{selectedPart.dimensions}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sub-Assemblies
                  </div>
                  <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {model.parts.map((part) => (
                      <li key={part.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPart(part.id)}
                          className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                            selectedPartId === part.id
                              ? "border-accent/50 bg-accent/10 text-foreground"
                              : "border-transparent bg-surface-raised/40 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="font-medium">{part.name}</span>
                          <span className="font-mono text-[10px] opacity-75">{part.dimensions.split(" ")[0]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                {activePin && (
                  <div className="rounded-md border border-accent/30 bg-accent/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-accent">
                        Pin {activePin.pin} · {activePin.name}
                      </span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {activePin.voltage}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activePin.description}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: PIN_SIGNAL_COLORS[activePin.signalType].hex }}
                      />
                      <span className="text-foreground/80">{PIN_SIGNAL_COLORS[activePin.signalType].label}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pinout Map (Click to inspect)
                  </div>
                  <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {model.pins.map((pin) => {
                      const sig = PIN_SIGNAL_COLORS[pin.signalType];
                      return (
                        <li key={pin.pin}>
                          <button
                            type="button"
                            onClick={() => handleSelectPin(pin.pin)}
                            className={`flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                              selectedPin === pin.pin
                                ? "border-accent/50 bg-accent/10 text-foreground"
                                : "border-transparent bg-surface-raised/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-2 font-mono">
                              <span
                                className="inline-block size-2 rounded-full"
                                style={{ backgroundColor: sig.hex }}
                              />
                              <span className="font-semibold text-foreground">{pin.pin}</span>
                              <span>{pin.name}</span>
                            </span>
                            <span className="font-mono text-[10px]">{pin.voltage}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

