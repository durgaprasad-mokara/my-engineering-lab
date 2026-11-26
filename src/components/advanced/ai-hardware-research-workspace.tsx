"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Download, Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AZ_CATEGORIES } from "@/lib/components/az-types";
import type { HardwareResearchReport } from "@/lib/advanced/engines";

const SAVED_REPORTS_KEY = "mel_saved_hardware_research_v1";

const EXAMPLE_PROMPTS = [
  "Low-power ESP32 weather station with I2C humidity/barometric sensor and LiPo BMS",
  "Industrial RS485 Modbus energy meter with optocoupler isolation and 24V buck converter",
  "STM32 brushless DC motor controller with Hall effect feedback and current sensing",
];

export function AiHardwareResearchWorkspace({ initialReport }: { initialReport: HardwareResearchReport }) {
  const [query, setQuery] = useState(initialReport.query);
  const [category, setCategory] = useState("ALL");
  const [report, setReport] = useState<HardwareResearchReport>(initialReport);
  const [savedReports, setSavedReports] = useState<HardwareResearchReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_REPORTS_KEY);
      if (raw) setSavedReports(JSON.parse(raw) as HardwareResearchReport[]);
    } catch {}
  }, []);

  async function runResearch(promptText?: string) {
    const q = (promptText ?? query).trim();
    if (q.length < 2) {
      setError("Enter at least 2 characters describing your hardware goal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hardware-research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, category }),
      });
      const data = (await res.json()) as HardwareResearchReport & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Research request failed.");
      } else {
        setReport(data);
      }
    } catch {
      setError("Network error contacting Hardware Research API.");
    } finally {
      setLoading(false);
    }
  }

  function saveCurrentReport() {
    const next = [report, ...savedReports.filter((r) => r.id !== report.id)].slice(0, 12);
    setSavedReports(next);
    try {
      localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
    } catch {}
  }

  function deleteSavedReport(id: string) {
    const next = savedReports.filter((r) => r.id !== id);
    setSavedReports(next);
    try {
      localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
    } catch {}
  }

  function exportReportJson() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hardware-research-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI Hardware Research Prompt
          </CardTitle>
          <CardDescription className="text-xs">
            Synthesizes architecture notes and component shortlists grounded in the A–Z catalog (uses Claude API when configured, deterministic grounded engine otherwise).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-7">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe target MCU, sensors, power budget, interfaces, or environment..."
                className="pl-8"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter research category"
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
              >
                <option value="ALL">All 14 Categories</option>
                {AZ_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button className="w-full" disabled={loading} onClick={() => runResearch()}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Research
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                className="h-7 text-[11px]"
                onClick={() => {
                  setQuery(p);
                  void runResearch(p);
                }}
              >
                {p}
              </Button>
            ))}
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Research Synthesis</CardTitle>
                <Badge variant={report.mode === "anthropic" ? "live" : "illustrative"}>
                  {report.mode === "anthropic" ? "Claude AI + Catalog" : "Grounded Catalog Engine"}
                </Badge>
              </div>
              <CardDescription className="text-xs">Query: {report.query}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={saveCurrentReport}>
                <BookmarkPlus className="size-3.5" />
                Save Report
              </Button>
              <Button size="sm" variant="outline" onClick={exportReportJson}>
                <Download className="size-3.5" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-line rounded-md border border-border bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
            {report.summary}
          </p>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended Components ({report.recommendedComponents.length})
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {report.recommendedComponents.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    {c.estimatedCostUsd !== null && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        ~${c.estimatedCostUsd.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-primary">
                    {c.category} · {c.operatingVoltage}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{c.reason}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border p-3 text-xs">
              <p className="font-semibold text-foreground">Architecture Notes</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted-foreground">
                {report.architectureNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-border p-3 text-xs">
              <p className="font-semibold text-warning">Assumptions &amp; Verification Risks</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted-foreground">
                {report.risksAndAssumptions.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Saved Research Reports ({savedReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {savedReports.length === 0 ? (
            <p className="text-xs text-muted-foreground">No saved research reports yet. Click &quot;Save Report&quot; above to archive a run.</p>
          ) : (
            <div className="space-y-2">
              {savedReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setReport(r)}
                    className="text-left font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {r.query}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => deleteSavedReport(r.id)}>
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

