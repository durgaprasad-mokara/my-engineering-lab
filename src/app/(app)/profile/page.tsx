import type { Metadata } from "next";
import { getProfile } from "@/lib/data/profile";
import { getDashboardData } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile & Progress" };

const SKILL_AREAS = ["Electronics", "Sensors", "Embedded C/C++", "Communication", "PCB design", "Robotics", "Cloud"];

export default async function ProfilePage() {
  const [profile, dash] = await Promise.all([getProfile(), getDashboardData()]);
  const progress = dash.stats.find((s) => s.key === "learning_progress");
  const statsShown = dash.stats.filter((s) => ["iot_projects", "robotics_projects", "completed_experiments", "saved_configurations"].includes(s.key));
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Profile & Progress" description="Your engineering profile. The AI assistant (Phase 10) will use it to tailor recommendations." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>{profile.email ?? "Demo profile"}</CardDescription>
            </div>
            <DataSourceBadge source={profile.mode === "demo" ? "demo" : "live"} />
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <DataSourceBadge source={dash.mode === "demo" ? "demo" : "live"} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Learning roadmap</div>
                <div className="text-2xl font-semibold tabular-nums">{progress?.display ?? "—"}</div>
                <div className="text-[11px] text-muted-foreground">{progress?.hint}</div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {statsShown.map((s) => (
                  <div key={s.key} className="rounded-md border p-2.5">
                    <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                    <dd className="text-lg font-semibold tabular-nums">{s.value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Skill tracking</CardTitle>
                <CardDescription>Skill levels are recorded from completed lessons, starting in Phase 12.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-1.5">
                {SKILL_AREAS.map((s) => (
                  <li key={s} className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
