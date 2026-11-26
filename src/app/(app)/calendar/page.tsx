import type { Metadata } from "next";
import { CalendarWorkspace } from "@/components/learning/calendar-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Daily Learning Calendar — My Engineering Lab",
  description: "Personal engineering calendar with missed-task rescheduling and in-app, browser, and email reminder configuration.",
};

export default function CalendarPage() {
  const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 12 · Learning Calendar</Badge>
          </div>
        }
        title="Daily Learning Calendar"
        description="Schedule study sessions, reschedule missed tasks, and configure in-app, browser, and email reminders."
      />
      <CalendarWorkspace emailConfigured={emailConfigured} />
    </div>
  );
}

