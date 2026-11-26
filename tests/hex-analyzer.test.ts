import { describe, expect, it } from "vitest";
import { computeCrc16Modbus, verifyCrc16ModbusFrame } from "@/lib/hex-analyzer/crc16Modbus";
import { applyEngineeringScaling } from "@/lib/hex-analyzer/engineeringScaler";
import { parseHexInput } from "@/lib/hex-analyzer/hexParser";
import { decodeIndustrialPayload } from "@/lib/hex-analyzer/modbusDecoder";
import { analyzeHexPayload } from "@/lib/hex-analyzer/payloadAnalyzer";

describe("Advanced Hex Converter & IoT Data Type Analyzer", () => {
  it("parses valid multiline hex with separators and reports invalid characters with positions", () => {
    const valid = parseHexInput("0x01, 03:04\n42-48 00 00");
    expect(valid.valid).toBe(true);
    expect(valid.byteCount).toBe(7);
    expect(valid.normalizedHex).toBe("01 03 04 42 48 00 00");

    const invalid = parseHexInput("42 4G 00");
    expect(invalid.valid).toBe(false);
    expect(invalid.invalidChars[0]?.char).toBe("G");
    expect(invalid.invalidChars[0]?.position).toBe(4);

    const odd = parseHexInput("42 4");
    expect(odd.valid).toBe(false);
    expect(odd.error).toContain("Odd number");

    const empty = parseHexInput("   ");
    expect(empty.valid).toBe(false);
  });

  it("decodes ASCII printable and control characters, UTF-8, and 8-bit Binary", () => {
    const res = analyzeHexPayload("42 09 0D 0A 00");
    expect(res.binaryRows[0]?.binary).toBe("01000010");
    expect(res.ascii.rows[0]?.displayLabel).toBe("B");
    expect(res.ascii.rows[1]?.displayLabel).toBe("TAB");
    expect(res.ascii.rows[2]?.displayLabel).toBe("CR");
    expect(res.ascii.rows[3]?.displayLabel).toBe("LF");
    expect(res.ascii.rows[4]?.displayLabel).toBe("NULL");

    const utf8 = analyzeHexPayload("F0 9F 9A 80"); // 🚀
    expect(utf8.ascii.utf8Valid).toBe(true);
    expect(utf8.ascii.utf8Text).toBe("🚀");
  });

  it("decodes IEEE 754 FLOAT32 across all 4 byte orders (ABCD, DCBA, BADC, CDAB) and FLOAT64", () => {
    // 50.0f in IEEE 754 Big Endian = 42 48 00 00
    expect(analyzeHexPayload("42 48 00 00").float32.find((f) => f.order === "ABCD")?.value).toBe(50);
    expect(analyzeHexPayload("00 00 48 42").float32.find((f) => f.order === "DCBA")?.value).toBe(50);
    expect(analyzeHexPayload("48 42 00 00").float32.find((f) => f.order === "BADC")?.value).toBe(50);
    expect(analyzeHexPayload("00 00 42 48").float32.find((f) => f.order === "CDAB")?.value).toBe(50);

    // 8-byte IEEE 754 double: pi (40 09 21 FB 54 44 2D 18)
    const f64 = analyzeHexPayload("40 09 21 FB 54 44 2D 18").float64.find((f) => f.order === "BE");
    expect(f64?.valid).toBe(true);
    expect(f64?.value).toBeCloseTo(Math.PI, 12);
  });

  it("decodes UINT32, INT32 (two's complement), INT16, UINT16, and handles insufficient bytes", () => {
    const neg32 = analyzeHexPayload("FF FE 1D C0");
    expect(neg32.int32.find((x) => x.order === "ABCD")?.decimal).toBe("-123456");
    expect(neg32.uint32.find((x) => x.order === "ABCD")?.decimal).toBe("4294843840");

    const val16 = analyzeHexPayload("FF 9C");
    expect(val16.int16.find((x) => x.order === "AB")?.decimal).toBe("-100");
    expect(val16.uint16.find((x) => x.order === "AB")?.decimal).toBe("65436");
    // Insufficient bytes for 32-bit float/int
    expect(val16.float32[0]?.valid).toBe(false);
    expect(val16.int32[0]?.valid).toBe(false);
  });

  it("verifies Modbus RTU CRC16 and requires explicit protocol selection", () => {
    const payload = new Uint8Array([0x01, 0x03, 0x04, 0x42, 0x48, 0x00, 0x00]);
    const crc = computeCrc16Modbus(payload);
    const frame = new Uint8Array([...payload, crc.lowByte, crc.highByte]);

    expect(verifyCrc16ModbusFrame(frame).valid).toBe(true);

    // Never assumes unknown payload is Modbus when protocol = 'none'
    const noneRes = decodeIndustrialPayload(frame, "none");
    expect(noneRes.identified).toBe(false);

    const rtuRes = decodeIndustrialPayload(frame, "modbus-rtu");
    expect(rtuRes.identified).toBe(true);
    expect(rtuRes.validated).toBe(true);
    expect(rtuRes.decoded).toBe(true);
    expect(rtuRes.unitOrSlaveId).toBe(1);
    expect(rtuRes.functionCode).toBe(3);
  });

  it("computes Engineering Value = Raw Value * Scale + Offset", () => {
    const scaled = applyEngineeringScaling(245, {
      scale: 0.1,
      offset: -2,
      unit: "°C",
      registerAddress: 10,
      byteOffset: 0,
    });
    expect(scaled.engineeringValue).toBe(22.5);
    expect(scaled.formatted).toBe("22.5 °C");
  });
});

