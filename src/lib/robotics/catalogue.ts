import type { VerificationStatus } from "@/lib/data/types";

export interface RoboticsPart {
  id: string;
  name: string;
  kind: "motor" | "driver" | "encoder" | "imu" | "lidar";
  specs: string;
  voltage: string;
  interface: string;
  useCase: string;
  verificationStatus: VerificationStatus;
  sourceUrl: string;
}

export const ROBOTICS_PARTS: RoboticsPart[] = [
  {
    id: "rob-dc-enc",
    name: "12V Planetary Geared DC Motor + Quadrature Encoder",
    kind: "motor",
    specs: "150–300 RPM, 0.8–2.5 N·m stall torque, 64 CPR Hall encoder",
    voltage: "12 V DC (2.5 A stall)",
    interface: "2-wire Motor + 4-wire Quadrature (A/B, 5V/3.3V)",
    useCase: "Differential-drive AMRs and indoor inspection rovers",
    verificationStatus: "typical",
    sourceUrl: "https://www.pololu.com/category/115/25d-mm-metal-gearmotors",
  },
  {
    id: "rob-nema17",
    name: "NEMA 17 Bipolar Stepper (1.8°/step) + TMC2209",
    kind: "motor",
    specs: "200 steps/rev, 0.45 N·m holding torque, 256× microstepping (StealthChop)",
    voltage: "12–24 V DC (1.5 A/phase)",
    interface: "STEP / DIR + UART configuration",
    useCase: "Robotic arm joints, linear gantries, precision camera pan-tilt",
    verificationStatus: "typical",
    sourceUrl: "https://www.analog.com/en/products/tmc2209.html",
  },
  {
    id: "rob-tb6612",
    name: "TB6612FNG Dual H-Bridge MOSFET Driver",
    kind: "driver",
    specs: "1.2 A continuous / 3.2 A peak per channel, low RDS(on) MOSFETs",
    voltage: "4.5–13.5 V motor, 2.7–5.5 V logic",
    interface: "PWM + IN1/IN2 direction",
    useCase: "Small/medium 2WD rovers (replaces inefficient BJT L298N)",
    verificationStatus: "verified",
    sourceUrl: "https://toshiba.semicon-storage.com/info/TB6612FNG_datasheet_en_20141001.pdf?did=10660",
  },
  {
    id: "rob-odrive",
    name: "ODrive / VESC FOC Brushless Motor Controller",
    kind: "driver",
    specs: "Field-Oriented Control (FOC), closed-loop torque/velocity/position",
    voltage: "12–56 V (3S–12S LiPo)",
    interface: "CAN bus, UART, USB, Step/Dir",
    useCase: "High-power legged robots, heavy payload AGVs, robotic actuators",
    verificationStatus: "typical",
    sourceUrl: "https://docs.odriverobotics.com/",
  },
  {
    id: "rob-as5048a",
    name: "AS5048A 14-Bit Magnetic Rotary Encoder",
    kind: "encoder",
    specs: "0.0219° angular resolution (16,384 counts/rev), contactless diametric magnet",
    voltage: "3.3 V / 5.0 V",
    interface: "SPI (10 MHz) or PWM",
    useCase: "Robotic arm joint absolute angle & BLDC commutation",
    verificationStatus: "verified",
    sourceUrl: "https://ams-osram.com/products/sensor-solutions/position-sensors/ams-as5048a-magnetic-rotary-position-sensor",
  },
  {
    id: "rob-bno085",
    name: "BNO085 9-DOF Sensor-Fusion IMU",
    kind: "imu",
    specs: "On-chip ARM Cortex-M0 running SH-2 quaternion fusion (< 2° dynamic heading error)",
    voltage: "1.65–3.6 V",
    interface: "I2C / SPI / UART-RVC",
    useCase: "Mobile robot heading stabilization, EKF odometry fusion in ROS 2",
    verificationStatus: "verified",
    sourceUrl: "https://www.ceva-ip.com/wp-content/uploads/2019/10/BNO080_085-Datasheet.pdf",
  },
  {
    id: "rob-rplidar",
    name: "RPLIDAR A1M8 360° 2D Laser Scanner",
    kind: "lidar",
    specs: "0.15–12 m range, 8000 samples/sec, 5.5–10 Hz scan rate",
    voltage: "5.0 V DC (USB / UART)",
    interface: "UART 115200 bps",
    useCase: "Indoor 2D SLAM mapping and Nav2 obstacle avoidance",
    verificationStatus: "typical",
    sourceUrl: "https://www.slamtec.com/en/Lidar/A1",
  },
];

export interface RobotArchitecture {
  id: string;
  name: string;
  kinematics: string;
  compute: string;
  actuation: string;
  sensing: string;
  power: string;
  rosPackages: string[];
  notes: string;
}

