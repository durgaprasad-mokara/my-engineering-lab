export interface TelemetryDeviceRecord {
  id: string;
  name: string;
  deviceEui: string;
  protocol: "NB-IoT" | "LTE Cat 1" | "LoRaWAN IN865" | "MQTT / Wi-Fi";
  status: "online" | "sleep" | "alert";
  mqttTopic: string;
  lastSeenIso: string;
  metrics: {
    flowRateLpm: number;
    batteryV: number;
    rssiDbm: number;
    temperatureC: number;
    valveOpen: boolean;
  };
}

export interface TelemetryAlertRule {
  id: string;
  name: string;
  metric: keyof TelemetryDeviceRecord["metrics"];
  operator: ">" | "<";
  threshold: number;
  severity: "warning" | "critical";
}

export const DEFAULT_DEVICES: TelemetryDeviceRecord[] = [
  {
    id: "dev-wm-01",
    name: "Water Meter Pit #01",
    deviceEui: "8675309000000101",
    protocol: "NB-IoT",
    status: "online",
    mqttTopic: "lab/water/wm-01/telemetry",
    lastSeenIso: "2026-11-26T09:15:00Z",
    metrics: { flowRateLpm: 6.4, batteryV: 3.58, rssiDbm: -88, temperatureC: 24.2, valveOpen: true },
  },
  {
    id: "dev-wm-02",
    name: "Water Meter Pit #02",
    deviceEui: "8675309000000102",
    protocol: "LoRaWAN IN865",
    status: "alert",
    mqttTopic: "lab/water/wm-02/telemetry",
    lastSeenIso: "2026-11-26T09:12:00Z",
    metrics: { flowRateLpm: 24.8, batteryV: 3.05, rssiDbm: -112, temperatureC: 26.1, valveOpen: true },
  },
  {
    id: "dev-em-01",
    name: "Substation Energy Meter",
    deviceEui: "8675309000000201",
    protocol: "LTE Cat 1",
    status: "online",
    mqttTopic: "lab/energy/em-01/telemetry",
    lastSeenIso: "2026-11-26T09:18:00Z",
    metrics: { flowRateLpm: 0, batteryV: 12.1, rssiDbm: -74, temperatureC: 31.5, valveOpen: true },
  },
];

export const DEFAULT_ALERT_RULES: TelemetryAlertRule[] = [
  { id: "rule-leak", name: "High Flow / Potential Burst", metric: "flowRateLpm", operator: ">", threshold: 20, severity: "critical" },
  { id: "rule-bat", name: "Low Battery Voltage", metric: "batteryV", operator: "<", threshold: 3.1, severity: "warning" },
  { id: "rule-rssi", name: "Weak RF Signal", metric: "rssiDbm", operator: "<", threshold: -110, severity: "warning" },
];

export const CLOUD_PATTERNS = [
  {
    provider: "EMQX / Mosquitto (Self-Hosted)",
    topicPattern: "lab/{domain}/{device_id}/telemetry",
    auth: "TLS 1.3 + Username/Password or X.509 Client Cert",
    notes: "Lowest friction for local testing and self-hosted Docker deployments.",
  },
  {
    provider: "AWS IoT Core",
    topicPattern: "$aws/things/{thingName}/shadow/update",
    auth: "Mutual TLS (mTLS) with X.509 device certificates on port 8883",
    notes: "Device Shadow maintains reported/desired state even when NB-IoT nodes sleep.",
  },
  {
    provider: "Azure IoT Hub",
    topicPattern: "devices/{deviceId}/messages/events/",
    auth: "SAS Token or X.509 over MQTT/TLS (port 8883)",
    notes: "Routes telemetry directly to Azure Time Series / Stream Analytics.",
  },
];

export function evaluateDeviceAlerts(
  device: TelemetryDeviceRecord,
  rules: TelemetryAlertRule[],
): { rule: TelemetryAlertRule; actualValue: number }[] {
  const triggered: { rule: TelemetryAlertRule; actualValue: number }[] = [];
  for (const rule of rules) {
    const val = device.metrics[rule.metric];
    if (typeof val !== "number") continue;
    const hit = rule.operator === ">" ? val > rule.threshold : val < rule.threshold;
    if (hit) triggered.push({ rule, actualValue: val });
  }
  return triggered;
}

