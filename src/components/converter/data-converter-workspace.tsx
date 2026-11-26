"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Binary,
  Bookmark,
  Check,
  Code2,
  Copy,
  Cpu,
  Download,
  FileCode,
  FileUp,
  GitCompare,
  Hash,
  History,
  Layers,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { base64Converter } from "@/lib/converter/base64-converter";
import { byteInspector } from "@/lib/converter/byte-inspector";
import { encodingConverter } from "@/lib/converter/encoding-converter";
import { hashService, type DigestResult } from "@/lib/converter/hash-service";
import {
  binaryConverter,
  decimalConverter,
  hexadecimalConverter,
  octalConverter,
} from "@/lib/converter/number-converters";
import {
  PAYLOAD_PRESETS,
  payloadDecoder,
  type PayloadFieldSchema,
  type PayloadFieldType,
} from "@/lib/converter/payload-decoder";
import { TEXT_ENCODINGS, textConverter, type TextEncodingFormat } from "@/lib/converter/text-converter";

type ConverterTab =
  | "multi-panel"
  | "numbers"
  | "encoding"
  | "hashing"
  | "byte-inspector"
  | "iot-payload"
  | "file-converter"
  | "comparison";

const TABS: Array<{ id: ConverterTab; label: string; icon: typeof Type }> = [
  { id: "multi-panel", label: "Text & Multi-Panel", icon: Type },
  { id: "numbers", label: "Number System Converter", icon: Binary },
  { id: "encoding", label: "Encoding & Decoding", icon: Code2 },
  { id: "hashing", label: "Hash & Checksum", icon: Hash },
  { id: "byte-inspector", label: "Byte Inspector", icon: Layers },
  { id: "iot-payload", label: "IoT Payload Decoder", icon: Cpu },
  { id: "file-converter", label: "File Converter", icon: FileUp },
  { id: "comparison", label: "Data Comparison", icon: GitCompare },
];

const HISTORY_KEY = "mel_converter_history_v1";
const FAVORITES_KEY = "mel_converter_favorites_v1";

interface HistoryEntry {
  id: string;
  source: string;
  preview: string;
  timestamp: string;
}

