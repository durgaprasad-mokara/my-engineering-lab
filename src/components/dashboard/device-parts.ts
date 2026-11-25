export interface DevicePart {
  id: string;
  name: string;
  role: string;
}

export const DEVICE_PARTS: DevicePart[] = [
  { id: "antenna", name: "LTE antenna", role: "Radiates and receives the cellular signal. Needs the right band coverage, a 50 Ω feed and clearance from metal." },
  { id: "modem", name: "Cellular modem", role: "Connects the device to the mobile network (e.g. LTE Cat 1 / LTE-M / NB-IoT) and carries MQTT or HTTP traffic." },
  { id: "mcu", name: "Microcontroller", role: "Counts sensor pulses, computes flow and volume, manages sleep, and schedules transmissions." },
  { id: "pcb", name: "Main PCB", role: "Carries power regulation, protection, the MCU, the modem and connectors." },
  { id: "battery", name: "Battery", role: "Supplies average and peak current. Cellular transmit peaks drive cell selection and buffer capacitance." },
  { id: "sensor", name: "Flow sensor", role: "Hall-effect or ultrasonic sensing in the pipe. For a pulse sensor: volume (L) = pulses ÷ K-factor (pulses per litre)." },
  { id: "enclosure", name: "Enclosure", role: "Protects the electronics (IP rating), must be RF-transparent near the antenna." },
];
