import Link from "next/link";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { listDocs } from "@/lib/data/docs";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Documentation" };

export default async function DocumentationPage() {
  const docs = await listDocs();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Documentation"
        description="Platform planning documents and progress reports. Project documentation (per project) arrives with My Projects in Phase 7."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {docs.map((d, i) =>
          d.available ? (
            <Link key={d.slug} href={`/documentation/${d.slug}`} className="group">
              <Card className="h-full p-4 transition-colors group-hover:border-accent/40">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-accent">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="text-sm font-semibold">{d.title}</h2>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.excerpt}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <Card key={d.slug} className="p-4 opacity-60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{d.title}</h2>
                <Badge variant="outline">Missing</Badge>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
