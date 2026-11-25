import type { Metadata } from "next";
import { AntennasBrowser } from "@/components/antennas/antennas-browser";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getAntennasResult } from "@/lib/data/antennas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Antennas Library — My Engineering Lab",
  description: "Comprehensive catalogue of Cellular, LoRa, GNSS, Wi-Fi and BLE antennas with interactive 2D radiation pattern visualizer and ground plane rules.",
};

export default async function AntennasPage() {
  const { items, mode, error } = await getAntennasResult();

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">Phase 3 · Knowledge Base</Badge>
          </div>
        }
        title="Antennas Library"
        description="RF antenna selection and design engineering catalogue covering FPC flexible, ceramic chip, articulated dipole, patch, Yagi, and PCB trace antennas with interactive 2D radiation patterns, polarization, and ground-plane matching requirements."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load antennas from database: {error}
        </div>
      )}

      <AntennasBrowser items={items} />
    </div>
  );
}

