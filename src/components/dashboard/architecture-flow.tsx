import { ArrowRight, Cloud, Cpu, Database, Gauge, LayoutDashboard, RadioTower, Router, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

const STAGES = [
  { icon: Gauge, title: "Sensor", detail: "Pulse / analog / I²C", tone: "text-accent" },
  { icon: Cpu, title: "MCU firmware", detail: "Acquire · validate · compute", tone: "text-primary" },
  { icon: RadioTower, title: "Radio link", detail: "LTE-M · NB-IoT · LoRaWAN", tone: "text-violet" },
  { icon: Router, title: "Network / gateway", detail: "Operator core or LNS", tone: "text-violet" },
  { icon: Server, title: "MQTT broker", detail: "TLS · topics · QoS", tone: "text-primary" },
  { icon: Database, title: "Cloud & database", detail: "Ingest · store · rules", tone: "text-accent" },
  { icon: LayoutDashboard, title: "Dashboard & alerts", detail: "Usage · leaks · health", tone: "text-success" },
];

export function ArchitectureFlow() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2"><Cloud className="size-4 text-accent" /> Sensor-to-cloud architecture</CardTitle>
          <CardDescription>The path every telemetry reading takes. Each stage becomes a configurable module in later phases.</CardDescription>
        </div>
        <DataSourceBadge source="reference" />
      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-stretch lg:gap-0">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex items-center lg:flex-1">
                <div className="flex w-full items-center gap-3 rounded-md border bg-surface-raised/50 p-3 lg:flex-col lg:gap-2 lg:text-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
                    <Icon className={`size-4 ${s.tone}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{s.title}</div>
                    <div className="text-[10px] text-muted-foreground">{s.detail}</div>
                  </div>
                </div>
                {i < STAGES.length - 1 && <ArrowRight className="mx-1 hidden size-4 shrink-0 text-muted-foreground/60 lg:block" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
