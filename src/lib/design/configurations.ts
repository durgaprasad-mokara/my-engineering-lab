import type {
  BomItem,
  DesignCriterionKey,
  HardwareConfiguration,
} from "./types";

export const DESIGN_PRESETS: {
  id: string;
  label: string;
  requirement: string;
  configs: HardwareConfiguration[];
  defaultBom: BomItem[];
}[] = [
  {
    id: "water-meter",
    label: "Smart Water Meter (4G / LPWAN)",
    requirement: "Industrial smart water meter with pulse/ultrasonic flow sensor, low-power MCU, cellular/LPWAN backhaul, and 5–10 year battery life.",
    configs: [
      {
        id: "cfg-nbiot",
        name: "Config A — STM32WL / nRF9160 NB-IoT",
        summary: "Deep-penetration licensed NB-IoT with ultra-low-power PSM sleep and 3.6V Li-SOCl2 cell.",
        recommended: true,
        estimatedUnitBomUsd: 24.5,
        scores: {
          cost: 4,
          compatibility: 5,
          performance: 4,
          power: 5,
          batteryLife: 5,
          accuracy: 4,
          scalability: 5,
          availability: 4,
          maintainability: 4,
          compliance: 5,
        },
        subsystems: [
          { subsystem: "Sensor", part: "Hall-Effect Pulse / Ultrasonic Flow", rationale: "Zero-quiescent reed/Hall pulse counting or TDC1000 ultrasonic ToF." },
          { subsystem: "MCU", part: "STM32L431 / nRF9160 SiP", rationale: "< 2 µA STOP2 sleep current with RTC pulse wake." },
          { subsystem: "Modem", part: "Quectel BC660K-GL (NB-IoT)", rationale: "+20 dB MCL penetrates cast-iron underground pit covers." },
          { subsystem: "Antenna", part: "Taoglas FXP73 FPC", rationale: "Ground-plane independent adhesive antenna inside plastic lid." },
          { subsystem: "Power", part: "TPS62840 Buck + 470 mF Supercap", rationale: "60 nA Iq buck; supercap buffers 250 mA NB-IoT TX bursts." },
          { subsystem: "Battery", part: "Saft LS17500 / ER18505 Li-SOCl2", rationale: "3.6V 4000 mAh primary cell for 10+ year pit deployment." },
          { subsystem: "Protection", part: "TVS + Reverse Polarity PFET", rationale: "ESD protection on pulse input & battery terminal." },
          { subsystem: "Enclosure", part: "IP68 Polycarbonate + Potted PCB", rationale: "Submersion-proof against flooded meter pits." },
        ],
        tradeoffs: [
          "Requires carrier NB-IoT coverage at pit location",
          "Low uplink bandwidth (~100 kbps) unsuitable for frequent OTA firmware",
        ],
      },
      {
        id: "cfg-cat1bis",
        name: "Config B — ESP32-S3 + LTE Cat 1bis",
        summary: "High-throughput 4G Cat 1bis single-antenna modem for frequent telemetry and fast OTA.",
        estimatedUnitBomUsd: 31.0,
        scores: {
          cost: 3,
          compatibility: 5,
          performance: 5,
          power: 3,
          batteryLife: 3,
          accuracy: 4,
          scalability: 5,
          availability: 5,
          maintainability: 5,
          compliance: 5,
        },
        subsystems: [
          { subsystem: "Sensor", part: "YF-S201 / Industrial Pulse Flow", rationale: "Standard digital pulse output." },
          { subsystem: "MCU", part: "ESP32-WROOM-32", rationale: "Rich SDK, TLS stack, and BLE for technician walk-up setup." },
          { subsystem: "Modem", part: "Quectel EC200U-CN (LTE Cat 1bis)", rationale: "10 Mbps DL / 5 Mbps UL with single RF antenna." },
          { subsystem: "Antenna", part: "External SMA / FXP73", rationale: "700–2600 MHz wideband." },
          { subsystem: "Power", part: "TPS63020 Buck-Boost (3.8V)", rationale: "Handles 2A Cat 1 TX peaks." },
          { subsystem: "Battery", part: "2× 18650 Li-ion or Mains 12V", rationale: "Higher peak draw reduces primary-cell longevity." },
          { subsystem: "Protection", part: "SMBJ5.0A TVS + Fuse", rationale: "Surge and brownout protection." },
          { subsystem: "Enclosure", part: "IP67 ABS Wall-Mount", rationale: "Accessible SIM tray and external antenna bulkhead." },
        ],
        tradeoffs: [
          "Higher active current (~500 mA TX) shortens battery life compared to NB-IoT",
          "Slightly higher modem BOM cost",
        ],
      },
      {
        id: "cfg-lorawan",
        name: "Config C — STM32WL55 LoRaWAN (IN865)",
        summary: "Zero-SIM-fee private LPWAN using integrated sub-GHz LoRa SoC.",
        estimatedUnitBomUsd: 18.2,
        scores: {
          cost: 5,
          compatibility: 4,
          performance: 3,
          power: 5,
          batteryLife: 5,
          accuracy: 4,
          scalability: 4,
          availability: 4,
          maintainability: 4,
          compliance: 4,
        },
        subsystems: [
          { subsystem: "Sensor", part: "Inductive / Hall Flow Pulse", rationale: "Low-energy pulse sensing." },
          { subsystem: "MCU", part: "STM32WL55JC (Dual-core + SX1262)", rationale: "Single-chip MCU + LoRa transceiver reduces BOM." },
          { subsystem: "Modem", part: "Integrated Sub-GHz LoRa", rationale: "Operates on WPC de-licensed IN865–867 MHz." },
          { subsystem: "Antenna", part: "Helical 868 MHz / Linx Dipole", rationale: "Compact internal coil or external SMA." },
          { subsystem: "Power", part: "Direct 3.6V Li-SOCl2 + 100 µF", rationale: "120 mA TX burst easily buffered by ceramic/tantalum bank." },
          { subsystem: "Battery", part: "ER18505 3.6V Li-SOCl2", rationale: "10–15 year autonomous lifetime." },
          { subsystem: "Protection", part: "Pi-matching + ESD Diode", rationale: "RF port ESD protection." },
          { subsystem: "Enclosure", part: "IP68 Sealed Polymer", rationale: "Compact pit form factor." },
        ],
        tradeoffs: [
          "Requires deploying and maintaining LoRaWAN gateways",
          "11–242 byte payload limit restricts verbose diagnostics",
        ],
      },
      {
        id: "cfg-ltem",
        name: "Config D — nRF9160 LTE-M (eMTC)",
        summary: "Balanced cellular IoT with 1 Mbps throughput, VoLTE, and eDRX battery saving.",
        estimatedUnitBomUsd: 29.0,
        scores: {
          cost: 3,
          compatibility: 4,
          performance: 4,
          power: 4,
          batteryLife: 4,
          accuracy: 4,
          scalability: 5,
          availability: 4,
          maintainability: 4,
          compliance: 5,
        },
        subsystems: [
          { subsystem: "Sensor", part: "Ultrasonic Flow Transducer", rationale: "High-accuracy zero-moving-parts flow." },
          { subsystem: "MCU", part: "Nordic nRF9160 (Cortex-M33)", rationale: "Integrated modem + application MCU + TrustZone." },
          { subsystem: "Modem", part: "Integrated LTE-M / NB-IoT", rationale: "Dual-mode fallback across carriers." },
          { subsystem: "Antenna", part: "Taoglas FXP73", rationale: "Wideband cellular." },
          { subsystem: "Power", part: "ADP5360 PMIC", rationale: "Power-path + fuel gauge." },
          { subsystem: "Battery", part: "Li-SOCl2 + HLC Hybrid", rationale: "Hybrid layer capacitor handles LTE-M peaks." },
          { subsystem: "Protection", part: "PRTR5V0U2X ESD", rationale: "Sensor & SIM ESD clamping." },
          { subsystem: "Enclosure", part: "IP67 Industrial Housing", rationale: "Outdoor rated." },
        ],
        tradeoffs: [
          "LTE-M carrier availability varies by region (verify local telco support)",
        ],
      },
      {
        id: "cfg-wifi-ble",
        name: "Config E — ESP32-C3 Wi-Fi + BLE Walk-by",
        summary: "Lowest-cost local gateway bridge or drive-by BLE AMR.",
        estimatedUnitBomUsd: 11.5,
        scores: {
          cost: 5,
          compatibility: 4,
          performance: 4,
          power: 2,
          batteryLife: 2,
          accuracy: 4,
          scalability: 2,
          availability: 5,
          maintainability: 4,
          compliance: 4,
        },
        subsystems: [
          { subsystem: "Sensor", part: "Hall Pulse Flow Sensor", rationale: "Standard 3.3V pulse." },
          { subsystem: "MCU", part: "ESP32-C3 (RISC-V)", rationale: "Low-cost Wi-Fi 4 + BLE 5.0." },
          { subsystem: "Modem", part: "On-chip 2.4 GHz Wi-Fi / BLE", rationale: "Zero extra modem IC cost." },
          { subsystem: "Antenna", part: "PCB MIFA 2.4 GHz Trace", rationale: "Zero BOM antenna." },
          { subsystem: "Power", part: "AMS1117-3.3 LDO", rationale: "5V USB / wall adapter or frequent recharge." },
          { subsystem: "Battery", part: "18650 Li-ion (or Mains)", rationale: "Wi-Fi association drains batteries quickly." },
          { subsystem: "Protection", part: "B5819W Schottky", rationale: "Reverse current block." },
          { subsystem: "Enclosure", part: "Indoor ABS Case", rationale: "2.4 GHz attenuates heavily in underground pits." },
        ],
        tradeoffs: [
          "2.4 GHz fails in underground/metal water meter pits",
          "Requires local Wi-Fi AP or technician walk-by",
        ],
      },
    ],
    defaultBom: [
      {
        id: "bom-1",
        designator: "U1",
        partNumber: "ESP32-WROOM-32E",
        description: "Wi-Fi + BLE Dual-Core MCU Module (4 MB Flash)",
        manufacturer: "Espressif Systems",
        category: "Microcontroller",
        quantity: 1,
        unitPriceUsd: 3.1,
        availability: "In Stock",
        datasheetUrl: "https://espressif.com/documentation/esp32-wroom-32_datasheet_en.pdf",
        retrievedAt: "2026-11-10",
        verificationStatus: "typical",
      },
      {
        id: "bom-2",
        designator: "U2",
        partNumber: "BC660K-GL",
        description: "Multi-band NB-IoT Module (LCC)",
        manufacturer: "Quectel Wireless",
        category: "Modem",
        quantity: 1,
        unitPriceUsd: 6.85,
        availability: "In Stock",
        datasheetUrl: "https://www.quectel.com/product/lpwa-bc660k-gl",
        retrievedAt: "2026-11-12",
        verificationStatus: "typical",
      },
      {
        id: "bom-3",
        designator: "U3",
        partNumber: "AMS1117-3.3",
        description: "3.3V 1A LDO Voltage Regulator (SOT-223)",
        manufacturer: "Advanced Monolithic Systems",
        category: "Power",
        quantity: 1,
        unitPriceUsd: 0.18,
        availability: "In Stock",
        datasheetUrl: "https://www.alldatasheet.com/datasheet-pdf/pdf/457815/AMS/AMS1117.html",
        retrievedAt: "2026-06-01", // Intentionally >90 days old to demonstrate stale flag
        verificationStatus: "estimated",
      },
      {
        id: "bom-4",
        designator: "ANT1",
        partNumber: "FXP73.07.0100A",
        description: "Ultra-wideband 4G/NB-IoT Flexible PCB Antenna",
        manufacturer: "Taoglas",
        category: "Antenna",
        quantity: 1,
        unitPriceUsd: 4.2,
        availability: "In Stock",
        datasheetUrl: "https://www.taoglas.com/product/fxp73-blue-diamond-4g-3g-2g-flex-antenna-100mm-ipex-mhf-ufl/",
        retrievedAt: "2026-11-05",
        verificationStatus: "typical",
      },
      {
        id: "bom-5",
        designator: "C1, C2",
        partNumber: "GRM21BR71C104KA01",
        description: "100 nF 16V X7R 0805 MLCC Decoupling Capacitor",
        manufacturer: "Murata Electronics",
        category: "Passive",
        quantity: 4,
        unitPriceUsd: 0.03,
        availability: "In Stock",
        datasheetUrl: "https://pim.murata.com/en-global/pim/details/?partNum=GRM21BR71C104KA01#",
        retrievedAt: "2026-11-15",
        verificationStatus: "typical",
      },
      {
        id: "bom-6",
        designator: "J1",
        partNumber: "YF-S201",
        description: "Hall-Effect Inline Water Flow Sensor (1–30 L/min)",
        manufacturer: "Seeed / Generic",
        category: "Sensor",
        quantity: 1,
        unitPriceUsd: null,
        availability: "Unknown",
        datasheetUrl: "https://wiki.seeedstudio.com/Water_Flow_Sensor/",
        retrievedAt: null,
        verificationStatus: "unverified",
      },
    ],
  },
];

