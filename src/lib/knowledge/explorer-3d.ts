import type { DataSource } from "@/lib/data/types";

export type ExplorerViewMode =
  | "3d"
  | "exploded"
  | "pinout"
  | "circuit"
  | "pcb"
  | "wiring"
  | "architecture";

export interface ViewModeMeta {
  id: ExplorerViewMode;
  label: string;
  shortLabel: string;
  description: string;
}

export const EXPLORER_VIEW_MODES: ViewModeMeta[] = [
  {
    id: "3d",
    label: "3D Assembled",
    shortLabel: "3D",
    description: "Interactive shaded 3D assembly. Orbit, zoom, pan and click any part.",
  },
  {
    id: "exploded",
    label: "Exploded View",
    shortLabel: "Exploded",
    description: "Separates mechanical, PCB, sensing and RF layers along assembly axes.",
  },
  {
    id: "pinout",
    label: "Pinout Inspection",
    shortLabel: "Pinout",
    description: "Color-coded 3D pin markers with voltage limits and peripheral functions.",
  },
  {
    id: "circuit",
    label: "Circuit View",
    shortLabel: "Circuit",
    description: "Functional schematic blocks, power rails and signal conditioning paths.",
  },
  {
    id: "pcb",
    label: "PCB Footprint",
    shortLabel: "PCB",
    description: "Top-down copper pads, silkscreen outline, pin pitch and RF keepout zones.",
  },
  {
    id: "wiring",
    label: "Wiring Diagram",
    shortLabel: "Wiring",
    description: "Point-to-point harness and bus connections (VCC, GND, I2C, SPI, UART).",
  },
  {
    id: "architecture",
    label: "Architecture",
    shortLabel: "Arch",
    description: "System-level block hierarchy from physical sensing to cloud telemetry.",
  },
];

export type PinSignalType = "power" | "ground" | "gpio" | "analog" | "comm" | "rf";

export interface ExplorerPin {
  pin: string;
  name: string;
  signalType: PinSignalType;
  voltage: string;
  description: string;
  position: [number, number, number];
}

export interface ExplorerPart {
  id: string;
  name: string;
  role: string;
  material: string;
  dimensions: string;
  basePosition: [number, number, number];
  explodeOffset: [number, number, number];
  color: string;
}

export interface ExplorerWireLink {
  from: string;
  to: string;
  signal: string;
  protocol: string;
  color: string;
}

export interface ExplorerArchBlock {
  layer: string;
  title: string;
  detail: string;
}

export type ModelFidelity = "illustrative" | "manufacturer_cad";

export interface Explorer3DModel {
  slug: string;
  name: string;
  subtitle: string;
  category: "MCU Board" | "IoT Assembly" | "Integrated Circuit" | "Sensor Module" | "Robotics";
  fidelity: ModelFidelity;
  fidelityNote: string;
  sourceLabel: DataSource;
  kbHref?: string;
  dimensionsSummary: string;
  pcbFootprint: {
    widthMm: number;
    heightMm: number;
    pitchMm: number;
    packageName: string;
    keepoutNote: string;
  };
  parts: ExplorerPart[];
  pins: ExplorerPin[];
  wiring: ExplorerWireLink[];
  architecture: ExplorerArchBlock[];
}

export const PIN_SIGNAL_COLORS: Record<PinSignalType, { hex: string; label: string }> = {
  power: { hex: "#ef4444", label: "Power (VCC)" },
  ground: { hex: "#64748b", label: "Ground (GND)" },
  gpio: { hex: "#13d3f2", label: "Digital / GPIO" },
  analog: { hex: "#f59e0b", label: "Analog / ADC" },
  comm: { hex: "#3b82f6", label: "Bus (UART/I2C/SPI)" },
  rf: { hex: "#a855f7", label: "RF / Antenna" },
};

