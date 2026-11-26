"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Plus, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validateHardwareDesign, type ValidationInput, type ValidationReport } from "@/lib/advanced/engines";

const INITIAL_INPUT: ValidationInput = {
  projectName: "ESP32 Telemetry Node Rev B",
  supplyVoltageV: 5.0,
  mcuLogicVoltageV: 3.3,
  regulatorMaxCurrentMa: 800,
  ambientTempC: 35,
  components: [
    { name: "ESP32-WROOM-32", voltageV: 3.3, currentMa: 260, interfaceType: "Power" },
    { name: "BME280 Environmental Sensor", voltageV: 3.3, currentMa: 3.6, interfaceType: "I2C", i2cAddress: "0x76" },
    { name: "OLED SSD1306 128x64", voltageV: 3.3, currentMa: 22, interfaceType: "I2C", i2cAddress: "0x3C" },
    { name: "HC-SR04 Ultrasonic", voltageV: 5.0, currentMa: 15, interfaceType: "GPIO", fiveVTolerant: false },
  ],
};

export function HardwareValidationWorkspace() {
  const [input, setInput] = useState<ValidationInput>(INITIAL_INPUT);
  const [report, setReport] = useState<ValidationReport>(() => validateHardwareDesign(INITIAL_INPUT));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runValidation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hardware-validation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as ValidationReport & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Validation failed.");
      } else {
        setReport(data);
      }
    } catch {
      setError("Network error contacting validation engine.");
    } finally {
      setLoading(false);
    }
  }

  function addComponent() {
    setInput((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        { name: "New Peripheral", voltageV: 3.3, currentMa: 20, interfaceType: "I2C", i2cAddress: "0x40" },
      ],
    }));
  }

  function removeComponent(index: number) {
    setInput((prev) => ({
      ...prev,
      components: prev.components.filter((_, idx) => idx !== index),
    }));
  }

  function exportReport() {
    const blob = new Blob([JSON.stringify({ input, report }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hardware-validation-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Overall Status</div>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold uppercase">
            <Badge variant={report.overallStatus === "pass" ? "success" : report.overallStatus === "warning" ? "warning" : "danger"}>
              {report.overallStatus}
            </Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Total Load Current</div>
          <div className="mt-1 font-mono text-lg font-semibold">{report.totalCurrentMa} mA</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Regulator Utilization</div>
          <div className="mt-1 font-mono text-lg font-semibold">{report.regulatorUtilizationPct}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Est. LDO Heat</div>
          <div className="mt-1 font-mono text-lg font-semibold">{report.estimatedLdoHeatMw} mW</div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Design Rail &amp; Peripheral Configuration</CardTitle>
              <CardDescription className="text-xs">
                Checks voltage-level compatibility, regulator headroom, I2C 7-bit address collisions, and linear thermal drop.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportReport}>
                <Download className="size-3.5" />
                Export JSON
              </Button>
              <Button size="sm" disabled={loading} onClick={runValidation}>
                <ShieldCheck className="size-3.5" />
                {loading ? "Validating..." : "Run Validation"}
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
              <label className="mb-1 block text-[11px] text-muted-foreground">Project Name</label>
              <Input
                value={input.projectName}
                onChange={(e) => setInput({ ...input, projectName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Input Supply (V)</label>
              <Input
                type="number"
                step="0.1"
                value={input.supplyVoltageV}
                onChange={(e) => setInput({ ...input, supplyVoltageV: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">MCU Logic (V)</label>
              <Input
                type="number"
                step="0.1"
                value={input.mcuLogicVoltageV}
                onChange={(e) => setInput({ ...input, mcuLogicVoltageV: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Regulator Limit (mA)</label>
              <Input
                type="number"
                value={input.regulatorMaxCurrentMa}
                onChange={(e) => setInput({ ...input, regulatorMaxCurrentMa: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Ambient Temp (°C)</label>
              <Input
                type="number"
                value={input.ambientTempC}
                onChange={(e) => setInput({ ...input, ambientTempC: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Attached Devices ({input.components.length})
              </h4>
              <Button size="sm" variant="outline" onClick={addComponent}>
                <Plus className="size-3.5" />
                Add Device
              </Button>
            </div>
            {input.components.map((comp, idx) => (
              <div key={idx} className="grid items-center gap-2 rounded-md border border-border p-2 sm:grid-cols-12">
                <Input
                  className="sm:col-span-4"
                  value={comp.name}
                  onChange={(e) => {
                    const next = [...input.components];
                    next[idx] = { ...comp, name: e.target.value };
                    setInput({ ...input, components: next });
                  }}
                />
                <Input
                  type="number"
                  step="0.1"
                  className="sm:col-span-2"
                  value={comp.voltageV}
                  onChange={(e) => {
                    const next = [...input.components];
                    next[idx] = { ...comp, voltageV: Number(e.target.value) };
                    setInput({ ...input, components: next });
                  }}
                />
                <Input
                  type="number"
                  className="sm:col-span-2"
                  value={comp.currentMa}
                  onChange={(e) => {
                    const next = [...input.components];
                    next[idx] = { ...comp, currentMa: Number(e.target.value) };
                    setInput({ ...input, components: next });
                  }}
                />
                <select
                  value={comp.interfaceType}
                  onChange={(e) => {
                    const next = [...input.components];
                    next[idx] = {
                      ...comp,
                      interfaceType: e.target.value as ValidationInput["components"][number]["interfaceType"],
                    };
                    setInput({ ...input, components: next });
                  }}
                  className="h-9 rounded-md border border-border bg-background px-2 text-xs sm:col-span-2"
                >
                  {["I2C", "SPI", "UART", "Analog", "Power", "GPIO"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Input
                  className="sm:col-span-1"
                  placeholder="0x76"
                  value={comp.i2cAddress ?? ""}
                  onChange={(e) => {
                    const next = [...input.components];
                    next[idx] = { ...comp, i2cAddress: e.target.value };
                    setInput({ ...input, components: next });
                  }}
                />
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={input.components.length <= 1}
                    onClick={() => removeComponent(idx)}
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
          <CardTitle className="text-base">Validation Rule Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {report.checks.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              {c.status === "pass" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              ) : c.status === "warning" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
              )}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{c.rule}</span>
                  <Badge variant={c.status === "pass" ? "success" : c.status === "warning" ? "warning" : "danger"}>
                    {c.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-foreground">{c.detail}</p>
                <p className="text-muted-foreground">Remediation: {c.remediation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

