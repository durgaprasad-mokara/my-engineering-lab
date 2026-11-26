"use client";

import * as React from "react";
import { ArrowRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IOT_ROBOTICS_PIPELINES } from "@/lib/robotics/catalogue";

export function IotRoboticsWorkspace() {
  const [selectedId, setSelectedId] = React.useState(IOT_ROBOTICS_PIPELINES[0]!.id);
  const pipeline = IOT_ROBOTICS_PIPELINES.find((p) => p.id === selectedId) ?? IOT_ROBOTICS_PIPELINES[0]!;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface p-3">
        {IOT_ROBOTICS_PIPELINES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              selectedId === p.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-accent" />
              {pipeline.title}
            </CardTitle>
            <CardDescription>{pipeline.summary}</CardDescription>
          </div>
          <Badge variant="accent">ROS 2 ↔ MQTT</Badge>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          {/* 5-Stage Data Flow */}
          <div className="grid gap-3 md:grid-cols-5">
            {pipeline.stages.map((st, idx) => (
              <div key={st.stage} className="relative flex flex-col justify-between rounded-lg border bg-surface-raised/40 p-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-accent">
                    {idx + 1}. {st.stage}
                  </span>
                  <p className="mt-1 text-xs text-foreground/90">{st.detail}</p>
                </div>
                {idx < pipeline.stages.length - 1 && (
                  <ArrowRight className="mt-2 hidden size-4 text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>

          {/* Topic Bridge Mapping Table */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ROS 2 ↔ MQTT Topic Bridge Mapping
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-surface-raised/40 text-muted-foreground">
                    <th className="p-2.5">ROS 2 Topic</th>
                    <th className="p-2.5">Direction</th>
                    <th className="p-2.5">MQTT Broker Topic</th>
                    <th className="p-2.5">Publish Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono text-[11px]">
                  {pipeline.topicMappings.map((m) => (
                    <tr key={m.rosTopic}>
                      <td className="p-2.5 text-accent">{m.rosTopic}</td>
                      <td className="p-2.5 font-sans">
                        <Badge variant={m.direction.startsWith("ROS") ? "outline" : "warning"}>
                          {m.direction}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-foreground">{m.mqttTopic}</td>
                      <td className="p-2.5 text-muted-foreground">{m.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

