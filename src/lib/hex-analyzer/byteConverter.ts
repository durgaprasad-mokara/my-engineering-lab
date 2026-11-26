export interface InspectedByte {
  index: number;
  offsetHex: string;
  value: number;
  hex: string;
  binary: string;
  bits: number[]; // bit 7 down to bit 0
  booleanNonZero: boolean;
}

export function inspectAllBytes(bytes: Uint8Array): InspectedByte[] {
  return Array.from(bytes, (value, index) => {
    const bits: number[] = [];
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((value >> bit) & 1);
    }
    return {
      index,
      offsetHex: `0x${index.toString(16).toUpperCase().padStart(4, "0")}`,
      value,
      hex: value.toString(16).toUpperCase().padStart(2, "0"),
      binary: value.toString(2).padStart(8, "0"),
      bits,
      booleanNonZero: value !== 0,
    };
  });
}

