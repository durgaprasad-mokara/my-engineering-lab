"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Expand, Shrink, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { Button } from "@/components/ui/button";
import { DEVICE_PARTS } from "./device-parts";

const Scene = dynamic(() => import("./telemetry-device-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading 3D model…</div>
  ),
});

export function TelemetryDevice() {
  const [exploded, setExploded] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>("modem");
  const part = DEVICE_PARTS.find((p) => p.id === selected);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle>3D IoT telemetry device</CardTitle>
          <CardDescription>Drag to rotate · scroll to zoom · right-drag to pan · click a part</CardDescription>
        </div>
        <DataSourceBadge source="illustrative" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 md:flex-row">
        <div className="grid-bg relative h-64 min-w-0 flex-1 overflow-hidden rounded-md border bg-background/60 sm:h-72">
          <Scene exploded={exploded} selected={selected} onSelect={setSelected} />
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => setExploded((e) => !e)} aria-pressed={exploded}>
              {exploded ? <Shrink /> : <Expand />} {exploded ? "Assembled" : "Exploded view"}
            </Button>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-56">
          <div className="rounded-md border bg-surface-raised/50 p-3">
            {part ? (
              <>
                <div className="text-xs font-semibold text-accent">{part.name}</div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{part.role}</p>
              </>
            ) : (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <MousePointerClick className="size-4" /> Select a part
              </p>
            )}
          </div>
          <ul className="grid grid-cols-2 gap-1 md:grid-cols-1">
            {DEVICE_PARTS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`w-full rounded px-2 py-1 text-left text-[11px] ${
                    selected === p.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-surface-raised"
                  }`}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-auto text-[10px] leading-4 text-muted-foreground/80">
            Simplified generic geometry for learning — not a manufacturer CAD model. Accurate component models arrive in the 3D
            Explorer (Phase 4).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
