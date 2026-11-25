import { NAV_BY_SLUG } from "./navigation";

export interface Crumb {
  label: string;
  href: string;
}

const titleCase = (s: string) =>
  decodeURIComponent(s)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function buildBreadcrumbs(pathname: string, labels: Record<string, string> = {}): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Lab", href: "/dashboard" }];
  parts.forEach((part, idx) => {
    const href = "/" + parts.slice(0, idx + 1).join("/");
    const label = labels[href] ?? (idx === 0 ? NAV_BY_SLUG.get(part)?.title : undefined) ?? titleCase(part);
    crumbs.push({ label, href });
  });
  return crumbs;
}
