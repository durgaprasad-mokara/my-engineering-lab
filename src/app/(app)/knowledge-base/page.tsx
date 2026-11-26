import type { Metadata } from "next";
import { KnowledgeBaseWorkspace } from "@/components/advanced/knowledge-base-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Engineering Knowledge Base" };

export default function KnowledgeBasePage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Module 24 · Reference Library</Badge>
            <Badge variant="outline">Design Rules &amp; Working Principles</Badge>
          </div>
        }
        title="Engineering Knowledge Base"
        description="Unified reference of hardware design rules, bus guidelines, protection circuits, and component working principles indexed from the A–Z library."
      />

      <KnowledgeBaseWorkspace />
    </div>
  );
}

