export const binaryConverter = {
  validate(input: string): { valid: boolean; cleaned: string; error?: string } {
    const stripped = input.replace(/[\s,_|-]+/g, "").replace(/^0b/i, "");
    if (!stripped) return { valid: true, cleaned: "" };
    if (!/^[01]+$/.test(stripped)) {
      return { valid: false, cleaned: stripped, error: "Invalid binary input: only 0 and 1 bits are allowed." };
    }
    return { valid: true, cleaned: stripped };
  },

  fromBytes(bytes: Uint8Array, bitGroup = 8, separator = " "): string {
    const bits = Array.from(bytes, (b) => b.toString(2).padStart(8, "0")).join("");
    if (!bits) return "";
    if (bitGroup <= 0) return bits;
    const chunks: string[] = [];
    for (let i = 0; i < bits.length; i += bitGroup) {
      chunks.push(bits.slice(i, i + bitGroup));
    }
    return chunks.join(separator);
  },

  toBytes(input: string): { bytes: Uint8Array; error?: string } {
    const check = this.validate(input);
    if (!check.valid) return { bytes: new Uint8Array(), error: check.error };
    if (!check.cleaned) return { bytes: new Uint8Array() };
    if (check.cleaned.length % 8 !== 0) {
      return {
        bytes: new Uint8Array(),
        error: `Binary bit length (${check.cleaned.length}) must be a multiple of 8 bits to decode bytes.`,
      };
    }
    const out = new Uint8Array(check.cleaned.length / 8);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(check.cleaned.slice(i * 8, i * 8 + 8), 2);
    }
    return { bytes: out };
  },

  toInteger(input: string): { value: bigint | null; error?: string } {
    const check = this.validate(input);
    if (!check.valid) return { value: null, error: check.error };
    if (!check.cleaned) return { value: null };
    return { value: BigInt(`0b${check.cleaned}`) };
  },
};

export const decimalConverter = {
  fromBytes(bytes: Uint8Array, separator = " "): string {
    return Array.from(bytes, (b) => b.toString(10)).join(separator);
  },

  toBytes(input: string): { bytes: Uint8Array; error?: string } {
    const trimmed = input.trim();
    if (!trimmed) return { bytes: new Uint8Array() };
    const tokens = trimmed.split(/[\s,;]+/).filter(Boolean);
    const out = new Uint8Array(tokens.length);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]!;
      if (!/^\d+$/.test(tok)) {
        return { bytes: new Uint8Array(), error: `Invalid decimal byte token "${tok}". Expected 0–255.` };
      }
      const num = Number(tok);
      if (num < 0 || num > 255) {
        return { bytes: new Uint8Array(), error: `Byte value ${num} out of range (must be 0–255).` };
      }
      out[i] = num;
    }
    return { bytes: out };
  },

  convertIntegerRadix(input: string, fromBase: 2 | 8 | 10 | 16, toBase: 2 | 8 | 10 | 16): { result: string; error?: string } {
    const cleaned = input.trim().replace(/[\s_]/g, "");
    if (!cleaned) return { result: "" };
    try {
      let big: bigint;
      if (fromBase === 2) {
        const s = cleaned.replace(/^0b/i, "");
        if (!/^[01]+$/.test(s)) return { result: "", error: "Invalid binary integer." };
        big = BigInt(`0b${s}`);
      } else if (fromBase === 8) {
        const s = cleaned.replace(/^0o/i, "");
        if (!/^[0-7]+$/.test(s)) return { result: "", error: "Invalid octal integer." };
        big = BigInt(`0o${s}`);
      } else if (fromBase === 16) {
        const s = cleaned.replace(/^0x/i, "");
        if (!/^[0-9a-fA-F]+$/.test(s)) return { result: "", error: "Invalid hexadecimal integer." };
        big = BigInt(`0x${s}`);
      } else {
        if (!/^-?\d+$/.test(cleaned)) return { result: "", error: "Invalid decimal integer." };
        big = BigInt(cleaned);
      }
      return { result: big.toString(toBase).toUpperCase() };
    } catch {
      return { result: "", error: "Failed to parse integer value." };
    }
  },
};

export const hexadecimalConverter = {
  validate(input: string): { valid: boolean; cleaned: string; error?: string } {
    const stripped = input
      .replace(/0x/gi, "")
      .replace(/[\s,:_-]+/g, "");
    if (!stripped) return { valid: true, cleaned: "" };
    if (!/^[0-9a-fA-F]+$/.test(stripped)) {
      return { valid: false, cleaned: stripped, error: "Invalid hexadecimal input: only 0–9 and A–F are allowed." };
    }
    if (stripped.length % 2 !== 0) {
      return { valid: false, cleaned: stripped, error: `Hex string has odd length (${stripped.length}); bytes require pairs.` };
    }
    return { valid: true, cleaned: stripped.toUpperCase() };
  },

  fromBytes(bytes: Uint8Array, separator = " ", prefix = false, uppercase = true): string {
    return Array.from(bytes, (b) => {
      const hex = b.toString(16).padStart(2, "0");
      const cased = uppercase ? hex.toUpperCase() : hex.toLowerCase();
      return prefix ? `0x${cased}` : cased;
    }).join(separator);
  },

  toBytes(input: string): { bytes: Uint8Array; error?: string } {
    const check = this.validate(input);
    if (!check.valid) return { bytes: new Uint8Array(), error: check.error };
    if (!check.cleaned) return { bytes: new Uint8Array() };
    const out = new Uint8Array(check.cleaned.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(check.cleaned.slice(i * 2, i * 2 + 2), 16);
    }
    return { bytes: out };
  },
};

export const octalConverter = {
  fromBytes(bytes: Uint8Array, separator = " "): string {
    return Array.from(bytes, (b) => b.toString(8).padStart(3, "0")).join(separator);
  },
  toBytes(input: string): { bytes: Uint8Array; error?: string } {
    const trimmed = input.trim();
    if (!trimmed) return { bytes: new Uint8Array() };
    const tokens = trimmed.split(/[\s,;]+/).filter(Boolean);
    const out = new Uint8Array(tokens.length);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]!.replace(/^0o/i, "");
      if (!/^[0-7]+$/.test(tok)) {
        return { bytes: new Uint8Array(), error: `Invalid octal token "${tokens[i]}".` };
      }
      const num = parseInt(tok, 8);
      if (num > 255) {
        return { bytes: new Uint8Array(), error: `Octal value ${tokens[i]} exceeds 8-bit byte range (0–377).` };
      }
      out[i] = num;
    }
    return { bytes: out };
  },
};

