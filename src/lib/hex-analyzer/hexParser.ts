export interface HexInvalidChar {
  char: string;
  position: number;
  line: number;
  column: number;
}

export interface HexParseResult {
  originalInput: string;
  normalizedHex: string;
  bytes: Uint8Array;
  byteCount: number;
  valid: boolean;
  invalidChars: HexInvalidChar[];
  error: string | null;
}

/**
 * Parses multiline hexadecimal input with optional spaces, commas, colons, hyphens, or 0x prefixes.
 * Never silently discards invalid characters: reports every invalid character and its position.
 */
export function parseHexInput(input: string): HexParseResult {
  const originalInput = input;
  if (!input.trim()) {
    return {
      originalInput,
      normalizedHex: "",
      bytes: new Uint8Array(),
      byteCount: 0,
      valid: false,
      invalidChars: [],
      error: "Hexadecimal input is empty. Enter hex bytes (e.g. 01 03 04 42 48 00 00).",
    };
  }

  // Track line/column while scanning; allow 0x/0X prefix tokens and common separators
  const invalidChars: HexInvalidChar[] = [];
  let hexDigits = "";
  let line = 1;
  let column = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (ch === "\n") {
      line++;
      column = 0;
      continue;
    }
    column++;

    // Allow whitespace and common byte separators
    if (/[\s,;:\-|_]/.test(ch)) {
      continue;
    }

    // Allow 0x or 0X prefix when preceded by start or separator
    if (
      (ch === "x" || ch === "X") &&
      i > 0 &&
      input[i - 1] === "0" &&
      (i === 1 || /[\s,;:\-|_]/.test(input[i - 2]!))
    ) {
      // Remove the preceding '0' that was tentatively appended as a hex digit
      hexDigits = hexDigits.slice(0, -1);
      continue;
    }

    if (/^[0-9a-fA-F]$/.test(ch)) {
      hexDigits += ch.toUpperCase();
    } else {
      invalidChars.push({ char: ch, position: i, line, column });
    }
  }

  if (invalidChars.length > 0) {
    const preview = invalidChars
      .slice(0, 5)
      .map((c) => `'${c.char}' at pos ${c.position} (L${c.line}:C${c.column})`)
      .join(", ");
    return {
      originalInput,
      normalizedHex: hexDigits,
      bytes: new Uint8Array(),
      byteCount: 0,
      valid: false,
      invalidChars,
      error: `Invalid hexadecimal character(s): ${preview}${invalidChars.length > 5 ? ` (+${invalidChars.length - 5} more)` : ""}.`,
    };
  }

  if (hexDigits.length === 0) {
    return {
      originalInput,
      normalizedHex: "",
      bytes: new Uint8Array(),
      byteCount: 0,
      valid: false,
      invalidChars: [],
      error: "No hexadecimal digits found.",
    };
  }

  if (hexDigits.length % 2 !== 0) {
    return {
      originalInput,
      normalizedHex: hexDigits,
      bytes: new Uint8Array(),
      byteCount: 0,
      valid: false,
      invalidChars: [],
      error: `Odd number of hex digits (${hexDigits.length}). Each byte requires 2 hex characters.`,
    };
  }

  const bytes = new Uint8Array(hexDigits.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexDigits.slice(i * 2, i * 2 + 2), 16);
  }

  const normalizedHex = Array.from(bytes, (b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");

  return {
    originalInput,
    normalizedHex,
    bytes,
    byteCount: bytes.length,
    valid: true,
    invalidChars: [],
    error: null,
  };
}

