import { describe, expect, it } from "vitest";
import {
  demoCatalogueAntennas,
  demoCatalogueCommunication,
  demoCatalogueComponents,
  demoCatalogueMcus,
  demoCatalogueSensors,
} from "@/lib/data/demo";
import {
  catalogueToSearchItems,
  searchCatalogue,
  searchGlobal,
} from "@/lib/knowledge/search";
import { NAV_ITEMS } from "@/lib/navigation";

describe("global & catalogue search", () => {
  const catalogueItems = catalogueToSearchItems({
    components: demoCatalogueComponents(),
    sensors: demoCatalogueSensors(),
    mcus: demoCatalogueMcus(),
    communication: demoCatalogueCommunication(),
    antennas: demoCatalogueAntennas(),
  });

  it("indexes components, sensors, microcontrollers, communication and antennas with valid detail hrefs", () => {
    expect(catalogueItems.length).toBeGreaterThanOrEqual(35);
    expect(catalogueItems.some((i) => i.href === "/components/ti-lm358" && i.kind === "component")).toBe(true);
    expect(catalogueItems.some((i) => i.href === "/sensors/dht22" && i.kind === "sensor")).toBe(true);
    expect(
      catalogueItems.some((i) => i.href === "/microcontrollers/esp32-wroom-32" && i.kind === "microcontroller"),
    ).toBe(true);
    expect(
      catalogueItems.some((i) => i.href === "/communication/lorawan" && i.kind === "communication"),
    ).toBe(true);
    expect(
      catalogueItems.some((i) => i.href === "/antennas/taoglas-fxp73" && i.kind === "antenna"),
    ).toBe(true);
  });

  it("matches catalogue entries by part number, measurand, interface, wireless protocol or antenna connector", () => {
    expect(searchCatalogue("IRLZ44N", catalogueItems).map((i) => i.slug)).toEqual(["infineon-irlz44n"]);
    expect(searchCatalogue("humidity", catalogueItems).map((i) => i.slug)).toContain("dht22");
    expect(searchCatalogue("zigbee", catalogueItems).map((i) => i.slug)).toContain("nrf52840");
    expect(searchCatalogue("lorawan", catalogueItems).map((i) => i.slug)).toContain("lorawan");
    expect(searchCatalogue("fxp73", catalogueItems).map((i) => i.slug)).toContain("taoglas-fxp73");
  });

  it("returns navigation sections only when query is empty", () => {
    const emptyResults = searchGlobal("", catalogueItems);
    expect(emptyResults).toHaveLength(NAV_ITEMS.length);
    expect(emptyResults.every((r) => r.kind === "section")).toBe(true);
  });

  it("merges navigation sections and catalogue records for non-empty queries", () => {
    const espResults = searchGlobal("esp32", catalogueItems);
    expect(espResults.map((r) => r.href)).toContain("/microcontrollers");
    expect(espResults.map((r) => r.href)).toContain("/microcontrollers/esp32-wroom-32");

    const opampResults = searchGlobal("lm358", catalogueItems);
    expect(opampResults.map((r) => r.href)).toContain("/components/ti-lm358");

    const sensorResults = searchGlobal("dht22", catalogueItems);
    expect(sensorResults.map((r) => r.href)).toContain("/sensors");
    expect(sensorResults.map((r) => r.href)).toContain("/sensors/dht22");

    const loraResults = searchGlobal("lorawan", catalogueItems);
    expect(loraResults.map((r) => r.href)).toContain("/communication");
    expect(loraResults.map((r) => r.href)).toContain("/communication/lorawan");

    const antResults = searchGlobal("fxp73", catalogueItems);
    expect(antResults.map((r) => r.href)).toContain("/antennas/taoglas-fxp73");

    expect(searchGlobal("no-such-engineering-part-999", catalogueItems)).toEqual([]);
  });
});
