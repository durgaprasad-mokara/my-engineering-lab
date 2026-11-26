export const base64Converter = {
  encodeBytes(bytes: Uint8Array): string {
    if (bytes.length === 0) return "";
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const slice = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...slice);
    }
    return btoa(binary);
  },

  encodeText(text: string): string {
    return this.encodeBytes(new TextEncoder().encode(text));
  },

  decodeToBytes(base64: string): { bytes: Uint8Array; error?: string } {
    const cleaned = base64.trim().replace(/\s+/g, "");
    if (!cleaned) return { bytes: new Uint8Array() };
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
      return { bytes: new Uint8Array(), error: "Invalid Base64 string: check characters and '=' padding." };
    }
    try {
      const binary = atob(cleaned);
      const out = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
      }
      return { bytes: out };
    } catch {
      return { bytes: new Uint8Array(), error: "Failed to decode Base64 payload." };
    }
  },

  decodeToText(base64: string): { text: string; error?: string } {
    const { bytes, error } = this.decodeToBytes(base64);
    if (error) return { text: "", error };
    return { text: new TextDecoder("utf-8", { fatal: false }).decode(bytes) };
  },
};

