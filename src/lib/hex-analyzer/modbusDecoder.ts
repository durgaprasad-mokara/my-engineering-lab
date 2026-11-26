import { verifyCrc16ModbusFrame } from "./crc16Modbus";
import { formatBytesHex } from "./endianConverter";

export type IndustrialProtocolMode = "none" | "modbus-rtu" | "modbus-tcp" | "rs485-raw";

const MODBUS_FUNCTIONS: Record<number, string> = {
  0x01: "Read Coils (0x01)",
  0x02: "Read Discrete Inputs (0x02)",
  0x03: "Read Holding Registers (0x03)",
  0x04: "Read Input Registers (0x04)",
  0x05: "Write Single Coil (0x05)",
  0x06: "Write Single Register (0x06)",
  0x0f: "Write Multiple Coils (0x0F)",
  0x10: "Write Multiple Registers (0x10)",
};

export interface ModbusDecodeResult {
  protocolSelected: IndustrialProtocolMode;
  identified: boolean;
  validated: boolean;
  decoded: boolean;
  unitOrSlaveId: number | null;
  functionCode: number | null;
  functionName: string | null;
  registerAddressHex: string | null;
  registerCount: number | null;
  byteCount: number | null;
  dataBytes: Uint8Array;
  dataHex: string;
  registers16BE: number[];
  coilBits: number[];
  crcStatus: {
    checked: boolean;
    valid: boolean;
    expectedWireHex: string;
    actualWireHex: string;
  };
  messages: string[];
}