export function scoreConfiguration(
  config: HardwareConfiguration,
  weights: Partial<Record<DesignCriterionKey, number>>,
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const key of Object.keys(config.scores) as DesignCriterionKey[]) {
    const w = weights[key] ?? 1;
    weightedSum += config.scores[key] * w;
    totalWeight += w * 5;
  }
  return totalWeight > 0 ? Number(((weightedSum / totalWeight) * 100).toFixed(1)) : 0;
}

export function rankConfigurations(
  configs: HardwareConfiguration[],
  weights: Partial<Record<DesignCriterionKey, number>> = {},
): (HardwareConfiguration & { weightedPercent: number })[] {
  return [...configs]
    .map((cfg) => ({
      ...cfg,
      weightedPercent: scoreConfiguration(cfg, weights),
    }))
    .sort((a, b) => b.weightedPercent - a.weightedPercent);
}

/** Per PRD §6: Prices older than 90 days must be flagged as stale. */
export function isPriceStale(retrievedAt: string | null, now = new Date()): boolean {
  if (!retrievedAt) return true;
  const dt = new Date(retrievedAt);
  if (Number.isNaN(dt.getTime())) return true;
  const ageDays = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > 90;
}

export function calculateBomTotal(items: BomItem[]): {
  knownTotalUsd: number;
  missingPriceCount: number;
  stalePriceCount: number;
} {
  let knownTotalUsd = 0;
  let missingPriceCount = 0;
  let stalePriceCount = 0;

  for (const item of items) {
    if (item.unitPriceUsd === null || !Number.isFinite(item.unitPriceUsd)) {
      missingPriceCount++;
    } else {
      knownTotalUsd += item.unitPriceUsd * item.quantity;
    }
    if (isPriceStale(item.retrievedAt)) {
      stalePriceCount++;
    }
  }

  return {
    knownTotalUsd: Number(knownTotalUsd.toFixed(2)),
    missingPriceCount,
    stalePriceCount,
  };
}

export function bomToCsv(items: BomItem[]): string {
  const header = ["Designator", "Part Number", "Manufacturer", "Description", "Category", "Qty", "Unit Price (USD)", "Status", "Retrieved At", "Datasheet"];
  const rows = items.map((i) =>
    [
      i.designator,
      i.partNumber,
      i.manufacturer,
      `"${i.description.replace(/"/g, '""')}"`,
      i.category,
      String(i.quantity),
      i.unitPriceUsd !== null ? i.unitPriceUsd.toFixed(2) : "UNVERIFIED",
      i.verificationStatus,
      i.retrievedAt ?? "N/A",
      i.datasheetUrl ?? "",
    ].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

