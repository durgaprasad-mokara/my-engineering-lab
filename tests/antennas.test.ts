import { describe, expect, it } from "vitest";
import { demoCatalogueAntennas } from "@/lib/data/demo";

describe("Phase 3: Antennas Library & 2D Radiation Patterns", () => {
  const antennas = demoCatalogueAntennas();

  it("contains at least 8 antennas covering diverse mechanical & RF types", () => {
    expect(antennas.length).toBeGreaterThanOrEqual(8);

    const types = new Set(antennas.map((a) => a.antennaType));
    expect(types.has("fpc")).toBe(true);
    expect(types.has("dipole")).toBe(true);
    expect(types.has("ceramic")).toBe(true);
    expect(types.has("patch")).toBe(true);
    expect(types.has("yagi")).toBe(true);
    expect(types.has("pcb")).toBe(true);
    expect(types.has("helical")).toBe(true);
  });

  it("validates realistic RF parameters (frequency, impedance, VSWR)", () => {
    for (const a of antennas) {
      expect(a.freqMaxMhz).toBeGreaterThan(a.freqMinMhz);
      expect(a.impedanceOhm).toBe(50);
      expect(a.vswrMax).toBeGreaterThanOrEqual(1.0);
      expect(a.vswrMax).toBeLessThanOrEqual(3.0);
      expect(a.peakGainDbi).toBeGreaterThanOrEqual(-5.0);
      expect(a.peakGainDbi).toBeLessThanOrEqual(20.0);
      expect(a.connector.length).toBeGreaterThan(0);
      expect(a.groundPlane.length).toBeGreaterThan(0);
      expect(a.designConsiderations.length).toBeGreaterThan(0);
      expect(a.services.length).toBeGreaterThan(0);
    }
  });

  it("provides 360-degree radiation pattern points with valid E-plane and H-plane dBi values", () => {
    for (const a of antennas) {
      expect(a.patternData.length).toBe(72); // 360 / 5 degrees = 72 points
      expect(a.patternData[0]?.angle).toBe(0);
      expect(a.patternData[71]?.angle).toBe(355);

      for (const pt of a.patternData) {
        expect(pt.angle).toBeGreaterThanOrEqual(0);
        expect(pt.angle).toBeLessThan(360);
        expect(pt.ePlaneDbi).toBeGreaterThanOrEqual(-30);
        expect(pt.ePlaneDbi).toBeLessThanOrEqual(a.peakGainDbi + 1.0);
        expect(pt.hPlaneDbi).toBeGreaterThanOrEqual(-30);
        expect(pt.hPlaneDbi).toBeLessThanOrEqual(a.peakGainDbi + 1.0);
      }
    }
  });

  it("differentiates omnidirectional vs directional patterns correctly", () => {
    const yagi = antennas.find((a) => a.slug === "yagi-868-12dbi")!;
    expect(yagi.radiationPatternType).toBe("directional");
    expect(yagi.peakGainDbi).toBe(12.0);

    // In a directional Yagi, front gain at 0 deg must exceed back gain at 180 deg by at least 10 dB
    const front = yagi.patternData.find((p) => p.angle === 0)!;
    const back = yagi.patternData.find((p) => p.angle === 180)!;
    expect(front.hPlaneDbi - back.hPlaneDbi).toBeGreaterThanOrEqual(10.0);

    const dipole = antennas.find((a) => a.slug === "linx-ant-868-hwr")!;
    expect(dipole.radiationPatternType).toBe("omnidirectional");
    // In an omnidirectional dipole, H-plane (azimuth) gain is essentially constant across angles
    const hGains = dipole.patternData.map((p) => p.hPlaneDbi);
    const maxH = Math.max(...hGains);
    const minH = Math.min(...hGains);
    expect(maxH - minH).toBeLessThanOrEqual(1.5);
  });
});

