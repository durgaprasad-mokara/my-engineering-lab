import type { Metadata } from "next";
import { getDashboardData } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TelemetryDevice } from "@/components/dashboard/telemetry-device";
import { MeasurementsChart } from "@/components/dashboard/measurements-chart";
import { ArchitectureFlow } from "@/components/dashboard/architecture-flow";
import { ConfigComparison } from "@/components/dashboard/config-comparison";
import { QuickCalculators } from "@/components/dashboard/quick-calculators";
import {
  LearningCalendar,
  RecentComponents,
  RecentProjects,
  Recommendations,
  SavedDesigns,
  TodayTasks,
} from "@/components/dashboard/lists";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        title="Engineering dashboard"
        description={`${greeting}. Your lab at a glance — inventory, telemetry, designs and today's learning.`}
      />

      {data.errors.length > 0 && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          Some data could not be loaded: {data.errors.join(" · ")}
        </div>
      )}

      <StatsGrid stats={data.stats} mode={data.mode} />

      <div className="grid gap-4 xl:grid-cols-12 [&>*]:min-w-0">
        <div className="xl:col-span-7"><TelemetryDevice /></div>
        <div className="xl:col-span-5">
          <MeasurementsChart {...data.telemetry} />
        </div>
      </div>

      <ArchitectureFlow />

      <div className="grid items-start gap-4 xl:grid-cols-12 [&>*]:min-w-0">
        <div className="xl:col-span-7">
          <ConfigComparison configs={data.configurations} project={data.configurationsProject} mode={data.mode} />
        </div>
        <div id="calculators" className="scroll-mt-20 xl:col-span-5"><QuickCalculators /></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
        <RecentProjects projects={data.recentProjects} mode={data.mode} />
        <TodayTasks tasks={data.tasksToday} mode={data.mode} />
        <LearningCalendar taskDates={data.taskDates} mode={data.mode} />
        <Recommendations stats={data.stats} />
        <RecentComponents items={data.recentComponents} mode={data.mode} />
        <SavedDesigns items={data.savedDesigns} mode={data.mode} />
      </div>
    </div>
  );
}
