export type Endian32Order = "ABCD" | "DCBA" | "BADC" | "CDAB";
export type Endian16Order = "AB" | "BA";
export type Endian64Order = "BE" | "LE";

export const ENDIAN_32_ORDERS: Array<{ order: Endian32Order; label: string }> = [
  { order: "ABCD", label: "Big Endian (ABCD)" },
  { order: "DCBA", label: "Little Endian (DCBA)" },
  { order: "BADC", label: "Mid-Big Endian (BADC)" },
  { order: "CDAB", label: "Mid-Little Endian (CDAB)" },
];

export const ENDIAN_16_ORDERS: Array<{ order: Endian16Order; label: string }> = [
  { order: "AB", label: "Big Endian (AB)" },
  { order: "BA", label: "Little Endian (BA)" },
];

/**
 * Explicitly reorders 4 bytes from the given wire order into canonical Big-Endian [A, B, C, D]
 * so DataView(..., false) always decodes identically regardless of host CPU endianness.
 */
export function reorder4BytesToBigEndian(raw: Uint8Array, order: Endian32Order): Uint8Array {
  const a = raw[0] ?? 0;
  const b = raw[1] ?? 0;
  const c = raw[2] ?? 0;
  const d = raw[3] ?? 0;

  switch (order) {
    case "ABCD":
      return new Uint8Array([a, b, c, d]);
    case "DCBA":
      return new Uint8Array([d, c, b, a]);
    case "BADC":
      return new Uint8Array([b, a, d, c]);
    case "CDAB":
      return new Uint8Array([c, d, a, b]);
  }
}

/**
 * Explicitly reorders 2 bytes from AB or BA into canonical Big-Endian [A, B].
 */
export function reorder2BytesToBigEndian(raw: Uint8Array, order: Endian16Order): Uint8Array {
  const a = raw[0] ?? 0;
  const b = raw[1] ?? 0;
  return order === "AB" ? new Uint8Array([a, b]) : new Uint8Array([b, a]);
}

export function formatBytesHex(bytes: Uint8Array): string {
  return Array.from(bytes, (x) => x.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}

