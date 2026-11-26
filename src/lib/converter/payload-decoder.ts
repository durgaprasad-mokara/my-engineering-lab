export type PayloadFieldType = "uint8" | "int8" | "uint16" | "int16" | "uint32" | "int32" | "float32";

export interface PayloadFieldSchema {
  id: string;
  name: string;
  byteOffset: number;
  type: PayloadFieldType;
  endianness: "BE" | "LE";
  scale: number;
  offsetValue: number;
  unit: string;
}

export interface DecodedPayloadField {
  id: string;
  name: string;
  byteOffset: number;
  rawHex: string;
  rawNumeric: number | null;
  scaledValue: number | null;
  unit: string;
  error?: string;
}

export const PAYLOAD_PRESETS: Array<{
  id: string;
  label: string;
  sampleHex: string;
  fields: PayloadFieldSchema[];
}> = [
  {
    id: "esp32-env",
    label: "ESP32 Environmental Frame (User-Configured)",
    sampleHex: "09 C4 15 4A 0C E4 00 64",
    fields: [
      { id: "f1", name: "Temperature", byteOffset: 0, type: "int16", endianness: "BE", scale: 0.01, offsetValue: 0, unit: "°C" },
      { id: "f2", name: "Humidity", byteOffset: 2, type: "uint16", endianness: "BE", scale: 0.01, offsetValue: 0, unit: "%RH" },
      { id: "f3", name: "Battery Voltage", byteOffset: 4, type: "uint16", endianness: "BE", scale: 0.001, offsetValue: 0, unit: "V" },
      { id: "f4", name: "Status / Flags", byteOffset: 6, type: "uint16", endianness: "BE", scale: 1, offsetValue: 0, unit: "flags" },
    ],
  },
  {
    id: "modbus-rtu-regs",
    label: "Modbus RTU Register Payload (BE)",
    sampleHex: "01 03 04 09 29 01 F4",
    fields: [
      { id: "m1", name: "Slave ID", byteOffset: 0, type: "uint8", endianness: "BE", scale: 1, offsetValue: 0, unit: "addr" },
      { id: "m2", name: "Function Code", byteOffset: 1, type: "uint8", endianness: "BE", scale: 1, offsetValue: 0, unit: "fc" },
      { id: "m3", name: "Byte Count", byteOffset: 2, type: "uint8", endianness: "BE", scale: 1, offsetValue: 0, unit: "bytes" },
      { id: "m4", name: "Bus Voltage Reg", byteOffset: 3, type: "uint16", endianness: "BE", scale: 0.01, offsetValue: 0, unit: "V" },
      { id: "m5", name: "Load Current Reg", byteOffset: 5, type: "uint16", endianness: "BE", scale: 0.01, offsetValue: 0, unit: "A" },
    ],
  },
];

function byteWidth(type: PayloadFieldType): number {
  switch (type) {
    case "uint8":
    case "int8":
      return 1;
    case "uint16":
    case "int16":
      return 2;
    case "uint32":
    case "int32":
    case "float32":
      return 4;
  }
}

export const payloadDecoder = {
  decode(bytes: Uint8Array, fields: PayloadFieldSchema[]): DecodedPayloadField[] {
    if (fields.length === 0) return [];
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    return fields.map((f) => {
      const width = byteWidth(f.type);
      if (f.byteOffset < 0 || f.byteOffset + width > bytes.length) {
        return {
          id: f.id,
          name: f.name,
          byteOffset: f.byteOffset,
          rawHex: "—",
          rawNumeric: null,
          scaledValue: null,
          unit: f.unit,
          error: `Out of bounds (needs bytes ${f.byteOffset}..${f.byteOffset + width - 1}, payload has ${bytes.length} bytes).`,
        };
      }

      const slice = bytes.subarray(f.byteOffset, f.byteOffset + width);
      const rawHex = Array.from(slice, (b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
      const le = f.endianness === "LE";

      let rawNumeric: number;
      switch (f.type) {
        case "uint8":
          rawNumeric = view.getUint8(f.byteOffset);
          break;
        case "int8":
          rawNumeric = view.getInt8(f.byteOffset);
          break;
        case "uint16":
          rawNumeric = view.getUint16(f.byteOffset, le);
          break;
        case "int16":
          rawNumeric = view.getInt16(f.byteOffset, le);
          break;
        case "uint32":
          rawNumeric = view.getUint32(f.byteOffset, le);
          break;
        case "int32":
          rawNumeric = view.getInt32(f.byteOffset, le);
          break;
        case "float32":
          rawNumeric = view.getFloat32(f.byteOffset, le);
          break;
      }

      const scaledValue = Number((rawNumeric * f.scale + f.offsetValue).toFixed(6));

      return {
        id: f.id,
        name: f.name,
        byteOffset: f.byteOffset,
        rawHex,
        rawNumeric,
        scaledValue,
        unit: f.unit,
      };
    });
  },
};

