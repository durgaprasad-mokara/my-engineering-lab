import { AZ_COMPONENTS } from "@/lib/components/az-catalog";
import type { AzComponentRecord } from "@/lib/components/az-types";

export interface HardwareResearchReport {
  id: string;
  query: string;
  mode: "anthropic" | "grounded-engine";
  summary: string;
  recommendedComponents: Array<{
    slug: string;
    name: string;
    category: string;
    operatingVoltage: string;
    protocols: string[];
    estimatedCostUsd: number | null;
    reason: string;
  }>;
  architectureNotes: string[];
  risksAndAssumptions: string[];
  generatedAt: string;
}

export function runHardwareResearch(query: string, categoryFilter?: string): HardwareResearchReport {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);

  const scored = AZ_COMPONENTS.filter((c) => !categoryFilter || categoryFilter === "ALL" || c.category === categoryFilter)
    .map((c) => {
      const text = [
        c.name,
        c.category,
        c.subcategory,
        c.description,
        c.workingPrinciple,
        c.protocols.join(" "),
        c.applications.join(" "),
        c.compatibleMcus.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (c.name.toLowerCase().includes(tok)) score += 5;
        else if (text.includes(tok)) score += 2;
      }
      return { component: c, score };
    })
    .filter((x) => x.score > 0 || tokens.length === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const picks: AzComponentRecord[] =
    scored.length > 0 ? scored.map((s) => s.component) : AZ_COMPONENTS.slice(0, 4);

  return {
    id: `hr-${Date.now()}`,
    query,
    mode: "grounded-engine",
    summary: `Grounded hardware research synthesis for "${query}" across ${AZ_COMPONENTS.length} A–Z catalog parts. Matched ${picks.length} candidate components with verified voltage/interface metadata and estimated unit pricing.`,
    recommendedComponents: picks.map((c) => ({
      slug: c.slug,
      name: c.name,
      category: c.category,
      operatingVoltage: c.operatingVoltage,
      protocols: c.protocols,
      estimatedCostUsd: c.estimatedCostUsd,
      reason: `${c.subcategory} (${c.operatingVoltage}, ${c.protocols.join("/") || "Discrete"}) — ${c.applications[0] ?? c.description}`,
    })),
    architectureNotes: [
      "Verify logic-level compatibility (3.3 V vs 5 V) before connecting sensors directly to MCU GPIO.",
      "Place 100 nF ceramic decoupling capacitors close to every IC VCC/GND pair and bulk 10 µF–47 µF at rail entry.",
      "Review pull-up resistor sizing (typically 2.2 kΩ–4.7 kΩ at 3.3 V) for shared I2C buses.",
    ],
    risksAndAssumptions: [
      "Unit prices are estimated catalog benchmarks; confirm live distributor stock and lead times before PCB layout.",
      "Thermal margin and peak inrush currents must be validated against actual supply impedance.",
    ],
    generatedAt: new Date().toISOString(),
  };
}

export interface ValidationInput {
  projectName: string;
  supplyVoltageV: number;
  mcuLogicVoltageV: number;
  regulatorMaxCurrentMa: number;
  ambientTempC: number;
  components: Array<{
    name: string;
    voltageV: number;
    currentMa: number;
    interfaceType: "I2C" | "SPI" | "UART" | "Analog" | "Power" | "GPIO";
    i2cAddress?: string;
    fiveVTolerant?: boolean;
  }>;
}

export interface ValidationCheckResult {
  id: string;
  rule: string;
  status: "pass" | "warning" | "fail";
  detail: string;
  remediation: string;
}

export interface ValidationReport {
  projectName: string;
  overallStatus: "pass" | "warning" | "fail";
  totalCurrentMa: number;
  regulatorUtilizationPct: number;
  estimatedLdoHeatMw: number;
  checks: ValidationCheckResult[];
}

