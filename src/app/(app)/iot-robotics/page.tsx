import type { Metadata } from "next";
import { IotRoboticsWorkspace } from "@/components/robotics/iot-robotics-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "IoT + Robotics Projects — My Engineering Lab",
  description: "Connected autonomous systems bridging ROS 2 topics to MQTT cloud telemetry and remote teleoperation.",
};

export default function IotRoboticsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="illustrative" />
            <Badge variant="outline">Phase 8 · IoT + Robotics</Badge>
          </div>
        }
        title="IoT + Robotics Projects"
        description="End-to-end Sensor → Controller → Actuator → Gateway → Cloud architectures and ROS 2 ↔ MQTT topic bridges."
      />
      <IotRoboticsWorkspace />
    </div>
  );
}

