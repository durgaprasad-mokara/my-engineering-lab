import {
  demoCatalogueAntennas,
  demoCatalogueCommunication,
  demoCatalogueComponents,
  demoCatalogueMcus,
  demoCatalogueSensors,
} from "@/lib/data/demo";

export const ASSISTANT_20_STEPS: { step: number; title: string; question: string }[] = [
  { step: 1, title: "Application Domain", question: "What is the target application (e.g. water meter, energy meter, railway, robotics)?" },
  { step: 2, title: "Measured Parameters", question: "Which physical quantities must be measured and at what range/accuracy?" },
  { step: 3, title: "Sampling & Reporting Rate", question: "How often do you sample sensors vs transmit packets to the cloud?" },
  { step: 4, title: "Operating Environment", question: "Temperature range, ingress protection (IP67/IP68), indoor/underground, or hazardous?" },
  { step: 5, title: "Power Source", question: "Mains AC/DC, rechargeable Li-ion + solar, or primary Li-SOCl2 battery?" },
  { step: 6, title: "Target Battery Life", question: "Required autonomous runtime (e.g. 5–10 years for utility meters)?" },
  { step: 7, title: "Connectivity Bearer", question: "Cellular (NB-IoT/LTE Cat 1), LoRaWAN, BLE/Wi-Fi, or wired RS-485/CAN?" },
  { step: 8, title: "Target Region & Spectrum", question: "Deployment country for spectrum rules (e.g. India WPC IN865, EU868, US915)?" },
  { step: 9, title: "Sensor Selection", question: "Confirm sensor transduction principle, output interface, and calibration needs." },
  { step: 10, title: "Signal Conditioning", question: "Need op-amp gain, ADC resolution, isolation, or 5V→3.3V level shifting?" },
  { step: 11, title: "MCU / Compute Choice", question: "Select ultra-low-power MCU vs edge-AI SoC matching RAM/Flash/peripherals." },
  { step: 12, title: "Antenna & Enclosure Fit", question: "Internal FPC/chip/helical vs external SMA puck, and ground-plane clearance." },
  { step: 13, title: "5-Configuration Trade-off", question: "Compare 5 candidate hardware architectures across cost, power, and scalability." },
  { step: 14, title: "Preliminary BOM", question: "Verify part numbers, manufacturer datasheets, and stale/missing pricing." },
  { step: 15, title: "Schematic & ERC", question: "Check voltage compatibility, current budget, and bus pull-ups." },
  { step: 16, title: "PCB Stack-up & Layout", question: "Plan 2/4-layer stack-up, 50 Ω RF microstrip, and KiCad netlist export." },
  { step: 17, title: "Firmware Architecture", question: "Select ESP-IDF/FreeRTOS/Zephyr/STM32 HAL, sleep states, and watchdog." },
  { step: 18, title: "Cloud & MQTT Schema", question: "Define MQTT/CoAP topics, payload encoding (JSON/CBOR), and alert thresholds." },
  { step: 19, title: "Security & OTA", question: "Plan TLS 1.3/DTLS, X.509 device keys, and signed OTA updates." },
  { step: 20, title: "Bench & Field Test Plan", question: "Define current-profile, RF range, and safety validation criteria." },
];

export interface KbCitation {
  kind: string;
  title: string;
  href: string;
  sourceUrl: string | null;
}

export interface AssistantReply {
  mode: "anthropic" | "rule_based_kb";
  answer: string;
  citations: KbCitation[];
  facts: string[];
  assumptions: string[];
  nextQuestions: string[];
}

// Simple sliding-window in-memory rate limiter (NFR-06)
const requestBuckets = new Map<string, number[]>();

export function checkAssistantRateLimit(
  clientKey: string,
  limit = 20,
  windowMs = 60_000,
  nowMs = Date.now(),
): { allowed: boolean; remaining: number } {
  const prev = requestBuckets.get(clientKey) ?? [];
  const recent = prev.filter((t) => nowMs - t < windowMs);
  if (recent.length >= limit) {
    requestBuckets.set(clientKey, recent);
    return { allowed: false, remaining: 0 };
  }
  recent.push(nowMs);
  requestBuckets.set(clientKey, recent);
  return { allowed: true, remaining: limit - recent.length };
}

