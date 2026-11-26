"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import type { NotificationSummary, Viewer } from "@/lib/data/types";
import type { CatalogueSearchItem } from "@/lib/knowledge/search";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { BackToTop } from "./back-to-top";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandSearch } from "./command-search";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";

const STORAGE_KEY = "mel.sidebar.collapsed";

export function AppShell({
  viewer,
  notifications,
  catalogueItems,
  children,
}: {
  viewer: Viewer;
  notifications: NotificationSummary[];
  catalogueItems?: CatalogueSearchItem[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r bg-surface/80 backdrop-blur transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggle} />
      </aside>

      {/* Mobile drawer */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-surface data-[state=open]:animate-slide-in-left lg:hidden"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close className="absolute right-3 top-3.5 rounded-md p-1.5 text-muted-foreground hover:bg-surface-raised" aria-label="Close navigation">
              <X className="size-4" />
            </Dialog.Close>
            <Sidebar collapsed={false} variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className={cn("flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <header className="glass sticky top-0 z-20 border-b">
          <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-raised lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden min-w-0 flex-1 md:block">
              <Breadcrumbs />
            </div>
            <div className="flex flex-1 justify-end md:flex-none">
              <div className="w-full md:w-72 xl:w-96">
                <CommandSearch catalogueItems={catalogueItems} />
              </div>
            </div>
            <Link
              href="/assistant"
              className="flex h-9 items-center gap-1.5 rounded-md border border-violet/40 bg-violet/10 px-2.5 text-xs font-medium text-violet hover:bg-violet/20"
              aria-label="AI Engineering Assistant"
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Link>
            <NotificationsMenu items={notifications} mode={viewer.mode} />
            <UserMenu viewer={viewer} />
          </div>
          <div className="border-t px-4 py-2 md:hidden">
            <Breadcrumbs />
          </div>
        </header>

        {viewer.mode === "demo" && (
          <div className="border-b border-warning/20 bg-warning/5 px-4 py-2 text-center text-[11px] text-warning sm:px-5">
            Demo mode — Supabase is not configured, so sign-in is disabled and data is sample data.{" "}
            <Link href="/documentation/architecture" className="underline underline-offset-2">How to connect</Link>
          </div>
        )}

        <main className="reveal-section min-w-0 flex-1 px-3 py-5 sm:px-5 lg:px-6">{children}</main>
        <BackToTop />
      </div>
    </div>
  );
}
