export interface RcTransientPoint {
  timeMs: number;
  capacitorVoltageV: number;
  currentMa: number;
}

export interface RcTransientResult {
  tauMs: number;
  settling5TauMs: number;
  points: RcTransientPoint[];
}

export function simulateRcTransient({
  resistanceOhm,
  capacitanceUf,
  supplyVoltageV,
  mode,
}: {
  resistanceOhm: number;
  capacitanceUf: number;
  supplyVoltageV: number;
  mode: "charge" | "discharge";
}): RcTransientResult {
  const r = Math.max(1, resistanceOhm);
  const cFarads = Math.max(1e-9, capacitanceUf * 1e-6);
  const tauSec = r * cFarads;
  const tauMs = tauSec * 1000;
  const totalMs = tauMs * 5;
  const points: RcTransientPoint[] = [];

  for (let i = 0; i <= 50; i++) {
    const tMs = (i / 50) * totalMs;
    const tSec = tMs / 1000;
    const exp = Math.exp(-tSec / tauSec);
    const vCap = mode === "charge" ? supplyVoltageV * (1 - exp) : supplyVoltageV * exp;
    const iMa = ((mode === "charge" ? supplyVoltageV - vCap : -vCap) / r) * 1000;
    points.push({
      timeMs: Number(tMs.toFixed(3)),
      capacitorVoltageV: Number(vCap.toFixed(4)),
      currentMa: Number(iMa.toFixed(3)),
    });
  }

  return {
    tauMs: Number(tauMs.toFixed(3)),
    settling5TauMs: Number(totalMs.toFixed(3)),
    points,
  };
}

export interface RlTransientPoint {
  timeMs: number;
  currentMa: number;
  inductorVoltageV: number;
}

export interface RlTransientResult {
  tauMs: number;
  steadyStateMa: number;
  points: RlTransientPoint[];
}

export function simulateRlTransient({
  resistanceOhm,
  inductanceMh,
  supplyVoltageV,
}: {
  resistanceOhm: number;
  inductanceMh: number;
  supplyVoltageV: number;
}): RlTransientResult {
  const r = Math.max(0.1, resistanceOhm);
  const lHenries = Math.max(1e-6, inductanceMh * 1e-3);
  const tauSec = lHenries / r;
  const tauMs = tauSec * 1000;
  const totalMs = tauMs * 5;
  const steadyStateMa = (supplyVoltageV / r) * 1000;
  const points: RlTransientPoint[] = [];

  for (let i = 0; i <= 50; i++) {
    const tMs = (i / 50) * totalMs;
    const tSec = tMs / 1000;
    const exp = Math.exp(-tSec / tauSec);
    const iMa = steadyStateMa * (1 - exp);
    const vInd = supplyVoltageV * exp;
    points.push({
      timeMs: Number(tMs.toFixed(4)),
      currentMa: Number(iMa.toFixed(3)),
      inductorVoltageV: Number(vInd.toFixed(4)),
    });
  }

  return {
    tauMs: Number(tauMs.toFixed(4)),
    steadyStateMa: Number(steadyStateMa.toFixed(2)),
    points,
  };
}

export interface DutyCyclePoint {
  phase: string;
  timeSec: number;
  powerMw: number;
  currentMa: number;
}

export interface DutyCycleResult {
  averageCurrentMa: number;
  averagePowerMw: number;
  dailyEnergyMwh: number;
  points: DutyCyclePoint[];
}

export function simulateDutyCyclePower({
  sleepUa,
  activeMa,
  txMa,
  activeSec,
  txSec,
  periodSec,
  supplyV,
}: {
  sleepUa: number;
  activeMa: number;
  txMa: number;
  activeSec: number;
  txSec: number;
  periodSec: number;
  supplyV: number;
}): DutyCycleResult {
  const period = Math.max(1, periodSec);
  const aSec = Math.max(0, Math.min(period, activeSec));
  const tSec = Math.max(0, Math.min(period - aSec, txSec));
  const sleepSec = Math.max(0, period - aSec - tSec);
  const sleepMa = sleepUa / 1000;

  const avgMa = (sleepMa * sleepSec + activeMa * aSec + txMa * tSec) / period;
  const avgMw = avgMa * supplyV;
  const dailyEnergyMwh = avgMw * 24;

  const points: DutyCyclePoint[] = [
    { phase: "Sleep Start", timeSec: 0, currentMa: Number(sleepMa.toFixed(4)), powerMw: Number((sleepMa * supplyV).toFixed(4)) },
    { phase: "Wake / Sample", timeSec: Number((sleepSec * 0.5).toFixed(1)), currentMa: activeMa, powerMw: Number((activeMa * supplyV).toFixed(2)) },
    { phase: "RF Transmit", timeSec: Number((sleepSec * 0.5 + aSec).toFixed(1)), currentMa: txMa, powerMw: Number((txMa * supplyV).toFixed(2)) },
    { phase: "Return Sleep", timeSec: Number((sleepSec * 0.5 + aSec + tSec).toFixed(1)), currentMa: Number(sleepMa.toFixed(4)), powerMw: Number((sleepMa * supplyV).toFixed(4)) },
    { phase: "Cycle End", timeSec: period, currentMa: Number(sleepMa.toFixed(4)), powerMw: Number((sleepMa * supplyV).toFixed(4)) },
  ];

  return {
    averageCurrentMa: Number(avgMa.toFixed(4)),
    averagePowerMw: Number(avgMw.toFixed(3)),
    dailyEnergyMwh: Number(dailyEnergyMwh.toFixed(2)),
    points,
  };
}

export interface FftBin {
  freqHz: number;
  magnitudeG: number;
}

export interface VibrationTimePoint {
  timeMs: number;
  accelG: number;
}

export function simulateVibrationFft({
  fundamentalHz,
  harmonic2Amp,
  harmonic3Amp,
  sampleRateHz = 512,
}: {
  fundamentalHz: number;
  harmonic2Amp: number;
  harmonic3Amp: number;
  sampleRateHz?: number;
}): { timeDomain: VibrationTimePoint[]; spectrum: FftBin[] } {
  const N = 128;
  const samples: number[] = [];
  const timeDomain: VibrationTimePoint[] = [];

  for (let n = 0; n < N; n++) {
    const t = n / sampleRateHz;
    const val =
      1.0 * Math.sin(2 * Math.PI * fundamentalHz * t) +
      harmonic2Amp * Math.sin(2 * Math.PI * (2 * fundamentalHz) * t) +
      harmonic3Amp * Math.sin(2 * Math.PI * (3 * fundamentalHz) * t);
    samples.push(val);
    timeDomain.push({
      timeMs: Number((t * 1000).toFixed(2)),
      accelG: Number(val.toFixed(3)),
    });
  }

  // Real DFT for first N/2 bins
  const spectrum: FftBin[] = [];
  for (let k = 0; k < N / 2; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += samples[n]! * Math.cos(angle);
      im -= samples[n]! * Math.sin(angle);
    }
    const mag = (2 / N) * Math.sqrt(re * re + im * im);
    spectrum.push({
      freqHz: Number(((k * sampleRateHz) / N).toFixed(1)),
      magnitudeG: Number(mag.toFixed(3)),
    });
  }

  return { timeDomain, spectrum };
}

