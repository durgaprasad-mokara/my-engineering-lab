import { type CalcResult, type CalcStep, fmt } from "./types";

export interface PipeFlowInputs {
  pipeDiameterMm: number;
  flowRateLpm: number;
  kFactorPulsesPerLitre: number;
}

export interface PipeFlowOutputs {
  areaMm2: number;
  flowM3PerHour: number;
  velocityMs: number;
  reynoldsNumber: number;
  regime: "Laminar" | "Transitional" | "Turbulent";
  pulseFrequencyHz: number;
}

export const FLUID_FORMULAS = [
  "A = π × (D / 2)²",
  "v = Q / A",
  "Re = (v × D) / ν  (water at 20°C: ν = 1.004 × 10⁻⁶ m²/s)",
  "f_pulse = (Q_LPM / 60) × K_factor",
];

export function solvePipeFlow(inputs: PipeFlowInputs): CalcResult<PipeFlowOutputs> {
  const { pipeDiameterMm, flowRateLpm, kFactorPulsesPerLitre } = inputs;
  if (![pipeDiameterMm, flowRateLpm, kFactorPulsesPerLitre].every((v) => typeof v === "number" && Number.isFinite(v))) {
    return { ok: false, error: "All fluid inputs must be finite numbers." };
  }
  if (pipeDiameterMm <= 0) return { ok: false, error: "Pipe inner diameter must be greater than 0 mm." };
  if (flowRateLpm < 0) return { ok: false, error: "Flow rate cannot be negative." };
  if (kFactorPulsesPerLitre <= 0) return { ok: false, error: "Sensor K-factor must be greater than 0 pulses/L." };

  const dMeters = pipeDiameterMm / 1000;
  const radiusM = dMeters / 2;
  const areaM2 = Math.PI * radiusM * radiusM;
  const areaMm2 = areaM2 * 1e6;

  const flowM3PerSec = flowRateLpm / 60_000;
  const flowM3PerHour = flowRateLpm * 0.06;
  const velocityMs = flowM3PerSec / areaM2;

  const nuWater20C = 1.004e-6; // m²/s
  const reynoldsNumber = (velocityMs * dMeters) / nuWater20C;
  const regime: PipeFlowOutputs["regime"] =
    reynoldsNumber < 2300 ? "Laminar" : reynoldsNumber <= 4000 ? "Transitional" : "Turbulent";

  const pulseFrequencyHz = (flowRateLpm / 60) * kFactorPulsesPerLitre;

  const steps: CalcStep[] = [
    {
      label: "Cross-sectional area",
      expression: `A = π × (${fmt(pipeDiameterMm / 2)} mm)²`,
      result: `${fmt(areaMm2)} mm²`,
    },
    {
      label: "Flow velocity",
      expression: `v = ${fmt(flowM3PerSec)} m³/s / ${fmt(areaM2)} m²`,
      result: `${fmt(velocityMs)} m/s (${fmt(flowM3PerHour)} m³/h)`,
    },
    {
      label: "Reynolds number",
      expression: `Re = (${fmt(velocityMs)} × ${fmt(dMeters)}) / 1.004e-6`,
      result: `${fmt(reynoldsNumber)} (${regime})`,
    },
    {
      label: "Sensor pulse rate",
      expression: `f = (${fmt(flowRateLpm)} / 60) × ${fmt(kFactorPulsesPerLitre)}`,
      result: `${fmt(pulseFrequencyHz)} Hz`,
    },
  ];

  return {
    ok: true,
    value: {
      areaMm2,
      flowM3PerHour,
      velocityMs,
      reynoldsNumber,
      regime,
      pulseFrequencyHz,
    },
    steps,
    assumptions: [
      "Incompressible clean water at 20°C (kinematic viscosity ν = 1.004 × 10⁻⁶ m²/s)",
      "Full pipe circular cross-section without air pockets",
      "Constant sensor K-factor across operating flow band",
    ],
    limitations: [
      "Turbine/Hall flow sensors have a minimum cut-in flow rate (~1 L/min for YF-S201) below which pulses stop",
      "Turbulent swirls near bends or valves distort meter accuracy — provide 10×D straight upstream pipe",
    ],
  };
}

