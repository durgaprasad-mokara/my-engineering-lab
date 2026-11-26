import type { Metadata } from "next";
import { RoboticsBuilderWorkspace } from "@/components/robotics/robotics-builder-workspace";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "@/components/ui/data-source-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Robotics Project Builder — My Engineering Lab",
  description: "Motor/driver/encoder/IMU catalogue, robot motor sizing calculator, architectures, and ROS 2 Humble/Jazzy templates.",
};

export default function RoboticsBuilderPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge source="demo" />
            <Badge variant="outline">Phase 8 · Robotics</Badge>
          </div>
        }
        title="Robotics Project Builder"
        description="Select motors, drivers, encoders, IMUs and LiDARs, size wheel torque, and export ROS 2 Humble/Jazzy templates."
      />
      <RoboticsBuilderWorkspace />
    </div>
  );
}

