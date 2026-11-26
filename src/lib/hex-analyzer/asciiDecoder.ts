const CONTROL_LABELS: Record<number, string> = {
  0x00: "NULL",
  0x01: "SOH",
  0x02: "STX",
  0x03: "ETX",
  0x04: "EOT",
  0x05: "ENQ",
  0x06: "ACK",
  0x07: "BEL",
  0x08: "BS",
  0x09: "TAB",
  0x0a: "LF",
  0x0b: "VT",
  0x0c: "FF",
  0x0d: "CR",
  0x0e: "SO",
  0x0f: "SI",
  0x10: "DLE",
  0x11: "DC1",
  0x12: "DC2",
  0x13: "DC3",
  0x14: "DC4",
  0x15: "NAK",
  0x16: "SYN",
  0x17: "ETB",
  0x18: "CAN",
  0x19: "EM",
  0x1a: "SUB",
  0x1b: "ESC",
  0x1c: "FS",
  0x1d: "GS",
  0x1e: "RS",
  0x1f: "US",
  0x7f: "DEL",
};

export interface AsciiByteRow {
  position: number;
  offsetHex: string;
  rawHex: string;
  decimal: number;
  printable: boolean;
  displayLabel: string;
}

export interface AsciiDecodeResult {
  rows: AsciiByteRow[];
  asciiSummary: string;
  utf8Text: string;
  utf8Valid: boolean;
}

export function decodeAsciiAndUtf8(bytes: Uint8Array): AsciiDecodeResult {
  const rows: AsciiByteRow[] = Array.from(bytes, (b, position) => {
    const printable = b >= 0x20 && b <= 0x7e;
    const displayLabel = printable
      ? String.fromCharCode(b)
      : CONTROL_LABELS[b] ?? (b > 0x7f ? `0x${b.toString(16).toUpperCase().padStart(2, "0")}` : "CTRL");

    return {
      position,
      offsetHex: `0x${position.toString(16).toUpperCase().padStart(4, "0")}`,
      rawHex: b.toString(16).toUpperCase().padStart(2, "0"),
      decimal: b,
      printable,
      displayLabel,
    };
  });

  const asciiSummary = rows.map((r) => (r.printable ? r.displayLabel : `[${r.displayLabel}]`)).join("");

  let utf8Valid = true;
  let utf8Text = "";
  try {
    utf8Text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    utf8Valid = false;
    utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  return { rows, asciiSummary, utf8Text, utf8Valid };
}

