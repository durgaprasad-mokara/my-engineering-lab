"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogIn, LogOut, Settings, UserRound } from "lucide-react";
import type { Viewer } from "@/lib/data/types";
import { signOut } from "@/app/(auth)/actions";

const itemCls =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none data-[highlighted]:bg-surface-raised";

export function UserMenu({ viewer }: { viewer: Viewer }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-raised" aria-label="Account menu">
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-bold text-background">
          {viewer.initials}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-xs font-medium">{viewer.name}</span>
          <span className="block text-[10px] text-muted-foreground">{viewer.mode === "demo" ? "Demo mode" : viewer.email}</span>
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-56 rounded-lg border bg-surface p-1 shadow-2xl data-[state=open]:animate-fade-in">
          <div className="px-2 py-2">
            <div className="text-xs font-medium">{viewer.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {viewer.mode === "demo" ? "Supabase not configured" : viewer.email}
            </div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild className={itemCls}>
            <Link href="/profile"><UserRound className="size-3.5" /> Profile &amp; progress</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemCls}>
            <Link href="/settings"><Settings className="size-3.5" /> Settings</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {viewer.mode === "live" ? (
            <form action={signOut}>
              <DropdownMenu.Item asChild className={itemCls}>
                <button type="submit" className="w-full"><LogOut className="size-3.5" /> Sign out</button>
              </DropdownMenu.Item>
            </form>
          ) : (
            <DropdownMenu.Item asChild className={itemCls}>
              <Link href="/login"><LogIn className="size-3.5" /> Sign-in setup</Link>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
