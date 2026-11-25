import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Antenna,
  Binary,
  Boxes,
  Bot,
  Calculator,
  CalendarDays,
  CircuitBoard,
  Cloud,
  Cpu,
  Factory,
  FileText,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Network,
  Radio,
  Rotate3d,
  Settings,
  Sparkles,
  UserRound,
  Waypoints,
  Workflow,
  Gauge,
  Layers,
} from "lucide-react";

export type NavStatus = "available" | "planned";

export interface NavItem {
  /** Route segment, unique. */
  slug: string;
  href: string;
  title: string;
  icon: LucideIcon;
  group: NavGroupId;
  /** Roadmap phase that delivers the section's main functionality. */
  phase: number;
  status: NavStatus;
  summary: string;
  /** What the section will do when delivered (shown on status pages). */
  capabilities: string[];
  /** External services, hardware or accounts the section needs. */
  dependencies?: string[];
  keywords?: string[];
}

export type NavGroupId =
  | "overview"
  | "knowledge"
  | "design"
  | "projects"
  | "code"
  | "systems"
  | "intelligence"
  | "learning"
  | "workspace";

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "knowledge", label: "Knowledge Base" },
  { id: "design", label: "Design & Build" },
  { id: "projects", label: "Projects" },
  { id: "code", label: "Code & Compute" },
  { id: "systems", label: "Systems & Cloud" },
  { id: "intelligence", label: "Intelligence" },
  { id: "learning", label: "Learning" },
  { id: "workspace", label: "Workspace" },
];

const item = (i: Omit<NavItem, "href">): NavItem => ({ ...i, href: `/${i.slug}` });

