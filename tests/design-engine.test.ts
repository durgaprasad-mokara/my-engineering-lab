import { describe, expect, it } from "vitest";
import {
  DESIGN_PRESETS,
  bomToCsv,
  calculateBomTotal,
  isPriceStale,
  rankConfigurations,
} from "@/lib/design/configurations";
import {
  DEFAULT_CIRCUIT_EDGES,
  DEFAULT_CIRCUIT_NODES,
  DEFAULT_PCB_STACKUP,
} from "@/lib/design/default-circuit";
import { runElectricalRuleChecks } from "@/lib/design/erc";
import { generateKicadNetlist, generatePlacementCsv } from "@/lib/design/netlist";
import { DESIGN_CRITERIA } from "@/lib/design/types";

describe("Phase 5: Engineering Design Engine", () => {
  it("provides 5 configurations scored across all 10 criteria and ranks by priority weights", () => {
    const preset = DESIGN_PRESETS[0]!;
    expect(preset.configs).toHaveLength(5);
    expect(DESIGN_CRITERIA).toHaveLength(10);

    for (const cfg of preset.configs) {
      for (const c of DESIGN_CRITERIA) {
        expect(cfg.scores[c.key]).toBeGreaterThanOrEqual(1);
        expect(cfg.scores[c.key]).toBeLessThanOrEqual(5);
      }
      expect(cfg.subsystems.length).toBeGreaterThanOrEqual(6);
    }

    const batteryFocused = rankConfigurations(preset.configs, { batteryLife: 3, power: 3, cost: 3 });
    expect(batteryFocused[0]!.weightedPercent).toBeGreaterThanOrEqual(batteryFocused[4]!.weightedPercent);
  });

  it("flags stale prices older than 90 days and calculates BOM totals accurately", () => {
    const now = new Date("2026-11-26T00:00:00Z");
    expect(isPriceStale("2026-11-01", now)).toBe(false);
    expect(isPriceStale("2026-06-01", now)).toBe(true);
    expect(isPriceStale(null, now)).toBe(true);

    const summary = calculateBomTotal(DESIGN_PRESETS[0]!.defaultBom);
    expect(summary.knownTotalUsd).toBeGreaterThan(0);
    expect(summary.missingPriceCount).toBe(1);
    expect(summary.stalePriceCount).toBeGreaterThanOrEqual(2);

    const csv = bomToCsv(DESIGN_PRESETS[0]!.defaultBom);
    expect(csv).toContain("ESP32-WROOM-32E");
    expect(csv).toContain("UNVERIFIED");
  });

  it("passes static ERC on default 3.3V circuit", () => {
    const issues = runElectricalRuleChecks(DEFAULT_CIRCUIT_NODES, DEFAULT_CIRCUIT_EDGES);
    expect(issues.some((i) => i.severity === "error")).toBe(false);
    expect(issues.some((i) => i.severity === "info")).toBe(true);
  });

  it("detects 5V to 3.3V voltage mismatch in ERC and clears it when level shifter is added", () => {
    const nodes = [
      ...DEFAULT_CIRCUIT_NODES,
      {
        id: "sensor-5v",
        label: "5V Ultrasonic",
        kind: "sensor" as const,
        voltageV: 5.0,
        maxInputV: 5.5,
        currentDrawMa: 15,
        busTypes: ["GPIO"],
        x: 50,
        y: 250,
        footprint: "PinHeader_1x04",
      },
    ];
    const badEdges = [
      ...DEFAULT_CIRCUIT_EDGES,
      {
        id: "bad-5v",
        fromNodeId: "sensor-5v",
        fromPin: "ECHO",
        toNodeId: "mcu-1",
        toPin: "GPIO34",
        signal: "ECHO_5V",
        protocol: "analog" as const,
        voltageV: 5.0,
        hasLevelShifter: false,
      },
    ];

    const issues = runElectricalRuleChecks(nodes, badEdges);
    expect(issues.some((i) => i.code === "ERC-VOLT" && i.severity === "error")).toBe(true);

    const fixedEdges = badEdges.map((e) => (e.id === "bad-5v" ? { ...e, hasLevelShifter: true } : e));
    const fixedIssues = runElectricalRuleChecks(nodes, fixedEdges);
    expect(fixedIssues.some((i) => i.code === "ERC-VOLT")).toBe(false);
  });

  it("detects current overload and bus protocol incompatibility in ERC", () => {
    const overloadedNodes = DEFAULT_CIRCUIT_NODES.map((n) =>
      n.id === "modem-1" ? { ...n, currentDrawMa: 1200 } : n,
    );
    const currIssues = runElectricalRuleChecks(overloadedNodes, DEFAULT_CIRCUIT_EDGES);
    expect(currIssues.some((i) => i.code === "ERC-CURR" && i.severity === "error")).toBe(true);

    const badBusEdges = [
      ...DEFAULT_CIRCUIT_EDGES,
      {
        id: "bad-i2c",
        fromNodeId: "mcu-1",
        fromPin: "GPIO21",
        toNodeId: "modem-1",
        toPin: "RXD",
        signal: "BAD_I2C",
        protocol: "i2c" as const,
        voltageV: 3.3,
      },
    ];
    const busIssues = runElectricalRuleChecks(DEFAULT_CIRCUIT_NODES, badBusEdges);
    expect(busIssues.some((i) => i.code === "ERC-PIN" && i.severity === "error")).toBe(true);
  });

  it("detects missing power source", () => {
    const noPower = DEFAULT_CIRCUIT_NODES.filter((n) => n.kind !== "power");
    const issues = runElectricalRuleChecks(noPower, DEFAULT_CIRCUIT_EDGES);
    expect(issues.some((i) => i.code === "ERC-PWR" && i.severity === "error")).toBe(true);
  });

  it("exports valid KiCad S-expression netlist and placement CSV", () => {
    const net = generateKicadNetlist("Test_Board", DEFAULT_CIRCUIT_NODES, DEFAULT_CIRCUIT_EDGES);
    expect(net).toContain('(export (version "E")');
    expect(net).toContain('(comp (ref "U1")');
    expect(net).toContain('(net (code "1") (name "+3V3_MAIN")');

    const csv = generatePlacementCsv(DEFAULT_CIRCUIT_NODES, DEFAULT_PCB_STACKUP);
    expect(csv).toContain("Ref,Label,Footprint,X_mm,Y_mm");
    expect(csv).toContain("ESP32-WROOM-32");
  });
});

