import { describe, expect, it } from "vitest";
import { base64Converter } from "@/lib/converter/base64-converter";
import { byteInspector } from "@/lib/converter/byte-inspector";
import { encodingConverter } from "@/lib/converter/encoding-converter";
import { checksumService, hashService } from "@/lib/converter/hash-service";
import { binaryConverter, decimalConverter, hexadecimalConverter } from "@/lib/converter/number-converters";
import { PAYLOAD_PRESETS, payloadDecoder } from "@/lib/converter/payload-decoder";
import { textConverter } from "@/lib/converter/text-converter";

describe("Engineering Data Converter — Text, Number Systems & Encodings", () => {
  const samples = [
    "ESP32 Telemetry",
    "తెలుగు ఇంజనీరింగ్",
    "Specials: <>&\"' @#$%",
    "Rocket 🚀⚡",
    "",
  ];

  it("round-trips UTF-8 text through Binary, Hex, Decimal, and Base64", () => {
    for (const sample of samples) {
      const { bytes } = textConverter.encode(sample, "UTF-8");

      const bin = binaryConverter.fromBytes(bytes, 8, " ");
      const fromBin = binaryConverter.toBytes(bin);
      expect(fromBin.error).toBeUndefined();
      expect(textConverter.decode(fromBin.bytes, "UTF-8").text).toBe(sample);

      const hex = hexadecimalConverter.fromBytes(bytes, " ", false, true);
      const fromHex = hexadecimalConverter.toBytes(hex);
      expect(fromHex.error).toBeUndefined();
      expect(textConverter.decode(fromHex.bytes, "UTF-8").text).toBe(sample);

      const dec = decimalConverter.fromBytes(bytes, " ");
      const fromDec = decimalConverter.toBytes(dec);
      expect(fromDec.error).toBeUndefined();
      expect(textConverter.decode(fromDec.bytes, "UTF-8").text).toBe(sample);

      const b64 = base64Converter.encodeBytes(bytes);
      const fromB64 = base64Converter.decodeToBytes(b64);
      expect(fromB64.error).toBeUndefined();
      expect(textConverter.decode(fromB64.bytes, "UTF-8").text).toBe(sample);
    }
  });

  it("supports UTF-16 LE/BE, Windows-1251, Latin-1, and warns on ASCII loss", () => {
    const utf16 = textConverter.encode("Hi 🚀", "UTF-16 BE");
    expect(textConverter.decode(utf16.bytes, "UTF-16 BE").text).toBe("Hi 🚀");

    const win = textConverter.encode("Привет", "Windows-1251");
    expect(textConverter.decode(win.bytes, "Windows-1251").text).toBe("Привет");

    const ascii = textConverter.encode("Temp 25°C", "ASCII");
    expect(ascii.warnings.length).toBeGreaterThan(0);
  });

  it("handles large payloads cleanly", () => {
    const large = "A1B2C3D4".repeat(1500); // 12 KB
    const { bytes } = textConverter.encode(large, "UTF-8");
    const b64 = base64Converter.encodeBytes(bytes);
    const decoded = base64Converter.decodeToText(b64);
    expect(decoded.error).toBeUndefined();
    expect(decoded.text).toBe(large);
  });

  it("rejects invalid binary, hex, decimal, and Base64 inputs with clear errors", () => {
    expect(binaryConverter.toBytes("01012").error).toBeDefined();
    expect(binaryConverter.toBytes("0101").error).toBeDefined();
    expect(hexadecimalConverter.toBytes("4G").error).toBeDefined();
    expect(hexadecimalConverter.toBytes("ABC").error).toBeDefined();
    expect(decimalConverter.toBytes("256").error).toBeDefined();
    expect(base64Converter.decodeToBytes("not!valid").error).toBeDefined();
  });

  it("converts integer radices and structured encodings (URL, HTML, JSON, Unicode)", () => {
    expect(decimalConverter.convertIntegerRadix("255", 10, 16).result).toBe("FF");
    expect(decimalConverter.convertIntegerRadix("FF", 16, 2).result).toBe("11111111");
    expect(decimalConverter.convertIntegerRadix("377", 8, 10).result).toBe("255");

    const urlEnc = encodingConverter.urlEncode("a=1&b=తెలుగు");
    expect(encodingConverter.urlDecode(urlEnc).result).toBe("a=1&b=తెలుగు");

    const htmlEnc = encodingConverter.htmlEncode('<script>"x"</script>');
    expect(encodingConverter.htmlDecode(htmlEnc)).toBe('<script>"x"</script>');

    const formatted = encodingConverter.jsonFormat('{"a":1,"b":2}');
    expect(formatted.result).toContain("\n");
    expect(encodingConverter.jsonMinify(formatted.result).result).toBe('{"a":1,"b":2}');

    const uni = encodingConverter.toUnicodeEscapes("A🚀");
    expect(encodingConverter.fromUnicodeEscapes(uni).result).toBe("A🚀");
  });
});

describe("Engineering Data Converter — Hash & Checksum Test Vectors", () => {
  it("matches standard CRC32, MD5, SHA-1, SHA-256, RIPEMD-128, and RIPEMD-160 test vectors", async () => {
    const bytes123 = new TextEncoder().encode("123456789");
    expect(checksumService.crc32(bytes123)).toBe("cbf43926");

    const abc = new TextEncoder().encode("abc");
    expect((await hashService.digest("MD5", abc)).hex).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect((await hashService.digest("SHA-1", abc)).hex).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect((await hashService.digest("SHA-256", abc)).hex).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect((await hashService.digest("RIPEMD-128", abc)).hex).toBe("c14a12199c66e4ba84636b0f69144c77");
    expect((await hashService.digest("RIPEMD-160", abc)).hex).toBe("8eb208f7e05d987a9b044a8e98c6b087f15a0bfc");
  });

  it("compares digests case-insensitively and identifies mismatch index", () => {
    expect(hashService.compareDigests("ABCD", "abcd").match).toBe(true);
    const diff = hashService.compareDigests("abcd", "abfd");
    expect(diff.match).toBe(false);
    expect(diff.firstDiffIndex).toBe(2);
  });
});

describe("Engineering Data Converter — Byte Inspector & IoT Payload Decoder", () => {
  it("inspects byte offsets and detects UTF-8 vs ASCII", () => {
    const bytes = new TextEncoder().encode("ESP32 🚀");
    const info = byteInspector.inspect(bytes);
    expect(info.totalBytes).toBe(bytes.length);
    expect(info.detectedEncoding).toContain("UTF-8");
    expect(info.rows[0]?.offsetHex).toBe("0x0000");
  });

  it("decodes configured IoT payload fields with scaling and bounds checks", () => {
    const preset = PAYLOAD_PRESETS[0]!;
    const { bytes } = hexadecimalConverter.toBytes(preset.sampleHex);
    const decoded = payloadDecoder.decode(bytes, preset.fields);
    // 0x09C4 = 2500 * 0.01 = 25 °C
    expect(decoded[0]?.scaledValue).toBe(25);
    // 0x154A = 5450 * 0.01 = 54.5 %RH
    expect(decoded[1]?.scaledValue).toBe(54.5);
    // Out-of-bounds field returns explicit error
    const oob = payloadDecoder.decode(bytes, [
      { id: "oob", name: "OOB", byteOffset: 7, type: "uint16", endianness: "BE", scale: 1, offsetValue: 0, unit: "" },
    ]);
    expect(oob[0]?.error).toBeDefined();
  });
});

