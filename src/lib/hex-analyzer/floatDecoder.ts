import {
  ENDIAN_32_ORDERS,
  formatBytesHex,
  reorder4BytesToBigEndian,
  type Endian32Order,
} from "./endianConverter";

export interface Float32Decoded {
  order: Endian32Order;
  label: string;
  rawBytesHex: string;
  reorderedBytesHex: string;
  value: number | null;
  displayValue: string;
  valid: boolean;
  statusMessage: string;
}

export interface Float64Decoded {
  order: "BE" | "LE";
  label: string;
  rawBytesHex: string;
  reorderedBytesHex: string;
  value: number | null;
  displayValue: string;
  valid: boolean;
  statusMessage: string;
}

export function decodeFloat32AllOrders(bytes: Uint8Array, byteOffset = 0): Float32Decoded[] {
  const slice = bytes.subarray(byteOffset, byteOffset + 4);
  if (slice.length < 4) {
    return ENDIAN_32_ORDERS.map(({ order, label }) => ({
      order,
      label,
      rawBytesHex: slice.length > 0 ? formatBytesHex(slice) : "—",
      reorderedBytesHex: "—",
      value: null,
      displayValue: "Insufficient bytes",
      valid: false,
      statusMessage: `Need 4 bytes at offset ${byteOffset} (only ${slice.length} available).`,
    }));
  }

  const rawBytesHex = formatBytesHex(slice);

  return ENDIAN_32_ORDERS.map(({ order, label }) => {
    const reordered = reorder4BytesToBigEndian(slice, order);
    const view = new DataView(reordered.buffer, reordered.byteOffset, 4);
    const val = view.getFloat32(0, false); // Explicit Big-Endian after reordering
    const isFiniteNum = Number.isFinite(val);
    const displayValue = Number.isNaN(val) ? "NaN" : !isFiniteNum ? String(val) : String(Number(val.toPrecision(7)));

    return {
      order,
      label,
      rawBytesHex,
      reorderedBytesHex: formatBytesHex(reordered),
      value: val,
      displayValue,
      valid: isFiniteNum,
      statusMessage: isFiniteNum ? "Valid IEEE 754 Float32" : `Special IEEE 754 value (${displayValue})`,
    };
  });
}

export function decodeFloat64(bytes: Uint8Array, byteOffset = 0): Float64Decoded[] {
  const slice = bytes.subarray(byteOffset, byteOffset + 8);
  const modes: Array<{ order: "BE" | "LE"; label: string }> = [
    { order: "BE", label: "Float64 Big Endian (BE)" },
    { order: "LE", label: "Float64 Little Endian (LE)" },
  ];

  if (slice.length < 8) {
    return modes.map((m) => ({
      order: m.order,
      label: m.label,
      rawBytesHex: slice.length > 0 ? formatBytesHex(slice) : "—",
      reorderedBytesHex: "—",
      value: null,
      displayValue: "Insufficient bytes",
      valid: false,
      statusMessage: `Need 8 bytes at offset ${byteOffset} (only ${slice.length} available).`,
    }));
  }

  const rawBytesHex = formatBytesHex(slice);

  return modes.map((m) => {
    const ordered = m.order === "BE" ? slice : Uint8Array.from(slice).reverse();
    const view = new DataView(ordered.buffer, ordered.byteOffset, 8);
    const val = view.getFloat64(0, false);
    const isFiniteNum = Number.isFinite(val);
    const displayValue = Number.isNaN(val) ? "NaN" : !isFiniteNum ? String(val) : String(val);

    return {
      order: m.order,
      label: m.label,
      rawBytesHex,
      reorderedBytesHex: formatBytesHex(ordered),
      value: val,
      displayValue,
      valid: isFiniteNum,
      statusMessage: isFiniteNum ? "Valid IEEE 754 Float64" : `Special IEEE 754 value (${displayValue})`,
    };
  });
}

