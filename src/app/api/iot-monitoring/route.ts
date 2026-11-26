import { NextResponse } from "next/server";
import { z } from "zod";

export interface SimulatedIotNode {
  id: string;
  name: string;
  protocol: "MQTT" | "LoRaWAN" | "BLE" | "HTTP/TLS";
  mcu: string;
  status: "online" | "warning" | "offline";
  batteryPct: number;
  rssiDbm: number;
  temperatureC: number;
  humidityPct: number;
  busVoltageV: number;
  lastSeen: string;
  dataKind: "simulated";
}

const DEMO_NODES: SimulatedIotNode[] = [
  {
    id: "node-esp32-lab-01",
    name: "Greenhouse Climate Node #1",
    protocol: "MQTT",
    mcu: "ESP32-S3",
    status: "online",
    batteryPct: 89,
    rssiDbm: -61,
    temperatureC: 24.6,
    humidityPct: 54.2,
    busVoltageV: 3.31,
    lastSeen: new Date().toISOString(),
    dataKind: "simulated",
  },
  {
    id: "node-lora-field-02",
    name: "LoRaWAN Soil & Flow Telemetry",
    protocol: "LoRaWAN",
    mcu: "STM32WL",
    status: "online",
    batteryPct: 94,
    rssiDbm: -92,
    temperatureC: 21.3,
    humidityPct: 68.0,
    busVoltageV: 3.62,
    lastSeen: new Date().toISOString(),
    dataKind: "simulated",
  },
  {
    id: "node-power-rack-03",
    name: "Bench DC Rail Monitor",
    protocol: "HTTP/TLS",
    mcu: "Raspberry Pi 4 / INA219",
    status: "warning",
    batteryPct: 100,
    rssiDbm: -48,
    temperatureC: 41.8,
    humidityPct: 38.5,
    busVoltageV: 4.82,
    lastSeen: new Date().toISOString(),
    dataKind: "simulated",
  },
];

export async function GET() {
  const jitter = (val: number, span: number) => Number((val + (Math.random() - 0.5) * span).toFixed(2));
  const nodes = DEMO_NODES.map((n) => ({
    ...n,
    temperatureC: jitter(n.temperatureC, 0.8),
    humidityPct: jitter(n.humidityPct, 1.4),
    busVoltageV: jitter(n.busVoltageV, 0.04),
    lastSeen: new Date().toISOString(),
  }));
  return NextResponse.json({ mode: "simulated", nodes });
}

const commandSchema = z.object({
  nodeId: z.string().min(1),
  command: z.enum(["ping", "sample_now", "ota_check", "reboot"]),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const parsed = commandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid device command." }, { status: 400 });
  }
  return NextResponse.json({
    accepted: true,
    mode: "simulated",
    nodeId: parsed.data.nodeId,
    command: parsed.data.command,
    executedAt: new Date().toISOString(),
  });
}