export function decodeIndustrialPayload(
  bytes: Uint8Array,
  protocol: IndustrialProtocolMode,
  configuredStartAddress = 0,
): ModbusDecodeResult {
  if (protocol === "none") {
    return {
      protocolSelected: protocol,
      identified: false,
      validated: false,
      decoded: false,
      unitOrSlaveId: null,
      functionCode: null,
      functionName: null,
      registerAddressHex: null,
      registerCount: null,
      byteCount: null,
      dataBytes: new Uint8Array(),
      dataHex: "",
      registers16BE: [],
      coilBits: [],
      crcStatus: { checked: false, valid: false, expectedWireHex: "—", actualWireHex: "—" },
      messages: ["Select an explicit protocol (Modbus RTU, Modbus TCP, or RS485 Raw) before interpreting frame headers."],
    };
  }

  if (protocol === "rs485-raw") {
    const regs: number[] = [];
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      regs.push((bytes[i]! << 8) | bytes[i + 1]!);
    }
    return {
      protocolSelected: protocol,
      identified: true,
      validated: bytes.length > 0,
      decoded: bytes.length > 0,
      unitOrSlaveId: null,
      functionCode: null,
      functionName: "RS485 / Raw Register Payload",
      registerAddressHex: `0x${configuredStartAddress.toString(16).toUpperCase().padStart(4, "0")}`,
      registerCount: regs.length,
      byteCount: bytes.length,
      dataBytes: bytes,
      dataHex: formatBytesHex(bytes),
      registers16BE: regs,
      coilBits: [],
      crcStatus: { checked: false, valid: false, expectedWireHex: "—", actualWireHex: "—" },
      messages: [`Extracted ${regs.length} big-endian 16-bit register(s) from ${bytes.length} raw bytes.`],
    };
  }

  if (protocol === "modbus-tcp") {
    if (bytes.length < 9) {
      return {
        protocolSelected: protocol,
        identified: false,
        validated: false,
        decoded: false,
        unitOrSlaveId: null,
        functionCode: null,
        functionName: null,
        registerAddressHex: null,
        registerCount: null,
        byteCount: null,
        dataBytes: new Uint8Array(),
        dataHex: "",
        registers16BE: [],
        coilBits: [],
        crcStatus: { checked: false, valid: false, expectedWireHex: "—", actualWireHex: "—" },
        messages: ["Modbus TCP MBAP header + PDU requires at least 9 bytes."],
      };
    }

    const unitId = bytes[6]!;
    const fc = bytes[7]!;
    const fnName = MODBUS_FUNCTIONS[fc] ?? `Function 0x${fc.toString(16).toUpperCase().padStart(2, "0")}`;
    const byteCount = bytes[8]!;
    const dataBytes = bytes.subarray(9, Math.min(bytes.length, 9 + byteCount));
    const regs: number[] = [];
    for (let i = 0; i + 1 < dataBytes.length; i += 2) {
      regs.push((dataBytes[i]! << 8) | dataBytes[i + 1]!);
    }

    return {
      protocolSelected: protocol,
      identified: true,
      validated: dataBytes.length === byteCount,
      decoded: dataBytes.length > 0,
      unitOrSlaveId: unitId,
      functionCode: fc,
      functionName: fnName,
      registerAddressHex: `0x${configuredStartAddress.toString(16).toUpperCase().padStart(4, "0")}`,
      registerCount: regs.length,
      byteCount,
      dataBytes,
      dataHex: formatBytesHex(dataBytes),
      registers16BE: regs,
      coilBits: [],
      crcStatus: { checked: false, valid: false, expectedWireHex: "N/A (TCP)", actualWireHex: "N/A (TCP)" },
      messages: [`Modbus TCP Unit ${unitId} · ${fnName} · ${dataBytes.length} payload bytes.`],
    };
  }

  // Modbus RTU
  if (bytes.length < 4) {
    return {
      protocolSelected: protocol,
      identified: false,
      validated: false,
      decoded: false,
      unitOrSlaveId: null,
      functionCode: null,
      functionName: null,
      registerAddressHex: null,
      registerCount: null,
      byteCount: null,
      dataBytes: new Uint8Array(),
      dataHex: "",
      registers16BE: [],
      coilBits: [],
      crcStatus: { checked: false, valid: false, expectedWireHex: "—", actualWireHex: "—" },
      messages: ["Modbus RTU frame requires at least 4 bytes (Slave + FC + Data/CRC)."],
    };
  }

  const slaveId = bytes[0]!;
  const fc = bytes[1]!;
  const isException = (fc & 0x80) !== 0;
  const fnName = isException
    ? `Modbus Exception (0x${fc.toString(16).toUpperCase()})`
    : MODBUS_FUNCTIONS[fc] ?? `Function 0x${fc.toString(16).toUpperCase().padStart(2, "0")}`;

  const crc = verifyCrc16ModbusFrame(bytes);
  const messages: string[] = [];
  if (!crc.valid) {
    messages.push(`CRC16-Modbus mismatch: expected ${crc.expectedWireHex}, frame had ${crc.actualWireHex}.`);
  } else {
    messages.push(`CRC16-Modbus verified (${crc.expectedWireHex}).`);
  }

  // Response frame (FC 01..04): [Slave][FC][ByteCount][Data...][CRC_L][CRC_H]
  let byteCount: number | null = null;
  let dataBytes = bytes.subarray(2, bytes.length - 2);
  if ((fc === 0x01 || fc === 0x02 || fc === 0x03 || fc === 0x04) && bytes.length >= 5) {
    byteCount = bytes[2]!;
    if (3 + byteCount + 2 === bytes.length) {
      dataBytes = bytes.subarray(3, 3 + byteCount);
    }
  }

  const regs: number[] = [];
  for (let i = 0; i + 1 < dataBytes.length; i += 2) {
    regs.push((dataBytes[i]! << 8) | dataBytes[i + 1]!);
  }

  const coilBits: number[] = [];
  if (fc === 0x01 || fc === 0x02) {
    for (const b of dataBytes) {
      for (let bit = 0; bit < 8; bit++) {
        coilBits.push((b >> bit) & 1);
      }
    }
  }

  return {
    protocolSelected: protocol,
    identified: true,
    validated: crc.valid,
    decoded: dataBytes.length > 0,
    unitOrSlaveId: slaveId,
    functionCode: fc,
    functionName: fnName,
    registerAddressHex: `0x${configuredStartAddress.toString(16).toUpperCase().padStart(4, "0")}`,
    registerCount: fc === 0x01 || fc === 0x02 ? coilBits.length : regs.length,
    byteCount: byteCount ?? dataBytes.length,
    dataBytes,
    dataHex: formatBytesHex(dataBytes),
    registers16BE: regs,
    coilBits,
    crcStatus: { checked: true, ...crc },
    messages,
  };
}