export function retrieveKnowledgeContext(query: string): KbCitation[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length >= 2);
  const hits: { score: number; citation: KbCitation }[] = [];

  const scoreText = (text: string) =>
    terms.reduce((acc, term) => (text.toLowerCase().includes(term) ? acc + 1 : acc), 0);

  for (const c of demoCatalogueComponents()) {
    const s = scoreText(`${c.name} ${c.partNumber ?? ""} ${c.category} ${c.description ?? ""} ${c.applications.join(" ")}`);
    if (s > 0) hits.push({ score: s, citation: { kind: "Component", title: c.name, href: `/components/${c.slug}`, sourceUrl: c.sourceUrl } });
  }
  for (const sen of demoCatalogueSensors()) {
    const s = scoreText(`${sen.name} ${sen.measurand} ${sen.sensorGroup} ${sen.applications.join(" ")}`);
    if (s > 0) hits.push({ score: s, citation: { kind: "Sensor", title: sen.name, href: `/sensors/${sen.slug}`, sourceUrl: sen.sourceUrl } });
  }
  for (const mcu of demoCatalogueMcus()) {
    const s = scoreText(`${mcu.name} ${mcu.vendor} ${mcu.wireless.join(" ")} ${mcu.applications.join(" ")}`);
    if (s > 0) hits.push({ score: s, citation: { kind: "MCU", title: mcu.name, href: `/microcontrollers/${mcu.slug}`, sourceUrl: mcu.sourceUrl } });
  }
  for (const comm of demoCatalogueCommunication()) {
    const s = scoreText(`${comm.name} ${comm.category} ${comm.standard} ${comm.applications.join(" ")}`);
    if (s > 0) hits.push({ score: s, citation: { kind: "Protocol", title: comm.name, href: `/communication/${comm.slug}`, sourceUrl: comm.sourceUrl } });
  }
  for (const ant of demoCatalogueAntennas()) {
    const s = scoreText(`${ant.name} ${ant.antennaType} ${ant.services.join(" ")} ${ant.applications.join(" ")}`);
    if (s > 0) hits.push({ score: s, citation: { kind: "Antenna", title: ant.name, href: `/antennas/${ant.slug}`, sourceUrl: ant.sourceUrl } });
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((h) => h.citation);
}

export function buildRuleBasedAssistantReply(prompt: string): AssistantReply {
  const citations = retrieveKnowledgeContext(prompt);
  const lower = prompt.toLowerCase();

  const facts: string[] = [];
  const assumptions: string[] = [];
  const nextQuestions: string[] = [];

  if (lower.includes("water") || lower.includes("flow")) {
    facts.push("Hall-effect turbine sensors (e.g. YF-S201) output frequency proportional to flow (K-factor pulses/L).");
    facts.push("NB-IoT (+20 dB MCL) and LoRaWAN IN865 (865–867 MHz, 1W WPC India) offer strong pit penetration.");
    assumptions.push("Assumed underground meter pit environment requiring IP68 enclosure and primary Li-SOCl2 battery.");
    nextQuestions.push("What is the pipe diameter (DN15/DN20/DN25) and expected daily reporting interval?");
  } else if (lower.includes("railway") || lower.includes("bridge")) {
    facts.push("Railway track and bridge instrumentation are safety-critical and labelled Research/Educational prototypes only.");
    facts.push("RS-485 / CAN bus suits local bridge spans; LTE Cat 1 or LoRaWAN IN865 suits trackside backhaul.");
    assumptions.push("Assumed non-intrusive clamp mounting without interfacing with railway signaling track circuits.");
    nextQuestions.push("What sampling rate (Hz) is required for dynamic strain or vibration events?");
  } else {
    facts.push(
      citations.length > 0
        ? `Matched ${citations.length} sourced records in the Engineering Knowledge Base.`
        : "No exact keyword match found in the local catalogue; showing general 20-step workflow guidance.",
    );
    assumptions.push("ANTHROPIC_API_KEY is not configured — running deterministic Knowledge Base synthesis rather than Claude.");
    nextQuestions.push("What are your power budget, target environment, and communication range constraints?");
  }

  const citationList =
    citations.length > 0
      ? citations.map((c) => `- **${c.kind}:** ${c.title} (${c.href})`).join("\n")
      : "- Browse `/components`, `/sensors`, `/microcontrollers`, `/communication`, and `/antennas` for sourced datasheets.";

  const answer = [
    `**Knowledge Base Synthesis** _(Rule-based fallback; set \`ANTHROPIC_API_KEY\` in \`.env.local\` for live Claude reasoning)_`,
    "",
    `For your requirement: _"${prompt.trim()}"_`,
    "",
    "**Matched Knowledge Base Records:**",
    citationList,
    "",
    "**Recommended Next Workflow Steps:**",
    "1. Verify electrical & power constraints in [Hardware Architecture](/hardware-architecture).",
    "2. Validate voltage levels and bus compatibility in [Circuit Designer](/circuit-designer).",
    "3. Run link-budget and battery-runtime math in [Engineering Calculators](/calculators).",
  ].join("\n");

  return {
    mode: "rule_based_kb",
    answer,
    citations,
    facts,
    assumptions,
    nextQuestions,
  };
}

