"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AZ_COMPONENTS } from "@/lib/components/az-catalog";
import { AZ_CATEGORIES } from "@/lib/components/az-types";

const REFERENCE_NOTES = [
  {
    id: "kb-i2c-pullups",
    title: "I2C Pull-Up Resistor Sizing (3.3 V vs 5 V)",
    domain: "Communication",
    summary: "Calculate Rp(min) = (Vcc - Vol_max) / Iol and Rp(max) = tr / (0.8473 * Cbus). Typical 100 kHz–400 kHz buses use 2.2 kΩ to 4.7 kΩ.",
    relatedHref: "/components",
  },
  {
    id: "kb-ldo-vs-buck",
    title: "LDO vs Synchronous Buck Converter Thermal Trade-Off",
    domain: "Power Electronics",
    summary: "Linear LDO dissipation equals (Vin - Vout) * Iload. Above ~500 mW on small SMD packages, switch to a buck converter for >85% efficiency.",
    relatedHref: "/hardware-validation",
  },
  {
    id: "kb-decoupling",
    title: "IC Power Rail Decoupling Placement Rules",
    domain: "PCB Design",
    summary: "Place 100 nF X7R ceramic capacitors within 2 mm of every VDD/GND pin pair and pair with a 10 µF bulk capacitor per power domain.",
    relatedHref: "/pcb-design",
  },
  {
    id: "kb-flyback-diode",
    title: "Inductive Load Flyback Protection (Relays & Solenoids)",
    domain: "Protection",
    summary: "Always place a fast Schottky or 1N4007/1N4148 flyback diode reverse-biased across DC relay coils, solenoids, and brushed DC motors.",
    relatedHref: "/components/electromagnetic-relay",
  },
];

export function KnowledgeBaseWorkspace() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredComponents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AZ_COMPONENTS.filter((c) => {
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
      if (!q) return true;
      return `${c.name} ${c.category} ${c.workingPrinciple} ${c.internalArchitecture} ${c.protocols.join(" ")}`
        .toLowerCase()
        .includes(q);
    }).slice(0, 24);
  }, [query, selectedCategory]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REFERENCE_NOTES;
    return REFERENCE_NOTES.filter((n) => `${n.title} ${n.domain} ${n.summary}`.toLowerCase().includes(q));
  }, [query]);

  function exportKnowledgeMarkdown() {
    const lines = [
      "# My Engineering Lab — Engineering Knowledge Base Export",
      "",
      "## Design Rules & Application Notes",
      ...filteredNotes.map((n) => `### ${n.title} (${n.domain})\n${n.summary}\n`),
      "## Component Architecture Index",
      ...filteredComponents.map((c) => `- **${c.name}** (${c.category}): ${c.workingPrinciple}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engineering-knowledge-base.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search working principles, architectures, design rules, protocols..."
              className="pl-8"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2.5 text-xs"
          >
            <option value="ALL">All 14 Categories</option>
            {AZ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={exportKnowledgeMarkdown}>
            <Download className="size-3.5" />
            Export Markdown
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{note.domain}</Badge>
                <BookOpen className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>{note.summary}</p>
              <Link href={note.relatedHref} className="inline-block text-primary hover:underline">
                Open related workspace →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Component Working Principles ({filteredComponents.length})</CardTitle>
          <CardDescription className="text-xs">
            Quick engineering reference pulled directly from the A–Z Components Library
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {filteredComponents.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="rounded-lg border border-border p-3 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {c.category}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.workingPrinciple}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

