import { describe, expect, it } from "vitest";
import {
  IOT_ROBOTICS_PIPELINES,
  ROBOTICS_PARTS,
  ROBOT_ARCHITECTURES,
  ROS2_TEMPLATES,
} from "@/lib/robotics/catalogue";

describe("Phase 8: Robotics & IoT Integration", () => {
  it("covers motors, drivers, encoders, IMUs, and LiDARs with valid provenance URLs", () => {
    const kinds = new Set(ROBOTICS_PARTS.map((p) => p.kind));
    expect(kinds.has("motor")).toBe(true);
    expect(kinds.has("driver")).toBe(true);
    expect(kinds.has("encoder")).toBe(true);
    expect(kinds.has("imu")).toBe(true);
    expect(kinds.has("lidar")).toBe(true);

    for (const part of ROBOTICS_PARTS) {
      expect(part.sourceUrl).toMatch(/^https:\/\//);
      expect(part.specs.length).toBeGreaterThan(5);
    }
  });

  it("provides at least 3 complete robot architectures with ROS 2 packages", () => {
    expect(ROBOT_ARCHITECTURES.length).toBeGreaterThanOrEqual(3);
    for (const arch of ROBOT_ARCHITECTURES) {
      expect(arch.rosPackages.length).toBeGreaterThan(0);
      expect(arch.compute.length).toBeGreaterThan(0);
      expect(arch.power.length).toBeGreaterThan(0);
    }
  });

  it("includes downloadable ROS 2 Python and URDF templates", () => {
    expect(ROS2_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    const bridge = ROS2_TEMPLATES.find((t) => t.filename === "ros2_mqtt_bridge.py");
    expect(bridge).toBeDefined();
    expect(bridge?.code).toContain("rclpy");
    expect(bridge?.code).toContain("paho.mqtt");
  });

  it("defines 5-stage IoT + Robotics pipelines with ROS 2 to MQTT topic mappings", () => {
    expect(IOT_ROBOTICS_PIPELINES.length).toBeGreaterThanOrEqual(2);
    for (const pipe of IOT_ROBOTICS_PIPELINES) {
      expect(pipe.stages).toHaveLength(5);
      expect(pipe.topicMappings.length).toBeGreaterThan(0);
    }
  });
});

