"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ClipboardPaste,
  Copy,
  Cpu,
  Download,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { applyEngineeringScaling } from "@/lib/hex-analyzer/engineeringScaler";
import { decodeIndustrialPayload, type IndustrialProtocolMode } from "@/lib/hex-analyzer/modbusDecoder";
import { analyzeHexPayload } from "@/lib/hex-analyzer/payloadAnalyzer";

const DEFAULT_HEX = "42 48 00 00";

const SAMPLE_PRESETS = [
  { label: "Float32 50.0 (42 48 00 00)", hex: "42 48 00 00" },
  { label: "Modbus RTU Frame (01 03 04 42 48 00 00 6E 5D)", hex: "01 03 04 42 48 00 00 6E 5D" },
  { label: "Signed -123456 (FF FE 1D C0)", hex: "FF FE 1D C0" },
  { label: "ASCII + Control (48 69 09 0D 0A 00)", hex: "48 69 09 0D 0A 00" },
  { label: "8-Byte Double 3.14159 (40 09 21 FB 54 44 2D 18)", hex: "40 09 21 FB 54 44 2D 18" },
];

export function HexAnalyzerWorkspace() {
  const [rawInput, setRawInput] = useState(DEFAULT_HEX);
  const [analyzedInput, setAnalyzedInput] = useState(DEFAULT_HEX);
  const [byteOffset, setByteOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedByteIndex, setSelectedByteIndex] = useState(0);
  const [asciiMode, setAsciiMode] = useState<"ascii" | "utf8">("ascii");
  const [toast, setToast] = useState<string | null>(null);

  // Modbus / Industrial protocol state (explicit selection required)
  const [protocol, setProtocol] = useState<IndustrialProtocolMode>("none");
  const [registerAddress, setRegisterAddress] = useState(0);

  // Engineering Scaling state
  const [scale, setScale] = useState(0.1);
  const [offset, setOffset] = useState(0);
  const [unit, setUnit] = useState("°C");
  const [scaleSource, setScaleSource] = useState<"float32-abcd" | "int16-ab" | "uint16-ab" | "int32-abcd">("int16-ab");

  const analysis = useMemo(() => analyzeHexPayload(analyzedInput, byteOffset), [analyzedInput, byteOffset]);

  const industrialResult = useMemo(
    () => decodeIndustrialPayload(analysis.parse.bytes, protocol, registerAddress),
    [analysis.parse.bytes, protocol, registerAddress],
  );

  const rawValueForScaling = useMemo(() => {
    if (scaleSource === "float32-abcd") return analysis.float32[0]?.value ?? null;
    if (scaleSource === "int16-ab") return analysis.int16[0]?.valid ? Number(analysis.int16[0].decimal) : null;
    if (scaleSource === "uint16-ab") return analysis.uint16[0]?.valid ? Number(analysis.uint16[0].decimal) : null;
    return analysis.int32[0]?.valid ? Number(analysis.int32[0].decimal) : null;
  }, [analysis, scaleSource]);

  const scaledOutput = useMemo(
    () =>
      applyEngineeringScaling(rawValueForScaling, {
        scale,
        offset,
        unit,
        registerAddress,
        byteOffset,
      }),
    [rawValueForScaling, scale, offset, unit, registerAddress, byteOffset],
  );

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((c) => (c === msg ? null : c)), 2200);
  }

  async function copyVal(val: string, label: string) {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      notify(`Copied ${label}.`);
    } catch {}
  }

  async function pasteHex() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setRawInput(clip);
        setAnalyzedInput(clip);
      }
    } catch {
      notify("Clipboard paste blocked; paste directly into the editor.");
    }
  }

  function exportJson() {
    const payload = {
      input: analysis.parse.originalInput,
      normalizedHex: analysis.parse.normalizedHex,
      byteCount: analysis.parse.byteCount,
      byteOffset,
      ascii: analysis.ascii.asciiSummary,
      utf8: analysis.ascii.utf8Text,
      float32: analysis.float32,
      uint32: analysis.uint32,
      int32: analysis.int32,
      int16: analysis.int16,
      uint16: analysis.uint16,
      float64: analysis.float64,
      int64Uint64: analysis.int64Uint64,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hex-analysis-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = [
      ["DataType", "ByteOrder", "RawBytes", "Value", "Validity"],
      ...analysis.float32.map((r) => ["FLOAT32", r.order, r.rawBytesHex, r.displayValue, r.statusMessage]),
      ...analysis.uint32.map((r) => ["UINT32", r.order, r.rawBytesHex, r.decimal, r.statusMessage]),
      ...analysis.int32.map((r) => ["INT32", r.order, r.rawBytesHex, r.decimal, r.statusMessage]),
      ...analysis.int16.map((r) => ["INT16", r.order, r.rawBytesHex, r.decimal, r.statusMessage]),
      ...analysis.uint16.map((r) => ["UINT16", r.order, r.rawBytesHex, r.decimal, r.statusMessage]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hex-analysis-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filterMatch = (name: string) => {
    const q = typeFilter.trim().toLowerCase();
    return !q || name.toLowerCase().includes(q);
  };

  const inspectedByte = analysis.inspectedBytes[selectedByteIndex] ?? analysis.inspectedBytes[0] ?? null;

  return (
    <div className="space-y-5">
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg"
        >
          <Check className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* SECTION A — INPUT */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Section A — HexString Input</CardTitle>
              <CardDescription className="text-xs">
                Multiline hex input supporting spaces, commas, colons, 0x prefixes, and uppercase/lowercase digits. Invalid characters are flagged with exact positions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={analysis.parse.valid ? "success" : "danger"}>
                {analysis.parse.valid ? `Valid · ${analysis.parse.byteCount} Bytes` : "Invalid / Empty"}
              </Badge>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="size-3.5" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportJson}>
                <Download className="size-3.5" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={3}
            placeholder="01 03 04 42 48 00 00"
            className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setAnalyzedInput(rawInput)}>
                <Play className="size-3.5" />
                Analyze Data
              </Button>
              <Button variant="outline" onClick={pasteHex}>
                <ClipboardPaste className="size-3.5" />
                Paste
              </Button>
              <Button variant="outline" onClick={() => copyVal(rawInput, "Hex Input")}>
                <Copy className="size-3.5" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRawInput("");
                  setAnalyzedInput("");
                }}
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-muted-foreground">Byte Offset:</label>
              <Input
                type="number"
                min={0}
                max={Math.max(0, analysis.parse.byteCount - 1)}
                value={byteOffset}
                onChange={(e) => setByteOffset(Math.max(0, Number(e.target.value)))}
                className="h-8 w-20 font-mono text-xs"
              />
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2 size-3.5 text-muted-foreground" />
                <Input
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  placeholder="Filter data types..."
                  className="h-8 w-44 pl-7 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="ghost"
                className="h-7 border border-border/60 text-[11px]"
                onClick={() => {
                  setRawInput(p.hex);
                  setAnalyzedInput(p.hex);
                  setByteOffset(0);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {analysis.parse.error && (
            <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              {analysis.parse.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION B — BASIC CONVERSION (ASCII & BINARY) */}
      {(filterMatch("ascii") || filterMatch("binary") || filterMatch("utf-8")) && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Section B1 — ASCII / UTF-8 Converter</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={asciiMode === "ascii" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setAsciiMode("ascii")}
                  >
                    ASCII
                  </Button>
                  <Button
                    size="sm"
                    variant={asciiMode === "utf8" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setAsciiMode("utf8")}
                  >
                    UTF-8
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => copyVal(asciiMode === "ascii" ? analysis.ascii.asciiSummary : analysis.ascii.utf8Text, "ASCII/UTF-8")}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded border border-border bg-muted/30 p-2.5 font-mono text-xs">
                {asciiMode === "ascii" ? analysis.ascii.asciiSummary || "—" : analysis.ascii.utf8Text || "—"}
              </div>
              {asciiMode === "utf8" && !analysis.ascii.utf8Valid && (
                <p className="text-[11px] text-warning">Contains invalid UTF-8 byte sequence(s).</p>
              )}
              <div className="max-h-52 overflow-y-auto rounded border border-border">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1">Pos</th>
                      <th className="px-2 py-1">Offset</th>
                      <th className="px-2 py-1">Hex</th>
                      <th className="px-2 py-1">Char / Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {analysis.ascii.rows.map((r) => (
                      <tr key={r.position}>
                        <td className="px-2 py-1">{r.position}</td>
                        <td className="px-2 py-1 text-muted-foreground">{r.offsetHex}</td>
                        <td className="px-2 py-1 text-primary">{r.rawHex}</td>
                        <td className="px-2 py-1">
                          <Badge variant={r.printable ? "outline" : "illustrative"} className="font-mono text-[10px]">
                            {r.displayLabel}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Section B2 — Binary Converter</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => copyVal(analysis.binaryRows.map((b) => b.binary).join(" "), "Binary")}
                >
                  <Copy className="size-3.5" />
                  Copy Binary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto rounded border border-border">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1">Index</th>
                      <th className="px-2 py-1">Raw Hex</th>
                      <th className="px-2 py-1">Binary (8-bit)</th>
                      <th className="px-2 py-1">Nibbles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {analysis.binaryRows.map((b) => (
                      <tr
                        key={b.index}
                        onClick={() => setSelectedByteIndex(b.index)}
                        className={`cursor-pointer hover:bg-muted/40 ${selectedByteIndex === b.index ? "bg-primary/10" : ""}`}
                      >
                        <td className="px-2 py-1">{b.index}</td>
                        <td className="px-2 py-1 text-primary">{b.rawHex}</td>
                        <td className="px-2 py-1">{b.binary}</td>
                        <td className="px-2 py-1 text-muted-foreground">{b.nibbleGrouped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION C — FLOATING POINT (FLOAT32 ABCD, DCBA, BADC, CDAB) */}
      {filterMatch("float") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section C — IEEE 754 FLOAT32 (All 4 Byte Orders @ Offset {byteOffset})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysis.float32.map((f) => (
              <div key={f.order} className="rounded-lg border border-border p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{f.label}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyVal(f.displayValue, `FLOAT32 ${f.order}`)}>
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="mt-1.5 font-mono text-base font-bold text-primary">{f.displayValue}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  Raw: {f.rawBytesHex} → {f.reorderedBytesHex}
                </div>
                <Badge variant={f.valid ? "success" : "warning"} className="mt-1.5 text-[10px]">
                  {f.statusMessage}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECTION D & E — UINT32 & INT32 */}
      {(filterMatch("uint32") || filterMatch("int32")) && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Section D — UINT32 (Unsigned 32-bit @ Offset {byteOffset})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.uint32.map((u) => (
                <div key={u.order} className="flex items-center justify-between gap-2 rounded border border-border p-2.5 text-xs">
                  <div>
                    <div className="font-semibold">{u.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {u.rawBytesHex} → {u.reorderedBytesHex} ({u.hex})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{u.decimal}</span>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyVal(u.decimal, `UINT32 ${u.order}`)}>
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Section E — INT32 (Two&apos;s-Complement Signed @ Offset {byteOffset})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.int32.map((s) => (
                <div key={s.order} className="flex items-center justify-between gap-2 rounded border border-border p-2.5 text-xs">
                  <div>
                    <div className="font-semibold">{s.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {s.rawBytesHex} → {s.reorderedBytesHex} ({s.hex})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{s.decimal}</span>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyVal(s.decimal, `INT32 ${s.order}`)}>
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION F — 16-BIT DATA */}
      {(filterMatch("int16") || filterMatch("uint16") || filterMatch("16")) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section F — 16-Bit Integers (INT16 &amp; UINT16 @ Offset {byteOffset})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ...analysis.int16.map((x) => ({ ...x, kind: "INT16" })),
              ...analysis.uint16.map((x) => ({ ...x, kind: "UINT16" })),
            ].map((item) => (
              <div key={`${item.kind}-${item.order}`} className="rounded-lg border border-border p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {item.kind} {item.order}
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => copyVal(item.decimal, `${item.kind} ${item.order}`)}>
                    <Copy className="size-3" />
                  </Button>
                </div>
                <div className="mt-1 font-mono text-base font-bold text-primary">{item.decimal}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {item.hex} · {item.binary}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECTION G — ADVANCED ANALYSIS (64-BIT, BIT INSPECTOR, MODBUS, SCALING) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section G1 — 8-Bit, 64-Bit &amp; FLOAT64 (@ Offset {byteOffset})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded border border-border p-2.5">
              <span className="font-semibold">INT8 / UINT8:</span>{" "}
              {analysis.int8Uint8.valid
                ? `Signed ${analysis.int8Uint8.signed} · Unsigned ${analysis.int8Uint8.unsigned} (${analysis.int8Uint8.rawHex})`
                : analysis.int8Uint8.statusMessage}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.float64.map((f) => (
                <div key={f.order} className="rounded border border-border p-2.5">
                  <div className="font-semibold">{f.label}</div>
                  <div className="mt-1 font-mono text-sm font-bold text-primary">{f.displayValue}</div>
                  <div className="text-[11px] text-muted-foreground">{f.statusMessage}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.int64Uint64.map((i) => (
                <div key={i.order} className="rounded border border-border p-2.5 font-mono text-[11px]">
                  <div className="font-sans font-semibold">INT64 / UINT64 ({i.order})</div>
                  <div>INT64: {i.signed}</div>
                  <div>UINT64: {i.unsigned}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section G2 — Interactive Bit &amp; Byte Inspector</CardTitle>
            <CardDescription className="text-xs">Click any byte below or in the Binary table to inspect bits 7–0.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {analysis.inspectedBytes.map((b) => (
                <Button
                  key={b.index}
                  size="sm"
                  variant={selectedByteIndex === b.index ? "default" : "outline"}
                  className="h-7 px-2 font-mono text-xs"
                  onClick={() => setSelectedByteIndex(b.index)}
                >
                  [{b.index}] {b.hex}
                </Button>
              ))}
            </div>
            {inspectedByte ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                <div className="font-mono">
                  Offset {inspectedByte.offsetHex} · Hex <strong>0x{inspectedByte.hex}</strong> · Dec{" "}
                  <strong>{inspectedByte.value}</strong> · Boolean:{" "}
                  <strong>{inspectedByte.booleanNonZero ? "TRUE (≠0)" : "FALSE (0)"}</strong>
                </div>
                <div className="grid grid-cols-8 gap-1 text-center font-mono">
                  {inspectedByte.bits.map((bit, i) => {
                    const bitPos = 7 - i;
                    return (
                      <div
                        key={bitPos}
                        className={`rounded border p-1.5 ${bit === 1 ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}
                      >
                        <div className="text-[10px]">b{bitPos}</div>
                        <div className="text-sm font-bold">{bit}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Analyze valid hex bytes to inspect individual bits.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION G3 & G4 — MODBUS DECODER + ENGINEERING SCALING */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="size-4 text-primary" />
                  Section G3 — Modbus &amp; Industrial Protocol Decoder
                </CardTitle>
                <CardDescription className="text-xs">Explicit protocol selection required; never guesses unknown frames.</CardDescription>
              </div>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as IndustrialProtocolMode)}
                className="h-8 rounded border border-border bg-background px-2 text-xs"
              >
                <option value="none">Select Protocol...</option>
                <option value="modbus-rtu">Modbus RTU (with CRC16)</option>
                <option value="modbus-tcp">Modbus TCP (MBAP)</option>
                <option value="rs485-raw">RS485 / PLC Raw Registers</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={industrialResult.identified ? "outline" : "illustrative"}>
                {industrialResult.identified ? "Protocol Identified" : "Awaiting Protocol"}
              </Badge>
              <Badge variant={industrialResult.validated ? "success" : "warning"}>
                {industrialResult.validated ? "Frame Validated" : "Not Validated"}
              </Badge>
              <Badge variant={industrialResult.decoded ? "success" : "outline"}>
                {industrialResult.decoded ? "Decoded" : "No Data"}
              </Badge>
            </div>
            <div className="space-y-1 text-muted-foreground">
              {industrialResult.messages.map((m) => (
                <div key={m}>{m}</div>
              ))}
            </div>
            {industrialResult.identified && (
              <div className="grid grid-cols-2 gap-2 rounded border border-border bg-muted/20 p-2.5 font-mono">
                <div>Slave/Unit: {industrialResult.unitOrSlaveId ?? "—"}</div>
                <div>Function: {industrialResult.functionName ?? "—"}</div>
                <div>Reg Count: {industrialResult.registerCount ?? 0}</div>
                <div>CRC16: {industrialResult.crcStatus.checked ? industrialResult.crcStatus.expectedWireHex : "N/A"}</div>
                <div className="col-span-2">Registers (BE): {industrialResult.registers16BE.join(", ") || "—"}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section G4 — Engineering Scaling (Raw × Scale + Offset)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Source Type</label>
                <select
                  value={scaleSource}
                  onChange={(e) => setScaleSource(e.target.value as typeof scaleSource)}
                  className="h-8 w-full rounded border border-border bg-background px-1.5 text-xs"
                >
                  <option value="int16-ab">INT16 AB</option>
                  <option value="uint16-ab">UINT16 AB</option>
                  <option value="int32-abcd">INT32 ABCD</option>
                  <option value="float32-abcd">FLOAT32 ABCD</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Scale</label>
                <Input type="number" step="0.01" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="h-8" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Offset</label>
                <Input type="number" step="0.1" value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="h-8" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Unit</label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} className="h-8" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Reg Addr</label>
                <Input type="number" value={registerAddress} onChange={(e) => setRegisterAddress(Number(e.target.value))} className="h-8" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono">
              <div className="text-[11px] text-muted-foreground">
                Raw ({scaleSource}): {rawValueForScaling ?? "—"} · Reg 0x{registerAddress.toString(16).toUpperCase().padStart(4, "0")}
              </div>
              <div className="mt-1 text-lg font-bold text-primary">
                Engineering Value: {scaledOutput.formatted}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

