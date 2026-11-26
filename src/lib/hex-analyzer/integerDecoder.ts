import {
  ENDIAN_16_ORDERS,
  ENDIAN_32_ORDERS,
  formatBytesHex,
  reorder2BytesToBigEndian,
  reorder4BytesToBigEndian,
  type Endian16Order,
  type Endian32Order,
} from "./endianConverter";

export interface Integer32Decoded {
  order: Endian32Order;
  label: string;
  rawBytesHex: string;
  reorderedBytesHex: string;
  decimal: string;
  hex: string;
  binary: string;
  valid: boolean;
  statusMessage: string;
}

export interface Integer16Decoded {
  order: Endian16Order;
  label: string;
  rawBytesHex: string;
  reorderedBytesHex: string;
  decimal: string;
  hex: string;
  binary: string;
  valid: boolean;
  statusMessage: string;
}

export interface Integer8Decoded {
  signed: number | null;
  unsigned: number | null;
  rawHex: string;
  binary: string;
  valid: boolean;
  statusMessage: string;
}

export interface Integer64Decoded {
  order: "BE" | "LE";
  signed: string;
  unsigned: string;
  rawBytesHex: string;
  valid: boolean;
  statusMessage: string;
}

export function decodeInt8AndUint8(bytes: Uint8Array, byteOffset = 0): Integer8Decoded {
  if (byteOffset >= bytes.length) {
    return {
      signed: null,
      unsigned: null,
      rawHex: "—",
      binary: "—",
      valid: false,
      statusMessage: `Need 1 byte at offset ${byteOffset}.`,
    };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset + byteOffset, 1);
  const u = view.getUint8(0);
  const s = view.getInt8(0);
  return {
    signed: s,
    unsigned: u,
    rawHex: `0x${u.toString(16).toUpperCase().padStart(2, "0")}`,
    binary: u.toString(2).padStart(8, "0"),
    valid: true,
    statusMessage: "Valid 8-bit integer",
  };
}

export function decodeUint16AllOrders(bytes: Uint8Array, byteOffset = 0): Integer16Decoded[] {
  return decode16AllOrders(bytes, byteOffset, false);
}

export function decodeInt16AllOrders(bytes: Uint8Array, byteOffset = 0): Integer16Decoded[] {
  return decode16AllOrders(bytes, byteOffset, true);
}

function decode16AllOrders(bytes: Uint8Array, byteOffset: number, signed: boolean): Integer16Decoded[] {
  const slice = bytes.subarray(byteOffset, byteOffset + 2);
  if (slice.length < 2) {
    return ENDIAN_16_ORDERS.map(({ order, label }) => ({
      order,
      label,
      rawBytesHex: slice.length > 0 ? formatBytesHex(slice) : "—",
      reorderedBytesHex: "—",
      decimal: "Insufficient bytes",
      hex: "—",
      binary: "—",
      valid: false,
      statusMessage: `Need 2 bytes at offset ${byteOffset} (only ${slice.length} available).`,
    }));
  }

  const rawBytesHex = formatBytesHex(slice);

  return ENDIAN_16_ORDERS.map(({ order, label }) => {
    const reordered = reorder2BytesToBigEndian(slice, order);
    const view = new DataView(reordered.buffer, reordered.byteOffset, 2);
    const unsignedVal = view.getUint16(0, false);
    const val = signed ? view.getInt16(0, false) : unsignedVal;

    return {
      order,
      label,
      rawBytesHex,
      reorderedBytesHex: formatBytesHex(reordered),
      decimal: String(val),
      hex: `0x${unsignedVal.toString(16).toUpperCase().padStart(4, "0")}`,
      binary: unsignedVal.toString(2).padStart(16, "0"),
      valid: true,
      statusMessage: `Valid ${signed ? "INT16" : "UINT16"}`,
    };
  });
}

export function decodeUint32AllOrders(bytes: Uint8Array, byteOffset = 0): Integer32Decoded[] {
  return decode32AllOrders(bytes, byteOffset, false);
}

export function decodeInt32AllOrders(bytes: Uint8Array, byteOffset = 0): Integer32Decoded[] {
  return decode32AllOrders(bytes, byteOffset, true);
}

function decode32AllOrders(bytes: Uint8Array, byteOffset: number, signed: boolean): Integer32Decoded[] {
  const slice = bytes.subarray(byteOffset, byteOffset + 4);
  if (slice.length < 4) {
    return ENDIAN_32_ORDERS.map(({ order, label }) => ({
      order,
      label,
      rawBytesHex: slice.length > 0 ? formatBytesHex(slice) : "—",
      reorderedBytesHex: "—",
      decimal: "Insufficient bytes",
      hex: "—",
      binary: "—",
      valid: false,
      statusMessage: `Need 4 bytes at offset ${byteOffset} (only ${slice.length} available).`,
    }));
  }

  const rawBytesHex = formatBytesHex(slice);

  return ENDIAN_32_ORDERS.map(({ order, label }) => {
    const reordered = reorder4BytesToBigEndian(slice, order);
    const view = new DataView(reordered.buffer, reordered.byteOffset, 4);
    const unsignedVal = view.getUint32(0, false);
    const val = signed ? view.getInt32(0, false) : unsignedVal;

    return {
      order,
      label,
      rawBytesHex,
      reorderedBytesHex: formatBytesHex(reordered),
      decimal: String(val),
      hex: `0x${unsignedVal.toString(16).toUpperCase().padStart(8, "0")}`,
      binary: unsignedVal.toString(2).padStart(32, "0"),
      valid: true,
      statusMessage: `Valid ${signed ? "INT32" : "UINT32"}`,
    };
  });
}

export function decode64BitIntegers(bytes: Uint8Array, byteOffset = 0): Integer64Decoded[] {
  const slice = bytes.subarray(byteOffset, byteOffset + 8);
  const orders: Array<"BE" | "LE"> = ["BE", "LE"];
  if (slice.length < 8) {
    return orders.map((order) => ({
      order,
      signed: "Insufficient bytes",
      unsigned: "Insufficient bytes",
      rawBytesHex: slice.length > 0 ? formatBytesHex(slice) : "—",
      valid: false,
      statusMessage: `Need 8 bytes at offset ${byteOffset} (only ${slice.length} available).`,
    }));
  }

  const rawBytesHex = formatBytesHex(slice);
  const view = new DataView(slice.buffer, slice.byteOffset, 8);

  return orders.map((order) => {
    const le = order === "LE";
    return {
      order,
      signed: view.getBigInt64(0, le).toString(),
      unsigned: view.getBigUint64(0, le).toString(),
      rawBytesHex,
      valid: true,
      statusMessage: `Valid 64-bit integer (${order})`,
    };
  });
}

