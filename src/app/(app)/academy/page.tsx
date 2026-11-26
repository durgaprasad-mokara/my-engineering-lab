import type { Metadata } from "next";
import { AcademyWorkspace } from "@/components/learning/academy-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Learning Academy — My Engineering Lab",
  description: "365-day structured engineering curriculum across 12 months with daily theory, exercises, and checkpoint quizzes.",
};

export default function AcademyPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 12 · Learning Academy</Badge>
          </div>
        }
        title="Learning Academy"
        description="12-month / 365-day engineering roadmap with daily lessons, component references, calculations, and checkpoint quizzes."
      />
      <AcademyWorkspace />
    </div>
  );
}