export const EXPLORER_3D_MODELS: Explorer3DModel[] = [
  {
    slug: "esp32-devkit",
    name: "ESP32-WROOM-32 DevKit",
    subtitle: "Dual-core Wi-Fi + BLE MCU development board",
    category: "MCU Board",
    fidelity: "illustrative",
    fidelityNote: "Parametric 3D geometry built to standard DevKitC dimensions for pinout and layout inspection.",
    sourceLabel: "illustrative",
    kbHref: "/microcontrollers/esp32-wroom-32",
    dimensionsSummary: "54.4 × 27.9 × 12.0 mm",
    pcbFootprint: {
      widthMm: 54.4,
      heightMm: 27.9,
      pitchMm: 2.54,
      packageName: "30-pin DIP Header (2×15, 25.4 mm row spacing)",
      keepoutNote: "Keep copper/ground plane clear under the PCB antenna overhang (top 7 mm).",
    },
    parts: [
      {
        id: "pcb",
        name: "FR-4 Carrier PCB",
        role: "4-layer matte-black PCB with 2.54 mm header footprints and RF antenna clearance.",
        material: "FR-4 (1.6 mm), ENIG gold pads",
        dimensions: "54.4 × 27.9 × 1.6 mm",
        basePosition: [0, 0, 0],
        explodeOffset: [0, -0.35, 0],
        color: "#0f172a",
      },
      {
        id: "rf-shield",
        name: "ESP32-WROOM-32 Shield Can",
        role: "EMI-shielded RF module housing ESP32-D0WDQ6 SoC, 4 MB SPI flash, and 40 MHz crystal.",
        material: "Nickel-silver stamped metal can",
        dimensions: "18.0 × 14.3 × 2.8 mm",
        basePosition: [0.55, 0.14, 0],
        explodeOffset: [0.35, 0.75, 0],
        color: "#94a3b8",
      },
      {
        id: "pcb-antenna",
        name: "2.4 GHz Meander PCB Antenna",
        role: "On-board etched inverted-F antenna tuned for 2400–2483.5 MHz Wi-Fi & BLE.",
        material: "Exposed FR-4 + 1 oz copper trace",
        dimensions: "7.0 × 18.0 mm",
        basePosition: [1.18, 0.04, 0],
        explodeOffset: [0.75, 0.4, 0],
        color: "#d97706",
      },
      {
        id: "ldo",
        name: "AMS1117-3.3 LDO Regulator",
        role: "Steps 5V USB / VIN down to regulated 3.3V (up to 800 mA peak for Wi-Fi TX bursts).",
        material: "SOT-223 epoxy package",
        dimensions: "6.5 × 3.5 × 1.6 mm",
        basePosition: [-0.75, 0.1, 0.25],
        explodeOffset: [-0.25, 0.55, 0.3],
        color: "#1e293b",
      },
      {
        id: "usb-bridge",
        name: "CP2102 USB-UART Bridge",
        role: "Converts USB D+/D- to 3.3V UART TX/RX with auto-reset DTR/RTS bootloader logic.",
        material: "QFN-28",
        dimensions: "5.0 × 5.0 × 0.9 mm",
        basePosition: [-0.75, 0.08, -0.22],
        explodeOffset: [-0.25, 0.55, -0.3],
        color: "#334155",
      },
      {
        id: "usb-port",
        name: "USB-C / Micro-USB Port",
        role: "5V power input and serial programming interface.",
        material: "Stainless steel shell",
        dimensions: "9.0 × 7.5 × 3.2 mm",
        basePosition: [-1.25, 0.12, 0],
        explodeOffset: [-0.7, 0.35, 0],
        color: "#cbd5e1",
      },
    ],
    pins: [
      { pin: "1", name: "3V3", signalType: "power", voltage: "3.3 V", description: "Regulated 3.3V output (max 600 mA external load)", position: [-1.0, -0.1, 0.58] },
      { pin: "2", name: "EN", signalType: "gpio", voltage: "3.3 V", description: "Chip enable (active high; 10k pull-up)", position: [-0.75, -0.1, 0.58] },
      { pin: "3", name: "GPIO34 (ADC1)", signalType: "analog", voltage: "0–3.3 V", description: "Input-only ADC1_CH6 (no internal pull-up)", position: [-0.5, -0.1, 0.58] },
      { pin: "4", name: "GPIO32 (PWM)", signalType: "gpio", voltage: "3.3 V", description: "Digital I/O, Touch9, ADC1_CH4", position: [-0.25, -0.1, 0.58] },
      { pin: "5", name: "GPIO21 (SDA)", signalType: "comm", voltage: "3.3 V", description: "Default I2C SDA line", position: [0.0, -0.1, 0.58] },
      { pin: "6", name: "GPIO22 (SCL)", signalType: "comm", voltage: "3.3 V", description: "Default I2C SCL line", position: [0.25, -0.1, 0.58] },
      { pin: "7", name: "TXD0 (GPIO1)", signalType: "comm", voltage: "3.3 V", description: "UART0 Transmit (USB serial)", position: [0.5, -0.1, 0.58] },
      { pin: "8", name: "RXD0 (GPIO3)", signalType: "comm", voltage: "3.3 V", description: "UART0 Receive (USB serial)", position: [0.75, -0.1, 0.58] },
      { pin: "9", name: "GND", signalType: "ground", voltage: "0 V", description: "Common ground reference", position: [1.0, -0.1, 0.58] },
      { pin: "10", name: "VIN", signalType: "power", voltage: "5.0 V", description: "5V power input before LDO", position: [-1.0, -0.1, -0.58] },
      { pin: "11", name: "GPIO23 (MOSI)", signalType: "comm", voltage: "3.3 V", description: "VSPI MOSI", position: [-0.5, -0.1, -0.58] },
      { pin: "12", name: "GPIO19 (MISO)", signalType: "comm", voltage: "3.3 V", description: "VSPI MISO", position: [0.0, -0.1, -0.58] },
      { pin: "13", name: "GPIO18 (SCK)", signalType: "comm", voltage: "3.3 V", description: "VSPI Clock", position: [0.5, -0.1, -0.58] },
      { pin: "14", name: "ANT_RF", signalType: "rf", voltage: "50 Ω", description: "2.4 GHz PCB meander antenna feed", position: [1.22, 0.08, 0] },
    ],
    wiring: [
      { from: "USB Port (5V)", to: "AMS1117-3.3 LDO", signal: "VBUS 5.0V", protocol: "DC Power", color: "#ef4444" },
      { from: "AMS1117-3.3", to: "ESP32-WROOM-32", signal: "VDD 3.3V", protocol: "Regulated Rail", color: "#ef4444" },
      { from: "CP2102 Bridge", to: "ESP32 UART0", signal: "TXD0 / RXD0", protocol: "UART 115200", color: "#3b82f6" },
      { from: "ESP32 GPIO21/22", to: "External Sensors", signal: "SDA / SCL", protocol: "I2C 400 kHz", color: "#13d3f2" },
    ],
    architecture: [
      { layer: "Power", title: "5V USB → 3.3V LDO", detail: "AMS1117 regulates 5V input with decoupling caps for 500 mA RF peaks." },
      { layer: "Compute", title: "Xtensa Dual-Core LX6", detail: "240 MHz MCU + 520 KB SRAM + 4 MB QSPI Flash." },
      { layer: "Peripherals", title: "I2C / SPI / UART / ADC", detail: "34 programmable GPIOs, 12-bit SAR ADC, hardware PWM." },
      { layer: "RF / Cloud", title: "2.4 GHz Wi-Fi + BLE", detail: "Integrated PCB antenna connects to MQTT / HTTPS cloud endpoints." },
    ],
  },
  {
    slug: "water-meter-node",
    name: "4G Smart Water Meter Node",
    subtitle: "Full IoT telemetry assembly: flow sensor, MCU, LTE modem & battery",
    category: "IoT Assembly",
    fidelity: "illustrative",
    fidelityNote: "Generic multi-part IoT assembly representing an industrial water-metering telemetry node.",
    sourceLabel: "illustrative",
    kbHref: "/components/ti-lm358",
    dimensionsSummary: "140 × 65 × 55 mm (excluding pipe)",
    pcbFootprint: {
      widthMm: 115,
      heightMm: 45,
      pitchMm: 2.54,
      packageName: "Custom 4-layer IoT Mainboard",
      keepoutNote: "Keep 50 Ω RF microstrip from LTE modem to SMA edge connector free of ground pours on inner layer 2.",
    },
    parts: [
      {
        id: "sensor",
        name: "Inline Hall-Effect Flow Sensor",
        role: "Turbine impeller with Hall-effect pulse output (K-factor pulses per litre).",
        material: "Brass / glass-filled nylon",
        dimensions: "Ø 32 × 120 mm",
        basePosition: [0, -1.1, 0],
        explodeOffset: [0, -0.75, 0],
        color: "#64748b",
      },
      {
        id: "enclosure",
        name: "IP67 Polycarbonate Enclosure",
        role: "Weatherproof housing protecting electronics from pit condensation and dust.",
        material: "UV-stabilized Polycarbonate",
        dimensions: "130 × 55 × 45 mm",
        basePosition: [0, 0.1, 0],
        explodeOffset: [0, 0.25, -0.6],
        color: "#1d4ed8",
      },
      {
        id: "pcb",
        name: "Main Telemetry PCB",
        role: "4-layer carrier board routing pulse input, power rails, and RF trace.",
        material: "FR-4",
        dimensions: "115 × 45 × 1.6 mm",
        basePosition: [0, -0.05, 0],
        explodeOffset: [0, 0.1, 0],
        color: "#065f46",
      },
      {
        id: "battery",
        name: "ER18505 Li-SOCl2 Cell",
        role: "3.6V 4000 mAh primary lithium battery sized for multi-year pulse counting.",
        material: "Stainless steel cylindrical cell",
        dimensions: "Ø 18.5 × 50.5 mm",
        basePosition: [-0.75, 0.25, 0.15],
        explodeOffset: [-0.35, 0.65, 0.25],
        color: "#334155",
      },
      {
        id: "mcu",
        name: "Ultra-Low-Power MCU",
        role: "Counts flow pulses in deep sleep (< 5 µA) and wakes modem on schedule.",
        material: "LQFP-48",
        dimensions: "7.0 × 7.0 × 1.4 mm",
        basePosition: [0.15, 0.08, 0.1],
        explodeOffset: [0, 0.85, 0.1],
        color: "#0f172a",
      },
      {
        id: "modem",
        name: "4G LTE Cat 1 / NB-IoT Modem",
        role: "Transmits compressed telemetry packets over cellular network to MQTT broker.",
        material: "LGA shielded module",
        dimensions: "24.0 × 24.0 × 2.4 mm",
        basePosition: [0.75, 0.12, 0.05],
        explodeOffset: [0.35, 0.95, 0],
        color: "#94a3b8",
      },
      {
        id: "antenna",
        name: "External SMA Whip Antenna",
        role: "700–2600 MHz multiband cellular antenna mounted outside pit lid.",
        material: "TPE radome + brass SMA",
        dimensions: "Ø 10 × 140 mm",
        basePosition: [0.95, 1.05, 0],
        explodeOffset: [0.55, 1.55, 0],
        color: "#111827",
      },
    ],
    pins: [
      { pin: "J1-1", name: "VBAT+", signalType: "power", voltage: "3.6 V", description: "Primary Li-SOCl2 battery positive terminal", position: [-0.75, 0.25, 0.38] },
      { pin: "J2-1", name: "PULSE_IN", signalType: "gpio", voltage: "3.3 V", description: "Interrupt-driven Hall sensor pulse input", position: [0.0, -0.55, 0.25] },
      { pin: "U2-TX", name: "MODEM_UART", signalType: "comm", voltage: "1.8 / 3.3 V", description: "AT command & PPP serial interface to LTE modem", position: [0.45, 0.12, 0.2] },
      { pin: "J3-RF", name: "SMA_RF", signalType: "rf", voltage: "50 Ω", description: "50-ohm cellular antenna feed", position: [0.95, 0.35, 0] },
      { pin: "J1-2", name: "GND", signalType: "ground", voltage: "0 V", description: "System ground plane", position: [-0.75, 0.05, -0.35] },
    ],
    wiring: [
      { from: "Flow Sensor", to: "MCU Interrupt Pin", signal: "PULSE_IN", protocol: "Open-Collector Pulse", color: "#13d3f2" },
      { from: "Li-SOCl2 Cell", to: "Buck / Supercap", signal: "3.6V VBAT", protocol: "DC Power", color: "#ef4444" },
      { from: "MCU", to: "LTE Modem", signal: "UART TX/RX + PWRKEY", protocol: "AT Commands", color: "#3b82f6" },
      { from: "LTE Modem", to: "SMA Antenna", signal: "RF_ANT", protocol: "50 Ω Coax", color: "#a855f7" },
    ],
    architecture: [
      { layer: "Sensing", title: "Hall-Effect Flow Turbine", detail: "Generates pulse train proportional to volumetric flow (L/min)." },
      { layer: "Edge Compute", title: "Low-Power MCU", detail: "Accumulates litres in RTC memory; detects leak or reverse flow." },
      { layer: "Backhaul", title: "LTE Cat 1 / NB-IoT", detail: "Wakes once per interval to push JSON/CBOR payload via TLS." },
      { layer: "Cloud", title: "MQTT Broker & Dashboard", detail: "Ingests meter readings into time-series telemetry storage." },
    ],
  },
  {
    slug: "lm358-ic",
    name: "LM358 Dual Op-Amp (DIP-8)",
    subtitle: "Industry-standard dual operational amplifier with full 8-pin inspection",
    category: "Integrated Circuit",
    fidelity: "illustrative",
    fidelityNote: "Standard JEDEC MS-001 DIP-8 parametric geometry for pinout and circuit study.",
    sourceLabel: "illustrative",
    kbHref: "/components/ti-lm358",
    dimensionsSummary: "9.81 × 6.35 × 4.57 mm",
    pcbFootprint: {
      widthMm: 9.81,
      heightMm: 7.62,
      pitchMm: 2.54,
      packageName: "DIP-8 (300 mil row spacing, 2.54 mm pitch)",
      keepoutNote: "Place 100 nF ceramic decoupling capacitor within 5 mm of Pin 8 (VCC) and Pin 4 (GND).",
    },
    parts: [
      {
        id: "epoxy-body",
        name: "Molded Epoxy Package",
        role: "Encapsulates silicon die and protects wire bonds; Pin 1 notch on left.",
        material: "Thermoset epoxy molding compound",
        dimensions: "9.81 × 6.35 × 3.3 mm",
        basePosition: [0, 0.1, 0],
        explodeOffset: [0, 0.6, 0],
        color: "#1e293b",
      },
      {
        id: "silicon-die",
        name: "Dual Op-Amp Silicon Die",
        role: "Monolithic bipolar die containing two independent high-gain frequency-compensated op-amps.",
        material: "Doped silicon + Al metallization",
        dimensions: "1.8 × 1.5 × 0.3 mm",
        basePosition: [0, 0.08, 0],
        explodeOffset: [0, 0.15, 0],
        color: "#0284c7",
      },
      {
        id: "leadframe",
        name: "Copper Alloy Leadframe (8 Pins)",
        role: "Provides mechanical mounting and electrical path from die pads to PCB.",
        material: "Tin-plated copper alloy",
        dimensions: "2.54 mm pin pitch",
        basePosition: [0, -0.08, 0],
        explodeOffset: [0, -0.35, 0],
        color: "#cbd5e1",
      },
    ],
    pins: [
      { pin: "1", name: "OUT1", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 1 Amplifier Output", position: [-0.75, -0.15, 0.45] },
      { pin: "2", name: "IN1-", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 1 Inverting Input", position: [-0.25, -0.15, 0.45] },
      { pin: "3", name: "IN1+", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 1 Non-Inverting Input", position: [0.25, -0.15, 0.45] },
      { pin: "4", name: "GND / V-", signalType: "ground", voltage: "0 V", description: "Negative Supply / Ground", position: [0.75, -0.15, 0.45] },
      { pin: "5", name: "IN2+", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 2 Non-Inverting Input", position: [0.75, -0.15, -0.45] },
      { pin: "6", name: "IN2-", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 2 Inverting Input", position: [0.25, -0.15, -0.45] },
      { pin: "7", name: "OUT2", signalType: "analog", voltage: "0 to VCC-1.5V", description: "Channel 2 Amplifier Output", position: [-0.25, -0.15, -0.45] },
      { pin: "8", name: "VCC / V+", signalType: "power", voltage: "3.0–32 V", description: "Positive Supply Voltage", position: [-0.75, -0.15, -0.45] },
    ],
    wiring: [
      { from: "Pin 8 (VCC)", to: "5V / 12V Rail", signal: "Supply +", protocol: "DC Power + 100nF Cap", color: "#ef4444" },
      { from: "Pin 4 (GND)", to: "System Ground", signal: "0V Ref", protocol: "Ground", color: "#64748b" },
      { from: "Sensor Bridge", to: "Pin 3 (IN1+)", signal: "mV Differential", protocol: "Analog Input", color: "#f59e0b" },
      { from: "Pin 1 (OUT1)", to: "MCU ADC Pin", signal: "Amplified 0–3.3V", protocol: "Analog Output", color: "#13d3f2" },
    ],
    architecture: [
      { layer: "Input Stage", title: "PNP Differential Pair", detail: "Allows common-mode input sensing all the way down to ground (0V)." },
      { layer: "Gain Stage", title: "Class-A Voltage Gain", detail: "100 dB typical open-loop DC voltage gain with internal 30 pF compensation." },
      { layer: "Output Stage", title: "Push-Pull Emitter Follower", detail: "Sources up to 20–40 mA; swings within 1.5V of VCC." },
    ],
  },
  {
    slug: "hc-sr04-3d",
    name: "HC-SR04 Ultrasonic Sensor",
    subtitle: "40 kHz time-of-flight distance ranging module",
    category: "Sensor Module",
    fidelity: "illustrative",
    fidelityNote: "Parametric 3D representation matching standard 45 × 20 mm HC-SR04 board geometry.",
    sourceLabel: "illustrative",
    kbHref: "/sensors/hc-sr04",
    dimensionsSummary: "45.0 × 20.0 × 15.0 mm",
    pcbFootprint: {
      widthMm: 45.0,
      heightMm: 20.0,
      pitchMm: 2.54,
      packageName: "4-pin Right-Angle Header",
      keepoutNote: "Keep front face of both Ø16 mm acoustic transducers unobstructed (±15° cone).",
    },
    parts: [
      {
        id: "pcb",
        name: "Blue Carrier PCB",
        role: "Holds 40 kHz driver, MAX232/comparator, crystal, and 4-pin header.",
        material: "FR-4 (1.6 mm)",
        dimensions: "45.0 × 20.0 × 1.6 mm",
        basePosition: [0, 0, 0],
        explodeOffset: [0, 0, -0.35],
        color: "#1d4ed8",
      },
      {
        id: "tx-transducer",
        name: "40 kHz TX Transducer (T)",
        role: "Piezoelectric ultrasonic emitter driven by 8-cycle 40 kHz burst.",
        material: "Aluminum housing + piezo disc",
        dimensions: "Ø 16.0 × 12.0 mm",
        basePosition: [-0.68, 0.05, 0.35],
        explodeOffset: [-0.25, 0, 0.65],
        color: "#cbd5e1",
      },
      {
        id: "rx-transducer",
        name: "40 kHz RX Transducer (R)",
        role: "Receives reflected acoustic echo and converts sound pressure to mV signal.",
        material: "Aluminum housing + piezo disc",
        dimensions: "Ø 16.0 × 12.0 mm",
        basePosition: [0.68, 0.05, 0.35],
        explodeOffset: [0.25, 0, 0.65],
        color: "#cbd5e1",
      },
      {
        id: "crystal",
        name: "4.000 MHz Quartz Crystal",
        role: "Provides timing reference for the ultrasonic control IC.",
        material: "HC-49S metal can",
        dimensions: "11.0 × 4.5 × 3.5 mm",
        basePosition: [0, 0.05, -0.15],
        explodeOffset: [0, 0.35, -0.5],
        color: "#94a3b8",
      },
    ],
    pins: [
      { pin: "1", name: "VCC", signalType: "power", voltage: "5.0 V", description: "5V DC supply (15 mA working current)", position: [-0.3, -0.45, 0] },
      { pin: "2", name: "TRIG", signalType: "gpio", voltage: "5.0 V TTL", description: "10 µs high pulse initiates 8-cycle 40 kHz burst", position: [-0.1, -0.45, 0] },
      { pin: "3", name: "ECHO", signalType: "gpio", voltage: "5.0 V TTL", description: "High pulse width proportional to round-trip time (use divider for 3.3V MCUs)", position: [0.1, -0.45, 0] },
      { pin: "4", name: "GND", signalType: "ground", voltage: "0 V", description: "Ground reference", position: [0.3, -0.45, 0] },
    ],
    wiring: [
      { from: "5V Rail", to: "Pin 1 (VCC)", signal: "5.0V", protocol: "DC Power", color: "#ef4444" },
      { from: "MCU GPIO", to: "Pin 2 (TRIG)", signal: "10 µs Pulse", protocol: "Digital Trigger", color: "#13d3f2" },
      { from: "Pin 3 (ECHO)", to: "1k/2k Divider → MCU", signal: "Echo Duration", protocol: "5V→3.3V Level Shift", color: "#f59e0b" },
      { from: "GND", to: "Pin 4 (GND)", signal: "0V", protocol: "Ground", color: "#64748b" },
    ],
    architecture: [
      { layer: "Trigger", title: "10 µs MCU Pulse", detail: "Control IC fires eight 40 kHz ultrasonic cycles via TX transducer." },
      { layer: "Acoustic", title: "Time-of-Flight Propagation", detail: "Sound travels at ~343 m/s (20°C) and reflects off target object." },
      { layer: "Detection", title: "Amplifier + Comparator", detail: "RX signal amplified and thresholded to pull ECHO line low." },
      { layer: "Calculation", title: "Distance = (t × 343) / 2", detail: "MCU measures ECHO high time in microseconds." },
    ],
  },
  {
    slug: "rover-chassis",
    name: "Differential-Drive Rover Platform",
    subtitle: "2WD autonomous mobile robot chassis with motors, LiPo & compute",
    category: "Robotics",
    fidelity: "illustrative",
    fidelityNote: "Parametric assembly illustrating motor, driver, battery and SBC placement.",
    sourceLabel: "illustrative",
    dimensionsSummary: "240 × 180 × 95 mm",
    pcbFootprint: {
      widthMm: 160,
      heightMm: 110,
      pitchMm: 2.54,
      packageName: "Aluminum Chassis Deck + Controller Stack",
      keepoutNote: "Isolate high-current motor driver ground return from IMU/logic ground using star grounding.",
    },
    parts: [
      {
        id: "chassis",
        name: "Anodized Aluminum Deck",
        role: "Rigid structural baseplate with M3 mounting slots.",
        material: "2 mm 5052 Aluminum",
        dimensions: "220 × 140 × 2 mm",
        basePosition: [0, 0, 0],
        explodeOffset: [0, 0, 0],
        color: "#334155",
      },
      {
        id: "left-wheel",
        name: "Left Drive Wheel + Gearmotor",
        role: "12V DC geared motor with quadrature Hall encoder.",
        material: "Rubber tire + steel gearbox",
        dimensions: "Ø 65 × 26 mm",
        basePosition: [0, -0.15, 0.85],
        explodeOffset: [0, -0.25, 0.55],
        color: "#0f172a",
      },
      {
        id: "right-wheel",
        name: "Right Drive Wheel + Gearmotor",
        role: "12V DC geared motor with quadrature Hall encoder.",
        material: "Rubber tire + steel gearbox",
        dimensions: "Ø 65 × 26 mm",
        basePosition: [0, -0.15, -0.85],
        explodeOffset: [0, -0.25, -0.55],
        color: "#0f172a",
      },
      {
        id: "lipo",
        name: "3S 11.1V LiPo Battery Pack",
        role: "High-discharge power pack supplying motor driver and 5V buck converter.",
        material: "Lithium-polymer pouch pack",
        dimensions: "105 × 34 × 22 mm",
        basePosition: [-0.45, 0.2, 0],
        explodeOffset: [-0.35, 0.6, 0],
        color: "#1d4ed8",
      },
      {
        id: "motor-driver",
        name: "Dual H-Bridge Motor Driver",
        role: "Drives both DC motors via PWM speed and direction control.",
        material: "FR-4 + heatsink",
        dimensions: "43 × 43 × 27 mm",
        basePosition: [0.35, 0.18, 0],
        explodeOffset: [0.3, 0.55, 0],
        color: "#dc2626",
      },
      {
        id: "compute",
        name: "ROS 2 Companion Computer",
        role: "Runs odometry, SLAM, and MQTT telemetry bridge.",
        material: "Single-board computer",
        dimensions: "85 × 56 × 17 mm",
        basePosition: [0, 0.52, 0],
        explodeOffset: [0, 1.15, 0],
        color: "#065f46",
      },
    ],
    pins: [
      { pin: "PWR-1", name: "VBAT (11.1V)", signalType: "power", voltage: "9.6–12.6 V", description: "3S LiPo main power bus to motor driver & buck", position: [-0.45, 0.25, 0.2] },
      { pin: "DRV-L", name: "PWM_LEFT", signalType: "gpio", voltage: "3.3 V PWM", description: "Left motor speed & direction control", position: [0.35, 0.22, 0.35] },
      { pin: "DRV-R", name: "PWM_RIGHT", signalType: "gpio", voltage: "3.3 V PWM", description: "Right motor speed & direction control", position: [0.35, 0.22, -0.35] },
      { pin: "ENC-1", name: "QUAD_A/B", signalType: "comm", voltage: "3.3 V", description: "Quadrature encoder feedback pulses", position: [0, -0.1, 0.65] },
      { pin: "SBC-ETH", name: "ROS2_WIFI", signalType: "rf", voltage: "2.4 / 5 GHz", description: "Telemetry & teleoperation link", position: [0, 0.6, 0] },
    ],
    wiring: [
      { from: "3S LiPo (11.1V)", to: "Dual H-Bridge + 5V Buck", signal: "Main Power", protocol: "XT60 / High Current", color: "#ef4444" },
      { from: "5V 3A Buck", to: "Companion Computer", signal: "5.0V Logic", protocol: "Regulated DC", color: "#f59e0b" },
      { from: "Companion Computer", to: "Motor Driver", signal: "PWM + DIR", protocol: "20 kHz PWM", color: "#13d3f2" },
      { from: "Wheel Encoders", to: "MCU / Compute", signal: "Channel A/B", protocol: "Quadrature", color: "#3b82f6" },
    ],
    architecture: [
      { layer: "Actuation", title: "Gearmotors + H-Bridge", detail: "Differential wheel velocities control linear and angular motion." },
      { layer: "Feedback", title: "Quadrature Encoders", detail: "Tracks wheel ticks for closed-loop PID velocity & odometry." },
      { layer: "Autonomy", title: "ROS 2 Compute Stack", detail: "Fuses wheel odometry and IMU for navigation." },
      { layer: "Cloud", title: "ROS 2 ↔ MQTT Bridge", detail: "Streams battery state, pose and alerts to fleet dashboard." },
    ],
  },
];

export function getExplorerModel(slug?: string): Explorer3DModel {
  if (!slug) return EXPLORER_3D_MODELS[0]!;
  return EXPLORER_3D_MODELS.find((m) => m.slug === slug) ?? EXPLORER_3D_MODELS[0]!;
}

export function isValidViewMode(mode: string): mode is ExplorerViewMode {
  return EXPLORER_VIEW_MODES.some((v) => v.id === mode);
}

