"use client";

import * as React from "react";
import { AlertTriangle, Cloud, Plus, Radio, RefreshCw, Server, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CLOUD_PATTERNS,
  DEFAULT_ALERT_RULES,
  DEFAULT_DEVICES,
  evaluateDeviceAlerts,
  type TelemetryDeviceRecord,
} from "@/lib/cloud/telemetry";

export function GatewayCloudWorkspace({ brokerConfigured }: { brokerConfigured: boolean }) {
  const [devices, setDevices] = React.useState<TelemetryDeviceRecord[]>(DEFAULT_DEVICES);
  const [newName, setNewName] = React.useState("");
  const [newProtocol, setNewProtocol] = React.useState<TelemetryDeviceRecord["protocol"]>("NB-IoT");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const dev: TelemetryDeviceRecord = {
      id: `dev-${Date.now()}`,
      name: newName.trim(),
      deviceEui: `8675309${String(Date.now()).slice(-9)}`,
      protocol: newProtocol,
      status: "online",
      mqttTopic: `lab/custom/${slug}/telemetry`,
      lastSeenIso: new Date().toISOString(),
      metrics: { flowRateLpm: 4.2, batteryV: 3.6, rssiDbm: -85, temperatureC: 23.8, valveOpen: true },
    };
    setDevices((prev) => [dev, ...prev]);
    setNewName("");
  };

  const handleSimulateIngest = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const flow = Number((Math.random() * 14).toFixed(1));
        return {
          ...d,
          lastSeenIso: new Date().toISOString(),
          metrics: { ...d.metrics, flowRateLpm: flow },
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-surface p-3 text-xs">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-accent" />
          <span>
            <strong>MQTT Broker:</strong>{" "}
            {brokerConfigured ? "Configured via MQTT_BROKER_URL" : "Not configured — using simulated ingest stream"}
          </span>
        </div>
        <Badge variant={brokerConfigured ? "live" : "demo"}>
          {brokerConfigured ? "Live Broker" : "Demo Ingest"}
        </Badge>
      </div>

      {/* Register Device */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="size-4 text-accent" />
            Device Registry & Live Telemetry Ingest
          </CardTitle>
          <CardDescription>Register field devices, inspect MQTT topics, and evaluate alert thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleRegister} className="flex flex-wrap gap-2">
            <Input
              placeholder="Device name (e.g. Borewell Pump #03)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <select
              aria-label="Device protocol"
              value={newProtocol}
              onChange={(e) => setNewProtocol(e.target.value as TelemetryDeviceRecord["protocol"])}
              className="h-9 rounded-md border bg-surface-raised px-3 text-xs text-foreground"
            >
              <option value="NB-IoT">NB-IoT</option>
              <option value="LTE Cat 1">LTE Cat 1</option>
              <option value="LoRaWAN IN865">LoRaWAN IN865</option>
              <option value="MQTT / Wi-Fi">MQTT / Wi-Fi</option>
            </select>
            <Button type="submit" size="sm" className="h-9">
              <Plus className="size-3.5" /> Register Device
            </Button>
          </form>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((dev) => {
              const alerts = evaluateDeviceAlerts(dev, DEFAULT_ALERT_RULES);
              return (
                <div key={dev.id} className="rounded-lg border bg-surface-raised/30 p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-foreground">{dev.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">EUI: {dev.deviceEui}</div>
                    </div>
                    <Badge variant={alerts.length > 0 ? "danger" : "live"}>
                      {alerts.length > 0 ? `${alerts.length} Alert` : "Healthy"}
                    </Badge>
                  </div>

                  <div className="rounded bg-background/60 p-2 font-mono text-[10px] text-accent">
                    {dev.mqttTopic}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    <div>Flow: <strong>{dev.metrics.flowRateLpm} L/min</strong></div>
                    <div>Batt: <strong>{dev.metrics.batteryV} V</strong></div>
                    <div>RSSI: <strong>{dev.metrics.rssiDbm} dBm</strong></div>
                    <div>Temp: <strong>{dev.metrics.temperatureC} °C</strong></div>
                  </div>

                  {alerts.map((a) => (
                    <div key={a.rule.id} className="flex items-center gap-1.5 rounded border border-warning/40 bg-warning/10 p-1.5 text-[10px] text-warning">
                      <AlertTriangle className="size-3 shrink-0" />
                      <span>{a.rule.name} ({a.actualValue})</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleSimulateIngest(dev.id)}>
                      <RefreshCw className="size-3" /> Ingest Packet
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDevices((prev) => prev.filter((d) => d.id !== dev.id))}
                      className="text-muted-foreground hover:text-danger"
                      aria-label={`Remove ${dev.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cloud Broker Patterns */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="size-4 text-accent" />
            Cloud IoT & Broker Integration Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          {CLOUD_PATTERNS.map((pat) => (
            <div key={pat.provider} className="rounded-md border bg-surface-raised/30 p-3 space-y-1.5 text-xs">
              <div className="font-semibold text-foreground">{pat.provider}</div>
              <div className="rounded bg-background/70 p-1.5 font-mono text-[10px] text-accent">{pat.topicPattern}</div>
              <div className="text-[11px] text-muted-foreground"><strong>Auth:</strong> {pat.auth}</div>
              <p className="text-[11px] text-muted-foreground">{pat.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

