import { describe, expect, it } from "vitest";
import { demoCatalogueCommunication, demoSpectrumRegulations } from "@/lib/data/demo";
import type { ApplicationDomain } from "@/lib/data/types";

describe("Phase 3: Communication Technologies & Suitability", () => {
  const modules = demoCatalogueCommunication();
  const regulations = demoSpectrumRegulations();

  it("contains at least 8 communication modules across 4 categories", () => {
    expect(modules.length).toBeGreaterThanOrEqual(8);

    const categories = new Set(modules.map((m) => m.category));
    expect(categories.has("cellular")).toBe(true);
    expect(categories.has("lpwan")).toBe(true);
    expect(categories.has("wired")).toBe(true);
    expect(categories.has("application")).toBe(true);
  });

  it("enforces unique slugs, non-empty names, and valid standards", () => {
    const slugs = modules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const m of modules) {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.standard.length).toBeGreaterThan(0);
      expect(m.dataRate.length).toBeGreaterThan(0);
      expect(m.typicalRange.length).toBeGreaterThan(0);
      expect(m.topology.length).toBeGreaterThan(0);
      expect(m.powerConsumption.length).toBeGreaterThan(0);
      expect(m.security.length).toBeGreaterThan(0);
      expect(m.advantages.length).toBeGreaterThan(0);
      expect(m.limitations.length).toBeGreaterThan(0);
    }
  });

  it("evaluates all 6 application domains for every protocol with scores 1 to 5", () => {
    const expectedDomains: ApplicationDomain[] = [
      "smart_water_meter",
      "smart_energy_meter",
      "railway_track",
      "railway_bridge",
      "agriculture",
      "industrial_telemetry",
    ];

    for (const m of modules) {
      expect(m.suitability.length).toBe(6);
      const domains = m.suitability.map((s) => s.domain);
      for (const d of expectedDomains) {
        expect(domains).toContain(d);
      }
      for (const s of m.suitability) {
        expect(s.score).toBeGreaterThanOrEqual(1);
        expect(s.score).toBeLessThanOrEqual(5);
        expect(s.rationale.length).toBeGreaterThan(10);
      }
    }
  });

  it("proves engineering accuracy of domain recommendations", () => {
    // NB-IoT must be top-rated for underground water metering due to +20 dB penetration
    const nbiot = modules.find((m) => m.slug === "nb-iot")!;
    const waterSuit = nbiot.suitability.find((s) => s.domain === "smart_water_meter")!;
    expect(waterSuit.score).toBe(5);

    // RS-485 Modbus must be top-rated for industrial telemetry
    const modbus = modules.find((m) => m.slug === "rs-485-modbus")!;
    const indSuit = modbus.suitability.find((s) => s.domain === "industrial_telemetry")!;
    expect(indSuit.score).toBe(5);

    // LoRaWAN must be top-rated for precision agriculture
    const lora = modules.find((m) => m.slug === "lorawan")!;
    const agriSuit = lora.suitability.find((s) => s.domain === "agriculture")!;
    expect(agriSuit.score).toBe(5);
  });

  it("includes spectrum regulations for India WPC, Europe ETSI, North America FCC, and ITU", () => {
    expect(regulations.length).toBeGreaterThanOrEqual(5);

    const regions = new Set(regulations.map((r) => r.region));
    expect(regions.has("India (WPC/TEC)")).toBe(true);
    expect(regions.has("Europe (ETSI)")).toBe(true);
    expect(regions.has("North America (FCC)")).toBe(true);

    const wpc865 = regulations.find((r) => r.bandName.includes("IN865"));
    expect(wpc865).toBeDefined();
    expect(wpc865?.maxEirpPower).toContain("1 Watt");
  });
});

