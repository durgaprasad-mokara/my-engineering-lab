"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import type { NotificationSummary } from "@/lib/data/types";
import type { AppMode } from "@/lib/env";
import { relativeTime } from "@/lib/utils";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export function NotificationsMenu({ items, mode }: { items: NotificationSummary[]; mode: AppMode }) {
  const unread = items.filter((n) => !n.read).length;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-raised hover:text-foreground"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-background">
            {unread}
          </span>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 overflow-hidden rounded-lg border bg-surface shadow-2xl data-[state=open]:animate-fade-in"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            <DataSourceBadge source={mode === "demo" ? "demo" : "live"} />
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="scrollbar-thin max-h-80 overflow-y-auto">
              {items.map((n) => (
                <DropdownMenu.Item key={n.id} className="flex gap-3 border-b px-4 py-3 outline-none last:border-0 data-[highlighted]:bg-surface-raised">
                  <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${n.read ? "bg-border" : "bg-accent"}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium">{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>}
                    <span className="mt-1 block text-[10px] text-muted-foreground/70">{relativeTime(n.createdAt)}</span>
                  </span>
                </DropdownMenu.Item>
              ))}
            </ul>
          )}
          <div className="border-t px-4 py-2 text-[10px] text-muted-foreground">
            Reminders and browser notifications arrive with the calendar in Phase 12.
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
