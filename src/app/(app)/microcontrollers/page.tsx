import type { Metadata } from "next";
import { BoardSelector } from "@/components/knowledge/board-selector";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getMicrocontrollersResult } from "@/lib/data/microcontrollers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Microcontrollers" };

export default async function MicrocontrollersPage() {
  const { items, mode, error } = await getMicrocontrollersResult();

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={mode} />
            <Badge variant="outline">Phase 2 · Board Selector</Badge>
          </div>
        }
        title="Microcontrollers"
        description="Requirement-driven selector and comparison across ESP32, AVR, STM32, RP2040 and Nordic nRF52 architectures with memory, peripheral and power provenance."
      />

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Could not load microcontrollers from Supabase: {error}
        </div>
      )}

      <BoardSelector items={items} />
    </div>
  );
}
