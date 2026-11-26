"use client";

import * as React from "react";
import { Bell, CalendarDays, CheckCircle2, Clock, Mail, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rescheduleMissedTask, type CalendarTaskItem } from "@/lib/learning/curriculum";

const INITIAL_TASKS: CalendarTaskItem[] = [
  { id: "cal-1", date: "2026-11-26", title: "Day 19: RC Time Constants Lab & Quiz", dayNumber: 19, status: "pending", reminderTime: "18:00" },
  { id: "cal-2", date: "2026-11-25", title: "Day 18: Capacitor Dielectrics & Decoupling", dayNumber: 18, status: "missed", reminderTime: "18:00" },
  { id: "cal-3", date: "2026-11-24", title: "Day 17: MOSFET Gate Drive & RDS(on)", dayNumber: 17, status: "completed", reminderTime: "18:00" },
];

export function CalendarWorkspace({ emailConfigured }: { emailConfigured: boolean }) {
  const [tasks, setTasks] = React.useState<CalendarTaskItem[]>(INITIAL_TASKS);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDate, setNewDate] = React.useState("2026-11-27");
  const [browserPerm, setBrowserPerm] = React.useState<string>("default");

  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks((prev) => [
      {
        id: `cal-${Date.now()}`,
        date: newDate,
        title: newTitle.trim(),
        dayNumber: prev.length + 20,
        status: "pending",
        reminderTime: "18:00",
      },
      ...prev,
    ]);
    setNewTitle("");
  };

  const requestBrowserPush = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      setBrowserPerm(res);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Tasks & Rescheduling (8 cols) */}
      <Card className="xl:col-span-8">
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-accent" />
              Daily Learning Schedule & Missed-Task Rescheduler
            </CardTitle>
            <CardDescription>Schedule daily engineering sessions, mark completion, and reschedule missed items.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <form onSubmit={handleAddTask} className="flex flex-wrap gap-2">
            <Input
              placeholder="Schedule study session or lab experiment…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-40"
            />
            <Button type="submit" size="sm" className="h-9">
              <Plus className="size-3.5" /> Schedule
            </Button>
          </form>

          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-surface-raised/30 p-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-accent">{task.date}</span>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "missed"
                            ? "danger"
                            : task.status === "rescheduled"
                              ? "warning"
                              : "outline"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="font-medium text-foreground">{task.title}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  {task.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t)))
                      }
                    >
                      <CheckCircle2 className="size-3.5" /> Complete
                    </Button>
                  )}
                  {task.status === "missed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setTasks((prev) => rescheduleMissedTask(prev, task.id, "2026-11-27"))}
                    >
                      <RotateCcw className="size-3.5" /> Reschedule to Tomorrow
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Reminder Channels (4 cols) */}
      <Card className="xl:col-span-4">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="size-4 text-accent" />
            Reminder Delivery & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-xs">
          <div className="rounded-md border bg-surface-raised/30 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">1. In-App Notifications</span>
              <Badge variant="live">Always Active</Badge>
            </div>
            <p className="text-muted-foreground">Displayed in the top notification bell whenever you open the lab.</p>
          </div>

          <div className="rounded-md border bg-surface-raised/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">2. Browser Notifications</span>
              <Badge variant={browserPerm === "granted" ? "live" : "outline"}>{browserPerm}</Badge>
            </div>
            <p className="text-muted-foreground">Fires desktop alerts only while a browser tab is open.</p>
            <Button size="sm" variant="outline" onClick={requestBrowserPush} className="w-full">
              <Clock className="size-3.5" /> Request Browser Permission
            </Button>
          </div>

          <div className="rounded-md border bg-surface-raised/30 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" /> 3. Email (App Closed)
              </span>
              <Badge variant={emailConfigured ? "live" : "warning"}>
                {emailConfigured ? "Configured" : "Needs RESEND_API_KEY"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Scheduled reminders when the app is closed require <code>RESEND_API_KEY</code> and a cron trigger.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

