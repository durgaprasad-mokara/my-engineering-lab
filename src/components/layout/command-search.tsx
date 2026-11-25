"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { searchNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const router = useRouter();
  const results = React.useMemo(() => searchNav(query), [query]);

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
          <span className="hidden flex-1 text-left sm:inline">Search sections, components, sensors…</span>
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
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                if (e.key === "Enter" && results[active]) go(results[active].href);
              }}
              placeholder="Search sections — try “esp32”, “lorawan”, “flow”"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              aria-label="Search query"
            />
          </div>
          <ul className="scrollbar-thin max-h-[50vh] overflow-y-auto p-2" role="listbox">
            {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</li>}
            {results.map((r, i) => {
              const Icon = r.icon;
              return (
                <li key={r.slug} role="option" aria-selected={i === active}>
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
                    {r.status === "planned" ? (
                      <span className="font-mono text-[10px] text-muted-foreground">Phase {r.phase}</span>
                    ) : (
                      i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
            Searching sections. Component, sensor and project search is added with the knowledge base in Phase 2.
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
