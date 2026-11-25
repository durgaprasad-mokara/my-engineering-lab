import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NAV_BY_SLUG } from "@/lib/navigation";
import { PhaseStatus } from "@/components/layout/phase-status";

// Sections that have shipped get their own static route, which takes precedence over this one.
// Rendered per request because the app shell reads the signed-in user.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: NAV_BY_SLUG.get(section)?.title ?? "Not found" };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = NAV_BY_SLUG.get(section);
  if (!item || item.status !== "planned") notFound();
  return <PhaseStatus item={item} />;
}
