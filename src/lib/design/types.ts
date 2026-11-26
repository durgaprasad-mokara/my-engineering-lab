import type { VerificationStatus } from "@/lib/data/types";

export const DESIGN_CRITERIA = [
  { key: "cost", label: "BOM Cost" },
  { key: "compatibility", label: "Compatibility" },
  { key: "performance", label: "Performance" },
  { key: "power", label: "Low Power" },
  { key: "batteryLife", label: "Battery Life" },
  { key: "accuracy", label: "Accuracy" },
  { key: "scalability", label: "Scalability" },
  { key: "availability", label: "Availability" },
  { key: "maintainability", label: "Maintainability" },
  { key: "compliance", label: "Compliance" },
] as const;

export type DesignCriterionKey = (typeof DESIGN_CRITERIA)[number]["key"];

export type CriteriaScores = Record<DesignCriterionKey, 1 | 2 | 3 | 4 | 5>;

export interface HardwareSubsystemPick {
  subsystem: "Sensor" | "MCU" | "Modem" | "Antenna" | "Power" | "Battery" | "Protection" | "Enclosure";
  part: string;
  rationale: string;
}

export interface HardwareConfiguration {
  id: string;
  name: string;
  summary: string;
  recommended?: boolean;
  scores: CriteriaScores;
  subsystems: HardwareSubsystemPick[];
  tradeoffs: string[];
  estimatedUnitBomUsd: number | null;
}

export interface BomItem {
  id: string;
  designator: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  category: string;
  quantity: number;
  unitPriceUsd: number | null;
  availability: "In Stock" | "Low Stock" | "Lead Time" | "Unknown";
  datasheetUrl: string | null;
  retrievedAt: string | null; // ISO date YYYY-MM-DD
  verificationStatus: VerificationStatus;
}

export type CircuitViewKind = "block" | "wiring" | "schematic" | "pcb_layout";

export interface CircuitNode {
  id: string;
  label: string;
  kind: "mcu" | "sensor" | "power" | "modem" | "protection" | "connector";
  voltageV: number;
  maxInputV: number;
  currentDrawMa: number; // positive = load, negative = source capacity
  busTypes: string[];
  x: number;
  y: number;
  footprint: string;
}

export interface CircuitEdge {
  id: string;
  fromNodeId: string;
  fromPin: string;
  toNodeId: string;
  toPin: string;
  signal: string;
  protocol: "power" | "ground" | "i2c" | "spi" | "uart" | "analog" | "rf";
  voltageV: number;
  hasLevelShifter?: boolean;
}

export interface ErcIssue {
  id: string;
  severity: "error" | "warning" | "info";
  code: "ERC-VOLT" | "ERC-CURR" | "ERC-PIN" | "ERC-PWR" | "ERC-GND";
  message: string;
  nodeIds: string[];
}

export interface PcbStackup {
  layers: 2 | 4;
  thicknessMm: number;
  copperOz: 1 | 2;
  substrate: "FR-4 Standard" | "FR-4 High-Tg" | "Rogers RO4350B";
  impedanceControl: boolean;
  boardWidthMm: number;
  boardHeightMm: number;
}

