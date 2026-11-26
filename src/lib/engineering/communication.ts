import { type CalcResult, type CalcStep, fmt } from "./types";

export interface LinkBudgetInputs {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  txCableLossDb: number;
  frequencyMhz: number;
  distanceKm: number;
  rxAntennaGainDbi: number;
  rxCableLossDb: number;
  rxSensitivityDbm: number;
  fadeMarginDb: number;
}

export interface LinkBudgetOutputs {
  wavelengthM: number;
  quarterWaveCm: number;
  eirpDbm: number;
  fsplDb: number;
  rxPowerDbm: number;
  linkMarginDb: number;
  netMarginDb: number;
  viable: boolean;
}

export const LINK_BUDGET_FORMULAS = [
  "FSPL (dB) = 32.44 + 20·log10(f_MHz) + 20·log10(d_km)",
  "EIRP (dBm) = P_tx + G_tx − L_tx",
  "P_rx (dBm) = EIRP − FSPL + G_rx − L_rx",
  "Net Margin (dB) = (P_rx − Sensitivity) − Fade Margin",
];

const isFiniteNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function solveLinkBudget(inputs: LinkBudgetInputs): CalcResult<LinkBudgetOutputs> {
  const vals = Object.values(inputs);
  if (!vals.every(isFiniteNum)) {
    return { ok: false, error: "All link budget inputs must be finite numbers." };
  }
  if (inputs.frequencyMhz <= 0) return { ok: false, error: "Frequency must be greater than 0 MHz." };
  if (inputs.distanceKm <= 0) return { ok: false, error: "Distance must be greater than 0 km." };
  if (inputs.txCableLossDb < 0 || inputs.rxCableLossDb < 0) {
    return { ok: false, error: "Cable/connector losses cannot be negative." };
  }
  if (inputs.fadeMarginDb < 0) return { ok: false, error: "Fade margin cannot be negative." };

  const wavelengthM = 299.792458 / inputs.frequencyMhz;
  const quarterWaveCm = (wavelengthM / 4) * 100;
  const eirpDbm = inputs.txPowerDbm + inputs.txAntennaGainDbi - inputs.txCableLossDb;
  const fsplDb = 32.44 + 20 * Math.log10(inputs.frequencyMhz) + 20 * Math.log10(inputs.distanceKm);
  const rxPowerDbm = eirpDbm - fsplDb + inputs.rxAntennaGainDbi - inputs.rxCableLossDb;
  const linkMarginDb = rxPowerDbm - inputs.rxSensitivityDbm;
  const netMarginDb = linkMarginDb - inputs.fadeMarginDb;
  const viable = netMarginDb >= 0;

  const steps: CalcStep[] = [
    {
      label: "Wavelength (λ)",
      expression: `λ = c / f = 299.792 / ${fmt(inputs.frequencyMhz)} MHz`,
      result: `${fmt(wavelengthM)} m (λ/4 = ${fmt(quarterWaveCm)} cm)`,
    },
    {
      label: "EIRP",
      expression: `${fmt(inputs.txPowerDbm)} + ${fmt(inputs.txAntennaGainDbi)} − ${fmt(inputs.txCableLossDb)}`,
      result: `${fmt(eirpDbm)} dBm`,
    },
    {
      label: "Free-Space Path Loss",
      expression: `32.44 + 20·log10(${fmt(inputs.frequencyMhz)}) + 20·log10(${fmt(inputs.distanceKm)})`,
      result: `${fmt(fsplDb)} dB`,
    },
    {
      label: "Received Power (P_rx)",
      expression: `${fmt(eirpDbm)} − ${fmt(fsplDb)} + ${fmt(inputs.rxAntennaGainDbi)} − ${fmt(inputs.rxCableLossDb)}`,
      result: `${fmt(rxPowerDbm)} dBm`,
    },
    {
      label: "Net Link Margin",
      expression: `(${fmt(rxPowerDbm)} − (${fmt(inputs.rxSensitivityDbm)})) − ${fmt(inputs.fadeMarginDb)}`,
      result: `${fmt(netMarginDb)} dB (${viable ? "VIABLE" : "INSUFFICIENT"})`,
    },
  ];

  return {
    ok: true,
    value: {
      wavelengthM,
      quarterWaveCm,
      eirpDbm,
      fsplDb,
      rxPowerDbm,
      linkMarginDb,
      netMarginDb,
      viable,
    },
    steps,
    assumptions: [
      "Line-of-sight free-space propagation without terrain or building obstructions",
      "50 Ω impedance-matched antennas aligned in polarization",
      "Fade margin accounts for multipath, rain, or foliage variations",
    ],
    limitations: [
      "Does not model Fresnel zone clearance or urban NLOS shadowing (add 15–30 dB loss for urban/indoor)",
      "Verify EIRP does not exceed regional regulatory limits (e.g., 30 dBm for India WPC IN865, 14 dBm for EU868)",
    ],
  };
}