export const NAV_ITEMS: NavItem[] = [
  item({
    slug: "dashboard", title: "Dashboard", icon: LayoutDashboard, group: "overview", phase: 1, status: "available",
    summary: "Engineering ecosystem overview: statistics, telemetry, projects, tasks and quick calculators.",
    capabilities: ["Live database statistics or labelled demo data", "Illustrative 3D telemetry device", "Quick calculators"],
  }),
  item({
    slug: "components", title: "Components Library", icon: Boxes, group: "knowledge", phase: 2, status: "planned",
    summary: "Searchable, categorised database of passive, semiconductor, IC, power and connector components.",
    capabilities: [
      "Category tree (passive, semiconductor, ICs, power electronics, connectors)",
      "Full component record: principle, internal structure, pinout, ratings, package, interfaces",
      "Per-value provenance (verified / typical / estimated) with manufacturer datasheet links",
      "Compatible and alternative components",
    ],
    dependencies: ["Public manufacturer datasheets"],
    keywords: ["resistor", "capacitor", "mosfet", "op-amp", "ldo", "usb-c"],
  }),
  item({
    slug: "sensors", title: "Sensors Library", icon: Gauge, group: "knowledge", phase: 2, status: "planned",
    summary: "Sensor knowledge base with 21 attributes per sensor and five-way comparison.",
    capabilities: [
      "Distance, environmental, motion, industrial, water and navigation sensors",
      "Measurement principle, range, accuracy, resolution, repeatability, response time",
      "Calibration procedures and environmental limits",
      "Compare five sensors on accuracy, cost, range, power, reliability, interface, maintenance",
    ],
    keywords: ["flow", "ultrasonic", "lidar", "radar", "imu", "load cell", "strain gauge"],
  }),
  item({
    slug: "microcontrollers", title: "Microcontrollers", icon: Cpu, group: "knowledge", phase: 2, status: "planned",
    summary: "Development boards and processors with a board selection assistant.",
    capabilities: [
      "Arduino, ESP32/ESP8266, STM32, RP2040/Pico, nRF52, Raspberry Pi, Jetson, NXP, TI, Renesas, Qualcomm",
      "Architecture, CPU, memory, peripherals (ADC, DAC, PWM, UART, SPI, I2C, CAN, USB), wireless, power",
      "Side-by-side comparison and requirement-driven selection",
    ],
    keywords: ["esp32", "stm32", "arduino", "raspberry pi", "rp2040", "nrf52", "jetson"],
  }),
  item({
    slug: "communication", title: "Communication Technologies", icon: Radio, group: "knowledge", phase: 3, status: "planned",
    summary: "Cellular, LPWAN, wired and application protocols with an application-suitability comparison engine.",
    capabilities: [
      "2G to 5G, LTE Cat 1 / 1bis / 4, LTE-M, NB-IoT",
      "LoRa/LoRaWAN, BLE, Zigbee, Z-Wave, Thread, Wi-Fi HaLow",
      "UART, SPI, I2C, RS-232/485, Modbus RTU/TCP, CAN, Ethernet, USB",
      "MQTT, MQTT-SN, HTTP(S), CoAP, WebSocket, OPC UA",
      "Suitability for water/energy meters, railway, agriculture, industrial automation with regional spectrum notes",
    ],
    keywords: ["4g", "5g", "nb-iot", "lorawan", "mqtt", "modbus", "rs-485"],
  }),
  item({
    slug: "antennas", title: "Antennas Library", icon: Antenna, group: "knowledge", phase: 3, status: "planned",
    summary: "Antenna learning and selection with interactive radiation patterns.",
    capabilities: [
      "Cellular, LoRa, GNSS, Wi-Fi, BLE; PCB, FPC, ceramic, dipole, monopole, patch, Yagi, helical",
      "Gain, impedance, VSWR, return loss, polarisation, bandwidth, ground plane, matching",
      "Radiation pattern visualisation",
      "Selection guidance for 4G telemetry, 5G, LoRaWAN gateways, GPS tracking",
    ],
    keywords: ["vswr", "dbi", "u.fl", "sma", "gnss"],
  }),
  item({
    slug: "explorer-3d", title: "3D Component Explorer", icon: Rotate3d, group: "knowledge", phase: 4, status: "planned",
    summary: "Interactive 3D workspace to inspect components, pins and assemblies.",
    capabilities: [
      "Rotate, zoom, pan, select, inspect pins, labels",
      "3D, exploded, pinout, circuit, PCB, wiring and architecture views",
      "Hover tooltips and specification panels",
      "Clear labelling of illustrative vs manufacturer CAD models",
    ],
    dependencies: ["3D models (glTF); manufacturer CAD where licensing allows"],
  }),
  item({
    slug: "circuit-designer", title: "Circuit Designer", icon: Workflow, group: "design", phase: 5, status: "planned",
    summary: "Block diagrams, wiring diagrams and schematics with electrical rule checks.",
    capabilities: [
      "Component placement and pin connections",
      "Voltage, current and pin-compatibility rule checks",
      "Distinct block / wiring / schematic / PCB views",
      "Save and export; never labelled 'validated' without simulation",
    ],
  }),
  item({
    slug: "pcb-designer", title: "PCB Designer", icon: CircuitBoard, group: "design", phase: 5, status: "planned",
    summary: "PCB design preparation: footprints, stack-up planning and netlist export.",
    capabilities: ["Footprint assignment", "Board outline and placement planning", "Netlist export for KiCad"],
    dependencies: ["KiCad (local) for routing and Gerber output"],
  }),
  item({
    slug: "hardware-architecture", title: "Hardware Architecture", icon: Network, group: "design", phase: 5, status: "planned",
    summary: "Requirement-driven hardware configuration engine with five ranked alternatives and editable BOM.",
    capabilities: [
      "Identify sensor, MCU, modem, antenna, power, battery, PCB, enclosure, connectors, protection",
      "Five configurations compared on cost, compatibility, performance, power, battery life, accuracy, scalability",
      "Editable BOM with part numbers, datasheets, prices and availability where reliable",
      "Missing or unverified data flagged",
    ],
  }),
  item({
    slug: "iot-builder", title: "IoT Project Builder", icon: Waypoints, group: "projects", phase: 7, status: "planned",
    summary: "Standardised 22-section engineering workflow for IoT projects.",
    capabilities: [
      "Water, energy, railway, industrial, agriculture and smart-city templates",
      "Requirements → architecture → hardware → firmware → cloud → testing → deployment",
      "Reference project: Smart Water Meter (pulse counting, K-factor, leak detection)",
    ],
  }),
  item({
    slug: "robotics-builder", title: "Robotics Project Builder", icon: Bot, group: "projects", phase: 8, status: "planned",
    summary: "Robotics workspace: arms, mobile and autonomous robots, drones.",
    capabilities: ["Motor and driver selection", "Encoders, IMUs, controllers, power systems", "ROS 2 templates and navigation"],
    dependencies: ["ROS 2 (local install) for running templates"],
  }),
  item({
    slug: "iot-robotics", title: "IoT + Robotics Projects", icon: Activity, group: "projects", phase: 8, status: "planned",
    summary: "Connected robots: cloud-controlled arms, inspection and agricultural robots.",
    capabilities: ["Sensor → controller → actuator → gateway → cloud data flow", "ROS 2 ↔ MQTT bridging"],
  }),
  item({
    slug: "code-lab", title: "Embedded Code Lab", icon: Binary, group: "code", phase: 9, status: "planned",
    summary: "Monaco-based embedded IDE with firmware templates matched to your hardware.",
    capabilities: [
      "C, C++, Arduino, ESP-IDF, STM32, MicroPython, FreeRTOS, Zephyr, PlatformIO",
      "Project structure, libraries, pin config, drivers, comms, error handling, power management",
      "File management, copy, download, version history",
      "Build status shown as 'untested' until actually compiled",
    ],
    dependencies: ["Optional compile service (PlatformIO in a container)"],
  }),
  item({
    slug: "calculators", title: "Engineering Calculators", icon: Calculator, group: "code", phase: 6, status: "planned",
    summary: "Mechanical, electrical, fluid, communication and battery calculators.",
    capabilities: [
      "Formula, variables, units, steps, result, assumptions and limitations on every calculator",
      "Link budget, FSPL, wavelength, data rate",
      "Battery runtime with duty cycle and sleep current",
    ],
  }),
  item({
    slug: "simulation", title: "Engineering Simulation", icon: FlaskConical, group: "code", phase: 6, status: "planned",
    summary: "Basic engineering simulations (transients, power profiles, signal processing).",
    capabilities: ["RC/RL transients", "Duty-cycle power profiles", "Vibration signal FFT examples"],
  }),
  item({
    slug: "gateway-cloud", title: "Gateway & Cloud", icon: Cloud, group: "systems", phase: 11, status: "planned",
    summary: "Gateways, MQTT, device registration, telemetry processing and alerts.",
    capabilities: [
      "LoRaWAN, cellular, industrial, Ethernet and Raspberry Pi gateways",
      "AWS IoT Core, Azure IoT, Google Cloud patterns; MQTT brokers; REST APIs",
      "Device registry, telemetry ingest, dashboards, alerts",
    ],
    dependencies: ["MQTT broker (hosted or self-hosted)", "Optional cloud provider accounts"],
  }),
  item({
    slug: "industrial", title: "Industrial Applications", icon: Factory, group: "systems", phase: 7, status: "planned",
    summary: "Smart metering, railway and bridge monitoring, predictive maintenance, plus industry research.",
    capabilities: [
      "Railway track and bridge load monitoring (research prototypes, safety disclaimers)",
      "Predictive maintenance and machine monitoring",
      "Company technology research with sources and research dates",
    ],
  }),
  item({
    slug: "digital-twin", title: "Digital Twin", icon: Layers, group: "systems", phase: 11, status: "planned",
    summary: "Digital twins bound to live device telemetry.",
    capabilities: ["3D device twin driven by telemetry", "State history and anomaly overlays"],
    dependencies: ["Phase 11 telemetry pipeline"],
  }),
  item({
    slug: "assistant", title: "AI Engineering Assistant", icon: Sparkles, group: "intelligence", phase: 10, status: "planned",
    summary: "Claude-powered assistant that turns requirements into complete engineering solutions.",
    capabilities: [
      "Understands natural-language requirements and asks for missing specs",
      "Recommends sensors, MCUs, modems, antennas with reasoning and alternatives",
      "Five configurations, BOM, wiring, firmware, battery and cloud architecture",
      "Separates facts from assumptions and cites datasheets",
    ],
    dependencies: ["Anthropic API key (server-side)"],
    keywords: ["ai", "claude", "chat"],
  }),
  item({
    slug: "academy", title: "Learning Academy", icon: GraduationCap, group: "learning", phase: 12, status: "planned",
    summary: "Structured 365-day roadmap from electronics fundamentals to capstone projects.",
    capabilities: [
      "12 months: electronics → MCUs → sensors → embedded → comms → PCB → IoT → robotics → RTOS → industrial → AI → capstone",
      "Daily objective, theory, components, exercise, coding, calculation, quiz, milestone",
      "Progress tracking and next-activity suggestions",
    ],
  }),
  item({
    slug: "calendar", title: "Daily Learning Calendar", icon: CalendarDays, group: "learning", phase: 12, status: "planned",
    summary: "Personal engineering calendar with reminders.",
    capabilities: [
      "Daily tasks, weekly goals, monthly milestones, deadlines",
      "Missed-task tracking and rescheduling",
      "Reminders: in-app, browser (tab open), email (app closed)",
    ],
    dependencies: ["Email provider for reminders when the app is closed"],
  }),
  item({
    slug: "projects", title: "My Projects", icon: FolderKanban, group: "workspace", phase: 7, status: "planned",
    summary: "Project management workspace: requirements, configurations, firmware, tests, docs, versions.",
    capabilities: [
      "Create, edit, duplicate, archive, export",
      "Status lifecycle: Planning → Research → Design → Development → Testing → Completed",
      "Tasks, milestones, version history",
    ],
  }),
  item({
    slug: "documentation", title: "Documentation", icon: FileText, group: "workspace", phase: 1, status: "available",
    summary: "Platform documentation: PRD, architecture, database, design system, roadmap and progress reports.",
    capabilities: ["Read all platform planning documents in-app"],
    keywords: ["prd", "architecture", "schema", "roadmap"],
  }),
  item({
    slug: "profile", title: "Profile & Progress", icon: UserRound, group: "workspace", phase: 1, status: "available",
    summary: "Your engineering profile, goals and progress.",
    capabilities: ["Display name, headline, time zone, learning goals", "Skill and progress tracking (expands in Phase 12)"],
  }),
  item({
    slug: "settings", title: "Settings", icon: Settings, group: "workspace", phase: 1, status: "available",
    summary: "Preferences: region, units and reminder time.",
    capabilities: ["Region (for spectrum guidance), unit system, reminder time"],
  }),
];

export const NAV_BY_SLUG = new Map(NAV_ITEMS.map((i) => [i.slug, i]));

export const PLANNED_SECTIONS = NAV_ITEMS.filter((i) => i.status === "planned");

export function navItemsByGroup(): { id: NavGroupId; label: string; items: NavItem[] }[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: NAV_ITEMS.filter((i) => i.group === g.id) })).filter(
    (g) => g.items.length > 0,
  );
}

export function findNavItem(pathname: string): NavItem | undefined {
  const first = pathname.split("/").filter(Boolean)[0];
  return first ? NAV_BY_SLUG.get(first) : undefined;
}

/** Simple case-insensitive search over title, summary and keywords. */
export function searchNav(query: string): NavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return NAV_ITEMS;
  return NAV_ITEMS.filter((i) =>
    [i.title, i.summary, ...(i.keywords ?? [])].some((s) => s.toLowerCase().includes(q)),
  );
}
