// Checksum & Message Digest Services
// - CRC32 (IEEE 802.3 checksum — non-cryptographic)
// - MD5 (RFC 1321 — legacy hash, not for security-sensitive applications)
// - SHA-1 (Web Crypto API — legacy hash, not for security-sensitive applications)
// - SHA-256, SHA-384, SHA-512 (Web Crypto API — cryptographic hashes)
// - RIPEMD-128, RIPEMD-160 (pure TypeScript)

export type DigestAlgorithm =
  | "CRC32"
  | "MD5"
  | "SHA-1"
  | "SHA-256"
  | "SHA-384"
  | "SHA-512"
  | "RIPEMD-128"
  | "RIPEMD-160";

export type DigestKind = "checksum" | "legacy-hash" | "cryptographic-hash";

export interface DigestResult {
  algorithm: DigestAlgorithm;
  hex: string;
  kind: DigestKind;
  securityNote: string;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export const checksumService = {
  crc32(bytes: Uint8Array): string {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = CRC32_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
    }
    return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
  },
};

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function toHexLE(words: number[]): string {
  return words
    .map((w) => {
      const b0 = w & 0xff;
      const b1 = (w >>> 8) & 0xff;
      const b2 = (w >>> 16) & 0xff;
      const b3 = (w >>> 24) & 0xff;
      return [b0, b1, b2, b3].map((b) => b.toString(16).padStart(2, "0")).join("");
    })
    .join("");
}

function pad64BitLE(bytes: Uint8Array): Uint8Array {
  const bitLen = bytes.length * 8;
  const padLen = ((56 - ((bytes.length + 1) % 64)) + 64) % 64;
  const out = new Uint8Array(bytes.length + 1 + padLen + 8);
  out.set(bytes, 0);
  out[bytes.length] = 0x80;
  const view = new DataView(out.buffer);
  view.setUint32(out.length - 8, bitLen >>> 0, true);
  view.setUint32(out.length - 4, Math.floor(bitLen / 0x100000000) >>> 0, true);
  return out;
}

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0);

function computeMd5(bytes: Uint8Array): string {
  const padded = pad64BitLE(bytes);
  const view = new DataView(padded.buffer);
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(offset + j * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const temp = (A + F + MD5_K[i]! + M[g]!) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(temp, MD5_S[i]!)) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  return toHexLE([a0, b0, c0, d0]);
}

// RIPEMD-128 & RIPEMD-160 shared compression helpers
const RMD_ZL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
];
const RMD_ZR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
];
const RMD_SL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
];
const RMD_SR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
];

function rmdF(j: number, x: number, y: number, z: number): number {
  if (j < 16) return x ^ y ^ z;
  if (j < 32) return (x & y) | (~x & z);
  if (j < 48) return (x | ~y) ^ z;
  if (j < 64) return (x & z) | (y & ~z);
  return x ^ (y | ~z);
}

function computeRipemd128(bytes: Uint8Array): string {
  const padded = pad64BitLE(bytes);
  const view = new DataView(padded.buffer);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc];
  const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x00000000];

  for (let offset = 0; offset < padded.length; offset += 64) {
    const X = new Uint32Array(16);
    for (let i = 0; i < 16; i++) X[i] = view.getUint32(offset + i * 4, true);
    let al = h0, bl = h1, cl = h2, dl = h3;
    let ar = h0, br = h1, cr = h2, dr = h3;
    for (let j = 0; j < 64; j++) {
      const rnd = Math.floor(j / 16);
      const tl = rotl((al + rmdF(j, bl, cl, dl) + X[RMD_ZL[j]!]! + KL[rnd]!) >>> 0, RMD_SL[j]!);
      al = dl; dl = cl; cl = bl; bl = tl;
      const tr = rotl((ar + rmdF(63 - j, br, cr, dr) + X[RMD_ZR[j]!]! + KR[rnd]!) >>> 0, RMD_SR[j]!);
      ar = dr; dr = cr; cr = br; br = tr;
    }
    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + ar) >>> 0;
    h2 = (h3 + al + br) >>> 0;
    h3 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }
  return toHexLE([h0, h1, h2, h3]);
}

