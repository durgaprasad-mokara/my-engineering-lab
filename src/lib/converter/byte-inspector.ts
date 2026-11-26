export interface ByteInspectorRow {
  offsetHex: string;
  offsetDec: number;
  bytes: Array<{
    index: number;
    value: number;
    hex: string;
    binary: string;
    ascii: string;
  }>;
  asciiLine: string;
}

export interface ByteInspectionResult {
  totalBytes: number;
  detectedEncoding: string;
  rows: ByteInspectorRow[];
}

export const byteInspector = {
  detectEncoding(bytes: Uint8Array): string {
    if (bytes.length === 0) return "Empty (0 bytes)";
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return "UTF-8 with BOM (EF BB BF)";
    }
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
      return "UTF-16 LE with BOM (FF FE)";
    }
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      return "UTF-16 BE with BOM (FE FF)";
    }
    let allAscii = true;
    for (const b of bytes) {
      if (b > 0x7f) {
        allAscii = false;
        break;
      }
    }
    if (allAscii) return "7-bit ASCII / UTF-8 subset";
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return "Valid multi-byte UTF-8";
    } catch {
      return "Raw Binary / Extended 8-bit (non-UTF-8)";
    }
  },

  inspect(bytes: Uint8Array, bytesPerRow = 16, maxRows = 128): ByteInspectionResult {
    const rows: ByteInspectorRow[] = [];
    const limit = Math.min(bytes.length, bytesPerRow * maxRows);

    for (let offset = 0; offset < limit; offset += bytesPerRow) {
      const slice = bytes.subarray(offset, Math.min(offset + bytesPerRow, limit));
      const rowBytes = Array.from(slice, (b, idx) => ({
        index: offset + idx,
        value: b,
        hex: b.toString(16).toUpperCase().padStart(2, "0"),
        binary: b.toString(2).padStart(8, "0"),
        ascii: b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : ".",
      }));
      rows.push({
        offsetHex: `0x${offset.toString(16).toUpperCase().padStart(4, "0")}`,
        offsetDec: offset,
        bytes: rowBytes,
        asciiLine: rowBytes.map((rb) => rb.ascii).join(""),
      });
    }

    return {
      totalBytes: bytes.length,
      detectedEncoding: this.detectEncoding(bytes),
      rows,
    };
  },
};