export function DataConverterWorkspace() {
  const [activeTab, setActiveTab] = useState<ConverterTab>("multi-panel");
  const [toast, setToast] = useState<string | null>(null);

  // Core multi-panel state
  const [textEncoding, setTextEncoding] = useState<TextEncodingFormat>("UTF-8");
  const [textVal, setTextVal] = useState("ESP32 Telemetry: 24.5°C 🚀");
  const [binaryVal, setBinaryVal] = useState("");
  const [hexVal, setHexVal] = useState("");
  const [base64Val, setBase64Val] = useState("");
  const [decimalVal, setDecimalVal] = useState("");
  const [octalVal, setOctalVal] = useState("");

  // Formatting options
  const [binaryGroup, setBinaryGroup] = useState<number>(8);
  const [hexSeparator, setHexSeparator] = useState<string>(" ");
  const [hexPrefix, setHexPrefix] = useState<boolean>(false);

  // Digests
  const [digests, setDigests] = useState<DigestResult[]>([]);
  const [digestLoading, setDigestLoading] = useState(false);

  // Status / warnings / history
  const [statusMsg, setStatusMsg] = useState<string>("Ready");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Number system integer radix converter
  const [radixInput, setRadixInput] = useState("255");
  const [radixFrom, setRadixFrom] = useState<2 | 8 | 10 | 16>(10);

  // Encoding / Decoding tab state
  const [encInput, setEncInput] = useState('{"device":"esp32","tempC":24.5,"msg":"Hello & Welcome 🚀"}');
  const [encOutput, setEncOutput] = useState("");
  const [encError, setEncError] = useState<string | null>(null);

  // Hash compare state
  const [hashA, setHashA] = useState("");
  const [hashB, setHashB] = useState("");

  // Byte inspector selected byte index
  const [selectedByteIdx, setSelectedByteIdx] = useState<number | null>(0);

  // IoT Payload Decoder state
  const [payloadPresetId, setPayloadPresetId] = useState(PAYLOAD_PRESETS[0]!.id);
  const [payloadHex, setPayloadHex] = useState(PAYLOAD_PRESETS[0]!.sampleHex);
  const [payloadFields, setPayloadFields] = useState<PayloadFieldSchema[]>(PAYLOAD_PRESETS[0]!.fields);

  // File converter state
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileDigests, setFileDigests] = useState<DigestResult[]>([]);

  // Data comparison state
  const [cmpMode, setCmpMode] = useState<"text" | "hex" | "binary" | "checksum">("hex");
  const [cmpLeft, setCmpLeft] = useState("48 65 6C 6C 6F");
  const [cmpRight, setCmpRight] = useState("48 65 6C 70 6F");

  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h) as HistoryEntry[]);
      const f = localStorage.getItem(FAVORITES_KEY);
      if (f) setFavorites(JSON.parse(f) as string[]);
    } catch {}
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((c) => (c === msg ? null : c)), 2400);
  }, []);

  const copyText = useCallback(
    async (value: string, label: string) => {
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        notify(`Copied ${label} to clipboard.`);
      } catch {
        notify("Clipboard write failed.");
      }
    },
    [notify],
  );

  const downloadText = useCallback((value: string, filename: string) => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const recordHistory = useCallback((source: string, preview: string) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      source,
      preview: preview.slice(0, 48),
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const syncFromBytes = useCallback(
    async (
      bytes: Uint8Array,
      source: "TEXT" | "BINARY" | "HEX" | "BASE64" | "DECIMAL" | "OCTAL",
      skipSource = false,
    ) => {
      setErrorMsg(null);
      if (source !== "TEXT" || !skipSource) {
        const decoded = textConverter.decode(bytes, textEncoding);
        setTextVal(decoded.text);
        setWarnings(decoded.warnings);
      }
      if (source !== "BINARY" || !skipSource) {
        setBinaryVal(binaryConverter.fromBytes(bytes, binaryGroup, " "));
      }
      if (source !== "HEX" || !skipSource) {
        setHexVal(hexadecimalConverter.fromBytes(bytes, hexSeparator, hexPrefix, true));
      }
      if (source !== "BASE64" || !skipSource) {
        setBase64Val(base64Converter.encodeBytes(bytes));
      }
      if (source !== "DECIMAL" || !skipSource) {
        setDecimalVal(decimalConverter.fromBytes(bytes, " "));
      }
      if (source !== "OCTAL" || !skipSource) {
        setOctalVal(octalConverter.fromBytes(bytes, " "));
      }

      setDigestLoading(true);
      try {
        const computed = await hashService.computeAll(bytes);
        setDigests(computed);
      } finally {
        setDigestLoading(false);
      }
      setStatusMsg(`Converted ${bytes.length} byte(s) from ${source}`);
    },
    [binaryGroup, hexPrefix, hexSeparator, textEncoding],
  );

  // Initial sync on mount
  useEffect(() => {
    const { bytes, warnings: w } = textConverter.encode(textVal, textEncoding);
    setWarnings(w);
    void syncFromBytes(bytes, "TEXT", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function convertFromText(nextText = textVal, nextEnc = textEncoding) {
    const { bytes, warnings: w } = textConverter.encode(nextText, nextEnc);
    setWarnings(w);
    void syncFromBytes(bytes, "TEXT", true);
    recordHistory(`TEXT (${nextEnc})`, nextText);
  }

  function convertFromBinary(val = binaryVal) {
    const { bytes, error } = binaryConverter.toBytes(val);
    if (error) {
      setErrorMsg(error);
      return;
    }
    void syncFromBytes(bytes, "BINARY", true);
    recordHistory("BINARY", val);
  }

  function convertFromHex(val = hexVal) {
    const { bytes, error } = hexadecimalConverter.toBytes(val);
    if (error) {
      setErrorMsg(error);
      return;
    }
    void syncFromBytes(bytes, "HEX", true);
    recordHistory("HEX", val);
  }

  function convertFromBase64(val = base64Val) {
    const { bytes, error } = base64Converter.decodeToBytes(val);
    if (error) {
      setErrorMsg(error);
      return;
    }
    void syncFromBytes(bytes, "BASE64", true);
    recordHistory("BASE64", val);
  }

  function convertFromDecimal(val = decimalVal) {
    const { bytes, error } = decimalConverter.toBytes(val);
    if (error) {
      setErrorMsg(error);
      return;
    }
    void syncFromBytes(bytes, "DECIMAL", true);
    recordHistory("DECIMAL", val);
  }

  function convertFromOctal(val = octalVal) {
    const { bytes, error } = octalConverter.toBytes(val);
    if (error) {
      setErrorMsg(error);
      return;
    }
    void syncFromBytes(bytes, "OCTAL", true);
    recordHistory("OCTAL", val);
  }

  function clearAll() {
    setTextVal("");
    setBinaryVal("");
    setHexVal("");
    setBase64Val("");
    setDecimalVal("");
    setOctalVal("");
    setDigests([]);
    setWarnings([]);
    setErrorMsg(null);
    setStatusMsg("Cleared workspace");
  }

  function toggleFavoriteOp(op: string) {
    setFavorites((prev) => {
      const next = prev.includes(op) ? prev.filter((x) => x !== op) : [...prev, op];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const activeBytes = useMemo(() => textConverter.encode(textVal, textEncoding).bytes, [textVal, textEncoding]);
  const textStats = useMemo(() => textConverter.stats(textVal, textEncoding), [textVal, textEncoding]);
  const inspection = useMemo(() => byteInspector.inspect(activeBytes, 16, 128), [activeBytes]);

  const payloadDecodeResult = useMemo(() => {
    const parsed = hexadecimalConverter.toBytes(payloadHex);
    if (parsed.error) return { error: parsed.error, fields: [] };
    return { error: null, fields: payloadDecoder.decode(parsed.bytes, payloadFields) };
  }, [payloadHex, payloadFields]);

  const radixResults = useMemo(() => {
    return {
      bin: decimalConverter.convertIntegerRadix(radixInput, radixFrom, 2),
      oct: decimalConverter.convertIntegerRadix(radixInput, radixFrom, 8),
      dec: decimalConverter.convertIntegerRadix(radixInput, radixFrom, 10),
      hex: decimalConverter.convertIntegerRadix(radixInput, radixFrom, 16),
    };
  }, [radixInput, radixFrom]);

  const hashCompare = useMemo(() => hashService.compareDigests(hashA, hashB), [hashA, hashB]);

  const dataComparison = useMemo(() => {
    const a = cmpLeft.trim();
    const b = cmpRight.trim();
    if (cmpMode === "checksum" || cmpMode === "hex") {
      return hashService.compareDigests(a, b);
    }
    const maxLen = Math.max(a.length, b.length);
    let firstDiffIndex = -1;
    for (let i = 0; i < maxLen; i++) {
      if (a[i] !== b[i]) {
        firstDiffIndex = i;
        break;
      }
    }
    return { match: a === b && a.length > 0, normalizedA: a, normalizedB: b, firstDiffIndex };
  }, [cmpLeft, cmpRight, cmpMode]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setFileMeta({ name: file.name, size: file.size, type: file.type || "application/octet-stream" });
    setFileBytes(bytes);
    const computed = await hashService.computeAll(bytes);
    setFileDigests(computed);
    notify(`Loaded ${file.name} (${bytes.length} bytes).`);
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg"
        >
          <Check className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <Button
              key={t.id}
              size="sm"
              variant={active ? "default" : "ghost"}
              className="h-8 text-xs"
              onClick={() => setActiveTab(t.id)}
            >
              <Icon className="size-3.5" />
              {t.label}
            </Button>
          );
        })}
      </div>

      {/* Status & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={errorMsg ? "danger" : "success"}>{errorMsg ? "Validation Error" : "Synced"}</Badge>
          <span className="text-muted-foreground">{statusMsg}</span>
          <span className="font-mono text-foreground">
            {textStats.charCount} chars · {textStats.byteCount} bytes ({textEncoding})
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromText()}>
            <RefreshCw className="size-3" />
            Convert All
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={clearAll}>
            <Trash2 className="size-3" />
            Clear
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => toggleFavoriteOp(`TEXT(${textEncoding}) -> HEX/B64`)}
          >
            <Bookmark className="size-3" />
            Save Preset ({favorites.length})
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
          {errorMsg}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          {warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}

      {/* TAB 1: MULTI-PANEL CONVERTER (6 PANELS) */}
      {activeTab === "multi-panel" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Panel 1: TEXT */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">1. TEXT</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={textEncoding}
                      onChange={(e) => {
                        const enc = e.target.value as TextEncodingFormat;
                        setTextEncoding(enc);
                        convertFromText(textVal, enc);
                      }}
                      aria-label="Text character encoding"
                      className="h-7 rounded border border-border bg-background px-2 text-xs"
                    >
                      {TEXT_ENCODINGS.map((enc) => (
                        <option key={enc} value={enc}>
                          {enc}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyText(textVal, "Text")}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => downloadText(textVal, "converted-text.txt")}>
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={textVal}
                  onChange={(e) => {
                    setTextVal(e.target.value);
                    convertFromText(e.target.value, textEncoding);
                  }}
                  rows={4}
                  placeholder="Enter English, Telugu (తెలుగు), emojis, or raw text..."
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Supports UTF-8, ASCII, Windows-1251, UTF-16 LE/BE, Latin-1</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromText()}>
                    Encode Text →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel 2: BINARY */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">2. BINARY</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={binaryGroup}
                      onChange={(e) => setBinaryGroup(Number(e.target.value))}
                      aria-label="Binary bit grouping"
                      className="h-7 rounded border border-border bg-background px-2 text-xs"
                    >
                      <option value={8}>8-bit bytes</option>
                      <option value={4}>4-bit nibbles</option>
                      <option value={16}>16-bit words</option>
                      <option value={0}>No grouping</option>
                    </select>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyText(binaryVal, "Binary")}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => downloadText(binaryVal, "converted-binary.txt")}>
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={binaryVal}
                  onChange={(e) => setBinaryVal(e.target.value)}
                  rows={4}
                  placeholder="01000101 01010011 01010000"
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>8-bit aligned binary octets</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromBinary()}>
                    Decode Binary →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel 3: HEX */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">3. HEXADECIMAL</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={hexSeparator}
                      onChange={(e) => setHexSeparator(e.target.value)}
                      aria-label="Hex separator"
                      className="h-7 rounded border border-border bg-background px-2 text-xs"
                    >
                      <option value=" ">Space</option>
                      <option value=":">Colon (:)</option>
                      <option value="">Compact</option>
                    </select>
                    <Button
                      size="sm"
                      variant={hexPrefix ? "default" : "outline"}
                      className="h-7 px-2 font-mono text-[11px]"
                      onClick={() => setHexPrefix((v) => !v)}
                    >
                      0x
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyText(hexVal, "Hex")}>
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={hexVal}
                  onChange={(e) => setHexVal(e.target.value)}
                  rows={4}
                  placeholder="45 53 50 33 32"
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Accepts spaces, colons, or 0x prefixes</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromHex()}>
                    Decode Hex →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel 4: BASE64 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">4. BASE64</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyText(base64Val, "Base64")}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => downloadText(base64Val, "converted-base64.txt")}>
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={base64Val}
                  onChange={(e) => setBase64Val(e.target.value)}
                  rows={4}
                  placeholder="RVNQMzIgVGVsZW1ldHJ5"
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>RFC 4648 byte-safe Base64</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromBase64()}>
                    Decode Base64 →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel 5: DECIMAL */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">5. DECIMAL (BYTES &amp; OCTAL)</CardTitle>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyText(decimalVal, "Decimal")}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={decimalVal}
                  onChange={(e) => setDecimalVal(e.target.value)}
                  rows={3}
                  placeholder="69 83 80 51 50"
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11px] text-muted-foreground">Octal: {octalVal || "—"}</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromDecimal()}>
                      Decode Decimal →
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => convertFromOctal()}>
                      Decode Octal →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel 6: MESSAGE DIGEST / CHECKSUM */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold tracking-wide">6. MESSAGE DIGEST / CHECKSUM</CardTitle>
                  {digestLoading && <Badge variant="outline">Computing…</Badge>}
                </div>
                <CardDescription className="text-[11px]">
                  MD5 and SHA-1 are legacy algorithms (not for security). CRC32 is a non-cryptographic checksum.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {digests.map((d) => (
                  <div key={d.algorithm} className="flex items-center justify-between gap-2 rounded border border-border/70 bg-muted/20 px-2.5 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-20 font-semibold">{d.algorithm}</span>
                      {d.kind === "legacy-hash" && (
                        <Badge variant="warning" className="text-[9px]">
                          Legacy
                        </Badge>
                      )}
                      {d.kind === "checksum" && (
                        <Badge variant="outline" className="text-[9px]">
                          Checksum
                        </Badge>
                      )}
                    </div>
                    <code className="max-w-[230px] truncate font-mono text-[11px] text-foreground">{d.hex}</code>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyText(d.hex, d.algorithm)}>
                      <Copy className="size-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent History */}
          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <History className="size-3.5" />
                  Recent Conversion History
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <Badge key={h.id} variant="outline" className="font-mono text-[11px]">
                    {h.timestamp} · {h.source}: {h.preview}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: NUMBER SYSTEM CONVERTER */}
      {activeTab === "numbers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arbitrary-Precision Integer Radix Converter</CardTitle>
            <CardDescription className="text-xs">
              Convert integers cleanly across Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-[11px] text-muted-foreground">Source Radix</label>
                <select
                  value={radixFrom}
                  onChange={(e) => setRadixFrom(Number(e.target.value) as 2 | 8 | 10 | 16)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs"
                >
                  <option value={10}>Decimal (Base 10)</option>
                  <option value={16}>Hexadecimal (Base 16)</option>
                  <option value={2}>Binary (Base 2)</option>
                  <option value={8}>Octal (Base 8)</option>
                </select>
              </div>
              <div className="sm:col-span-9">
                <label className="mb-1 block text-[11px] text-muted-foreground">Input Value</label>
                <Input
                  value={radixInput}
                  onChange={(e) => setRadixInput(e.target.value)}
                  className="font-mono"
                  placeholder="Enter integer (e.g. 255, FF, 11111111, 377)"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Binary (Base 2)", res: radixResults.bin },
                { label: "Octal (Base 8)", res: radixResults.oct },
                { label: "Decimal (Base 10)", res: radixResults.dec },
                { label: "Hexadecimal (Base 16)", res: radixResults.hex },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{item.label}</span>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyText(item.res.result, item.label)}>
                      <Copy className="size-3" />
                    </Button>
                  </div>
                  <div className="mt-1.5 break-all font-mono text-sm font-semibold text-foreground">
                    {item.res.error ? <span className="text-danger">{item.res.error}</span> : item.res.result || "—"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: ENCODING & DECODING */}
      {activeTab === "encoding" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Encoding, Decoding &amp; Structured Text Utilities</CardTitle>
            <CardDescription className="text-xs">
              Base64, URL Percent-Encoding, HTML Entities, JSON Format/Minify, and Unicode Code Point Escapes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => { setEncError(null); setEncOutput(base64Converter.encodeText(encInput)); }}>
                Base64 Encode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = base64Converter.decodeToText(encInput);
                  setEncError(r.error ?? null);
                  setEncOutput(r.text);
                }}
              >
                Base64 Decode
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEncError(null); setEncOutput(encodingConverter.urlEncode(encInput)); }}>
                URL Encode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = encodingConverter.urlDecode(encInput);
                  setEncError(r.error ?? null);
                  setEncOutput(r.result);
                }}
              >
                URL Decode
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEncError(null); setEncOutput(encodingConverter.htmlEncode(encInput)); }}>
                HTML Encode
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEncError(null); setEncOutput(encodingConverter.htmlDecode(encInput)); }}>
                HTML Decode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = encodingConverter.jsonFormat(encInput);
                  setEncError(r.error ?? null);
                  setEncOutput(r.result);
                }}
              >
                JSON Format
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = encodingConverter.jsonMinify(encInput);
                  setEncError(r.error ?? null);
                  setEncOutput(r.result);
                }}
              >
                JSON Minify
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEncError(null); setEncOutput(encodingConverter.toUnicodeEscapes(encInput)); }}>
                Text → \uXXXX
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const r = encodingConverter.fromUnicodeEscapes(encInput);
                  setEncError(r.error ?? null);
                  setEncOutput(r.result);
                }}
              >
                \uXXXX → Text
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEncInput(encOutput);
                  setEncOutput(encInput);
                }}
              >
                <ArrowLeftRight className="size-3.5" />
                Swap
              </Button>
            </div>

            {encError && (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">
                {encError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Input</label>
                <textarea
                  rows={8}
                  value={encInput}
                  onChange={(e) => setEncInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Output</label>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copyText(encOutput, "Output")}>
                      <Copy className="size-3" />
                      Copy
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => downloadText(encOutput, "encoded-output.txt")}>
                      <Download className="size-3" />
                      Download
                    </Button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  readOnly
                  value={encOutput}
                  className="w-full rounded-md border border-border bg-muted/30 p-2.5 font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: HASH & CHECKSUM */}
      {activeTab === "hashing" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Cryptographic Hashes &amp; Checksums
                <Badge variant="outline">Web Crypto API + Pure TS</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Hashes alone do not prove authenticity without a trusted reference or cryptographic signature. MD5 and SHA-1 are legacy algorithms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {digests.map((d) => (
                <div key={d.algorithm} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{d.algorithm}</span>
                      <Badge variant={d.kind === "cryptographic-hash" ? "success" : d.kind === "legacy-hash" ? "warning" : "outline"}>
                        {d.kind === "cryptographic-hash" ? "Cryptographic" : d.kind === "legacy-hash" ? "Legacy (Not for Security)" : "Checksum"}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(d.hex, d.algorithm)}>
                      <Copy className="size-3.5" />
                      Copy Hex
                    </Button>
                  </div>
                  <div className="mt-1.5 break-all font-mono text-xs text-foreground">{d.hex}</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{d.securityNote}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Compare Two Hashes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={hashA} onChange={(e) => setHashA(e.target.value)} placeholder="Expected hash / checksum (hex)" className="font-mono text-xs" />
                <Input value={hashB} onChange={(e) => setHashB(e.target.value)} placeholder="Computed hash / checksum (hex)" className="font-mono text-xs" />
              </div>
              {hashA.trim() && hashB.trim() && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={hashCompare.match ? "success" : "danger"}>
                    {hashCompare.match ? "MATCH" : "MISMATCH"}
                  </Badge>
                  <span className="text-muted-foreground">
                    {hashCompare.match
                      ? "Digests match identically (normalized case-insensitive hex)."
                      : `First difference at hex character index ${hashCompare.firstDiffIndex}.`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: BYTE INSPECTOR */}
      {activeTab === "byte-inspector" && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Byte &amp; Encoding Inspector</CardTitle>
                <CardDescription className="text-xs">
                  Detected encoding: <strong className="text-foreground">{inspection.detectedEncoding}</strong> · Total {inspection.totalBytes} bytes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">
              {inspection.rows.length === 0 ? (
                <p className="text-muted-foreground">Enter text or decode bytes in Tab 1 to inspect raw memory offsets.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-1 pr-4">Offset</th>
                      <th className="py-1 pr-4">Hex Bytes (click to inspect)</th>
                      <th className="py-1">ASCII</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.rows.map((row) => (
                      <tr key={row.offsetHex} className="border-b border-border/40">
                        <td className="py-1.5 pr-4 text-primary">{row.offsetHex}</td>
                        <td className="py-1.5 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {row.bytes.map((b) => (
                              <button
                                key={b.index}
                                type="button"
                                onClick={() => setSelectedByteIdx(b.index)}
                                className={`rounded px-1 py-0.5 ${
                                  selectedByteIdx === b.index ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                }`}
                              >
                                {b.hex}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-1.5 text-muted-foreground">{row.asciiLine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedByteIdx !== null && activeBytes[selectedByteIdx] !== undefined && (
              <div className="rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs">
                Selected Byte [{selectedByteIdx}]: Hex <strong className="text-primary">0x{activeBytes[selectedByteIdx]!.toString(16).toUpperCase().padStart(2, "0")}</strong> · Dec{" "}
                <strong>{activeBytes[selectedByteIdx]}</strong> · Bin{" "}
                <strong>{activeBytes[selectedByteIdx]!.toString(2).padStart(8, "0")}</strong>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 6: IOT PAYLOAD DECODER */}
      {activeTab === "iot-payload" && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Configurable IoT / Modbus / LoRaWAN Payload Decoder</CardTitle>
                <CardDescription className="text-xs">
                  Select a template or define explicit byte offsets, data types, endianness, scaling, and units. Never guesses unknown protocols.
                </CardDescription>
              </div>
              <select
                value={payloadPresetId}
                onChange={(e) => {
                  const preset = PAYLOAD_PRESETS.find((p) => p.id === e.target.value);
                  if (!preset) return;
                  setPayloadPresetId(preset.id);
                  setPayloadHex(preset.sampleHex);
                  setPayloadFields(preset.fields);
                }}
                className="h-8 rounded-md border border-border bg-background px-2.5 text-xs"
              >
                {PAYLOAD_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Raw Hex Payload</label>
              <Input value={payloadHex} onChange={(e) => setPayloadHex(e.target.value)} className="font-mono text-xs" />
            </div>

            {payloadDecodeResult.error && (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">
                {payloadDecodeResult.error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Field Schema</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPayloadFields((prev) => [
                      ...prev,
                      { id: `f-${Date.now()}`, name: "Custom Field", byteOffset: 0, type: "uint16", endianness: "BE", scale: 1, offsetValue: 0, unit: "raw" },
                    ])
                  }
                >
                  <Plus className="size-3.5" />
                  Add Field
                </Button>
              </div>
              {payloadFields.map((f, idx) => (
                <div key={f.id} className="grid items-center gap-2 rounded border border-border p-2 sm:grid-cols-12">
                  <Input
                    className="sm:col-span-3"
                    value={f.name}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, name: e.target.value };
                      setPayloadFields(next);
                    }}
                  />
                  <Input
                    type="number"
                    className="sm:col-span-1"
                    value={f.byteOffset}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, byteOffset: Number(e.target.value) };
                      setPayloadFields(next);
                    }}
                  />
                  <select
                    value={f.type}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, type: e.target.value as PayloadFieldType };
                      setPayloadFields(next);
                    }}
                    className="h-9 rounded border border-border bg-background px-2 text-xs sm:col-span-2"
                  >
                    {["uint8", "int8", "uint16", "int16", "uint32", "int32", "float32"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    value={f.endianness}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, endianness: e.target.value as "BE" | "LE" };
                      setPayloadFields(next);
                    }}
                    className="h-9 rounded border border-border bg-background px-2 text-xs sm:col-span-2"
                  >
                    <option value="BE">Big-Endian</option>
                    <option value="LE">Little-Endian</option>
                  </select>
                  <Input
                    type="number"
                    step="0.001"
                    className="sm:col-span-2"
                    value={f.scale}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, scale: Number(e.target.value) };
                      setPayloadFields(next);
                    }}
                  />
                  <Input
                    className="sm:col-span-1"
                    value={f.unit}
                    onChange={(e) => {
                      const next = [...payloadFields];
                      next[idx] = { ...f, unit: e.target.value };
                      setPayloadFields(next);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="sm:col-span-1"
                    onClick={() => setPayloadFields(payloadFields.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {payloadDecodeResult.fields.map((df) => (
                <div key={df.id} className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <div className="font-semibold text-foreground">{df.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    Offset {df.byteOffset} · Raw {df.rawHex}
                  </div>
                  {df.error ? (
                    <div className="mt-1 text-danger">{df.error}</div>
                  ) : (
                    <div className="mt-1.5 font-mono text-base font-bold text-primary">
                      {df.scaledValue} {df.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: FILE CONVERTER */}
      {activeTab === "file-converter" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode className="size-4 text-primary" />
              Local File Converter &amp; Digest Calculator
            </CardTitle>
            <CardDescription className="text-xs">
              Reads text or binary firmware files locally in your browser via File API, converts representations, and computes digests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" onChange={handleFileUpload} className="cursor-pointer text-xs" />

            {fileMeta && fileBytes ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">{fileMeta.name}</Badge>
                  <Badge variant="outline">{fileMeta.size} bytes</Badge>
                  <Badge variant="outline">{fileMeta.type}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadText(hexadecimalConverter.fromBytes(fileBytes, " ", false, true), `${fileMeta.name}.hex.txt`)}
                  >
                    <Download className="size-3.5" />
                    Download Hex
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadText(base64Converter.encodeBytes(fileBytes), `${fileMeta.name}.b64.txt`)}
                  >
                    <Download className="size-3.5" />
                    Download Base64
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {fileDigests.map((d) => (
                    <div key={d.algorithm} className="rounded border border-border p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{d.algorithm}</span>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyText(d.hex, d.algorithm)}>
                          <Copy className="size-3" />
                        </Button>
                      </div>
                      <div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{d.hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Choose any text, JSON, CSV, or binary (.bin/.hex) file to inspect and convert.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 8: DATA COMPARISON */}
      {activeTab === "comparison" && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Engineering Data &amp; Checksum Comparison</CardTitle>
                <CardDescription className="text-xs">
                  Compare two text payloads, hexadecimal dumps, binary streams, or checksums and pinpoint the first divergence.
                </CardDescription>
              </div>
              <select
                value={cmpMode}
                onChange={(e) => setCmpMode(e.target.value as "text" | "hex" | "binary" | "checksum")}
                className="h-8 rounded-md border border-border bg-background px-2.5 text-xs"
              >
                <option value="hex">Hexadecimal</option>
                <option value="text">Text</option>
                <option value="binary">Binary</option>
                <option value="checksum">Checksum / Hash</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                rows={5}
                value={cmpLeft}
                onChange={(e) => setCmpLeft(e.target.value)}
                placeholder="Value A"
                className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs"
              />
              <textarea
                rows={5}
                value={cmpRight}
                onChange={(e) => setCmpRight(e.target.value)}
                placeholder="Value B"
                className="w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
              {dataComparison.match ? (
                <Badge variant="success">IDENTICAL</Badge>
              ) : (
                <Badge variant="danger">
                  <ShieldAlert className="mr-1 size-3" />
                  DIFFERENT
                </Badge>
              )}
              <span className="text-muted-foreground">
                {dataComparison.match
                  ? "Both inputs are identical."
                  : `First difference detected at character index ${dataComparison.firstDiffIndex}.`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

