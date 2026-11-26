import { describe, expect, it } from "vitest";
import { estimatePrototypeCost, runHardwareResearch, validateHardwareDesign } from "@/lib/advanced/engines";
import { AZ_COMPONENTS, AZ_LETTERS, getAzComponentBySlug, getAzCountsByLetter } from "@/lib/components/az-catalog";
import { AZ_CATEGORIES } from "@/lib/components/az-types";

describe("A-Z Electronic Components Library", () => {
  it("covers all 26 letters from A to Z", () => {
    expect(AZ_LETTERS).toHaveLength(26);
    const counts = getAzCountsByLetter();
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) {
      expect(counts[letter]).toBeGreaterThan(0);
    }
  });

  it("covers all 14 required engineering categories", () => {
    const present = new Set(AZ_COMPONENTS.map((c) => c.category));
    for (const cat of AZ_CATEGORIES) {
      expect(present.has(cat)).toBe(true);
    }
  });

  it("has unique slugs and honest image metadata on every component", () => {
    const slugs = new Set<string>();
    for (const c of AZ_COMPONENTS) {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
      expect(getAzComponentBySlug(c.slug)?.name).toBe(c.name);
      expect(c.images.length).toBeGreaterThanOrEqual(4);
      const mfg = c.images.find((img) => img.role === "manufacturer");
      expect(mfg?.available).toBe(false);
    }
  });
});

describe("Advanced Engineering Engines", () => {
  it("detects voltage mismatches, I2C collisions, and overcurrent in Hardware Validation Engine", () => {
    const report = validateHardwareDesign({
      projectName: "Test Board",
      supplyVoltageV: 12,
      mcuLogicVoltageV: 3.3,
      regulatorMaxCurrentMa: 200,
      ambientTempC: 30,
      components: [
        { name: "MCU", voltageV: 3.3, currentMa: 150, interfaceType: "Power" },
        { name: "Sensor A", voltageV: 5.0, currentMa: 80, interfaceType: "I2C", i2cAddress: "0x76" },
        { name: "Sensor B", voltageV: 3.3, currentMa: 20, interfaceType: "I2C", i2cAddress: "0x76" },
      ],
    });

    expect(report.overallStatus).toBe("fail");
    expect(report.totalCurrentMa).toBe(250);
    expect(report.checks.find((c) => c.id === "power-budget")?.status).toBe("fail");
    expect(report.checks.find((c) => c.id === "logic-levels")?.status).toBe("fail");
    expect(report.checks.find((c) => c.id === "i2c-collision")?.status).toBe("fail");
  });

  it("computes prototype cost tiers and BOM totals", () => {
    const estimate = estimatePrototypeCost({
      projectName: "Sensor Node",
      items: [
        { name: "ESP32", unitCostUsd: 3.5, qty: 1 },
        { name: "Sensor", unitCostUsd: 2.0, qty: 2 },
      ],
      pcbAreaCm2: 25,
      pcbLayers: 2,
      prototypeQty: 10,
      enclosureCostUsd: 4,
      shippingAndNreUsd: 20,
    });

    expect(estimate.bomPerUnitUsd).toBe(7.5);
    expect(estimate.tiers).toHaveLength(4);
    expect(estimate.tiers[3]!.perUnitUsd).toBeLessThan(estimate.tiers[0]!.perUnitUsd);
  });

  it("returns grounded hardware research recommendations from the A-Z catalog", () => {
    const report = runHardwareResearch("ESP32 LoRaWAN solar battery monitor");
    expect(report.mode).toBe("grounded-engine");
    expect(report.recommendedComponents.length).toBeGreaterThan(0);
  });
});

