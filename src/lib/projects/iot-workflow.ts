import type { ProjectSummary } from "@/lib/data/types";

export const PROJECT_STATUS_FLOW: ProjectSummary["status"][] = [
  "planning",
  "research",
  "design",
  "development",
  "testing",
  "completed",
];

export interface WorkflowSectionDef {
  number: number;
  id: string;
  phaseGroup: "Definition" | "Hardware" | "Design" | "Firmware & Cloud" | "Verification";
  title: string;
  prompt: string;
}

export const IOT_22_SECTIONS: WorkflowSectionDef[] = [
  { number: 1, id: "objectives", phaseGroup: "Definition", title: "Problem Statement & Objectives", prompt: "Define measurable business and engineering outcomes." },
  { number: 2, id: "environment", phaseGroup: "Definition", title: "Operational Environment", prompt: "Specify temperature range, IP ingress, vibration, and EMI conditions." },
  { number: 3, id: "regulatory", phaseGroup: "Definition", title: "Regulatory & Safety Constraints", prompt: "List WPC/FCC/CE spectrum rules and safety-critical disclaimers." },
  { number: 4, id: "functional-req", phaseGroup: "Definition", title: "Functional Requirements", prompt: "Sampling rate, reporting interval, alarms, and local display needs." },
  { number: 5, id: "non-functional-req", phaseGroup: "Definition", title: "Non-Functional Requirements", prompt: "Target battery life, unit BOM ceiling, MTBF, and OTA capability." },
  { number: 6, id: "sensing", phaseGroup: "Hardware", title: "Sensing & Transducer Selection", prompt: "Choose primary sensor, range, accuracy, and K-factor/calibration." },
  { number: 7, id: "conditioning", phaseGroup: "Hardware", title: "Signal Conditioning", prompt: "Amplifiers, anti-aliasing filters, level shifters, and ESD clamping." },
  { number: 8, id: "mcu", phaseGroup: "Hardware", title: "MCU / Compute Selection", prompt: "Select processor, RAM/Flash, peripherals, and deep-sleep current." },
  { number: 9, id: "comms", phaseGroup: "Hardware", title: "Communication & Backhaul", prompt: "Select Cellular/LPWAN/Wired bearer and transport protocol (MQTT/CoAP)." },
  { number: 10, id: "antenna", phaseGroup: "Hardware", title: "Antenna & RF Integration", prompt: "Choose antenna type, polarization, connector, and ground-plane keepout." },
  { number: 11, id: "power-budget", phaseGroup: "Hardware", title: "Power Architecture & Energy Budget", prompt: "Regulators, buck/LDO efficiency, and duty-cycle average current." },
  { number: 12, id: "battery", phaseGroup: "Hardware", title: "Battery Sizing & Protection", prompt: "Cell chemistry (Li-SOCl2/Li-ion), pulse buffering, and reverse polarity." },
  { number: 13, id: "config-compare", phaseGroup: "Design", title: "5-Configuration Trade-off Matrix", prompt: "Compare 5 candidate architectures across cost, power, and scalability." },
  { number: 14, id: "bom", phaseGroup: "Design", title: "Bill of Materials (BOM)", prompt: "Part numbers, manufacturers, datasheet URLs, and price freshness." },
  { number: 15, id: "schematic-erc", phaseGroup: "Design", title: "Schematic & Electrical Rule Checks", prompt: "Verify voltage levels, current limits, and bus pin compatibility." },
  { number: 16, id: "pcb-layout", phaseGroup: "Design", title: "PCB Stack-up & Layout Rules", prompt: "Layer count, 50 Ω RF microstrip, and star grounding." },
  { number: 17, id: "enclosure", phaseGroup: "Design", title: "Mechanical Enclosure & Mounting", prompt: "CAD clearances, gasket sealing, and RF-transparent window." },
  { number: 18, id: "firmware", phaseGroup: "Firmware & Cloud", title: "Firmware Architecture & Sleep States", prompt: "RTOS/bare-metal state machine, watchdog, and brownout recovery." },
  { number: 19, id: "cloud-schema", phaseGroup: "Firmware & Cloud", title: "Cloud & MQTT Telemetry Schema", prompt: "Topic hierarchy, binary/JSON payload, QoS, and time-series ingest." },
  { number: 20, id: "security", phaseGroup: "Firmware & Cloud", title: "Security & Device Provisioning", prompt: "TLS 1.3 / DTLS, X.509 keys, secure boot, and signed OTA." },
  { number: 21, id: "test-plan", phaseGroup: "Verification", title: "Bench & Field Test Plan", prompt: "Current profile measurement, RF range test, and soak testing." },
  { number: 22, id: "deployment", phaseGroup: "Verification", title: "Deployment & Maintenance SOP", prompt: "Commissioning checklist, calibration schedule, and end-of-life." },
];

