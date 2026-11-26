"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Layers, Power, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_ALERT_RULES,
  DEFAULT_DEVICES,
  evaluateDeviceAlerts,
  type TelemetryDeviceRecord,
} from "@/lib/cloud/telemetry";

const TelemetryScene = dynamic(() => import("@/components/dashboard/telemetry-device-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Loading 3D Digital Twin…
    </div>
  ),
});

export function DigitalTwinWorkspace() {
  const [devices, setDevices] = React.useState<TelemetryDeviceRecord[]>(DEFAULT_DEVICES);
  const [selectedId, setSelectedId] = React.useState(DEFAULT_DEVICES[0]!.id);
  const [selectedPart, setSelectedPart] = React.useState<string | null>("sensor");
  const [exploded, setExploded] = React.useState(false);

  const device = devices.find((d) => d.id === selectedId) ?? devices[0]!;
  const alerts = evaluateDeviceAlerts(device, DEFAULT_ALERT_RULES);

  const toggleValve = () => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? {
              ...d,
              lastSeenIso: new Date().toISOString(),
              metrics: {
                ...d.metrics,
                valveOpen: !d.metrics.valveOpen,
                flowRateLpm: !d.metrics.valveOpen ? 6.4 : 0,
              },
            }
          : d,
      ),
    );
  };

  const injectAnomaly = () => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id
          ? {
              ...d,
              lastSeenIso: new Date().toISOString(),
              metrics: { ...d.metrics, flowRateLpm: 28.5, batteryV: 2.95 },
            }
          : d,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface p-3">
        <div className="flex flex-wrap gap-1.5">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                d.id === device.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={toggleValve}>
            <Power className="size-3.5" /> {device.metrics.valveOpen ? "Close Valve" : "Open Valve"}
          </Button>
          <Button size="sm" variant="secondary" onClick={injectAnomaly}>
            <RefreshCw className="size-3.5" /> Simulate Leak Anomaly
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader className="border-b pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="size-4 text-accent" />
                3D Digital Twin — {device.name}
              </CardTitle>
              <CardDescription>Topic: {device.mqttTopic} · Protocol: {device.protocol}</CardDescription>
            </div>
            <Badge variant={alerts.length > 0 ? "danger" : "live"}>
              {alerts.length > 0 ? "Anomaly Detected" : "Nominal"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid-bg relative h-80 w-full overflow-hidden rounded-md border bg-background/70">
              <TelemetryScene exploded={exploded} selected={selectedPart} onSelect={setSelectedPart} />
              <div className="absolute bottom-2 left-2">
                <Button size="sm" variant="secondary" onClick={() => setExploded((e) => !e)}>
                  {exploded ? "Assemble Twin" : "Explode Twin"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Bound Telemetry State</CardTitle>
            <CardDescription>Last updated: {device.lastSeenIso}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-xs">
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="rounded-md border bg-surface-raised/40 p-3">
                <span className="block font-sans text-[10px] text-muted-foreground">Flow Rate</span>
                <span className="text-base font-bold text-accent">{device.metrics.flowRateLpm} L/min</span>
              </div>
              <div className="rounded-md border bg-surface-raised/40 p-3">
                <span className="block font-sans text-[10px] text-muted-foreground">Battery Voltage</span>
                <span className="text-base font-bold text-foreground">{device.metrics.batteryV} V</span>
              </div>
              <div className="rounded-md border bg-surface-raised/40 p-3">
                <span className="block font-sans text-[10px] text-muted-foreground">Signal (RSSI)</span>
                <span className="text-base font-bold text-foreground">{device.metrics.rssiDbm} dBm</span>
              </div>
              <div className="rounded-md border bg-surface-raised/40 p-3">
                <span className="block font-sans text-[10px] text-muted-foreground">Actuator / Valve</span>
                <span className={`text-base font-bold ${device.metrics.valveOpen ? "text-success" : "text-warning"}`}>
                  {device.metrics.valveOpen ? "OPEN" : "CLOSED"}
                </span>
              </div>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-danger">
                  Active Anomaly Overlays
                </div>
                {alerts.map((a) => (
                  <div key={a.rule.id} className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 p-2.5 text-danger">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{a.rule.name}: measured {a.actualValue} (threshold {a.rule.operator} {a.rule.threshold})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-success/30 bg-success/10 p-3 text-success">
                All telemetry channels within nominal operating thresholds.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

