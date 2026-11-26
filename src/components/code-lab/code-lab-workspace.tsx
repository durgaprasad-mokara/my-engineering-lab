"use client";

import * as React from "react";
import {
  AlertTriangle,
  Binary,
  Copy,
  Download,
  FileCode2,
  GitBranch,
  Plus,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FIRMWARE_TEMPLATES,
  createInitialVersion,
  exportFirmwareBundleText,
  saveFirmwareVersion,
  type FirmwareFile,
  type FirmwareVersion,
} from "@/lib/code-lab/templates";

export function CodeLabWorkspace() {
  const [templateId, setTemplateId] = React.useState(FIRMWARE_TEMPLATES[0]!.id);
  const template = FIRMWARE_TEMPLATES.find((t) => t.id === templateId) ?? FIRMWARE_TEMPLATES[0]!;

  const [files, setFiles] = React.useState<FirmwareFile[]>(() => template.files.map((f) => ({ ...f })));
  const [activePath, setActivePath] = React.useState(template.files[0]!.path);
  const [versions, setVersions] = React.useState<FirmwareVersion[]>(() => [createInitialVersion(template)]);
  const [versionNote, setVersionNote] = React.useState("");
  const [newFilePath, setNewFilePath] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const handleSelectTemplate = (id: string) => {
    const next = FIRMWARE_TEMPLATES.find((t) => t.id === id) ?? FIRMWARE_TEMPLATES[0]!;
    setTemplateId(next.id);
    setFiles(next.files.map((f) => ({ ...f })));
    setActivePath(next.files[0]!.path);
    setVersions([createInitialVersion(next)]);
  };

  const activeFile = files.find((f) => f.path === activePath) ?? files[0]!;
  const lineCount = activeFile.content.split("\n").length;

  const handleUpdateContent = (nextContent: string) => {
    setFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, content: nextContent } : f)));
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFilePath.trim();
    if (!cleaned || files.some((f) => f.path === cleaned)) return;
    const ext = cleaned.split(".").pop()?.toLowerCase();
    const lang: FirmwareFile["language"] =
      ext === "py" ? "python" : ext === "cpp" ? "cpp" : ext === "ini" ? "ini" : "c";
    setFiles((prev) => [...prev, { path: cleaned, language: lang, content: `// ${cleaned}\n` }]);
    setActivePath(cleaned);
    setNewFilePath("");
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    setVersions((prev) => saveFirmwareVersion(prev, files, versionNote));
    setVersionNote("");
  };

  const handleRestoreVersion = (ver: FirmwareVersion) => {
    setFiles(ver.files.map((f) => ({ ...f })));
    setActivePath(ver.files[0]!.path);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Target Firmware Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FIRMWARE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTemplate(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                templateId === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning">Build: untested</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {template.targetBoard}
          </Badge>
        </div>
      </div>

      {/* Honest Build Status Notice */}
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Build Status: UNTESTED.</strong> Firmware templates match target pinouts and frameworks, but browser-side code is never marked compiled until executed against a local PlatformIO / ESP-IDF / Zephyr toolchain or compile container.
        </span>
      </div>

      {/* IDE Layout: File Tree + Editor + Versions */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* File Tree (3 cols) */}
        <Card className="xl:col-span-3">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileCode2 className="size-4 text-accent" />
              Project Files ({files.length})
            </CardTitle>
            <CardDescription>{template.framework}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-3">
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setActivePath(f.path)}
                    className={`w-full rounded px-2.5 py-1.5 text-left font-mono text-xs transition-colors ${
                      activeFile.path === f.path
                        ? "bg-primary/15 font-semibold text-accent"
                        : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                    }`}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddFile} className="flex gap-1.5 pt-2">
              <Input
                placeholder="src/driver.c"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="h-8 font-mono text-xs"
              />
              <Button type="submit" size="sm" variant="outline" className="h-8 px-2" aria-label="Add file">
                <Plus className="size-3.5" />
              </Button>
            </form>

            <div className="border-t pt-3">
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                onClick={() =>
                  downloadFile(
                    `${template.id}-bundle.txt`,
                    exportFirmwareBundleText(template.name, files),
                  )
                }
              >
                <Download className="size-3.5" /> Download Full Bundle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code Editor (6 cols) */}
        <Card className="flex flex-col xl:col-span-6">
          <CardHeader className="border-b pb-3">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Binary className="size-4 text-accent" />
                <span className="font-mono text-xs font-semibold text-foreground">{activeFile.path}</span>
                <Badge variant="outline" className="font-mono text-[10px]">{activeFile.language}</Badge>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeFile.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(activeFile.path.split("/").pop() ?? "firmware.txt", activeFile.content)}
                >
                  <Download className="size-3.5" /> File
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 p-0">
            <div className="flex w-full bg-[#060a14] font-mono text-xs">
              <div className="select-none border-r border-border/60 px-3 py-3 text-right text-[11px] leading-5 text-muted-foreground/50">
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>
              <textarea
                aria-label={`Code editor for ${activeFile.path}`}
                spellCheck={false}
                value={activeFile.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                className="min-h-[400px] w-full resize-none bg-transparent p-3 text-xs leading-5 text-slate-200 outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Version History (3 cols) */}
        <Card className="xl:col-span-3">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <GitBranch className="size-4 text-accent" />
              Version History ({versions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3">
            <form onSubmit={handleSaveSnapshot} className="space-y-2">
              <Input
                placeholder="Snapshot note (e.g. Add sleep timer)"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="submit" size="sm" className="w-full">
                <Save className="size-3.5" /> Save Snapshot
              </Button>
            </form>

            <ul className="max-h-72 space-y-2 overflow-y-auto pt-1">
              {[...versions].reverse().map((v) => (
                <li key={v.version} className="rounded-md border bg-surface-raised/30 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-accent">v{v.version}</span>
                    <Badge variant="warning" className="text-[9px]">{v.buildStatus}</Badge>
                  </div>
                  <p className="text-[11px] text-foreground">{v.note}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                    <span>{v.createdAt.slice(11, 19)}</span>
                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(v)}
                      className="text-accent hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

