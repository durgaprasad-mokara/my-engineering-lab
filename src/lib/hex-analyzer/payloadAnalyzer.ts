import { decodeAsciiAndUtf8, type AsciiDecodeResult } from "./asciiDecoder";
import { decodeBinaryRows, type BinaryRow } from "./binaryDecoder";
import { inspectAllBytes, type InspectedByte } from "./byteConverter";
import { decodeFloat32AllOrders, decodeFloat64, type Float32Decoded, type Float64Decoded } from "./floatDecoder";
import { parseHexInput, type HexParseResult } from "./hexParser";
import {
  decode64BitIntegers,
  decodeInt16AllOrders,
  decodeInt32AllOrders,
  decodeInt8AndUint8,
  decodeUint16AllOrders,
  decodeUint32AllOrders,
  type Integer16Decoded,
  type Integer32Decoded,
  type Integer64Decoded,
  type Integer8Decoded,
} from "./integerDecoder";

export interface FullPayloadAnalysis {
  parse: HexParseResult;
  ascii: AsciiDecodeResult;
  binaryRows: BinaryRow[];
  inspectedBytes: InspectedByte[];
  float32: Float32Decoded[];
  float64: Float64Decoded[];
  uint32: Integer32Decoded[];
  int32: Integer32Decoded[];
  int16: Integer16Decoded[];
  uint16: Integer16Decoded[];
  int8Uint8: Integer8Decoded;
  int64Uint64: Integer64Decoded[];
}

export function analyzeHexPayload(hexInput: string, byteOffset = 0): FullPayloadAnalysis {
  const parse = parseHexInput(hexInput);
  const bytes = parse.valid ? parse.bytes : new Uint8Array();
  const safeOffset = Math.max(0, Math.min(byteOffset, bytes.length));

  return {
    parse,
    ascii: decodeAsciiAndUtf8(bytes),
    binaryRows: decodeBinaryRows(bytes),
    inspectedBytes: inspectAllBytes(bytes),
    float32: decodeFloat32AllOrders(bytes, safeOffset),
    float64: decodeFloat64(bytes, safeOffset),
    uint32: decodeUint32AllOrders(bytes, safeOffset),
    int32: decodeInt32AllOrders(bytes, safeOffset),
    int16: decodeInt16AllOrders(bytes, safeOffset),
    uint16: decodeUint16AllOrders(bytes, safeOffset),
    int8Uint8: decodeInt8AndUint8(bytes, safeOffset),
    int64Uint64: decode64BitIntegers(bytes, safeOffset),
  };
}

