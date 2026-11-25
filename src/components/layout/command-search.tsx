"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Antenna, Boxes, CornerDownLeft, Cpu, FileText, Gauge, Radio, Search } from "lucide-react";
import { NAV_BY_SLUG } from "@/lib/navigation";
import {
  demoCatalogueAntennas,
  demoCatalogueCommunication,
  demoCatalogueComponents,
  demoCatalogueMcus,
  demoCatalogueSensors,
} from "@/lib/data/demo";
import {
  catalogueToSearchItems,
  searchGlobal,
  type CatalogueKind,
  type CatalogueSearchItem,
} from "@/lib/knowledge/search";
import { cn } from "@/lib/utils";

const KIND_BADGE: Record<CatalogueKind, { label: string; icon: typeof Boxes }> = {
  component: { label: "Component", icon: Boxes },
  sensor: { label: "Sensor", icon: Gauge },
  microcontroller: { label: "MCU", icon: Cpu },
  communication: { label: "Protocol", icon: Radio },
  antenna: { label: "Antenna", icon: Antenna },
};

export function CommandSearch({ catalogueItems }: { catalogueItems?: CatalogueSearchItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const router = useRouter();

  const resolvedCatalogue = React.useMemo(
    () =>
      catalogueItems ??
      catalogueToSearchItems({
        components: demoCatalogueComponents(),
        sensors: demoCatalogueSensors(),
        mcus: demoCatalogueMcus(),
        communication: demoCatalogueCommunication(),
        antennas: demoCatalogueAntennas(),
      }),
    [catalogueItems],
  );

  const results = React.useMemo(
    () => searchGlobal(query, resolvedCatalogue),
    [query, resolvedCatalogue],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => setActive(0), [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border bg-surface-raised/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          aria-label="Search the lab"
        >
          <Search className="size-4" />
          <span className="hidden flex-1 text-left sm:inline">Search sections, components, sensors, MCUs…</span>
          <kbd className="hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] md:inline">Ctrl K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[12vh] z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border bg-surface shadow-2xl data-[state=open]:animate-fade-in"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => (results.length === 0 ? 0 : Math.min(a + 1, results.length - 1)));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                }
                if (e.key === "Enter") {
                  const chosen = results[active];
                  if (chosen) go(chosen.href);
                }
              }}
              placeholder="Search sections, components, sensors, MCUs — try “esp32”, “lm358”, “dht22”"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              aria-label="Search query"
            />
          </div>
          <ul className="scrollbar-thin max-h-[50vh] overflow-y-auto p-2" role="listbox">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</li>
            )}
            {results.map((r, i) => {
              const Icon =
                r.kind === "section"
                  ? NAV_BY_SLUG.get(r.id.replace("section:", ""))?.icon ?? FileText
                  : KIND_BADGE[r.kind].icon;

              return (
                <li key={r.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left",
                      i === active ? "bg-primary/15" : "hover:bg-surface-raised",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.summary}</span>
                    </span>
                    {r.kind === "section" && r.planned ? (
                      <span className="font-mono text-[10px] text-muted-foreground">Phase {r.phase}</span>
                    ) : r.kind !== "section" ? (
                      <span className="flex items-center gap-2">
                        <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-accent">
                          {KIND_BADGE[r.kind].label}
                        </span>
                        {i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" />}
                      </span>
                    ) : (
                      i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
            Searching sections and knowledge base (components, sensors, microcontrollers).
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
