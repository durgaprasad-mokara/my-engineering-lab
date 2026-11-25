import { type CalcResult, fmt } from "./types";

export interface BatteryInputs {
  capacityMah: number; // rated capacity
  activeCurrentMa: number; // current while awake / transmitting
  activeSeconds: number; // awake time per cycle
  sleepCurrentUa: number; // current while asleep
  periodSeconds: number; // full cycle length (e.g. 900 s for a 15-minute report interval)
  usableFraction: number; // 0–1, derating for temperature, ageing, cut-off voltage, self-discharge
}

export interface BatteryOutputs {
  dutyCycle: number; // 0–1
  averageCurrentMa: number;
  usableCapacityMah: number;
  runtimeHours: number;
  runtimeDays: number;
}

export const BATTERY_FORMULAS = [
  "D = t_active / T",
  "I_avg = (I_active × t_active + I_sleep × (T − t_active)) / T",
  "C_usable = C_rated × k",
  "t_runtime = C_usable / I_avg",
];

export function batteryRuntime(i: BatteryInputs): CalcResult<BatteryOutputs> {
  const fields = Object.entries(i) as [keyof BatteryInputs, number][];
  for (const [k, v] of fields) {
    if (!Number.isFinite(v)) return { ok: false, error: `Enter a value for ${k}.` };
    if (v < 0) return { ok: false, error: `${k} cannot be negative.` };
  }
  if (i.capacityMah <= 0) return { ok: false, error: "Battery capacity must be greater than 0 mAh." };
  if (i.periodSeconds <= 0) return { ok: false, error: "Cycle period must be greater than 0 s." };
  if (i.activeSeconds > i.periodSeconds) return { ok: false, error: "Active time cannot exceed the cycle period." };
  if (i.usableFraction <= 0 || i.usableFraction > 1) return { ok: false, error: "Usable fraction must be between 0 and 1." };

  const sleepMa = i.sleepCurrentUa / 1000;
  const sleepSeconds = i.periodSeconds - i.activeSeconds;
  const duty = i.activeSeconds / i.periodSeconds;
  const avg = (i.activeCurrentMa * i.activeSeconds + sleepMa * sleepSeconds) / i.periodSeconds;
  if (avg <= 0) return { ok: false, error: "Average current is zero — enter a non-zero active or sleep current." };
  const usable = i.capacityMah * i.usableFraction;
  const hours = usable / avg;

  return {
    ok: true,
    value: { dutyCycle: duty, averageCurrentMa: avg, usableCapacityMah: usable, runtimeHours: hours, runtimeDays: hours / 24 },
    steps: [
      { label: "Duty cycle", expression: `D = ${fmt(i.activeSeconds)} s / ${fmt(i.periodSeconds)} s`, result: `${fmt(duty * 100)} %` },
      {
        label: "Average current",
        expression: `I_avg = (${fmt(i.activeCurrentMa)} mA × ${fmt(i.activeSeconds)} s + ${fmt(sleepMa)} mA × ${fmt(sleepSeconds)} s) / ${fmt(i.periodSeconds)} s`,
        result: `${fmt(avg)} mA`,
      },
      { label: "Usable capacity", expression: `C_usable = ${fmt(i.capacityMah)} mAh × ${fmt(i.usableFraction)}`, result: `${fmt(usable)} mAh` },
      { label: "Runtime", expression: `t = ${fmt(usable)} mAh / ${fmt(avg)} mA`, result: `${fmt(hours)} h ≈ ${fmt(hours / 24)} days` },
    ],
    assumptions: [
      "Currents are measured at the battery terminals (regulator losses included)",
      "Active and sleep currents are constant averages over their intervals",
      "Usable fraction covers temperature, ageing, cut-off voltage and self-discharge",
    ],
    limitations: [
      "Cellular modems draw short peaks (often amps) — the battery must deliver peak current, not just average",
      "Primary cells (e.g. Li-SOCl₂) can need a buffer capacitor for pulse loads",
      "Real capacity depends on discharge rate and temperature — confirm with the cell datasheet",
      "Retries during poor coverage can raise average current substantially",
    ],
  };
}
