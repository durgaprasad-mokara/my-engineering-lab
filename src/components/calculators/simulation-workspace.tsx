"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Cpu, FlaskConical, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  simulateDutyCyclePower,
  simulateRcTransient,
  simulateRlTransient,
  simulateVibrationFft,
} from "@/lib/engineering/simulations";

type SimKind = "rc" | "rl" | "duty" | "fft";

export function SimulationWorkspace() {
  const [kind, setKind] = React.useState<SimKind>("rc");

  // RC
  const [rcR, setRcR] = React.useState(10000);
  const [rcC, setRcC] = React.useState(10);
  const [rcV, setRcV] = React.useState(5);
  const [rcMode, setRcMode] = React.useState<"charge" | "discharge">("charge");

  // RL
  const [rlR, setRlR] = React.useState(100);
  const [rlL, setRlL] = React.useState(50);
  const [rlV, setRlV] = React.useState(12);

  // Duty cycle
  const [sleepUa, setSleepUa] = React.useState(15);
  const [activeMa, setActiveMa] = React.useState(45);
  const [txMa, setTxMa] = React.useState(220);
  const [activeSec, setActiveSec] = React.useState(5);
  const [txSec, setTxSec] = React.useState(10);
  const [periodSec, setPeriodSec] = React.useState(900);

  // FFT
  const [fundHz, setFundHz] = React.useState(40);
  const [h2Amp, setH2Amp] = React.useState(0.45);
  const [h3Amp, setH3Amp] = React.useState(0.2);

  const rcSim = React.useMemo(
    () => simulateRcTransient({ resistanceOhm: rcR, capacitanceUf: rcC, supplyVoltageV: rcV, mode: rcMode }),
    [rcR, rcC, rcV, rcMode],
  );
  const rlSim = React.useMemo(
    () => simulateRlTransient({ resistanceOhm: rlR, inductanceMh: rlL, supplyVoltageV: rlV }),
    [rlR, rlL, rlV],
  );
  const dutySim = React.useMemo(
    () =>
      simulateDutyCyclePower({
        sleepUa,
        activeMa,
        txMa,
        activeSec,
        txSec,
        periodSec,
        supplyV: 3.6,
      }),
    [sleepUa, activeMa, txMa, activeSec, txSec, periodSec],
  );
  const fftSim = React.useMemo(
    () => simulateVibrationFft({ fundamentalHz: fundHz, harmonic2Amp: h2Amp, harmonic3Amp: h3Amp }),
    [fundHz, h2Amp, h3Amp],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3">
        {[
          { id: "rc" as const, label: "RC Transient Response", icon: Zap },
          { id: "rl" as const, label: "RL Inductor Step", icon: Cpu },
          { id: "duty" as const, label: "IoT Duty-Cycle Power", icon: Activity },
          { id: "fft" as const, label: "Vibration Signal FFT", icon: FlaskConical },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                kind === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="text-base">
              {kind === "rc" && "RC Charging / Discharging Transient"}
              {kind === "rl" && "RL Inductive Current Rise"}
              {kind === "duty" && "IoT Node Duty-Cycle Power Profile (3.6V Li-SOCl2)"}
              {kind === "fft" && "Machinery / Bridge Vibration Time & FFT Spectrum"}
            </CardTitle>
            <CardDescription>
              Interactive analytical simulation — adjust circuit or signal parameters to inspect response curves.
            </CardDescription>
          </div>
          <Badge variant="illustrative">Simulated</Badge>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          {kind === "rc" && (
            <>
              <div className="grid gap-3 sm:grid-cols-4 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Resistance R (Ω)</label>
                  <Input type="number" value={rcR} onChange={(e) => setRcR(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Capacitance C (µF)</label>
                  <Input type="number" value={rcC} onChange={(e) => setRcC(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Supply Voltage (V)</label>
                  <Input type="number" value={rcV} onChange={(e) => setRcV(Number(e.target.value))} />
                </div>
                <div className="flex items-end gap-2">
                  {(["charge", "discharge"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRcMode(m)}
                      className={`h-9 flex-1 rounded-md border text-xs capitalize ${
                        rcMode === m ? "border-accent bg-accent/15 text-accent" : "bg-surface-raised text-muted-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 font-mono text-xs">
                <span>Time constant τ = <strong className="text-accent">{rcSim.tauMs} ms</strong></span>
                <span>5τ Settling = <strong className="text-accent">{rcSim.settling5TauMs} ms</strong></span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rcSim.points}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="timeMs" stroke="#94a3b8" fontSize={11} unit=" ms" />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" V" />
                    <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "#1e293b", fontSize: 12 }} />
                    <Line type="monotone" dataKey="capacitorVoltageV" name="Vc (V)" stroke="#13d3f2" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {kind === "rl" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Resistance R (Ω)</label>
                  <Input type="number" value={rlR} onChange={(e) => setRlR(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Inductance L (mH)</label>
                  <Input type="number" value={rlL} onChange={(e) => setRlL(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Step Voltage (V)</label>
                  <Input type="number" value={rlV} onChange={(e) => setRlV(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-4 font-mono text-xs">
                <span>Time constant τ = L/R = <strong className="text-accent">{rlSim.tauMs} ms</strong></span>
                <span>Steady-state I∞ = <strong className="text-accent">{rlSim.steadyStateMa} mA</strong></span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rlSim.points}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="timeMs" stroke="#94a3b8" fontSize={11} unit=" ms" />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" mA" />
                    <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "#1e293b", fontSize: 12 }} />
                    <Line type="monotone" dataKey="currentMa" name="I_L (mA)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {kind === "duty" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Sleep (µA)</label>
                  <Input type="number" value={sleepUa} onChange={(e) => setSleepUa(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Sample (mA)</label>
                  <Input type="number" value={activeMa} onChange={(e) => setActiveMa(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">RF TX (mA)</label>
                  <Input type="number" value={txMa} onChange={(e) => setTxMa(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Sample (s)</label>
                  <Input type="number" value={activeSec} onChange={(e) => setActiveSec(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">TX (s)</label>
                  <Input type="number" value={txSec} onChange={(e) => setTxSec(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">Period (s)</label>
                  <Input type="number" value={periodSec} onChange={(e) => setPeriodSec(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 font-mono text-xs">
                <span>Avg Current: <strong className="text-accent">{dutySim.averageCurrentMa} mA</strong></span>
                <span>Avg Power: <strong className="text-accent">{dutySim.averagePowerMw} mW</strong></span>
                <span>Daily Energy: <strong className="text-success">{dutySim.dailyEnergyMwh} mWh/day</strong></span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dutySim.points}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="phase" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" mA" />
                    <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "#1e293b", fontSize: 12 }} />
                    <Line type="stepAfter" dataKey="currentMa" name="Current (mA)" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {kind === "fft" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <label className="mb-1 block text-muted-foreground">Fundamental Freq (Hz)</label>
                  <Input type="number" value={fundHz} onChange={(e) => setFundHz(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">2nd Harmonic Amp (g)</label>
                  <Input type="number" step="0.05" value={h2Amp} onChange={(e) => setH2Amp(Number(e.target.value))} />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground">3rd Harmonic Amp (g)</label>
                  <Input type="number" step="0.05" value={h3Amp} onChange={(e) => setH3Amp(Number(e.target.value))} />
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fftSim.spectrum}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="freqHz" stroke="#94a3b8" fontSize={11} unit=" Hz" />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" g" />
                    <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "#1e293b", fontSize: 12 }} />
                    <Line type="monotone" dataKey="magnitudeG" name="Magnitude (g)" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

