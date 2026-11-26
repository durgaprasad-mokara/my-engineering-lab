export type TextEncodingFormat =
  | "Plain Text"
  | "UTF-8"
  | "ASCII"
  | "Windows-1251"
  | "UTF-16"
  | "UTF-16 LE"
  | "UTF-16 BE"
  | "Latin-1";

export const TEXT_ENCODINGS: TextEncodingFormat[] = [
  "Plain Text",
  "UTF-8",
  "ASCII",
  "Windows-1251",
  "UTF-16",
  "UTF-16 LE",
  "UTF-16 BE",
  "Latin-1",
];

// Standard Windows-1251 upper 128 code points (0x80 - 0xFF)
const WIN1251_UPPER: number[] = [
  0x0402, 0x0403, 0x201a, 0x0453, 0x201e, 0x2026, 0x2020, 0x2021, 0x20ac, 0x2030, 0x0409, 0x2039, 0x040a, 0x040c, 0x040b, 0x040f,
  0x0452, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x0098, 0x2122, 0x0459, 0x203a, 0x045a, 0x045c, 0x045b, 0x045f,
  0x00a0, 0x040e, 0x045e, 0x0408, 0x00a4, 0x0490, 0x00a6, 0x00a7, 0x0401, 0x00a9, 0x0404, 0x00ab, 0x00ac, 0x00ad, 0x00ae, 0x0407,
  0x00b0, 0x00b1, 0x0406, 0x0456, 0x0491, 0x00b5, 0x00b6, 0x00b7, 0x0451, 0x2116, 0x0454, 0x00bb, 0x0458, 0x0405, 0x0455, 0x0457,
  0x0410, 0x0411, 0x0412, 0x0413, 0x0414, 0x0415, 0x0416, 0x0417, 0x0418, 0x0419, 0x041a, 0x041b, 0x041c, 0x041d, 0x041e, 0x041f,
  0x0420, 0x0421, 0x0422, 0x0423, 0x0424, 0x0425, 0x0426, 0x0427, 0x0428, 0x0429, 0x042a, 0x042b, 0x042c, 0x042d, 0x042e, 0x042f,
  0x0430, 0x0431, 0x0432, 0x0433, 0x0434, 0x0435, 0x0436, 0x0437, 0x0438, 0x0439, 0x043a, 0x043b, 0x043c, 0x043d, 0x043e, 0x043f,
  0x0440, 0x0441, 0x0442, 0x0443, 0x0444, 0x0445, 0x0446, 0x0447, 0x0448, 0x0449, 0x044a, 0x044b, 0x044c, 0x044d, 0x044e, 0x044f,
];

const WIN1251_REVERSE = new Map<number, number>(
  WIN1251_UPPER.map((cp, idx) => [cp, 0x80 + idx]),
);

export const textConverter = {
  encode(text: string, encoding: TextEncodingFormat = "UTF-8"): { bytes: Uint8Array; warnings: string[] } {
    const warnings: string[] = [];
    if (encoding === "Plain Text" || encoding === "UTF-8") {
      return { bytes: new TextEncoder().encode(text), warnings };
    }

    if (encoding === "ASCII") {
      const out = new Uint8Array(text.length);
      let nonAscii = 0;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 0x7f) {
          nonAscii++;
          out[i] = 0x3f; // '?'
        } else {
          out[i] = code;
        }
      }
      if (nonAscii > 0) {
        warnings.push(`${nonAscii} non-ASCII character(s) replaced with '?' (0x3F). Use UTF-8 for full Unicode.`);
      }
      return { bytes: out, warnings };
    }

    if (encoding === "Latin-1") {
      const out = new Uint8Array(text.length);
      let outOfRange = 0;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 0xff) {
          outOfRange++;
          out[i] = 0x3f;
        } else {
          out[i] = code;
        }
      }
      if (outOfRange > 0) {
        warnings.push(`${outOfRange} character(s) outside ISO-8859-1 (0x00–0xFF) replaced with '?'.`);
      }
      return { bytes: out, warnings };
    }

    if (encoding === "Windows-1251") {
      const out = new Uint8Array(text.length);
      let unmapped = 0;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code <= 0x7f) {
          out[i] = code;
        } else {
          const mapped = WIN1251_REVERSE.get(code);
          if (mapped !== undefined) {
            out[i] = mapped;
          } else {
            unmapped++;
            out[i] = 0x3f;
          }
        }
      }
      if (unmapped > 0) {
        warnings.push(`${unmapped} character(s) cannot be represented in Windows-1251 and were replaced with '?'.`);
      }
      return { bytes: out, warnings };
    }

    // UTF-16 / UTF-16 LE / UTF-16 BE
    const littleEndian = encoding === "UTF-16 LE" || encoding === "UTF-16";
    const out = new Uint8Array(text.length * 2);
    const view = new DataView(out.buffer);
    for (let i = 0; i < text.length; i++) {
      view.setUint16(i * 2, text.charCodeAt(i), littleEndian);
    }
    return { bytes: out, warnings };
  },

  decode(bytes: Uint8Array, encoding: TextEncodingFormat = "UTF-8"): { text: string; warnings: string[] } {
    const warnings: string[] = [];
    if (encoding === "Plain Text" || encoding === "UTF-8") {
      return { text: new TextDecoder("utf-8", { fatal: false }).decode(bytes), warnings };
    }

    if (encoding === "ASCII") {
      let out = "";
      let highBytes = 0;
      for (const b of bytes) {
        if (b > 0x7f) {
          highBytes++;
          out += "\uFFFD";
        } else {
          out += String.fromCharCode(b);
        }
      }
      if (highBytes > 0) warnings.push(`${highBytes} byte(s) > 0x7F are outside 7-bit ASCII.`);
      return { text: out, warnings };
    }

    if (encoding === "Latin-1") {
      let out = "";
      for (const b of bytes) out += String.fromCharCode(b);
      return { text: out, warnings };
    }

    if (encoding === "Windows-1251") {
      let out = "";
      for (const b of bytes) {
        if (b <= 0x7f) out += String.fromCharCode(b);
        else out += String.fromCharCode(WIN1251_UPPER[b - 0x80] ?? 0x3f);
      }
      return { text: out, warnings };
    }

    // UTF-16 / LE / BE
    const littleEndian = encoding === "UTF-16 LE" || encoding === "UTF-16";
    if (bytes.length % 2 !== 0) {
      warnings.push("Odd byte count for UTF-16; trailing byte ignored.");
    }
    const usable = bytes.length - (bytes.length % 2);
    const view = new DataView(bytes.buffer, bytes.byteOffset, usable);
    let out = "";
    for (let i = 0; i < usable; i += 2) {
      out += String.fromCharCode(view.getUint16(i, littleEndian));
    }
    return { text: out, warnings };
  },

  stats(text: string, encoding: TextEncodingFormat = "UTF-8") {
    const { bytes } = this.encode(text, encoding);
    return {
      charCount: Array.from(text).length,
      codeUnitCount: text.length,
      byteCount: bytes.length,
    };
  },
};