export interface ProjectVersionSnapshot {
  version: number;
  createdAt: string;
  note: string;
  status: ProjectSummary["status"];
}

export interface WorkspaceProject extends ProjectSummary {
  description: string;
  isArchived: boolean;
  isReference: boolean;
  safetyCritical: boolean;
  safetyDisclaimer?: string;
  version: number;
  versions: ProjectVersionSnapshot[];
  sections: Record<string, string>;
}

export const REFERENCE_PROJECTS: WorkspaceProject[] = [
  {
    id: "ref-water-meter",
    name: "Smart Water Meter (4G / NB-IoT)",
    description: "Automated meter reading node with Hall-effect turbine pulse counting, K-factor calibration, leak/reverse-flow detection, and 10-year Li-SOCl2 battery.",
    kind: "iot",
    industry: "water",
    status: "design",
    updatedAt: "2026-11-26T00:00:00Z",
    isArchived: false,
    isReference: true,
    safetyCritical: false,
    version: 2,
    versions: [
      { version: 1, createdAt: "2026-11-20T10:00:00Z", note: "Initial requirements & NB-IoT selection", status: "research" },
      { version: 2, createdAt: "2026-11-26T00:00:00Z", note: "Completed power budget & 5-config matrix", status: "design" },
    ],
    sections: {
      objectives: "Measure residential/commercial water volume to ±2% accuracy and report daily totals + leak alerts over NB-IoT.",
      environment: "Underground cast-iron meter pit, -10°C to +60°C, 100% condensing humidity (IP68).",
      sensing: "Hall-effect turbine flow sensor (K = 450 pulses/L) with quadrature/dual-Hall reverse-flow detection.",
      comms: "3GPP NB-IoT (Band 8 / Band 5) with CoAP/LwM2M over DTLS to minimize handshake energy.",
      "power-budget": "3.6V 4000 mAh Li-SOCl2 + 470 mF hybrid supercapacitor; average current ~18 µA at 1 report/day.",
    },
  },
  {
    id: "ref-energy-meter",
    name: "Smart 3-Phase Energy Meter",
    description: "Industrial mains-powered power quality & billing meter with CT/shunt sensing, DLMS/COSEM over LTE Cat 1, and last-gasp outage alert.",
    kind: "iot",
    industry: "energy",
    status: "development",
    updatedAt: "2026-11-25T14:00:00Z",
    isArchived: false,
    isReference: true,
    safetyCritical: false,
    version: 1,
    versions: [
      { version: 1, createdAt: "2026-11-25T14:00:00Z", note: "Baseline Cat 1bis + isolated metrology AFE", status: "development" },
    ],
    sections: {
      objectives: "Log 15-minute kWh, kVARh, power factor, and voltage sag/swell events with remote tamper notification.",
      sensing: "Isolated energy metrology IC (ADE7953 / ATM90E36) with 100A split-core current transformers.",
      comms: "4G LTE Cat 1bis (Quectel EC200U) running MQTT over TLS 1.3.",
      "power-budget": "Mains AC-DC isolated PSU (3.3V / 5V) + supercapacitor bank for 10-second power-fail last-gasp SMS/MQTT.",
    },
  },
  {
    id: "ref-railway-track",
    name: "Railway Track Condition Monitor",
    description: "Lineside rail temperature, buckle stress, and axle-vibration event node using solar/Li-SOCl2 and LoRaWAN IN865 / LTE backhaul.",
    kind: "iot",
    industry: "railway",
    status: "research",
    updatedAt: "2026-11-24T09:00:00Z",
    isArchived: false,
    isReference: true,
    safetyCritical: true,
    safetyDisclaimer: "RESEARCH & EDUCATIONAL PROTOTYPE ONLY — Railway wayside signaling and track-integrity systems require EN 50126/50128/50129 SIL certification and independent validation by qualified railway engineers before any field deployment.",
    version: 1,
    versions: [
      { version: 1, createdAt: "2026-11-24T09:00:00Z", note: "Feasibility & WPC IN865 link budget", status: "research" },
    ],
    sections: {
      objectives: "Monitor rail neutral temperature and abnormal track-bed shock events along remote track corridors.",
      regulatory: "Research/educational prototype only. Non-intrusive clamp mounting; must not interface with signalling track circuits without SIL-4 approval.",
      comms: "LoRaWAN IN865 (1W EIRP WPC de-licensed) to solar trackside gateways every 5 km.",
    },
  },
  {
    id: "ref-railway-bridge",
    name: "Railway Bridge Load & Strain Monitor",
    description: "Multi-node structural health monitoring for girder strain, pier tilt, and modal vibration FFT during train passage.",
    kind: "iot",
    industry: "railway",
    status: "planning",
    updatedAt: "2026-11-23T18:00:00Z",
    isArchived: false,
    isReference: true,
    safetyCritical: true,
    safetyDisclaimer: "RESEARCH & EDUCATIONAL PROTOTYPE ONLY — Structural health monitoring on bridges is advisory only and must not replace certified civil-engineering inspections or structural load ratings.",
    version: 1,
    versions: [
      { version: 1, createdAt: "2026-11-23T18:00:00Z", note: "Initial instrumentation architecture", status: "planning" },
    ],
    sections: {
      objectives: "Capture synchronized dynamic strain (µε) and 3-axis acceleration (200 Hz) triggered by approaching train vibration.",
      sensing: "350 Ω Wheatstone full-bridge foil strain gauges + 24-bit ADS1256 ADC + triaxial MEMS accelerometer.",
      comms: "Wired RS-485 Modbus / CAN bus along bridge span to an LTE Cat 1 / Yagi gateway.",
    },
  },
  {
    id: "ref-industrial-vibration",
    name: "Industrial Motor Predictive Maintenance",
    description: "Edge FFT vibration & bearing temperature puck for 3-phase induction motors using RS-485 / BLE / MQTT.",
    kind: "iot",
    industry: "industrial",
    status: "testing",
    updatedAt: "2026-11-22T12:00:00Z",
    isArchived: false,
    isReference: true,
    safetyCritical: false,
    version: 1,
    versions: [
      { version: 1, createdAt: "2026-11-22T12:00:00Z", note: "Bench FFT harmonic test validation", status: "testing" },
    ],
    sections: {
      objectives: "Detect bearing inner/outer race wear and rotor unbalance early via on-node 1024-point FFT.",
      sensing: "Wide-bandwidth MEMS accelerometer (ADXL355 / IIS3DWB) + RTD PT100 housing temperature.",
      comms: "BLE 5.3 / RS-485 Modbus RTU to factory edge gateway → OPC UA / MQTT.",
    },
  },
];

