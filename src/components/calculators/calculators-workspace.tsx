"use client";

import * as React from "react";
import { BatteryCharging, Calculator, Cog, Droplets, Radio, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { batteryRuntime, BATTERY_FORMULAS } from "@/lib/engineering/battery";
import { LINK_BUDGET_FORMULAS, solveLinkBudget } from "@/lib/engineering/communication";
import { FLUID_FORMULAS, solvePipeFlow } from "@/lib/engineering/fluid";
import { MECHANICAL_FORMULAS, solveMotorTorque } from "@/lib/engineering/mechanical";
import { OHM_FORMULAS, solveOhm } from "@/lib/engineering/ohms-law";
import { fmt, type CalcResult } from "@/lib/engineering/types";

type CalcDomain = "electrical" | "battery" | "communication" | "fluid" | "mechanical";

const DOMAINS: { id: CalcDomain; label: string; icon: typeof Zap }[] = [
  { id: "electrical", label: "Electrical (Ohm's Law)", icon: Zap },
  { id: "battery", label: "Battery Runtime", icon: BatteryCharging },
  { id: "communication", label: "RF Link Budget & FSPL", icon: Radio },
  { id: "fluid", label: "Fluid & Flow Sensor", icon: Droplets },
  { id: "mechanical", label: "Mechanical & Motor Torque", icon: Cog },
];

function ResultBreakdown<T>({
  formulas,
  result,
  summaryRows,
}: {
  formulas: string[];
  result: CalcResult<T>;
  summaryRows: (v: T) => { label: string; value: string; highlight?: boolean }[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-surface-raised/40 p-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Governing Equations
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-xs text-accent">
          {formulas.map((f) => (
            <span key={f} className="rounded border border-accent/20 bg-background/70 px-2 py-1">
              {f}
            </span>
          ))}
        </div>
      </div>

      {!result.ok ? (
        <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
          {result.error}
        </div>
      ) : (
        <>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {summaryRows(result.value).map((row) => (
              <div
                key={row.label}
                className={`rounded-md border p-3 ${
                  row.highlight ? "border-accent/40 bg-accent/10" : "bg-surface-raised/40"
                }`}
              >
                <span className="block text-[11px] text-muted-foreground">{row.label}</span>
                <span className={`font-mono text-base font-bold ${row.highlight ? "text-accent" : "text-foreground"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-md border bg-surface-raised/30 p-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Step-by-Step Derivation
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {result.steps.map((s) => (
                <div key={s.label} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-1 last:border-none">
                  <span className="font-sans text-muted-foreground">{s.label}:</span>
                  <span className="text-foreground/80">{s.expression}</span>
                  <span className="font-semibold text-accent">= {s.result}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-md border bg-surface-raised/20 p-3">
              <div className="mb-1.5 font-semibold text-foreground">Assumptions</div>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {result.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
              <div className="mb-1.5 font-semibold text-warning">Engineering Limitations</div>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {result.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CalculatorsWorkspace() {
  const [domain, setDomain] = React.useState<CalcDomain>("communication");

  // Electrical
  const [ohmV, setOhmV] = React.useState("3.3");
  const [ohmI, setOhmI] = React.useState("");
  const [ohmR, setOhmR] = React.useState("330");

  // Battery
  const [capMah, setCapMah] = React.useState(4000);
  const [actMa, setActMa] = React.useState(180);
  const [actSec, setActSec] = React.useState(15);
  const [slpUa, setSlpUa] = React.useState(12);
  const [perSec, setPerSec] = React.useState(3600);
  const [usable, setUsable] = React.useState(0.85);

  // Communication Link Budget
  const [txDbm, setTxDbm] = React.useState(14);
  const [txGain, setTxGain] = React.useState(2.1);
  const [txLoss, setTxLoss] = React.useState(0.5);
  const [freqMhz, setFreqMhz] = React.useState(865.5);
  const [distKm, setDistKm] = React.useState(5);
  const [rxGain, setRxGain] = React.useState(3.0);
  const [rxLoss, setRxLoss] = React.useState(1.0);
  const [rxSens, setRxSens] = React.useState(-130);
  const [fadeDb, setFadeDb] = React.useState(10);

  // Fluid
  const [pipeD, setPipeD] = React.useState(20);
  const [flowLpm, setFlowLpm] = React.useState(12);
  const [kFactor, setKFactor] = React.useState(450);

  // Mechanical
  const [massKg, setMassKg] = React.useState(8);
  const [wheelMm, setWheelMm] = React.useState(50);
  const [inclineDeg, setInclineDeg] = React.useState(10);
  const [accel, setAccel] = React.useState(0.5);
  const [wheels, setWheels] = React.useState(2);
  const [eff, setEff] = React.useState(0.75);
  const [rpm, setRpm] = React.useState(120);

  const numOrUndef = (s: string) => (s.trim() === "" ? undefined : Number(s));

  const ohmResult = solveOhm({
    voltage: numOrUndef(ohmV),
    current: numOrUndef(ohmI),
    resistance: numOrUndef(ohmR),
  });

  const batResult = batteryRuntime({
    capacityMah: capMah,
    activeCurrentMa: actMa,
    activeSeconds: actSec,
    sleepCurrentUa: slpUa,
    periodSeconds: perSec,
    usableFraction: usable,
  });

  const rfResult = solveLinkBudget({
    txPowerDbm: txDbm,
    txAntennaGainDbi: txGain,
    txCableLossDb: txLoss,
    frequencyMhz: freqMhz,
    distanceKm: distKm,
    rxAntennaGainDbi: rxGain,
    rxCableLossDb: rxLoss,
    rxSensitivityDbm: rxSens,
    fadeMarginDb: fadeDb,
  });

  const fluidResult = solvePipeFlow({
    pipeDiameterMm: pipeD,
    flowRateLpm: flowLpm,
    kFactorPulsesPerLitre: kFactor,
  });

  const mechResult = solveMotorTorque({
    robotMassKg: massKg,
    wheelRadiusMm: wheelMm,
    inclineDeg,
    accelMs2: accel,
    drivenWheels: wheels,
    gearEfficiency: eff,
    wheelRpm: rpm,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3" role="tablist">
        {DOMAINS.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={domain === d.id}
              onClick={() => setDomain(d.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                domain === d.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {d.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="size-4 text-accent" />
              {DOMAINS.find((d) => d.id === domain)?.label}
            </CardTitle>
            <CardDescription>
              Deterministic engineering calculation with explicit units, derivation steps, assumptions, and limitations.
            </CardDescription>
          </div>
          <Badge variant="live">Pure Formula Engine</Badge>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          {domain === "electrical" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Voltage V (leave blank to solve)</label>
                  <Input type="number" step="any" value={ohmV} onChange={(e) => setOhmV(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Current I in Amps (leave blank to solve)</label>
                  <Input type="number" step="any" value={ohmI} onChange={(e) => setOhmI(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Resistance R in Ω (leave blank to solve)</label>
                  <Input type="number" step="any" value={ohmR} onChange={(e) => setOhmR(e.target.value)} />
                </div>
              </div>
              <ResultBreakdown
                formulas={OHM_FORMULAS}
                result={ohmResult}
                summaryRows={(v) => [
                  { label: "Voltage", value: `${fmt(v.voltage)} V` },
                  { label: "Current", value: `${fmt(v.current * 1000)} mA`, highlight: true },
                  { label: "Resistance", value: `${fmt(v.resistance)} Ω` },
                  { label: "Power Dissipated", value: `${fmt(v.power)} W` },
                ]}
              />
            </>
          )}

          {domain === "battery" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Capacity (mAh)</label>
                  <Input type="number" value={capMah} onChange={(e) => setCapMah(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Active (mA)</label>
                  <Input type="number" value={actMa} onChange={(e) => setActMa(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Active Time (s)</label>
                  <Input type="number" value={actSec} onChange={(e) => setActSec(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Sleep (µA)</label>
                  <Input type="number" value={slpUa} onChange={(e) => setSlpUa(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Period (s)</label>
                  <Input type="number" value={perSec} onChange={(e) => setPerSec(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Usable Fraction</label>
                  <Input type="number" step="0.05" value={usable} onChange={(e) => setUsable(Number(e.target.value))} />
                </div>
              </div>
              <ResultBreakdown
                formulas={BATTERY_FORMULAS}
                result={batResult}
                summaryRows={(v) => [
                  { label: "Avg Current", value: `${fmt(v.averageCurrentMa)} mA` },
                  { label: "Duty Cycle", value: `${fmt(v.dutyCycle * 100)} %` },
                  { label: "Runtime (Hours)", value: `${fmt(v.runtimeHours)} h` },
                  { label: "Runtime (Days)", value: `${fmt(v.runtimeDays)} days`, highlight: true },
                ]}
              />
            </>
          )}

          {domain === "communication" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">TX Power (dBm)</label>
                  <Input type="number" value={txDbm} onChange={(e) => setTxDbm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">TX Gain (dBi)</label>
                  <Input type="number" step="0.1" value={txGain} onChange={(e) => setTxGain(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Frequency (MHz)</label>
                  <Input type="number" step="0.5" value={freqMhz} onChange={(e) => setFreqMhz(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Distance (km)</label>
                  <Input type="number" step="0.5" value={distKm} onChange={(e) => setDistKm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">RX Sensitivity (dBm)</label>
                  <Input type="number" value={rxSens} onChange={(e) => setRxSens(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">TX Loss (dB)</label>
                  <Input type="number" step="0.1" value={txLoss} onChange={(e) => setTxLoss(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">RX Gain (dBi)</label>
                  <Input type="number" step="0.1" value={rxGain} onChange={(e) => setRxGain(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">RX Loss (dB)</label>
                  <Input type="number" step="0.1" value={rxLoss} onChange={(e) => setRxLoss(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Fade Margin (dB)</label>
                  <Input type="number" value={fadeDb} onChange={(e) => setFadeDb(Number(e.target.value))} />
                </div>
              </div>
              <ResultBreakdown
                formulas={LINK_BUDGET_FORMULAS}
                result={rfResult}
                summaryRows={(v) => [
                  { label: "EIRP", value: `${fmt(v.eirpDbm)} dBm` },
                  { label: "Path Loss (FSPL)", value: `${fmt(v.fsplDb)} dB` },
                  { label: "Received Power", value: `${fmt(v.rxPowerDbm)} dBm` },
                  { label: "Net Margin", value: `${fmt(v.netMarginDb)} dB (${v.viable ? "OK" : "FAIL"})`, highlight: true },
                ]}
              />
            </>
          )}

          {domain === "fluid" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Pipe Inner Diameter (mm)</label>
                  <Input type="number" value={pipeD} onChange={(e) => setPipeD(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Volumetric Flow Rate (L/min)</label>
                  <Input type="number" value={flowLpm} onChange={(e) => setFlowLpm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Sensor K-Factor (pulses/L)</label>
                  <Input type="number" value={kFactor} onChange={(e) => setKFactor(Number(e.target.value))} />
                </div>
              </div>
              <ResultBreakdown
                formulas={FLUID_FORMULAS}
                result={fluidResult}
                summaryRows={(v) => [
                  { label: "Velocity", value: `${fmt(v.velocityMs)} m/s` },
                  { label: "Hourly Flow", value: `${fmt(v.flowM3PerHour)} m³/h` },
                  { label: "Reynolds Number", value: `${fmt(v.reynoldsNumber)} (${v.regime})` },
                  { label: "Sensor Pulse Freq", value: `${fmt(v.pulseFrequencyHz)} Hz`, highlight: true },
                ]}
              />
            </>
          )}

          {domain === "mechanical" && (
            <>
              <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Mass (kg)</label>
                  <Input type="number" value={massKg} onChange={(e) => setMassKg(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Wheel Radius (mm)</label>
                  <Input type="number" value={wheelMm} onChange={(e) => setWheelMm(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Incline (°)</label>
                  <Input type="number" value={inclineDeg} onChange={(e) => setInclineDeg(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Accel (m/s²)</label>
                  <Input type="number" step="0.1" value={accel} onChange={(e) => setAccel(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Driven Wheels</label>
                  <Input type="number" value={wheels} onChange={(e) => setWheels(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Efficiency (0–1)</label>
                  <Input type="number" step="0.05" value={eff} onChange={(e) => setEff(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Wheel RPM</label>
                  <Input type="number" value={rpm} onChange={(e) => setRpm(Number(e.target.value))} />
                </div>
              </div>
              <ResultBreakdown
                formulas={MECHANICAL_FORMULAS}
                result={mechResult}
                summaryRows={(v) => [
                  { label: "Tractive Force", value: `${fmt(v.totalForceN)} N` },
                  { label: "Torque / Wheel", value: `${fmt(v.torquePerWheelNm)} N·m`, highlight: true },
                  { label: "Linear Speed", value: `${fmt(v.linearVelocityMs)} m/s` },
                  { label: "Shaft Power", value: `${fmt(v.motorPowerW)} W` },
                ]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

