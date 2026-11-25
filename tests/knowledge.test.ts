import { describe, expect, it } from "vitest";
import {
  demoCatalogueComponents,
  demoCatalogueMcus,
  demoCatalogueSensors,
} from "@/lib/data/demo";
import {
  buildSensorComparisonMatrix,
  filterComponents,
  filterMcus,
  filterSensors,
  formatCompareParam,
  formatSpecRange,
  getComponentCategories,
  getSensorGroups,
  MAX_COMPARE_SENSORS,
  parseCompareSlugs,
  toggleCompareSlug,
} from "@/lib/knowledge/filters";

describe("demo knowledge base provenance & minimums", () => {
  it("provides >= 8 components with non-verified demo provenance and real source URLs", () => {
    const components = demoCatalogueComponents();
    expect(components.length).toBeGreaterThanOrEqual(8);
    expect(new Set(components.map((c) => c.slug)).size).toBe(components.length);
    expect(getComponentCategories(components).length).toBeGreaterThanOrEqual(5);

    for (const c of components) {
      expect(c.verificationStatus).not.toBe("verified");
      expect(c.sourceUrl).toMatch(/^https:\/\//);
      for (const rating of c.ratings ?? []) {
        expect(rating.verificationStatus).not.toBe("verified");
        expect(rating.source).toMatch(/^https:\/\//);
      }
    }
  });

  it("provides >= 6 sensors with non-verified demo provenance and real source URLs", () => {
    const sensors = demoCatalogueSensors();
    expect(sensors.length).toBeGreaterThanOrEqual(6);
    expect(new Set(sensors.map((s) => s.slug)).size).toBe(sensors.length);
    expect(getSensorGroups(sensors).length).toBeGreaterThanOrEqual(4);

    for (const s of sensors) {
      expect(s.verificationStatus).not.toBe("verified");
      expect(s.sourceUrl).toMatch(/^https:\/\//);
      expect(s.specs.length).toBeGreaterThanOrEqual(3);
      for (const sp of s.specs) {
        expect(sp.verificationStatus).not.toBe("verified");
        expect(sp.source).toMatch(/^https:\/\//);
      }
    }
  });

  it("provides >= 5 microcontrollers with non-verified demo provenance and real source URLs", () => {
    const mcus = demoCatalogueMcus();
    expect(mcus.length).toBeGreaterThanOrEqual(5);
    expect(new Set(mcus.map((m) => m.slug)).size).toBe(mcus.length);

    for (const m of mcus) {
      expect(m.verificationStatus).not.toBe("verified");
      expect(m.sourceUrl).toMatch(/^https:\/\//);
      if (m.power) {
        expect(m.power.verificationStatus).not.toBe("verified");
        expect(m.power.source).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("component filtering", () => {
  const items = demoCatalogueComponents();

  it("matches by part number, manufacturer and package", () => {
    expect(filterComponents(items, { query: "IRLZ44N" }).map((c) => c.slug)).toEqual(["infineon-irlz44n"]);
    expect(filterComponents(items, { query: "Texas Instruments" }).map((c) => c.slug)).toContain("ti-lm358");
    expect(filterComponents(items, { query: "0805" }).map((c) => c.slug)).toContain("yageo-rc0805-thick-film-resistor");
  });

  it("filters by categorySlug and verificationStatus", () => {
    expect(filterComponents(items, { categorySlug: "mosfets" }).map((c) => c.slug)).toEqual(["infineon-irlz44n"]);
    const estimated = filterComponents(items, { status: "estimated" });
    expect(estimated.length).toBeGreaterThan(0);
    expect(estimated.every((c) => c.verificationStatus === "estimated")).toBe(true);
  });
});

describe("sensor filtering & 5-way comparison", () => {
  const sensors = demoCatalogueSensors();
  const validSlugs = new Set(sensors.map((s) => s.slug));

  it("filters by sensorGroup and outputType", () => {
    const env = filterSensors(sensors, { group: "environmental" });
    expect(env.map((s) => s.slug)).toEqual(expect.arrayContaining(["dht22", "bmp280"]));
    expect(filterSensors(sensors, { outputType: "pulse" }).map((s) => s.slug)).toContain("hc-sr04");
  });

  it("parses and limits compare slugs to MAX_COMPARE_SENSORS (5)", () => {
    const parsed = parseCompareSlugs(
      "HC-SR04, dht22, dht22, unknown-sensor, bmp280, mpu-6050, acs712, yf-s201",
      validSlugs,
    );
    expect(parsed).toEqual(["hc-sr04", "dht22", "bmp280", "mpu-6050", "acs712"]);
    expect(parsed).toHaveLength(MAX_COMPARE_SENSORS);
    expect(parseCompareSlugs(undefined, validSlugs)).toEqual([]);
  });

  it("toggles slugs up to the 5-sensor limit and removes existing ones", () => {
    let selected: string[] = [];
    for (const s of sensors.slice(0, 5)) {
      selected = toggleCompareSlug(selected, s.slug);
    }
    expect(selected).toHaveLength(5);
    const sixth = sensors[5]?.slug ?? "yf-s201";
    expect(toggleCompareSlug(selected, sixth)).toHaveLength(5);
    expect(toggleCompareSlug(selected, "dht22")).not.toContain("dht22");
    expect(formatCompareParam(["hc-sr04", "dht22"])).toBe("hc-sr04,dht22");
  });

  it("formats spec ranges cleanly", () => {
    expect(formatSpecRange({ minValue: 3.3, typValue: 5, maxValue: 5.5, unit: "V" })).toBe(
      "3.3 .. 5.5 V (typ 5 V)",
    );
    expect(formatSpecRange({ minValue: -40, typValue: null, maxValue: 80, unit: "°C" })).toBe("-40 .. 80 °C");
    expect(formatSpecRange({ minValue: null, typValue: 1.5, maxValue: null, unit: "mA" })).toBe("1.5 mA");
    expect(formatSpecRange({ minValue: 2, typValue: null, maxValue: null, unit: "cm" })).toBe("≥ 2 cm");
    expect(formatSpecRange({ minValue: null, typValue: null, maxValue: 2, unit: "s" })).toBe("≤ 2 s");
  });

  it("builds comparison matrix aligned across selected sensors", () => {
    const selected = sensors.slice(0, 5);
    const matrix = buildSensorComparisonMatrix(selected);
    expect(matrix.keys).toContain("supply_voltage");
    expect(matrix.rows.length).toBeGreaterThan(3);
    const supplyRow = matrix.rows.find((r) => r.key === "supply_voltage");
    expect(supplyRow?.values["hc-sr04"]?.unit).toBe("V");
  });
});

describe("microcontroller board selector", () => {
  const mcus = demoCatalogueMcus();

  it("filters by wireless availability and radio protocol", () => {
    const wirelessOnly = filterMcus(mcus, { wirelessRequired: "yes" });
    expect(wirelessOnly.map((m) => m.slug).sort()).toEqual(["esp32-wroom-32", "nrf52840"]);

    const wiredOnly = filterMcus(mcus, { wirelessRequired: "no" });
    expect(wiredOnly.map((m) => m.slug).sort()).toEqual([
      "arduino-uno-r3",
      "raspberry-pi-pico",
      "stm32f103c8",
    ]);

    expect(filterMcus(mcus, { wirelessProtocol: "Wi-Fi" }).map((m) => m.slug)).toEqual(["esp32-wroom-32"]);
    expect(filterMcus(mcus, { wirelessProtocol: "Thread" }).map((m) => m.slug)).toEqual(["nrf52840"]);
  });

  it("filters by Flash, RAM, GPIO, clock and vendor", () => {
    const highMem = filterMcus(mcus, { minFlashKb: 1024, minRamKb: 256, minGpio: 26 });
    expect(highMem.map((m) => m.slug)).toEqual(
      expect.arrayContaining(["esp32-wroom-32", "raspberry-pi-pico", "nrf52840"]),
    );
    expect(highMem.map((m) => m.slug)).not.toContain("arduino-uno-r3");

    const highGpio = filterMcus(mcus, { minFlashKb: 1024, minRamKb: 256, minGpio: 30 });
    expect(highGpio.map((m) => m.slug)).toEqual(["esp32-wroom-32", "nrf52840"]);

    expect(filterMcus(mcus, { vendor: "Espressif Systems" }).map((m) => m.slug)).toEqual(["esp32-wroom-32"]);
    expect(filterMcus(mcus, { minClockMhz: 200 }).map((m) => m.slug)).toEqual(["esp32-wroom-32"]);
  });
});