export interface IndustryResearchProfile {
  id: string;
  company: string;
  focusAreas: string[];
  keyTechnologies: string[];
  summary: string;
  researchDate: string;
  sourceTitle: string;
  sourceUrl: string;
}

export const INDUSTRY_RESEARCH_PROFILES: IndustryResearchProfile[] = [
  {
    id: "ind-ti",
    company: "Texas Instruments",
    focusAreas: ["Industrial Sensing", "Sub-1 GHz RF", "Power Management", "Motor Control"],
    keyTechnologies: ["SimpleLink CC13xx/CC26xx", "Sitara AM6x", "C2000 Real-Time MCUs", "Ultrasonic Flow TDC1000"],
    summary: "Supplies ultra-low-quiescent buck converters (TPS62840), sub-GHz wireless MCUs for smart metering, and precision analog front-ends.",
    researchDate: "2026-11-25",
    sourceTitle: "TI Smart Metering & Industrial IoT Solutions",
    sourceUrl: "https://www.ti.com/applications/industrial/smart-grid-utilities/overview.html",
  },
  {
    id: "ind-bosch",
    company: "Bosch Sensortec",
    focusAreas: ["MEMS Environmental", "Inertial Measurement (IMU)", "Edge AI Sensors"],
    keyTechnologies: ["BME688 AI Gas Sensor", "BMP390/BMP280", "BHI360 Programmable IMU"],
    summary: "Pioneers ultra-miniature MEMS barometric, humidity, and programmable IMU sensors with integrated edge pattern classification.",
    researchDate: "2026-11-25",
    sourceTitle: "Bosch Sensortec Product Portfolio",
    sourceUrl: "https://www.bosch-sensortec.com/products/",
  },
  {
    id: "ind-siemens",
    company: "Siemens Industrial Automation",
    focusAreas: ["SCADA & PLC", "OPC UA", "Predictive Maintenance", "Digital Twins"],
    keyTechnologies: ["SIMATIC IOT2050", "MindSphere / Insights Hub", "PROFINET / Industrial Edge"],
    summary: "Standardizes factory-to-cloud telemetry using OPC UA, Industrial Edge gateways, and physics-informed digital twins.",
    researchDate: "2026-11-25",
    sourceTitle: "Siemens Industrial Edge & IoT",
    sourceUrl: "https://www.siemens.com/global/en/products/automation/topic-areas/industrial-edge.html",
  },
  {
    id: "ind-qualcomm",
    company: "Qualcomm",
    focusAreas: ["Cellular IoT (LTE/5G)", "Edge AI Robotics", "GNSS"],
    keyTechnologies: ["Qualcomm 9205 LTE-M/NB-IoT", "RB5 Robotics Platform", "Snapdragon Flight"],
    summary: "Provides multimode cellular IoT chipsets and heterogeneous robotics compute platforms combining DSP, NPU, and ISP.",
    researchDate: "2026-11-25",
    sourceTitle: "Qualcomm IoT & Robotics Platforms",
    sourceUrl: "https://www.qualcomm.com/internet-of-things",
  },
  {
    id: "ind-abb",
    company: "ABB",
    focusAreas: ["Industrial Robotics", "Smart Grid", "Condition Monitoring"],
    keyTechnologies: ["ABB Ability Smart Sensor", "OmniCore Controllers", "Substation Automation IEC 61850"],
    summary: "Integrates wireless vibration/temperature smart sensors directly onto electric motors, pumps, and bearings for fleet health.",
    researchDate: "2026-11-25",
    sourceTitle: "ABB Ability Smart Sensor for Motors",
    sourceUrl: "https://new.abb.com/motors-generators/service/advanced-services/abb-ability-smart-sensor",
  },
  {
    id: "ind-nvidia",
    company: "NVIDIA",
    focusAreas: ["Autonomous Robotics", "Edge Computer Vision", "ROS 2 Acceleration"],
    keyTechnologies: ["Jetson Orin Nano / AGX", "Isaac ROS", "Omniverse Digital Twins"],
    summary: "Accelerates perception, SLAM, and manipulation workloads on autonomous mobile robots using CUDA-accelerated ROS 2 packages.",
    researchDate: "2026-11-25",
    sourceTitle: "NVIDIA Jetson & Isaac Robotics",
    sourceUrl: "https://developer.nvidia.com/isaac-ros",
  },
];

