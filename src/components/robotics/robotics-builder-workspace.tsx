"use client";

import * as React from "react";
import { Bot, Cog, Copy, Download, ExternalLink, Info, Terminal } from "lucide-react";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { solveMotorTorque } from "@/lib/engineering/mechanical";
import { fmt } from "@/lib/engineering/types";
import {
  ROBOTICS_PARTS,
  ROBOT_ARCHITECTURES,
  ROS2_TEMPLATES,
  type RoboticsPart,
} from "@/lib/robotics/catalogue";

export function RoboticsBuilderWorkspace() {
  const [tab, setTab] = React.useState<"hardware" | "sizing" | "architectures">("hardware");
  const [partFilter, setPartFilter] = React.useState<"all" | RoboticsPart["kind"]>("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Motor sizing
  const [massKg, setMassKg] = React.useState(6);
  const [wheelMm, setWheelMm] = React.useState(50);
  const [inclineDeg, setInclineDeg] = React.useState(12);
  const [rpm, setRpm] = React.useState(150);

  const torqueResult = solveMotorTorque({
    robotMassKg: massKg,
    wheelRadiusMm: wheelMm,
    inclineDeg,
    accelMs2: 0.5,
    drivenWheels: 2,
    gearEfficiency: 0.75,
    wheelRpm: rpm,
  });

  const filteredParts =
    partFilter === "all" ? ROBOTICS_PARTS : ROBOTICS_PARTS.filter((p) => p.kind === partFilter);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3">
        {[
          { id: "hardware" as const, label: "Motors, Drivers, Encoders & IMUs", icon: Cog },
          { id: "sizing" as const, label: "Motor Sizing Calculator", icon: Bot },
          { id: "architectures" as const, label: "Robot Architectures & ROS 2 Templates", icon: Terminal },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "hardware" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "motor", "driver", "encoder", "imu", "lidar"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPartFilter(k)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                  partFilter === k
                    ? "bg-primary text-primary-foreground"
                    : "border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredParts.map((part) => (
              <Card key={part.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="uppercase text-[10px]">{part.kind}</Badge>
                    <ProvenanceBadge status={part.verificationStatus} />
                  </div>
                  <CardTitle className="pt-1 text-base">{part.name}</CardTitle>
                  <CardDescription>{part.useCase}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="rounded bg-surface-raised/50 p-2.5 font-mono text-[11px]">{part.specs}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="block text-muted-foreground">Supply</span>
                      <span className="font-mono text-foreground">{part.voltage}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground">Interface</span>
                      <span className="font-mono text-foreground">{part.interface}</span>
                    </div>
                  </div>
                  <a
                    href={part.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Manufacturer reference <ExternalLink className="size-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "sizing" && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">2WD Mobile Robot Motor Sizing</CardTitle>
            <CardDescription>
              Computes per-wheel torque, linear velocity, and mechanical shaft power with 1.5× thermal margin guidance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-xs">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-muted-foreground">Robot Mass (kg)</label>
                <Input type="number" value={massKg} onChange={(e) => setMassKg(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-muted-foreground">Wheel Radius (mm)</label>
                <Input type="number" value={wheelMm} onChange={(e) => setWheelMm(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-muted-foreground">Max Incline (°)</label>
                <Input type="number" value={inclineDeg} onChange={(e) => setInclineDeg(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-muted-foreground">Wheel Speed (RPM)</label>
                <Input type="number" value={rpm} onChange={(e) => setRpm(Number(e.target.value))} />
              </div>
            </div>

            {torqueResult.ok ? (
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-md border border-accent/40 bg-accent/10 p-3">
                  <span className="block text-muted-foreground">Required Torque / Wheel</span>
                  <span className="font-mono text-base font-bold text-accent">
                    {fmt(torqueResult.value.torquePerWheelNm)} N·m
                  </span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-3">
                  <span className="block text-muted-foreground">Recommended Rated (×1.5)</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {fmt(torqueResult.value.torquePerWheelNm * 1.5)} N·m
                  </span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-3">
                  <span className="block text-muted-foreground">Linear Velocity</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {fmt(torqueResult.value.linearVelocityMs)} m/s
                  </span>
                </div>
                <div className="rounded-md border bg-surface-raised/40 p-3">
                  <span className="block text-muted-foreground">Shaft Power</span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {fmt(torqueResult.value.motorPowerW)} W
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded border border-danger/30 bg-danger/10 p-3 text-danger">{torqueResult.error}</div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "architectures" && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {ROBOT_ARCHITECTURES.map((arch) => (
              <Card key={arch.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{arch.name}</CardTitle>
                  <CardDescription>{arch.kinematics}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div><strong className="text-accent">Compute:</strong> <span className="text-muted-foreground">{arch.compute}</span></div>
                  <div><strong className="text-accent">Actuation:</strong> <span className="text-muted-foreground">{arch.actuation}</span></div>
                  <div><strong className="text-accent">Sensing:</strong> <span className="text-muted-foreground">{arch.sensing}</span></div>
                  <div><strong className="text-accent">Power:</strong> <span className="text-muted-foreground">{arch.power}</span></div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {arch.rosPackages.map((pkg) => (
                      <Badge key={pkg} variant="outline" className="font-mono text-[10px]">{pkg}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
            <Info className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>
              <strong>ROS 2 Runtime Note:</strong> Export and run these templates on your local ROS 2 Humble/Jazzy workspace (<code>colcon build</code>). Browser execution is not simulated without a local ROS 2 daemon.
            </span>
          </div>

          <div className="space-y-4">
            {ROS2_TEMPLATES.map((tpl) => (
              <Card key={tpl.id}>
                <CardHeader className="border-b pb-3">
                  <div>
                    <CardTitle className="text-sm">{tpl.title}</CardTitle>
                    <CardDescription>{tpl.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCopy(tpl.id, tpl.code)}>
                      <Copy className="size-3.5" /> {copiedId === tpl.id ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDownload(tpl.filename, tpl.code)}>
                      <Download className="size-3.5" /> {tpl.filename}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="max-h-64 overflow-auto bg-[#060a14] p-4 font-mono text-[11px] text-slate-200">
                    {tpl.code}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

