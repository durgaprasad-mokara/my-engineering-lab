"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";
import type { DataSource, TelemetryPoint } from "@/lib/data/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

const timeFmt = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

export function MeasurementsChart({
  metric,
  unit,
  points,
  source,
}: {
  metric: string;
  unit: string;
  points: TelemetryPoint[];
  source: DataSource | "none";
}) {
  const values = points.map((p) => p.value);
  const latest = values.at(-1);
  const peak = values.length ? Math.max(...values) : undefined;
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Activity className="size-4 text-accent" /> Engineering measurements</CardTitle>
          <CardDescription>
            {source === "demo" ? "Synthetic flow profile (not a measurement) · last 24 h" : source === "live" ? `${metric} · last 24 h` : "Telemetry"}
          </CardDescription>
        </div>
        <DataSourceBadge source={source} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {points.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
            No telemetry in the last 24 hours. Device registration and MQTT ingest arrive in Phase 11.
          </div>
        ) : (
          <>
            <dl className="mb-3 grid grid-cols-3 gap-2">
              {[
                ["Latest", latest],
                ["Mean", mean],
                ["Peak", peak],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-md border bg-surface-raised/40 p-2">
                  <dt className="text-[10px] text-muted-foreground">{k as string}</dt>
                  <dd className="font-mono text-sm tabular-nums">
                    {typeof v === "number" ? v.toFixed(2) : "—"} <span className="text-[10px] text-muted-foreground">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="min-h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(189 94% 53%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(189 94% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(222 30% 18%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickFormatter={timeFmt} tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={36} />
                  <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} tickLine={false} axisLine={false} width={44} />
                  <Tooltip
                    contentStyle={{ background: "hsl(223 42% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(l) => timeFmt(String(l))}
                    formatter={(v) => [`${Number(v).toFixed(2)} ${unit}`, metric]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(189 94% 53%)" strokeWidth={2} fill="url(#flowFill)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
