"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { navItemsByGroup } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate, variant = "desktop" }: SidebarProps) {
  const pathname = usePathname();
  const groups = navItemsByGroup();

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 items-center border-b px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="My Engineering Lab home">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      <nav aria-label="Main" className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <div key={group.id} className="mb-3">
            {!collapsed ? (
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.label}
              </div>
            ) : (
              <div className="mx-auto my-2 h-px w-6 bg-border" aria-hidden />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[13px] transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary/15 text-foreground shadow-glow"
                          : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
                      {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                      {!collapsed && item.status === "planned" && (
                        <span className="rounded border px-1 font-mono text-[9px] text-muted-foreground/80" title={`Delivered in Phase ${item.phase}`}>
                          P{item.phase}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {variant === "desktop" && onToggleCollapsed && (
        <div className="border-t p-2">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );
}