export const ROBOT_ARCHITECTURES: RobotArchitecture[] = [
  {
    id: "arch-diff-amr",
    name: "Differential-Drive Autonomous Mobile Robot (AMR)",
    kinematics: "2 driven wheels (L/R) + 1 passive caster; unicycle model (v, ω)",
    compute: "Raspberry Pi 4/5 or NVIDIA Jetson Orin Nano + STM32 low-level MCU",
    actuation: "2× Planetary DC Gearmotors + TB6612 / Cytron MDDS30 driver",
    sensing: "Quadrature wheel encoders + BNO085 IMU + 2D RPLIDAR",
    power: "3S/4S LiPo (11.1–14.8V) → Smart BMS + 5V 5A Buck for SBC",
    rosPackages: ["ros2_control (diff_drive_controller)", "robot_localization (EKF)", "slam_toolbox", "nav2_bringup"],
    notes: "MCU runs 100 Hz PID velocity loop over micro-ROS or serial; SBC runs SLAM and Nav2 path planning.",
  },
  {
    id: "arch-arm-4dof",
    name: "4-DOF / 6-DOF Articulated Robotic Manipulator",
    kinematics: "Serial revolute joints (Base, Shoulder, Elbow, Wrist) with inverse kinematics",
    compute: "Jetson / PC running MoveIt 2 + CANopen / Dynamixel bus controller",
    actuation: "NEMA 17/23 Steppers (TMC2209) or Smart Serial/CAN Servos",
    sensing: "14-bit Magnetic absolute encoders (AS5048A) + wrist force/torque or gripper current",
    power: "24V DC 10A Industrial PSU + emergency-stop contactor relay",
    rosPackages: ["moveit_ros", "ros2_control (joint_trajectory_controller)", "xacro / URDF"],
    notes: "Hardware E-stop must cut motor power independently of software.",
  },
  {
    id: "arch-agri-rover",
    name: "4WD Skid-Steer Agricultural Inspection Rover",
    kinematics: "4 independent hub/geared wheels; high traction on uneven soil",
    compute: "Jetson Orin Nano + Pixhawk / STM32 safety co-processor",
    actuation: "4× 24V BLDC motors + VESC CAN-bus controllers",
    sensing: "RTK-GNSS + Stereo Depth Camera + Soil Moisture Probe + IMU",
    power: "24V 20Ah LiFePO4 pack + Solar MPPT charger",
    rosPackages: ["nav2", "robot_localization (navsat_transform_node)", "usb_cam / realsense2"],
    notes: "Uses dual-antenna GNSS + IMU for outdoor waypoint navigation without LiDAR landmarks.",
  },
];

export interface Ros2Template {
  id: string;
  filename: string;
  title: string;
  language: "python" | "yaml" | "xml";
  description: string;
  code: string;
}

export const ROS2_TEMPLATES: Ros2Template[] = [
  {
    id: "ros-diff-node",
    filename: "diff_drive_odom_node.py",
    title: "ROS 2 Humble/Jazzy Differential Drive Twist & Odometry Node",
    language: "python",
    description: "Subscribes to /cmd_vel (Twist), computes left/right wheel target rad/s, and publishes /odom.",
    code: `import math
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

class DiffDriveBridge(Node):
    def __init__(self):
        super().__init__('diff_drive_bridge')
        self.wheel_radius = 0.05   # meters
        self.wheel_base = 0.24     # meters
        self.sub = self.create_subscription(Twist, '/cmd_vel', self.on_cmd_vel, 10)
        self.odom_pub = self.create_publisher(Odometry, '/odom', 10)
        self.get_logger().info('DiffDriveBridge ready (requires local ROS 2 runtime).')

    def on_cmd_vel(self, msg: Twist):
        v = msg.linear.x
        w = msg.angular.z
        v_left = (v - w * self.wheel_base / 2.0) / self.wheel_radius
        v_right = (v + w * self.wheel_base / 2.0) / self.wheel_radius
        # Forward v_left, v_right (rad/s) over UART/CAN to motor controller
        self.get_logger().debug(f'Wheel targets rad/s -> L:{v_left:.2f} R:{v_right:.2f}')

def main():
    rclpy.init()
    node = DiffDriveBridge()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
`,
  },
  {
    id: "ros-mqtt-bridge",
    filename: "ros2_mqtt_bridge.py",
    title: "ROS 2 ↔ MQTT Cloud Telemetry & Teleop Bridge",
    language: "python",
    description: "Bridges local ROS 2 topics (/odom, /battery_state) to an MQTT broker and accepts cloud /cmd_vel commands.",
    code: `import json
import paho.mqtt.client as mqtt
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

class Ros2MqttBridge(Node):
    def __init__(self):
        super().__init__('ros2_mqtt_bridge')
        self.robot_id = 'rover-01'
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.create_subscription(Odometry, '/odom', self.on_odom, 10)

        self.mqtt = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.mqtt.on_message = self.on_mqtt_msg
        self.mqtt.connect('localhost', 1883, 60)
        self.mqtt.subscribe(f'robots/{self.robot_id}/cmd/vel')
        self.mqtt.loop_start()

    def on_odom(self, msg: Odometry):
        payload = {
            'x': round(msg.pose.pose.position.x, 3),
            'y': round(msg.pose.pose.position.y, 3),
            'vx': round(msg.twist.twist.linear.x, 3),
        }
        self.mqtt.publish(f'robots/{self.robot_id}/telemetry/odom', json.dumps(payload), qos=0)

    def on_mqtt_msg(self, _client, _userdata, msg):
        data = json.loads(msg.payload.decode())
        twist = Twist()
        twist.linear.x = float(data.get('vx', 0.0))
        twist.angular.z = float(data.get('wz', 0.0))
        self.cmd_pub.publish(twist)
`,
  },
  {
    id: "ros-urdf-diff",
    filename: "mobile_base.urdf",
    title: "Minimal Differential-Drive Robot URDF Excerpt",
    language: "xml",
    description: "Defines base_link, left_wheel, and right_wheel frames for TF2 and RViz2.",
    code: `<robot name="engineering_rover">
  <link name="base_link">
    <visual>
      <geometry><box size="0.24 0.18 0.06"/></geometry>
    </visual>
  </link>
  <link name="left_wheel">
    <visual>
      <geometry><cylinder radius="0.05" length="0.026"/></geometry>
    </visual>
  </link>
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0 0.11 -0.02" rpy="-1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>
`,
  },
];

