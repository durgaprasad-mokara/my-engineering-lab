export interface BinaryRow {
  index: number;
  offsetHex: string;
  rawHex: string;
  binary: string;
  nibbleGrouped: string;
}

export function decodeBinaryRows(bytes: Uint8Array): BinaryRow[] {
  return Array.from(bytes, (b, index) => {
    const binary = b.toString(2).padStart(8, "0");
    return {
      index,
      offsetHex: `0x${index.toString(16).toUpperCase().padStart(4, "0")}`,
      rawHex: b.toString(16).toUpperCase().padStart(2, "0"),
      binary,
      nibbleGrouped: `${binary.slice(0, 4)} ${binary.slice(4)}`,
    };
  });
}

