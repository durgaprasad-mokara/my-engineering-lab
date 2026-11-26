"use client";

import * as React from "react";
import { Building2, ExternalLink, Factory, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INDUSTRY_RESEARCH_PROFILES,
  REFERENCE_PROJECTS,
} from "@/lib/projects/iot-workflow";

export function IndustrialWorkspace() {
  const [tab, setTab] = React.useState<"systems" | "research">("systems");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3">
        <button
          type="button"
          onClick={() => setTab("systems")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
            tab === "systems"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-raised text-muted-foreground hover:text-foreground"
          }`}
        >
          <Factory className="size-3.5" />
          Reference Industrial Systems ({REFERENCE_PROJECTS.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("research")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
            tab === "research"
              ? "bg-primary text-primary-foreground"
              : "bg-surface-raised text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" />
          Industry Technology Research ({INDUSTRY_RESEARCH_PROFILES.length})
        </button>
      </div>

      {tab === "systems" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {REFERENCE_PROJECTS.map((sys) => (
            <Card key={sys.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="uppercase">{sys.industry}</Badge>
                  {sys.safetyCritical && <Badge variant="warning">Research Prototype · Safety-Critical</Badge>}
                </div>
                <CardTitle className="pt-1 text-base">{sys.name}</CardTitle>
                <CardDescription>{sys.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                {sys.safetyCritical && sys.safetyDisclaimer && (
                  <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2.5 text-[11px] text-warning">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <span>{sys.safetyDisclaimer}</span>
                  </div>
                )}
                {Object.entries(sys.sections).map(([k, v]) => (
                  <div key={k} className="rounded bg-surface-raised/40 p-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {k.replace(/-/g, " ")}
                    </span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {INDUSTRY_RESEARCH_PROFILES.map((prof) => (
            <Card key={prof.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{prof.company}</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Researched {prof.researchDate}
                  </Badge>
                </div>
                <CardDescription>{prof.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-1">
                  {prof.focusAreas.map((f) => (
                    <Badge key={f} variant="accent" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
                <div className="rounded bg-surface-raised/40 p-2.5">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Key Platforms
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    {prof.keyTechnologies.join(" · ")}
                  </span>
                </div>
                <a
                  href={prof.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  {prof.sourceTitle} <ExternalLink className="size-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

