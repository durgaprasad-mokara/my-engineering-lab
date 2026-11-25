"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-xs text-muted-foreground">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.href + i} className={`flex min-w-0 items-center gap-1 ${i < crumbs.length - 2 ? "hidden sm:flex" : ""}`}>
              {i > 0 && <ChevronRight className="size-3 shrink-0" aria-hidden />}
              {last ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="truncate hover:text-foreground">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
