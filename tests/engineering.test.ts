import { describe, expect, it } from "vitest";
import { solveOhm } from "@/lib/engineering/ohms-law";
import { batteryRuntime } from "@/lib/engineering/battery";

describe("Ohm's law", () => {
  it("computes current and power from V and R", () => {
    const r = solveOhm({ voltage: 5, resistance: 250 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.current).toBeCloseTo(0.02, 10);
    expect(r.value.power).toBeCloseTo(0.1, 10);
  });

  it("computes voltage from I and R, and resistance from V and I", () => {
    const a = solveOhm({ current: 0.01, resistance: 330 });
    expect(a.ok && a.value.voltage).toBeCloseTo(3.3, 10);
    const b = solveOhm({ voltage: 12, current: 2 });
    expect(b.ok && b.value.resistance).toBeCloseTo(6, 10);
  });

  it("rejects wrong input counts and invalid values", () => {
    expect(solveOhm({ voltage: 1 }).ok).toBe(false);
    expect(solveOhm({ voltage: 1, current: 1, resistance: 1 }).ok).toBe(false);
    expect(solveOhm({ voltage: 1, resistance: 0 }).ok).toBe(false);
    expect(solveOhm({ voltage: 1, current: 0 }).ok).toBe(false);
    expect(solveOhm({ voltage: -1, current: 1 }).ok).toBe(false);
  });
});

describe("battery runtime", () => {
  const base = {
    capacityMah: 2600,
    activeCurrentMa: 120,
    activeSeconds: 20,
    sleepCurrentUa: 15,
    periodSeconds: 900,
    usableFraction: 0.8,
  };

  it("matches a hand calculation", () => {
    // I_avg = (120*20 + 0.015*880)/900 = (2400 + 13.2)/900 = 2.681333 mA
    // runtime = 2080 / 2.681333 = 775.733 h = 32.322 days
    const r = batteryRuntime(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.averageCurrentMa).toBeCloseTo(2.681333, 5);
    expect(r.value.usableCapacityMah).toBe(2080);
    expect(r.value.runtimeHours).toBeCloseTo(775.7335, 3);
    expect(r.value.runtimeDays).toBeCloseTo(32.3221, 3);
    expect(r.value.dutyCycle).toBeCloseTo(20 / 900, 10);
  });

  it("is pure sleep when active time is zero", () => {
    const r = batteryRuntime({ ...base, activeSeconds: 0 });
    expect(r.ok && r.value.averageCurrentMa).toBeCloseTo(0.015, 10);
  });

  it("validates inputs", () => {
    expect(batteryRuntime({ ...base, activeSeconds: 1000 }).ok).toBe(false);
    expect(batteryRuntime({ ...base, usableFraction: 1.2 }).ok).toBe(false);
    expect(batteryRuntime({ ...base, capacityMah: 0 }).ok).toBe(false);
    expect(batteryRuntime({ ...base, periodSeconds: 0 }).ok).toBe(false);
    expect(batteryRuntime({ ...base, sleepCurrentUa: -1 }).ok).toBe(false);
    expect(batteryRuntime({ ...base, activeCurrentMa: Number.NaN }).ok).toBe(false);
    expect(batteryRuntime({ ...base, activeCurrentMa: 0, sleepCurrentUa: 0 }).ok).toBe(false);
  });
});
