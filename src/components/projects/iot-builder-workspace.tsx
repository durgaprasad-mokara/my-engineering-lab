"use client";

import * as React from "react";
import { CheckCircle2, CircleDashed, Download, ShieldAlert, Waypoints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IOT_22_SECTIONS,
  REFERENCE_PROJECTS,
  exportProjectToMarkdown,
  type WorkspaceProject,
} from "@/lib/projects/iot-workflow";

export function IotBuilderWorkspace() {
  const [selectedRefId, setSelectedRefId] = React.useState(REFERENCE_PROJECTS[0]!.id);
  const baseProject = REFERENCE_PROJECTS.find((p) => p.id === selectedRefId) ?? REFERENCE_PROJECTS[0]!;

  const [sections, setSections] = React.useState<Record<string, string>>(baseProject.sections);
  const [activeSecId, setActiveSecId] = React.useState(IOT_22_SECTIONS[0]!.id);

  React.useEffect(() => {
    setSections(baseProject.sections);
  }, [baseProject]);

  const completedCount = IOT_22_SECTIONS.filter((s) => (sections[s.id] ?? "").trim().length > 0).length;
  const activeSec = IOT_22_SECTIONS.find((s) => s.id === activeSecId) ?? IOT_22_SECTIONS[0]!;

  const handleExport = () => {
    const project: WorkspaceProject = { ...baseProject, sections };
    const md = exportProjectToMarkdown(project);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseProject.id}-22-section-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Reference Template Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Template:</span>
          {REFERENCE_PROJECTS.map((ref) => (
            <button
              key={ref.id}
              type="button"
              onClick={() => setSelectedRefId(ref.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedRefId === ref.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {ref.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="accent" className="font-mono">
            {completedCount} / {IOT_22_SECTIONS.length} Sections
          </Badge>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="size-3.5" /> Export 22-Section Spec
          </Button>
        </div>
      </div>

      {baseProject.safetyCritical && baseProject.safetyDisclaimer && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>{baseProject.safetyDisclaimer}</span>
        </div>
      )}

      {/* 22-Section Split Editor */}
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Waypoints className="size-4 text-accent" />
              22-Section Engineering Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[480px] overflow-y-auto p-2">
            <ul className="space-y-1">
              {IOT_22_SECTIONS.map((sec) => {
                const done = (sections[sec.id] ?? "").trim().length > 0;
                const isActive = sec.id === activeSec.id;
                return (
                  <li key={sec.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSecId(sec.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? "bg-primary/15 text-foreground"
                          : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                        ) : (
                          <CircleDashed className="size-3.5 shrink-0 text-muted-foreground/60" />
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {String(sec.number).padStart(2, "0")}
                        </span>
                        <span className="font-medium">{sec.title}</span>
                      </span>
                      <Badge variant="outline" className="text-[9px]">{sec.phaseGroup}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader className="border-b pb-3">
            <div>
              <Badge variant="outline" className="mb-1 text-[10px]">{activeSec.phaseGroup}</Badge>
              <CardTitle className="text-base">
                Section {activeSec.number}: {activeSec.title}
              </CardTitle>
              <CardDescription>{activeSec.prompt}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <textarea
              aria-label={`Notes for ${activeSec.title}`}
              rows={14}
              value={sections[activeSec.id] ?? ""}
              onChange={(e) => setSections((prev) => ({ ...prev, [activeSec.id]: e.target.value }))}
              placeholder={`Document ${activeSec.title.toLowerCase()} here…`}
              className="w-full rounded-md border bg-surface-raised/60 p-3 text-sm text-foreground outline-none focus:border-accent"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

