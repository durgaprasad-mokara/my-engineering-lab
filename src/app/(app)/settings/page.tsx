import type { Metadata } from "next";
import { getPreferences } from "@/lib/data/profile";
import { appMode } from "@/lib/env";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

const INTEGRATIONS = [
  { name: "Supabase (auth, database, storage)", phase: 1, env: "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY" },
  { name: "Anthropic Claude API", phase: 10, env: "ANTHROPIC_API_KEY (server-only)" },
  { name: "MQTT broker", phase: 11, env: "MQTT_BROKER_URL" },
  { name: "Email reminders", phase: 12, env: "RESEND_API_KEY" },
];

export default async function SettingsPage() {
  const prefs = await getPreferences();
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader title="Settings" description="Preferences and integration status." />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Saved to your account.</CardDescription>
          </div>
          <DataSourceBadge source={prefs.mode === "demo" ? "demo" : "live"} />
        </CardHeader>
        <CardContent>
          <SettingsForm prefs={prefs} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Reminder delivery</CardTitle>
            <CardDescription>How reminders will reach you once the calendar ships (Phase 12).</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><span className="text-foreground">In-app:</span> always shown in the notifications menu.</p>
          <p><span className="text-foreground">Browser notifications:</span> require your permission and only appear while a lab tab is open (or via a service worker push subscription).</p>
          <p><span className="text-foreground">Email:</span> sent by a scheduled server job at your reminder time — the only channel that works when the app is closed.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {INTEGRATIONS.map((i) => {
              const connected = i.phase === 1 && appMode === "live";
              return (
                <li key={i.name} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div>{i.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{i.env}</div>
                  </div>
                  {connected ? (
                    <Badge variant="live">Connected</Badge>
                  ) : i.phase === 1 ? (
                    <Badge variant="demo">Not configured</Badge>
                  ) : (
                    <Badge variant="outline">Needed in Phase {i.phase}</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
