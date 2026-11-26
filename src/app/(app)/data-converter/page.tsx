import type { Metadata } from "next";
import { DataConverterWorkspace } from "@/components/converter/data-converter-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Engineering Data Converter" };

export default function DataConverterPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 26 · Encoding &amp; Diagnostics</Badge>
            <Badge variant="outline">Web Crypto API + Byte Inspector</Badge>
          </div>
        }
        title="Engineering Data Converter"
        description="Convert, encode, decode, hash, inspect raw bytes, compare payloads, and decode configurable IoT/Modbus/LoRaWAN frames locally in your browser."
      />

      <DataConverterWorkspace />
    </div>
  );
}

