/**
 * Computes standard Modbus RTU CRC-16 (polynomial 0xA001, initial value 0xFFFF).
 * On the wire, Modbus RTU transmits CRC Low Byte first, then CRC High Byte.
 */
export function computeCrc16Modbus(bytes: Uint8Array): {
  crcValue: number;
  lowByte: number;
  highByte: number;
  wireHex: string;
} {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]!;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >>> 1) ^ 0xa001;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  const lowByte = crc & 0xff;
  const highByte = (crc >> 8) & 0xff;
  const wireHex = `${lowByte.toString(16).toUpperCase().padStart(2, "0")} ${highByte.toString(16).toUpperCase().padStart(2, "0")}`;
  return { crcValue: crc, lowByte, highByte, wireHex };
}

export function verifyCrc16ModbusFrame(frame: Uint8Array): {
  valid: boolean;
  expectedWireHex: string;
  actualWireHex: string;
} {
  if (frame.length < 4) {
    return { valid: false, expectedWireHex: "—", actualWireHex: "—" };
  }
  const payload = frame.subarray(0, frame.length - 2);
  const expected = computeCrc16Modbus(payload);
  const actualLow = frame[frame.length - 2]!;
  const actualHigh = frame[frame.length - 1]!;
  const actualWireHex = `${actualLow.toString(16).toUpperCase().padStart(2, "0")} ${actualHigh.toString(16).toUpperCase().padStart(2, "0")}`;
  return {
    valid: expected.lowByte === actualLow && expected.highByte === actualHigh,
    expectedWireHex: expected.wireHex,
    actualWireHex,
  };
}

