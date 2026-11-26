import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI Engineering Assistant — My Engineering Lab",
  description: "Server-side AI assistant grounded in the engineering knowledge base with 20-step requirement workflow and rate limiting.",
};

export default function AssistantPage() {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source={hasApiKey ? "live" : "demo"} />
            <Badge variant="outline">Phase 10 · Intelligence</Badge>
          </div>
        }
        title="AI Engineering Assistant"
        description="Requirement-driven engineering guidance grounded in stored datasheets and knowledge base records. Uses Claude when ANTHROPIC_API_KEY is configured, or deterministic KB synthesis otherwise."
      />
      <AssistantWorkspace />
    </div>
  );
}

