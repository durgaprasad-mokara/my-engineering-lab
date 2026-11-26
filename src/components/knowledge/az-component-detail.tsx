"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Check,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  FolderPlus,
  ImagePlus,
  Info,
  Layers,
  Package,
  PackagePlus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { ComponentVisual } from "@/components/knowledge/component-visual";
import { ProvenanceBadge } from "@/components/knowledge/provenance-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AzComponentRecord, ComponentImageRecord } from "@/lib/components/az-types";

const FAVORITES_KEY = "mel_az_favorites_v1";
const RECENT_KEY = "mel_az_recent_v1";
const BOM_KEY = "mel_az_bom_v1";
const PROJECT_KEY = "mel_az_project_parts_v1";
const ADMIN_IMAGES_KEY = "mel_az_admin_images_v1";

type GalleryRole = ComponentImageRecord["role"];

function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function AzComponentDetail({ component }: { component: AzComponentRecord }) {
  const [activeRole, setActiveRole] = useState<GalleryRole>("main");
  const [activeCodeTab, setActiveCodeTab] = useState<"arduino" | "esp32" | "stm32" | "raspberryPi">(() => {
    if (component.codeExamples.arduino) return "arduino";
    if (component.codeExamples.esp32) return "esp32";
    if (component.codeExamples.stm32) return "stm32";
    return "raspberryPi";
  });
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Admin image metadata override state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customAttribution, setCustomAttribution] = useState("");
  const [customLicense, setCustomLicense] = useState("Official Manufacturer Documentation");
  const [savedAdminMeta, setSavedAdminMeta] = useState<{
    url: string;
    attribution: string;
    license: string;
  } | null>(null);

  useEffect(() => {
    try {
      const recRaw = localStorage.getItem(RECENT_KEY);
      const rec = recRaw ? (JSON.parse(recRaw) as string[]) : [];
      const nextRec = [component.slug, ...rec.filter((s) => s !== component.slug)].slice(0, 12);
      localStorage.setItem(RECENT_KEY, JSON.stringify(nextRec));

      const favRaw = localStorage.getItem(FAVORITES_KEY);
      const fav = favRaw ? (JSON.parse(favRaw) as string[]) : [];
      setIsFavorite(fav.includes(component.slug));

      const adminRaw = localStorage.getItem(ADMIN_IMAGES_KEY);
      if (adminRaw) {
        const map = JSON.parse(adminRaw) as Record<string, { url: string; attribution: string; license: string }>;
        if (map[component.slug]) {
          setSavedAdminMeta(map[component.slug] ?? null);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [component.slug]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((c) => (c === msg ? null : c)), 2800);
  }

  function toggleFavorite() {
    try {
      const favRaw = localStorage.getItem(FAVORITES_KEY);
      const fav = favRaw ? (JSON.parse(favRaw) as string[]) : [];
      const next = fav.includes(component.slug)
        ? fav.filter((s) => s !== component.slug)
        : [...fav, component.slug];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setIsFavorite(next.includes(component.slug));
      notify(next.includes(component.slug) ? "Saved to favorites." : "Removed from favorites.");
    } catch {}
  }

  function addToList(key: string, label: string) {
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      if (!list.includes(component.slug)) {
        localStorage.setItem(key, JSON.stringify([...list, component.slug]));
      }
      notify(`Added ${component.name} to ${label}.`);
    } catch {}
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(component, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${component.slug}-specs.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${component.name} specification JSON.`);
  }

  function saveAdminImage(e: React.FormEvent) {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    const entry = {
      url: customImageUrl.trim(),
      attribution: customAttribution.trim() || component.manufacturer,
      license: customLicense.trim() || "Authorized Product Documentation",
    };
    try {
      const raw = localStorage.getItem(ADMIN_IMAGES_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, typeof entry>) : {};
      map[component.slug] = entry;
      localStorage.setItem(ADMIN_IMAGES_KEY, JSON.stringify(map));
      setSavedAdminMeta(entry);
      setShowAdminPanel(false);
      notify("Updated component image metadata.");
    } catch {}
  }

  const activeImageMeta = component.images.find((img) => img.role === activeRole) ?? component.images[0];
  const codeText = component.codeExamples[activeCodeTab] ?? "";

  async function copyCode() {
    if (!codeText) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const specRows: Array<{ label: string; value: string; status?: "verified" | "estimated" }> = [
    { label: "Manufacturer", value: component.manufacturer, status: "verified" },
    { label: "Part Number", value: component.partNumber, status: "verified" },
    { label: "Package Type", value: component.packageType, status: "verified" },
    { label: "Dimensions", value: component.dimensions, status: "verified" },
    { label: "Operating Voltage", value: component.operatingVoltage, status: "verified" },
    { label: "Operating Current", value: component.operatingCurrent, status: "verified" },
    { label: "Power Consumption", value: component.powerConsumption, status: "estimated" },
    { label: "I/O Details", value: component.ioDetails, status: "verified" },
    { label: "Communication Protocols", value: component.protocols.join(", ") || "None (Analog/Discrete)", status: "verified" },
    { label: "Frequency Range", value: component.frequencyRange ?? "N/A / Not applicable", status: "verified" },
    { label: "Measurement Range", value: component.measurementRange ?? "N/A / Not applicable", status: "verified" },
    { label: "Accuracy", value: component.accuracy ?? "See manufacturer datasheet", status: "verified" },
    { label: "Resolution", value: component.resolution ?? "N/A / Analog continuous", status: "verified" },
    { label: "Operating Temperature", value: component.operatingTemp, status: "verified" },
    {
      label: "Estimated Unit Cost",
      value: component.estimatedCostUsd !== null ? `$${component.estimatedCostUsd.toFixed(2)} USD (Estimated)` : "Unverified",
      status: "estimated",
    },
    { label: "Supplier Info", value: component.supplierInfo, status: "estimated" },
  ];

  return (
    <div className="space-y-5">
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg"
        >
          <Check className="size-4 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            Letter {component.letter}
          </Badge>
          <Badge variant="outline">{component.category}</Badge>
          <Badge variant="outline">{component.subcategory}</Badge>
          <ProvenanceBadge status={component.verificationStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={isFavorite ? "default" : "outline"} onClick={toggleFavorite}>
            <Bookmark className="size-3.5" />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => addToList(BOM_KEY, "Bill of Materials")}>
            <PackagePlus className="size-3.5" />
            Add to BOM
          </Button>
          <Button size="sm" variant="outline" onClick={() => addToList(PROJECT_KEY, "Active Project")}>
            <FolderPlus className="size-3.5" />
            Add to Project
          </Button>
          <Button size="sm" variant="outline" onClick={exportJson}>
            <Download className="size-3.5" />
            Export JSON
          </Button>
          {isSafeHttpUrl(component.datasheetUrl) && (
            <a href={component.datasheetUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <FileText className="size-3.5" />
                Datasheet
                <ExternalLink className="size-3" />
              </Button>
            </a>
          )}
          {isSafeHttpUrl(component.manufacturerUrl) && (
            <a href={component.manufacturerUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                Manufacturer
                <ExternalLink className="size-3" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Gallery + Architecture Overview */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Component Visual Gallery</CardTitle>
                <CardDescription className="text-xs">
                  {activeImageMeta?.isIllustrative
                    ? "Illustrative Technical Diagram — clearly distinguished from manufacturer photography"
                    : "Manufacturer product image status"}
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowAdminPanel((v) => !v)}>
                <ImagePlus className="size-3.5" />
                Admin Image
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-background/80 p-3">
              <ComponentVisual component={component} role={activeRole} className="h-64 w-full" />
            </div>

            {savedAdminMeta && activeRole === "manufacturer" && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 text-xs">
                <p className="font-medium text-foreground">Admin Registered Image Reference:</p>
                <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">{savedAdminMeta.url}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Attribution: {savedAdminMeta.attribution} · License: {savedAdminMeta.license}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {component.images.map((img) => (
                <Button
                  key={img.role}
                  size="sm"
                  variant={activeRole === img.role ? "default" : "outline"}
                  className="h-7 px-2.5 text-xs capitalize"
                  onClick={() => setActiveRole(img.role)}
                >
                  {img.role}
                </Button>
              ))}
            </div>

            {activeImageMeta && (
              <div className="rounded-md border border-border/70 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
                <div>
                  <strong className="text-foreground">View:</strong> {activeImageMeta.title}
                </div>
                <div>
                  <strong className="text-foreground">Attribution:</strong> {activeImageMeta.attribution} ·{" "}
                  <strong className="text-foreground">License:</strong> {activeImageMeta.license}
                </div>
              </div>
            )}

            {showAdminPanel && (
              <form onSubmit={saveAdminImage} className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-foreground">Update Component Image Metadata (Admin)</p>
                <Input
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Supabase Storage path or authorized manufacturer image URL"
                  className="h-8 text-xs"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={customAttribution}
                    onChange={(e) => setCustomAttribution(e.target.value)}
                    placeholder="Attribution (e.g. Texas Instruments)"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={customLicense}
                    onChange={(e) => setCustomLicense(e.target.value)}
                    placeholder="License / Documentation source"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdminPanel(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Metadata
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4 text-primary" />
                Working Principle &amp; Internal Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h4>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{component.description}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Working Principle</h4>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{component.workingPrinciple}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal Architecture</h4>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{component.internalArchitecture}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="size-4 text-primary" />
                Compatibility &amp; Ecosystem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="mb-1.5 font-medium text-muted-foreground">Compatible Microcontrollers</p>
                <div className="flex flex-wrap gap-1.5">
                  {component.compatibleMcus.map((mcu) => (
                    <Badge key={mcu} variant="default">
                      {mcu}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-medium text-muted-foreground">Compatible Sensors &amp; Modules</p>
                <div className="flex flex-wrap gap-1.5">
                  {component.compatibleModules.map((mod) => (
                    <Badge key={mod} variant="outline">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Electrical Specs + Pinout */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" />
              Electrical &amp; Mechanical Specifications
            </CardTitle>
            <CardDescription className="text-xs">
              Verified manufacturer limits vs. estimated cost/power figures are explicitly labelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60 text-xs">
              {specRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 py-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <div className="flex items-center gap-2 text-right font-mono text-foreground">
                    <span>{row.value}</span>
                    {row.status === "estimated" && (
                      <Badge variant="illustrative" className="text-[9px]">
                        Est.
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4 text-primary" />
              Pinout &amp; Terminal Descriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-1.5 pr-3 font-medium">Pin</th>
                    <th className="py-1.5 pr-3 font-medium">Name</th>
                    <th className="py-1.5 pr-3 font-medium">Function</th>
                    <th className="py-1.5 font-medium">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {component.pinout.map((pin) => (
                    <tr key={`${pin.pin}-${pin.name}`}>
                      <td className="py-1.5 pr-3 font-mono font-semibold text-primary">{pin.pin}</td>
                      <td className="py-1.5 pr-3 font-mono">{pin.name}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{pin.function}</td>
                      <td className="py-1.5 font-mono text-[11px]">{pin.voltage ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-border/70 bg-muted/30 p-3 text-xs">
              <p className="font-semibold text-foreground">Wiring &amp; Example Circuit</p>
              <p className="mt-1 text-muted-foreground">{component.wiringNotes}</p>
              <p className="mt-1.5 font-mono text-[11px] text-foreground">{component.exampleCircuit}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="size-4 text-primary" />
                Firmware &amp; Integration Examples
              </CardTitle>
              <CardDescription className="text-xs">
                Starter snippets for Arduino, ESP32, STM32 HAL, and Raspberry Pi (Python)
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["arduino", "esp32", "stm32", "raspberryPi"] as const).map((tab) => {
                const available = Boolean(component.codeExamples[tab]);
                if (!available) return null;
                return (
                  <Button
                    key={tab}
                    size="sm"
                    variant={activeCodeTab === tab ? "default" : "outline"}
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setActiveCodeTab(tab)}
                  >
                    {tab === "raspberryPi" ? "Raspberry Pi" : tab.toUpperCase()}
                  </Button>
                );
              })}
              {codeText && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={copyCode}>
                  {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {codeText ? (
            <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
              <code>{codeText}</code>
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground">No firmware example available for this passive/mechanical part.</p>
          )}
        </CardContent>
      </Card>

      {/* Applications, Pros/Cons, Alternatives */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="size-4 text-primary" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {component.applications.map((app) => (
                <li key={app}>{app}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Advantages &amp; Disadvantages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-success">Advantages</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                {component.advantages.map((adv) => (
                  <li key={adv}>{adv}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-warning">Trade-offs / Limitations</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                {component.disadvantages.map((dis) => (
                  <li key={dis}>{dis}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-primary" />
              Alternative Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {component.alternatives.map((alt) => (
                <Badge key={alt} variant="outline">
                  {alt}
                </Badge>
              ))}
            </div>
            <p className="pt-2 text-[11px] text-muted-foreground">
              <Link href="/components" className="text-primary hover:underline">
                Browse all A–Z components →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

