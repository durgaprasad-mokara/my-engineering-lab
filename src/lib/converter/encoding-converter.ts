const HTML_ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const HTML_DECODE_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": "\u00A0",
};

export const encodingConverter = {
  urlEncode(text: string): string {
    return encodeURIComponent(text);
  },

  urlDecode(text: string): { result: string; error?: string } {
    try {
      return { result: decodeURIComponent(text) };
    } catch {
      return { result: "", error: "Malformed percent-encoded URL sequence." };
    }
  },

  htmlEncode(text: string): string {
    return text.replace(/[&<>"']/g, (ch) => HTML_ENCODE_MAP[ch] ?? ch);
  },

  htmlDecode(text: string): string {
    return text
      .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (ent) => HTML_DECODE_MAP[ent] ?? ent)
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  },

  jsonFormat(text: string): { result: string; error?: string } {
    if (!text.trim()) return { result: "" };
    try {
      return { result: JSON.stringify(JSON.parse(text), null, 2) };
    } catch (e) {
      return { result: "", error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON." };
    }
  },

  jsonMinify(text: string): { result: string; error?: string } {
    if (!text.trim()) return { result: "" };
    try {
      return { result: JSON.stringify(JSON.parse(text)) };
    } catch (e) {
      return { result: "", error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON." };
    }
  },

  toUnicodeEscapes(text: string): string {
    let out = "";
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      if (cp > 0xffff) {
        out += `\\u{${cp.toString(16).toUpperCase()}}`;
      } else {
        out += `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`;
      }
    }
    return out;
  },

  fromUnicodeEscapes(text: string): { result: string; error?: string } {
    try {
      const result = text
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/U\+([0-9a-fA-F]{4,6})/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
      return { result };
    } catch {
      return { result: "", error: "Invalid Unicode escape sequence." };
    }
  },
};

