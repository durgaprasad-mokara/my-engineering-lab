import { type CalcResult, type CalcStep, fmt } from "./types";

export interface MotorTorqueInputs {
  robotMassKg: number;
  wheelRadiusMm: number;
  inclineDeg: number;
  accelMs2: number;
  drivenWheels: number;
  gearEfficiency: number; // 0.1 - 1.0
  wheelRpm: number;
}

export interface MotorTorqueOutputs {
  totalForceN: number;
  torquePerWheelNm: number;
  motorPowerW: number;
  linearVelocityMs: number;
}

export const MECHANICAL_FORMULAS = [
  "F_total = m · (g·sin(θ) + a + μ_rr·g·cos(θ))",
  "τ_wheel = (F_total × r_wheel) / (N_wheels × η)",
  "v = ω × r_wheel = (2π × RPM / 60) × r_wheel",
  "P_mech = τ_wheel × ω × N_wheels",
];

export function solveMotorTorque(inputs: MotorTorqueInputs): CalcResult<MotorTorqueOutputs> {
  const { robotMassKg, wheelRadiusMm, inclineDeg, accelMs2, drivenWheels, gearEfficiency, wheelRpm } = inputs;
  if (
    ![robotMassKg, wheelRadiusMm, inclineDeg, accelMs2, drivenWheels, gearEfficiency, wheelRpm].every(
      (v) => typeof v === "number" && Number.isFinite(v),
    )
  ) {
    return { ok: false, error: "All mechanical inputs must be finite numbers." };
  }
  if (robotMassKg <= 0) return { ok: false, error: "Robot mass must be greater than 0 kg." };
  if (wheelRadiusMm <= 0) return { ok: false, error: "Wheel radius must be greater than 0 mm." };
  if (inclineDeg < 0 || inclineDeg > 60) return { ok: false, error: "Incline angle must be between 0° and 60°." };
  if (drivenWheels < 1) return { ok: false, error: "At least 1 driven wheel is required." };
  if (gearEfficiency <= 0 || gearEfficiency > 1) return { ok: false, error: "Gearbox efficiency must be in (0, 1]." };
  if (wheelRpm < 0) return { ok: false, error: "Wheel RPM cannot be negative." };

  const g = 9.80665;
  const muRr = 0.015; // typical rubber tire on hard floor rolling resistance
  const thetaRad = (inclineDeg * Math.PI) / 180;
  const radiusM = wheelRadiusMm / 1000;

  const gradeForce = robotMassKg * g * Math.sin(thetaRad);
  const accelForce = robotMassKg * accelMs2;
  const rollingForce = robotMassKg * muRr * g * Math.cos(thetaRad);
  const totalForceN = gradeForce + accelForce + rollingForce;

  const torquePerWheelNm = (totalForceN * radiusM) / (drivenWheels * gearEfficiency);
  const omegaRadS = (2 * Math.PI * wheelRpm) / 60;
  const linearVelocityMs = omegaRadS * radiusM;
  const motorPowerW = torquePerWheelNm * omegaRadS * drivenWheels;

  const steps: CalcStep[] = [
    {
      label: "Tractive force (grade + accel + rolling)",
      expression: `${fmt(gradeForce)} + ${fmt(accelForce)} + ${fmt(rollingForce)} N`,
      result: `${fmt(totalForceN)} N`,
    },
    {
      label: "Torque per driven wheel",
      expression: `(${fmt(totalForceN)} × ${fmt(radiusM)} m) / (${drivenWheels} × ${fmt(gearEfficiency)})`,
      result: `${fmt(torquePerWheelNm)} N·m`,
    },
    {
      label: "Linear velocity",
      expression: `(2π × ${fmt(wheelRpm)} / 60) × ${fmt(radiusM)} m`,
      result: `${fmt(linearVelocityMs)} m/s`,
    },
    {
      label: "Total mechanical shaft power",
      expression: `${fmt(torquePerWheelNm)} N·m × ${fmt(omegaRadS)} rad/s × ${drivenWheels}`,
      result: `${fmt(motorPowerW)} W`,
    },
  ];

  return {
    ok: true,
    value: {
      totalForceN,
      torquePerWheelNm,
      motorPowerW,
      linearVelocityMs,
    },
    steps,
    assumptions: [
      "Standard gravity g = 9.80665 m/s² and rolling resistance coefficient μ_rr = 0.015 (hard surface)",
      "Equal load sharing across all driven wheels",
      "Constant gearbox efficiency across speed range",
    ],
    limitations: [
      "Peak stall torque during wheel slip or bump impact can reach 2–3× continuous torque",
      "Select a motor whose continuous rated torque is ≥ 1.5× the calculated value for thermal margin",
    ],
  };
}

