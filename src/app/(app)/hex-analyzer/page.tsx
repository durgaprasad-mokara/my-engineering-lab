import type { Metadata } from "next";
import { HexAnalyzerWorkspace } from "@/components/hex-analyzer/hex-analyzer-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hex & IoT Data Type Analyzer" };

export default function HexAnalyzerPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 27 · Industrial Diagnostics</Badge>
            <Badge variant="outline">IEEE 754 · Modbus RTU/TCP · Endianness</Badge>
          </div>
        }
        title="Advanced Hex Converter & IoT Data Type Analyzer"
        description="Decode raw hexadecimal payloads into ASCII/UTF-8, Binary, IEEE 754 FLOAT32/64, INT16/32/64, UINT16/32/64 across ABCD, DCBA, BADC, and CDAB byte orders, with Modbus CRC16 verification and engineering scaling."
      />

      <HexAnalyzerWorkspace />
    </div>
  );
}