function computeRipemd160(bytes: Uint8Array): string {
  const padded = pad64BitLE(bytes);
  const view = new DataView(padded.buffer);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
  const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

  for (let offset = 0; offset < padded.length; offset += 64) {
    const X = new Uint32Array(16);
    for (let i = 0; i < 16; i++) X[i] = view.getUint32(offset + i * 4, true);
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    for (let j = 0; j < 80; j++) {
      const rnd = Math.floor(j / 16);
      const tl = (rotl((al + rmdF(j, bl, cl, dl) + X[RMD_ZL[j]!]! + KL[rnd]!) >>> 0, RMD_SL[j]!) + el) >>> 0;
      al = el; el = dl; dl = rotl(cl, 10); cl = bl; bl = tl;
      const tr = (rotl((ar + rmdF(79 - j, br, cr, dr) + X[RMD_ZR[j]!]! + KR[rnd]!) >>> 0, RMD_SR[j]!) + er) >>> 0;
      ar = er; er = dr; dr = rotl(cr, 10); cr = br; br = tr;
    }
    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }
  return toHexLE([h0, h1, h2, h3, h4]);
}

async function webCryptoHex(alg: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await globalThis.crypto.subtle.digest(alg, copy.buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const hashService = {
  md5: computeMd5,
  ripemd128: computeRipemd128,
  ripemd160: computeRipemd160,

  async digest(algorithm: DigestAlgorithm, bytes: Uint8Array): Promise<DigestResult> {
    switch (algorithm) {
      case "CRC32":
        return {
          algorithm,
          hex: checksumService.crc32(bytes),
          kind: "checksum",
          securityNote: "Non-cryptographic error-detection checksum (IEEE 802.3).",
        };
      case "MD5":
        return {
          algorithm,
          hex: computeMd5(bytes),
          kind: "legacy-hash",
          securityNote: "Legacy algorithm — vulnerable to collisions; not recommended for security-sensitive verification.",
        };
      case "SHA-1":
        return {
          algorithm,
          hex: await webCryptoHex("SHA-1", bytes),
          kind: "legacy-hash",
          securityNote: "Legacy algorithm — deprecated for collision resistance; do not use for security signatures.",
        };
      case "SHA-256":
        return {
          algorithm,
          hex: await webCryptoHex("SHA-256", bytes),
          kind: "cryptographic-hash",
          securityNote: "Cryptographic SHA-2 digest (Web Crypto API). Verify against a trusted reference or signature.",
        };
      case "SHA-384":
        return {
          algorithm,
          hex: await webCryptoHex("SHA-384", bytes),
          kind: "cryptographic-hash",
          securityNote: "Cryptographic SHA-2 digest (Web Crypto API). Verify against a trusted reference or signature.",
        };
      case "SHA-512":
        return {
          algorithm,
          hex: await webCryptoHex("SHA-512", bytes),
          kind: "cryptographic-hash",
          securityNote: "Cryptographic SHA-2 digest (Web Crypto API). Verify against a trusted reference or signature.",
        };
      case "RIPEMD-128":
        return {
          algorithm,
          hex: computeRipemd128(bytes),
          kind: "legacy-hash",
          securityNote: "128-bit legacy digest; insufficient collision margin for modern security.",
        };
      case "RIPEMD-160":
        return {
          algorithm,
          hex: computeRipemd160(bytes),
          kind: "cryptographic-hash",
          securityNote: "160-bit RIPEMD digest. Verify against a trusted reference or signature.",
        };
    }
  },

  async computeAll(bytes: Uint8Array): Promise<DigestResult[]> {
    const algs: DigestAlgorithm[] = [
      "CRC32",
      "MD5",
      "SHA-1",
      "SHA-256",
      "SHA-384",
      "SHA-512",
      "RIPEMD-128",
      "RIPEMD-160",
    ];
    return Promise.all(algs.map((a) => this.digest(a, bytes)));
  },

  compareDigests(a: string, b: string): { match: boolean; normalizedA: string; normalizedB: string; firstDiffIndex: number } {
    const normalizedA = a.trim().replace(/^0x/i, "").replace(/\s+/g, "").toLowerCase();
    const normalizedB = b.trim().replace(/^0x/i, "").replace(/\s+/g, "").toLowerCase();
    if (!normalizedA || !normalizedB) {
      return { match: false, normalizedA, normalizedB, firstDiffIndex: -1 };
    }
    const maxLen = Math.max(normalizedA.length, normalizedB.length);
    let firstDiffIndex = -1;
    for (let i = 0; i < maxLen; i++) {
      if (normalizedA[i] !== normalizedB[i]) {
        firstDiffIndex = i;
        break;
      }
    }
    return {
      match: normalizedA === normalizedB,
      normalizedA,
      normalizedB,
      firstDiffIndex,
    };
  },
};

