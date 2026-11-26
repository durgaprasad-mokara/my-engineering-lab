"use client";

import * as React from "react";
import {
  Archive,
  ArrowRight,
  Copy,
  Download,
  GitBranch,
  Plus,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PROJECT_STATUS_FLOW,
  REFERENCE_PROJECTS,
  duplicateWorkspaceProject,
  exportProjectToMarkdown,
  nextProjectStatus,
  type WorkspaceProject,
} from "@/lib/projects/iot-workflow";

export function ProjectsWorkspace() {
  const [projects, setProjects] = React.useState<WorkspaceProject[]>(REFERENCE_PROJECTS);
  const [showArchived, setShowArchived] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newIndustry, setNewIndustry] = React.useState("water");

  const visible = projects.filter((p) => (showArchived ? p.isArchived : !p.isArchived));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const isSafety = newIndustry === "railway";
    const proj: WorkspaceProject = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      description: "Custom engineering project created in My Projects workspace.",
      kind: "iot",
      industry: newIndustry,
      status: "planning",
      updatedAt: now,
      isArchived: false,
      isReference: false,
      safetyCritical: isSafety,
      safetyDisclaimer: isSafety
        ? "RESEARCH & EDUCATIONAL PROTOTYPE ONLY — Requires qualified engineering certification before field use."
        : undefined,
      version: 1,
      versions: [{ version: 1, createdAt: now, note: "Initial creation", status: "planning" }],
      sections: {},
    };
    setProjects((prev) => [proj, ...prev]);
    setNewName("");
  };

  const handleAdvanceStatus = (id: string) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = nextProjectStatus(p.status);
        if (next === p.status) return p;
        const newVer = p.version + 1;
        return {
          ...p,
          status: next,
          version: newVer,
          updatedAt: now,
          versions: [
            ...p.versions,
            { version: newVer, createdAt: now, note: `Advanced lifecycle to ${next}`, status: next },
          ],
        };
      }),
    );
  };

  const handleDownloadMd = (proj: WorkspaceProject) => {
    const md = exportProjectToMarkdown(proj);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${proj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Create & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleCreate} className="flex flex-1 flex-wrap gap-2">
          <Input
            placeholder="New project name (e.g. Smart Borewell Flow Monitor)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="min-w-[220px] flex-1"
          />
          <select
            aria-label="Project industry"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            className="h-9 rounded-md border bg-surface-raised px-3 text-xs text-foreground"
          >
            <option value="water">Water</option>
            <option value="energy">Energy</option>
            <option value="railway">Railway (Safety-Critical)</option>
            <option value="industrial">Industrial</option>
            <option value="agriculture">Agriculture</option>
          </select>
          <Button type="submit" size="sm" className="h-9">
            <Plus className="size-3.5" /> Create Project
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="rounded-md border bg-surface-raised px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {showArchived ? "Show Active Projects" : `Archived (${projects.filter((p) => p.isArchived).length})`}
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((proj) => (
          <Card key={proj.id} className="flex flex-col justify-between">
            <div>
              <CardHeader className="pb-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="accent" className="uppercase">{proj.status}</Badge>
                    <Badge variant="outline">v{proj.version}</Badge>
                    {proj.isReference && <Badge variant="demo">Reference</Badge>}
                    {proj.safetyCritical && <Badge variant="warning">Safety-Critical</Badge>}
                  </div>
                  <CardTitle className="pt-1 text-base">{proj.name}</CardTitle>
                  <CardDescription>{proj.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {proj.safetyCritical && proj.safetyDisclaimer && (
                  <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2.5 text-[11px] text-warning">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <span>{proj.safetyDisclaimer}</span>
                  </div>
                )}

                {/* Lifecycle Progress */}
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {PROJECT_STATUS_FLOW.map((st) => {
                    const active = st === proj.status;
                    return (
                      <span
                        key={st}
                        className={`rounded px-2 py-0.5 text-[10px] capitalize ${
                          active
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "bg-surface-raised text-muted-foreground"
                        }`}
                      >
                        {st}
                      </span>
                    );
                  })}
                </div>

                {/* Version History */}
                <div className="rounded-md border bg-surface-raised/30 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <GitBranch className="size-3" /> Version History ({proj.versions.length})
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    {proj.versions.slice(-2).map((v) => (
                      <div key={v.version} className="flex justify-between gap-2">
                        <span className="truncate">v{v.version}: {v.note}</span>
                        <span className="shrink-0 font-mono text-[10px]">{v.createdAt.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
              <div className="flex flex-wrap gap-1.5">
                {proj.status !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => handleAdvanceStatus(proj.id)}>
                    Advance <ArrowRight className="size-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProjects((prev) => [duplicateWorkspaceProject(proj), ...prev])}
                  title="Duplicate project"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setProjects((prev) =>
                      prev.map((p) => (p.id === proj.id ? { ...p, isArchived: !p.isArchived } : p)),
                    )
                  }
                  title={proj.isArchived ? "Restore" : "Archive"}
                >
                  {proj.isArchived ? <RotateCcw className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
              </div>
              <Button size="sm" variant="secondary" onClick={() => handleDownloadMd(proj)}>
                <Download className="size-3.5" /> Export MD
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

