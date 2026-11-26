import { describe, expect, it } from "vitest";
import { solveLinkBudget } from "@/lib/engineering/communication";
import { solvePipeFlow } from "@/lib/engineering/fluid";
import { solveMotorTorque } from "@/lib/engineering/mechanical";
import {
  simulateDutyCyclePower,
  simulateRcTransient,
  simulateRlTransient,
  simulateVibrationFft,
} from "@/lib/engineering/simulations";

describe("Phase 6: Engineering Calculators & Simulations", () => {
  it("computes RF link budget and FSPL accurately", () => {
    // At 865.5 MHz and 5 km: FSPL = 32.44 + 20*log10(865.5) + 20*log10(5) = 32.44 + 58.745 + 13.979 = 105.16 dB
    const r = solveLinkBudget({
      txPowerDbm: 14,
      txAntennaGainDbi: 2.1,
      txCableLossDb: 0.5,
      frequencyMhz: 865.5,
      distanceKm: 5,
      rxAntennaGainDbi: 3.0,
      rxCableLossDb: 1.0,
      rxSensitivityDbm: -130,
      fadeMarginDb: 10,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.eirpDbm).toBeCloseTo(15.6, 2);
    expect(r.value.fsplDb).toBeCloseTo(105.16, 1);
    expect(r.value.viable).toBe(true);
    expect(r.steps.length).toBeGreaterThanOrEqual(4);
    expect(r.assumptions.length).toBeGreaterThan(0);
    expect(r.limitations.length).toBeGreaterThan(0);
  });

  it("rejects invalid RF link budget inputs", () => {
    expect(
      solveLinkBudget({
        txPowerDbm: 14,
        txAntennaGainDbi: 0,
        txCableLossDb: 0,
        frequencyMhz: 0,
        distanceKm: 1,
        rxAntennaGainDbi: 0,
        rxCableLossDb: 0,
        rxSensitivityDbm: -120,
        fadeMarginDb: 10,
      }).ok,
    ).toBe(false);
  });

  it("computes pipe flow velocity, Reynolds number, and sensor pulse frequency", () => {
    const r = solvePipeFlow({
      pipeDiameterMm: 20,
      flowRateLpm: 12,
      kFactorPulsesPerLitre: 450,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // 12 L/min = 0.2 L/s -> 0.2 * 450 = 90 Hz
    expect(r.value.pulseFrequencyHz).toBeCloseTo(90, 4);
    expect(r.value.flowM3PerHour).toBeCloseTo(0.72, 4);
    expect(r.value.regime).toBe("Turbulent");
  });

  it("computes robot motor torque and shaft power", () => {
    const r = solveMotorTorque({
      robotMassKg: 10,
      wheelRadiusMm: 50,
      inclineDeg: 0,
      accelMs2: 1.0,
      drivenWheels: 2,
      gearEfficiency: 1.0,
      wheelRpm: 60,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // v = (2*pi*60/60)*0.05 = 0.31416 m/s
    expect(r.value.linearVelocityMs).toBeCloseTo(Math.PI * 0.1, 3);
    expect(r.value.torquePerWheelNm).toBeGreaterThan(0);
  });

  it("simulates RC and RL transient responses over 5 time constants", () => {
    const rc = simulateRcTransient({
      resistanceOhm: 1000,
      capacitanceUf: 10,
      supplyVoltageV: 5,
      mode: "charge",
    });
    expect(rc.tauMs).toBeCloseTo(10, 3);
    expect(rc.settling5TauMs).toBeCloseTo(50, 3);
    expect(rc.points).toHaveLength(51);
    expect(rc.points[0]!.capacitorVoltageV).toBe(0);
    // At 5*tau, Vc ≈ 5 * (1 - e^-5) = 4.9663 V
    expect(rc.points[50]!.capacitorVoltageV).toBeCloseTo(4.9663, 2);

    const rl = simulateRlTransient({
      resistanceOhm: 100,
      inductanceMh: 100,
      supplyVoltageV: 10,
    });
    expect(rl.tauMs).toBeCloseTo(1, 3);
    expect(rl.steadyStateMa).toBeCloseTo(100, 2);
  });

  it("simulates duty-cycle power and daily energy consumption", () => {
    const duty = simulateDutyCyclePower({
      sleepUa: 10,
      activeMa: 50,
      txMa: 200,
      activeSec: 10,
      txSec: 5,
      periodSec: 1000,
      supplyV: 3.6,
    });
    // avgMa = (0.01*985 + 50*10 + 200*5) / 1000 = 1509.85 / 1000 = 1.50985 mA
    expect(duty.averageCurrentMa).toBeCloseTo(1.5099, 3);
    expect(duty.dailyEnergyMwh).toBeGreaterThan(0);
  });

  it("computes vibration FFT peak at the fundamental frequency", () => {
    const { timeDomain, spectrum } = simulateVibrationFft({
      fundamentalHz: 32,
      harmonic2Amp: 0.4,
      harmonic3Amp: 0.2,
      sampleRateHz: 512,
    });
    expect(timeDomain).toHaveLength(128);
    expect(spectrum).toHaveLength(64);
    const bin32 = spectrum.find((b) => Math.abs(b.freqHz - 32) < 0.1);
    expect(bin32).toBeDefined();
    expect(bin32!.magnitudeG).toBeCloseTo(1.0, 1);
  });
});