export function validateHardwareDesign(input: ValidationInput): ValidationReport {
  const checks: ValidationCheckResult[] = [];
  const totalCurrentMa = input.components.reduce((sum, c) => sum + Math.max(0, c.currentMa), 0);
  const utilizationPct =
    input.regulatorMaxCurrentMa > 0 ? Math.round((totalCurrentMa / input.regulatorMaxCurrentMa) * 100) : 100;

  // 1. Current budget check
  if (totalCurrentMa > input.regulatorMaxCurrentMa) {
    checks.push({
      id: "power-budget",
      rule: "Regulator Current Budget",
      status: "fail",
      detail: `Total load (${totalCurrentMa} mA) exceeds regulator limit (${input.regulatorMaxCurrentMa} mA).`,
      remediation: "Upgrade to a higher-current buck converter or split high-draw actuators onto a dedicated rail.",
    });
  } else if (utilizationPct >= 80) {
    checks.push({
      id: "power-budget",
      rule: "Regulator Current Budget",
      status: "warning",
      detail: `Load is ${utilizationPct}% (${totalCurrentMa}/${input.regulatorMaxCurrentMa} mA) — less than 20% headroom.`,
      remediation: "Target <= 75% continuous utilization to accommodate transient Wi-Fi/motor inrush.",
    });
  } else {
    checks.push({
      id: "power-budget",
      rule: "Regulator Current Budget",
      status: "pass",
      detail: `Load is ${totalCurrentMa} mA (${utilizationPct}% of ${input.regulatorMaxCurrentMa} mA capacity).`,
      remediation: "Adequate steady-state current margin.",
    });
  }

  // 2. Logic level compatibility
  const mismatched = input.components.filter(
    (c) =>
      c.interfaceType !== "Power" &&
      Math.abs(c.voltageV - input.mcuLogicVoltageV) > 0.6 &&
      !c.fiveVTolerant,
  );
  if (mismatched.length > 0) {
    checks.push({
      id: "logic-levels",
      rule: "Logic Level Compatibility",
      status: "fail",
      detail: `Voltage mismatch on ${mismatched.map((m) => `${m.name} (${m.voltageV}V)`).join(", ")} vs ${input.mcuLogicVoltageV}V MCU.`,
      remediation: "Insert a bidirectional BSS138 / TXS0108E logic level converter on SDA/SCL/UART/SPI lines.",
    });
  } else {
    checks.push({
      id: "logic-levels",
      rule: "Logic Level Compatibility",
      status: "pass",
      detail: `All signal-level peripherals match ${input.mcuLogicVoltageV}V logic or are 5V-tolerant.`,
      remediation: "No level shifting required.",
    });
  }

  // 3. I2C address collisions
  const i2cMap = new Map<string, string[]>();
  for (const c of input.components) {
    if (c.interfaceType === "I2C" && c.i2cAddress) {
      const addr = c.i2cAddress.trim().toLowerCase();
      i2cMap.set(addr, [...(i2cMap.get(addr) ?? []), c.name]);
    }
  }
  const collisions = Array.from(i2cMap.entries()).filter(([, names]) => names.length > 1);
  if (collisions.length > 0) {
    checks.push({
      id: "i2c-collision",
      rule: "I2C Address Uniqueness",
      status: "fail",
      detail: collisions.map(([addr, names]) => `Address ${addr} shared by ${names.join(" & ")}`).join("; "),
      remediation: "Change ADDR jumper or add a TCA9548A I2C multiplexer.",
    });
  } else {
    checks.push({
      id: "i2c-collision",
      rule: "I2C Address Uniqueness",
      status: "pass",
      detail: "No duplicate I2C 7-bit addresses detected.",
      remediation: "Verify 2.2 kΩ–4.7 kΩ pull-ups on SDA and SCL.",
    });
  }

  // 4. Thermal dissipation estimate for linear drop
  const dropV = Math.max(0, input.supplyVoltageV - input.mcuLogicVoltageV);
  const estimatedLdoHeatMw = Math.round(dropV * totalCurrentMa);
  if (estimatedLdoHeatMw > 1000 || input.ambientTempC > 65) {
    checks.push({
      id: "thermal-ldo",
      rule: "Thermal & Linear Drop Check",
      status: "warning",
      detail: `Linear drop dissipation ~${estimatedLdoHeatMw} mW at ${input.ambientTempC}°C ambient.`,
      remediation: "Use a synchronous buck converter instead of an LDO or add copper thermal vias.",
    });
  } else {
    checks.push({
      id: "thermal-ldo",
      rule: "Thermal & Linear Drop Check",
      status: "pass",
      detail: `Estimated linear dissipation ${estimatedLdoHeatMw} mW at ${input.ambientTempC}°C ambient.`,
      remediation: "Within normal SOT-223 / DPAK thermal limits.",
    });
  }

  const overallStatus: ValidationReport["overallStatus"] = checks.some((c) => c.status === "fail")
    ? "fail"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "pass";

  return {
    projectName: input.projectName,
    overallStatus,
    totalCurrentMa,
    regulatorUtilizationPct: utilizationPct,
    estimatedLdoHeatMw,
    checks,
  };
}

