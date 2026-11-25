import type { Metadata } from "next";
import { CommunicationBrowser } from "@/components/communication/communication-browser";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getCommunicationModulesResult, getSpectrumRegulations } from "@/lib/data/communication";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Communication Technologies — My Engineering Lab",
  description: "Cellular, LPWAN, wired fieldbus and application protocols with application suitability matrix and spectrum regulation guide.",
};

export default async function CommunicationPage() {
  const [{ items, mode, error }, regulations] = await Promise.all([
    getCommunicationModulesResult(),
    getSpectrumRegulations(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">Phase 3 · Knowledge Base</Badge>
          </div>
        }
        title="Communication Technologies"
        description="Comprehensive engineering reference for Cellular (4G/5G/NB-IoT), LPWAN (LoRaWAN/BLE/Zigbee), Wired industrial fieldbuses (RS-485/CAN) and Application protocols (MQTT/CoAP) with application suitability matrix and India/Global spectrum rules."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load communication technologies from database: {error}
        </div>
      )}

      <CommunicationBrowser items={items} regulations={regulations} />
    </div>
  );
}

