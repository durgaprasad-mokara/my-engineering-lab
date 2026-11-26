import type { CircuitEdge, CircuitNode, ErcIssue } from "./types";

/**
 * Pure Electrical Rule Check (ERC) engine.
 * Checks voltage compatibility, current budget, bus protocol matching, and ground references.
 * Note: ERC is static rule checking, NOT a substitute for SPICE or bench electrical validation.
 */
export function runElectricalRuleChecks(nodes: CircuitNode[], edges: CircuitEdge[]): ErcIssue[] {
  const issues: ErcIssue[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 1. Check for ground / power source presence
  const powerSources = nodes.filter((n) => n.kind === "power" || n.currentDrawMa < 0);
  if (nodes.length > 0 && powerSources.length === 0) {
    issues.push({
      id: "erc-no-power",
      severity: "error",
      code: "ERC-PWR",
      message: "No power source / regulator node present in the design.",
      nodeIds: [],
    });
  }

  const hasGroundEdge = edges.some((e) => e.protocol === "ground");
  if (nodes.length > 1 && !hasGroundEdge) {
    issues.push({
      id: "erc-no-gnd",
      severity: "warning",
      code: "ERC-GND",
      message: "No explicit ground (GND) return connection defined between subsystems.",
      nodeIds: [],
    });
  }

  // 2. Total current budget check
  const totalLoadMa = nodes
    .filter((n) => n.currentDrawMa > 0)
    .reduce((sum, n) => sum + n.currentDrawMa, 0);
  const totalCapacityMa = powerSources.reduce((sum, n) => sum + Math.abs(n.currentDrawMa), 0);

  if (powerSources.length > 0 && totalLoadMa > totalCapacityMa) {
    issues.push({
      id: "erc-curr-over",
      severity: "error",
      code: "ERC-CURR",
      message: `Peak load (${totalLoadMa} mA) exceeds power supply capacity (${totalCapacityMa} mA).`,
      nodeIds: powerSources.map((p) => p.id),
    });
  } else if (powerSources.length > 0 && totalLoadMa > totalCapacityMa * 0.8) {
    issues.push({
      id: "erc-curr-margin",
      severity: "warning",
      code: "ERC-CURR",
      message: `Peak load (${totalLoadMa} mA) uses >80% of supply capacity (${totalCapacityMa} mA); verify thermal derating.`,
      nodeIds: powerSources.map((p) => p.id),
    });
  }

  // 3. Per-edge voltage & bus compatibility checks
  for (const edge of edges) {
    const from = nodeMap.get(edge.fromNodeId);
    const to = nodeMap.get(edge.toNodeId);
    if (!from || !to) continue;

    // Voltage tolerance check (skip ground and RF)
    if (edge.protocol !== "ground" && edge.protocol !== "rf" && !edge.hasLevelShifter) {
      if (edge.voltageV > to.maxInputV + 0.1) {
        issues.push({
          id: `erc-volt-${edge.id}`,
          severity: "error",
          code: "ERC-VOLT",
          message: `Voltage mismatch on ${edge.signal} (${from.label} → ${to.label}): ${edge.voltageV}V exceeds ${to.label} max input (${to.maxInputV}V). Add a level shifter or divider.`,
          nodeIds: [from.id, to.id],
        });
      }
    }

    // Bus protocol compatibility check for communication buses
    if (edge.protocol === "i2c" || edge.protocol === "spi" || edge.protocol === "uart") {
      const protoUpper = edge.protocol.toUpperCase();
      if (!from.busTypes.includes(protoUpper) || !to.busTypes.includes(protoUpper)) {
        issues.push({
          id: `erc-pin-${edge.id}`,
          severity: "error",
          code: "ERC-PIN",
          message: `Bus incompatibility on ${edge.signal}: ${protoUpper} is not supported by both ${from.label} and ${to.label}.`,
          nodeIds: [from.id, to.id],
        });
      }
    }
  }

  if (issues.length === 0 && nodes.length > 0) {
    issues.push({
      id: "erc-clean",
      severity: "info",
      code: "ERC-PIN",
      message: "All static voltage, current budget, and bus compatibility checks passed. Bench/SPICE simulation still required.",
      nodeIds: [],
    });
  }

  return issues;
}