export function nextProjectStatus(current: ProjectSummary["status"]): ProjectSummary["status"] {
  const idx = PROJECT_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= PROJECT_STATUS_FLOW.length - 1) return current;
  return PROJECT_STATUS_FLOW[idx + 1]!;
}

export function duplicateWorkspaceProject(project: WorkspaceProject, nowIso = new Date().toISOString()): WorkspaceProject {
  return {
    ...project,
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${project.name} (Copy)`,
    isReference: false,
    status: "planning",
    version: 1,
    updatedAt: nowIso,
    versions: [{ version: 1, createdAt: nowIso, note: `Duplicated from ${project.name}`, status: "planning" }],
    sections: { ...project.sections },
  };
}

export function exportProjectToMarkdown(project: WorkspaceProject): string {
  const lines: string[] = [
    `# ${project.name}`,
    "",
    `- **Status:** ${project.status}`,
    `- **Kind:** ${project.kind}`,
    `- **Industry:** ${project.industry ?? "general"}`,
    `- **Version:** v${project.version}`,
    "",
  ];
  if (project.safetyCritical && project.safetyDisclaimer) {
    lines.push(`> **SAFETY DISCLAIMER:** ${project.safetyDisclaimer}`, "");
  }
  lines.push("## Overview", project.description, "", "## 22-Section Engineering Specification", "");
  for (const sec of IOT_22_SECTIONS) {
    const content = project.sections[sec.id]?.trim() || "_Pending_";
    lines.push(`### ${sec.number}. ${sec.title}`, content, "");
  }
  return lines.join("\n");
}

