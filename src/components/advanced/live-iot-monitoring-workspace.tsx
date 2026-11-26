"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Download, Radio, RefreshCw, Send, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SimulatedIotNode } from "@/app/api/iot-monitoring/route";

export function LiveIoTMonitoringWorkspace() {
  const [nodes, setNodes] = useState<SimulatedIotNode[]>([]);
  const [search, setSearch] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandLog, setCommandLog] = useState<string[]>([]);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/iot-monitoring", { cache: "no-store" });
      const data = (await res.json()) as { nodes?: SimulatedIotNode[]; error?: string };
      if (!res.ok || !data.nodes) {
        setError(data.error ?? "Failed to fetch device telemetry.");
      } else {
        setNodes(data.nodes);
      }
    } catch {
      setError("Network error reaching telemetry endpoint.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTelemetry();
  }, [fetchTelemetry]);

  async function sendCommand(nodeId: string, command: "ping" | "sample_now" | "ota_check") {
    try {
      const res = await fetch("/api/iot-monitoring", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nodeId, command }),
      });
      const data = (await res.json()) as { executedAt?: string; command?: string };
      if (res.ok) {
        setCommandLog((prev) => [`[${new Date().toLocaleTimeString()}] ${nodeId} -> ${data.command} (simulated ACK)`, ...prev].slice(0, 8));
      }
    } catch {}
  }

  function exportTelemetryCsv() {
    const headers = ["ID", "Name", "Protocol", "MCU", "Status", "TempC", "HumidityPct", "BusVoltageV", "RSSI", "Kind"];
    const rows = nodes.map((n) => [
      n.id,
      n.name,
      n.protocol,
      n.mcu,
      n.status,
      n.temperatureC,
      n.humidityPct,
      n.busVoltageV,
      n.rssiDbm,
      n.dataKind,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "iot-telemetry-snapshot.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = nodes.filter((n) => {
    if (protocolFilter !== "ALL" && n.protocol !== protocolFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${n.name} ${n.mcu} ${n.protocol} ${n.id}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter devices by name, MCU, or ID..."
              className="w-64"
            />
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2.5 text-xs"
            >
              <option value="ALL">All Protocols</option>
              <option value="MQTT">MQTT</option>
              <option value="LoRaWAN">LoRaWAN</option>
              <option value="HTTP/TLS">HTTP/TLS</option>
              <option value="BLE">BLE</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="illustrative">Simulated Telemetry Stream</Badge>
            <Button size="sm" variant="outline" onClick={exportTelemetryCsv}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button size="sm" disabled={loading} onClick={() => fetchTelemetry()}>
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Poll Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          {error}
        </div>
      )}

      {filtered.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-10 text-center text-xs text-muted-foreground">
            No IoT devices match your active filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((node) => (
            <Card key={node.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={node.status === "online" ? "success" : "warning"}>{node.status.toUpperCase()}</Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {node.protocol}
                  </Badge>
                </div>
                <CardTitle className="text-base">{node.name}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {node.id} · {node.mcu}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/40 p-2.5 font-mono">
                  <div>
                    <span className="text-muted-foreground">Temp:</span> {node.temperatureC} °C
                  </div>
                  <div>
                    <span className="text-muted-foreground">RH:</span> {node.humidityPct}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rail:</span> {node.busVoltageV} V
                  </div>
                  <div>
                    <span className="text-muted-foreground">RSSI:</span> {node.rssiDbm} dBm
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Wifi className="size-3" /> Battery {node.batteryPct}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Radio className="size-3" /> Simulated
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => sendCommand(node.id, "ping")}>
                    <Send className="size-3" />
                    Ping
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => sendCommand(node.id, "sample_now")}>
                    <Activity className="size-3" />
                    Sample Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Device Command Log</CardTitle>
        </CardHeader>
        <CardContent>
          {commandLog.length === 0 ? (
            <p className="text-xs text-muted-foreground">Trigger Ping or Sample Now on a node to test downlink command dispatch.</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs text-muted-foreground">
              {commandLog.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

