import { type CalcResult, type CalcStep, fmt } from "./types";

export interface OhmInputs {
  voltage?: number; // V
  current?: number; // A
  resistance?: number; // Ω
}

export interface OhmOutputs {
  voltage: number;
  current: number;
  resistance: number;
  power: number; // W
}

export const OHM_FORMULAS = ["V = I × R", "I = V / R", "R = V / I", "P = V × I"];

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Solve Ohm's law from exactly two of V, I, R. */
export function solveOhm(inputs: OhmInputs): CalcResult<OhmOutputs> {
  const { voltage: V, current: I, resistance: R } = inputs;
  const given = [V, I, R].filter(isNum).length;
  if (given !== 2) return { ok: false, error: "Enter exactly two of voltage, current and resistance." };
  if (isNum(R) && R <= 0) return { ok: false, error: "Resistance must be greater than 0 Ω." };

  const steps: CalcStep[] = [];
  let v: number, i: number, r: number;

  if (!isNum(V)) {
    i = I!; r = R!; v = i * r;
    steps.push({ label: "Voltage", expression: `V = I × R = ${fmt(i)} A × ${fmt(r)} Ω`, result: `${fmt(v)} V` });
  } else if (!isNum(I)) {
    v = V; r = R!; i = v / r;
    steps.push({ label: "Current", expression: `I = V / R = ${fmt(v)} V / ${fmt(r)} Ω`, result: `${fmt(i)} A` });
  } else {
    v = V; i = I;
    if (i === 0) return { ok: false, error: "Current must be non-zero to compute resistance." };
    r = v / i;
    if (r <= 0) return { ok: false, error: "Voltage and current must have the same sign for a passive resistance." };
    steps.push({ label: "Resistance", expression: `R = V / I = ${fmt(v)} V / ${fmt(i)} A`, result: `${fmt(r)} Ω` });
  }

  const p = v * i;
  steps.push({ label: "Power", expression: `P = V × I = ${fmt(v)} V × ${fmt(i)} A`, result: `${fmt(p)} W` });

  return {
    ok: true,
    value: { voltage: v, current: i, resistance: r, power: p },
    steps,
    assumptions: ["Ideal linear (ohmic) resistor", "DC or RMS quantities", "Steady state"],
    limitations: [
      "Resistance changes with temperature (check the resistor's TCR)",
      "Choose a resistor power rating with margin — typically ≥ 2× the dissipated power",
      "Not valid for non-linear parts such as diodes, LEDs or thermistors",
    ],
  };
}
