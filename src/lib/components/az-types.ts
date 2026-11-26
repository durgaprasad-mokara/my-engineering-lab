import type { VerificationStatus } from "@/lib/data/types";

export const AZ_CATEGORIES = [
  "Sensors",
  "Microcontrollers",
  "Communication modules",
  "Antennas",
  "Power electronics",
  "Passive components",
  "Active components",
  "Displays",
  "Motors and actuators",
  "Protection devices",
  "Connectors",
  "Industrial automation components",
  "Robotics components",
  "IoT modules",
] as const;

export type AzCategory = (typeof AZ_CATEGORIES)[number];

export type VisualShape =
  | "board_mcu"
  | "ic_dip"
  | "ic_smd"
  | "sensor_ultrasonic"
  | "sensor_module"
  | "passive_axial"
  | "passive_cap"
  | "crystal"
  | "transistor_to220"
  | "diode"
  | "led"
  | "inductor"
  | "relay"
  | "motor"
  | "display"
  | "antenna"
  | "connector"
  | "battery"
  | "switch"
  | "pcb";

export interface ComponentImageRecord {
  role: "main" | "alternative" | "pinout" | "circuit" | "package" | "manufacturer";
  title: string;
  isIllustrative: boolean;
  attribution: string;
  license: string;
  storagePath?: string | null;
  available: boolean;
}

export interface AzPinoutItem {
  pin: string;
  name: string;
  function: string;
  voltage?: string;
}

export interface AzComponentRecord {
  slug: string;
  letter: string; // 'A'..'Z'
  name: string;
  category: AzCategory;
  subcategory: string;
  manufacturer: string;
  partNumber: string;
  packageType: string;
  dimensions: string;
  visualShape: VisualShape;
  description: string;
  workingPrinciple: string;
  internalArchitecture: string;
  operatingVoltage: string;
  operatingCurrent: string;
  powerConsumption: string;
  ioDetails: string;
  protocols: string[];
  frequencyRange?: string;
  measurementRange?: string;
  accuracy?: string;
  resolution?: string;
  operatingTemp: string;
  compatibleMcus: string[];
  compatibleModules: string[];
  pinout: AzPinoutItem[];
  wiringNotes: string;
  exampleCircuit: string;
  codeExamples: {
    arduino?: string;
    esp32?: string;
    stm32?: string;
    raspberryPi?: string;
  };
  applications: string[];
  advantages: string[];
  disadvantages: string[];
  alternatives: string[];
  datasheetUrl: string | null;
  manufacturerUrl: string | null;
  estimatedCostUsd: number | null;
  supplierInfo: string;
  verificationStatus: VerificationStatus;
  images: ComponentImageRecord[];
}

