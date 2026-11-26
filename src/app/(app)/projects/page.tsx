import type { Metadata } from "next";
import { ProjectsWorkspace } from "@/components/projects/projects-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My Projects — My Engineering Lab",
  description: "Engineering project workspace with lifecycle tracking, duplication, archiving, version snapshots, and Markdown export.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 7 · IoT Projects</Badge>
          </div>
        }
        title="My Projects"
        description="Create, duplicate, archive, version, and export engineering projects through Planning → Research → Design → Development → Testing → Completed."
      />
      <ProjectsWorkspace />
    </div>
  );
}

