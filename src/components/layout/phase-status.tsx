import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, PlugZap } from "lucide-react";
import type { NavItem } from "@/lib/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "./page-header";

/** Honest status page for sections, reflecting delivered phases and planned work. */
export function PhaseStatus({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const isAvailable = item.status === "available";
  const samePhase = NAV_ITEMS.filter((i) => i.phase === item.phase && i.slug !== item.slug);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <Badge variant="success">Phase {item.phase} complete</Badge>
            ) : (
              <Badge variant="warning">Not built yet</Badge>
            )}
            <Badge variant="outline">Phase {item.phase} of 13</Badge>
          </div>
        }
        title={item.title}
        description={item.summary}
        actions={
          isAvailable ? (
            <Button asChild size="sm">
              <Link href={item.href}>
                Open {item.title}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{isAvailable ? "Delivered capabilities" : "Planned capabilities"}</CardTitle>
              <CardDescription>
                {isAvailable
                  ? `Delivered in Phase ${item.phase} and active in this workspace.`
                  : `What this section will do when Phase ${item.phase} is delivered and tested.`}
              </CardDescription>
            </div>
            <Icon className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {item.capabilities.map((c) => (
                <li key={c} className="flex gap-2.5 text-sm">
                  {isAvailable ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {isAvailable ? (
                <p>
                  This section shipped in Phase {item.phase}. Records carry explicit provenance badges and manufacturer
                  documentation links.
                </p>
              ) : (
                <p>
                  This route exists so navigation is complete, but none of the features above are implemented yet.
                  Nothing on this page is a placeholder pretending to work.
                </p>
              )}
              <p className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-success" /> Phase 1 foundation is complete.
              </p>
              <p className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-success" /> Phase 2 knowledge base (components, sensors,
                microcontrollers) is complete.
              </p>
            </CardContent>
          </Card>

          {item.dependencies && item.dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>External dependencies</CardTitle>
                <PlugZap className="size-4 text-warning" />
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {item.dependencies.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {samePhase.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Also in Phase {item.phase}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {samePhase.map((s) => (
                  <Link key={s.slug} href={s.href} className="rounded-md border px-2 py-1 text-xs hover:bg-surface-raised">
                    {s.title}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        See the full plan in{" "}
        <Link href="/documentation/roadmap" className="text-accent hover:underline">
          Development Roadmap
        </Link>
        .
      </p>
    </div>
  );
}