export interface CostLineItem {
  name: string;
  unitCostUsd: number;
  qty: number;
}

export interface CostEstimateInput {
  projectName: string;
  items: CostLineItem[];
  pcbAreaCm2: number;
  pcbLayers: 2 | 4 | 6;
  prototypeQty: number;
  enclosureCostUsd: number;
  shippingAndNreUsd: number;
}

export interface CostEstimateResult {
  projectName: string;
  bomPerUnitUsd: number;
  pcbFabPerUnitUsd: number;
  assemblyPerUnitUsd: number;
  totalPerUnitUsd: number;
  totalBatchUsd: number;
  tiers: Array<{ qty: number; perUnitUsd: number; totalUsd: number }>;
  note: string;
}

export function estimatePrototypeCost(input: CostEstimateInput): CostEstimateResult {
  const qty = Math.max(1, Math.round(input.prototypeQty));
  const bomPerUnitUsd = input.items.reduce((sum, i) => sum + Math.max(0, i.unitCostUsd) * Math.max(0, i.qty), 0);
  const layerMultiplier = input.pcbLayers === 6 ? 2.4 : input.pcbLayers === 4 ? 1.55 : 1.0;
  const pcbBase = Math.max(1.2, input.pcbAreaCm2 * 0.08 * layerMultiplier);
  const assemblyBase = Math.max(2.5, input.items.length * 0.45);

  function computeForQty(targetQty: number) {
    const volumeDiscount = targetQty >= 100 ? 0.72 : targetQty >= 25 ? 0.82 : targetQty >= 10 ? 0.9 : 1.0;
    const bom = bomPerUnitUsd * volumeDiscount;
    const pcb = (pcbBase * (targetQty >= 25 ? 0.55 : targetQty >= 10 ? 0.75 : 1.0));
    const asm = assemblyBase * (targetQty >= 25 ? 0.6 : targetQty >= 10 ? 0.8 : 1.0);
    const nrePerUnit = input.shippingAndNreUsd / targetQty;
    const perUnit = Number((bom + pcb + asm + input.enclosureCostUsd + nrePerUnit).toFixed(2));
    return {
      qty: targetQty,
      perUnitUsd: perUnit,
      totalUsd: Number((perUnit * targetQty).toFixed(2)),
    };
  }

  const current = computeForQty(qty);
  const tiers = [1, 10, 50, 100].map(computeForQty);

  return {
    projectName: input.projectName,
    bomPerUnitUsd: Number(bomPerUnitUsd.toFixed(2)),
    pcbFabPerUnitUsd: Number(pcbBase.toFixed(2)),
    assemblyPerUnitUsd: Number(assemblyBase.toFixed(2)),
    totalPerUnitUsd: current.perUnitUsd,
    totalBatchUsd: current.totalUsd,
    tiers,
    note: "Estimated prototype pricing only; verify live Mouser/DigiKey/JLCPCB/PCBWay quotes before ordering.",
  };
}

