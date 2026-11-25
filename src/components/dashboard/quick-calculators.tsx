"use client";

import * as React from "react";
import { Calculator } from "lucide-react";
import { solveOhm, OHM_FORMULAS } from "@/lib/engineering/ohms-law";
import { batteryRuntime, BATTERY_FORMULAS } from "@/lib/engineering/battery";
import type { CalcResult } from "@/lib/engineering/types";
import { fmt } from "@/lib/engineering/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

function Steps<T>({ result, formulas }: { result: CalcResult<T>; formulas: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {formulas.map((f) => (
          <code key={f} className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-accent">{f}</code>
        ))}
      </div>
      {!result.ok ? (
        <p className="text-xs text-warning">{result.error}</p>
      ) : (
        <>
          <ol className="space-y-1">
            {result.steps.map((s) => (
              <li key={s.label} className="flex flex-col gap-0.5 rounded border bg-background/50 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">{s.expression}</span>
                <span className="font-mono text-xs font-semibold text-foreground">{s.result}</span>
              </li>
            ))}
          </ol>
          <details className="text-[11px] text-muted-foreground">
            <summary className="cursor-pointer select-none text-foreground/80">Assumptions &amp; limitations</summary>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {[...result.assumptions, ...result.limitations].map((a) => <li key={a}>{a}</li>)}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

function Field({ id, label, unit, value, onChange }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[11px]">{label}</Label>
      <div className="relative">
        <Input id={id} inputMode="decimal" type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 pr-10 font-mono text-xs" />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function OhmCalc() {
  const [v, setV] = React.useState("3.3");
  const [i, setI] = React.useState("");
  const [r, setR] = React.useState("220");
  const result = solveOhm({ voltage: num(v), current: num(i), resistance: num(r) });
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Fill exactly two fields; leave the unknown empty.</p>
      <div className="grid grid-cols-3 gap-2">
        <Field id="ohm-v" label="Voltage V" unit="V" value={v} onChange={setV} />
        <Field id="ohm-i" label="Current I" unit="A" value={i} onChange={setI} />
        <Field id="ohm-r" label="Resistance R" unit="Ω" value={r} onChange={setR} />
      </div>
      <Steps result={result} formulas={OHM_FORMULAS} />
    </div>
  );
}

function BatteryCalc() {
  const [s, set] = React.useState({ cap: "2600", act: "120", actS: "20", sleep: "15", period: "900", k: "0.8" });
  const u = (k: keyof typeof s) => (val: string) => set((p) => ({ ...p, [k]: val }));
  const result = batteryRuntime({
    capacityMah: Number(s.cap),
    activeCurrentMa: Number(s.act),
    activeSeconds: Number(s.actS),
    sleepCurrentUa: Number(s.sleep),
    periodSeconds: Number(s.period),
    usableFraction: Number(s.k),
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field id="b-cap" label="Capacity" unit="mAh" value={s.cap} onChange={u("cap")} />
        <Field id="b-act" label="Active current" unit="mA" value={s.act} onChange={u("act")} />
        <Field id="b-acts" label="Active time" unit="s" value={s.actS} onChange={u("actS")} />
        <Field id="b-sleep" label="Sleep current" unit="µA" value={s.sleep} onChange={u("sleep")} />
        <Field id="b-period" label="Report interval" unit="s" value={s.period} onChange={u("period")} />
        <Field id="b-k" label="Usable fraction" unit="k" value={s.k} onChange={u("k")} />
      </div>
      {result.ok && (
        <div className="rounded-md border border-accent/30 bg-accent/5 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Estimated runtime</div>
          <div className="font-mono text-lg font-semibold text-accent">{fmt(result.value.runtimeDays, 3)} days</div>
        </div>
      )}
      <Steps result={result} formulas={BATTERY_FORMULAS} />
    </div>
  );
}

const TABS = [
  { id: "ohm", label: "Ohm's law" },
  { id: "battery", label: "Battery runtime" },
] as const;

export function QuickCalculators() {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["id"]>("battery");
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Calculator className="size-4 text-accent" /> Quick calculators</CardTitle>
          <CardDescription>Working calculators with formulas and steps. The full lab arrives in Phase 6.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div role="tablist" className="inline-flex rounded-md border bg-background p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("rounded px-3 py-1 text-xs", tab === t.id ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "ohm" ? <OhmCalc /> : <BatteryCalc />}
      </CardContent>
    </Card>
  );
}