export interface IotRoboticsPipeline {
  id: string;
  title: string;
  summary: string;
  stages: { stage: "Sensor" | "Controller" | "Actuator" | "Gateway" | "Cloud"; detail: string }[];
  topicMappings: { rosTopic: string; mqttTopic: string; direction: "ROS → Cloud" | "Cloud → ROS"; rate: string }[];
}

export const IOT_ROBOTICS_PIPELINES: IotRoboticsPipeline[] = [
  {
    id: "pipe-inspection-rover",
    title: "Cloud-Controlled Substation Inspection Rover",
    summary: "Remote operator dispatches waypoints over MQTT/4G while local ROS 2 Nav2 handles obstacle avoidance.",
    stages: [
      { stage: "Sensor", detail: "RPLIDAR A1 + BNO085 IMU + Thermal Camera (FLIR Lepton)" },
      { stage: "Controller", detail: "Jetson Orin Nano (ROS 2 Nav2) + STM32 motor PID" },
      { stage: "Actuator", detail: "Dual 12V planetary gearmotors + pan-tilt camera servo" },
      { stage: "Gateway", detail: "4G LTE Cat 4 modem running WireGuard VPN + MQTT bridge" },
      { stage: "Cloud", detail: "Fleet Digital Twin dashboard + thermal anomaly alerts" },
    ],
    topicMappings: [
      { rosTopic: "/odom", mqttTopic: "robots/rover-01/telemetry/odom", direction: "ROS → Cloud", rate: "2 Hz" },
      { rosTopic: "/battery_state", mqttTopic: "robots/rover-01/telemetry/battery", direction: "ROS → Cloud", rate: "0.2 Hz" },
      { rosTopic: "/goal_pose", mqttTopic: "robots/rover-01/cmd/waypoint", direction: "Cloud → ROS", rate: "On-demand" },
    ],
  },
  {
    id: "pipe-cloud-arm",
    title: "Teleoperated Lab Sample-Handling Arm",
    summary: "Browser-commanded 4-DOF pick-and-place arm with closed-loop joint encoder feedback.",
    stages: [
      { stage: "Sensor", detail: "AS5048A 14-bit joint encoders + gripper load cell" },
      { stage: "Controller", detail: "MoveIt 2 + CAN-bus joint motion controller" },
      { stage: "Actuator", detail: "NEMA 17 steppers with TMC2209 drivers" },
      { stage: "Gateway", detail: "Local Ethernet edge broker (EMQX)" },
      { stage: "Cloud", detail: "Audit log of pick cycles, joint currents & fault states" },
    ],
    topicMappings: [
      { rosTopic: "/joint_states", mqttTopic: "robots/arm-01/telemetry/joints", direction: "ROS → Cloud", rate: "5 Hz" },
      { rosTopic: "/target_pose", mqttTopic: "robots/arm-01/cmd/pose", direction: "Cloud → ROS", rate: "On-demand" },
    ],
  },
];

