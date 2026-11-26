export interface CurriculumMonth {
  month: number;
  title: string;
  daysRange: [number, number];
  focus: string;
  milestone: string;
}

export interface DailyLesson {
  day: number;
  month: number;
  title: string;
  objective: string;
  theory: string;
  components: string[];
  exercise: string;
  calculationHint: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CalendarTaskItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  dayNumber: number;
  status: "pending" | "completed" | "missed" | "rescheduled";
  reminderTime: string;
}

export const CURRICULUM_12_MONTHS: CurriculumMonth[] = [
  { month: 1, title: "Electronics Fundamentals", daysRange: [1, 30], focus: "Ohm's Law, KVL/KCL, RC/RL, diodes, MOSFETs, op-amps", milestone: "Build & measure a LM358 amplifier on breadboard" },
  { month: 2, title: "Microcontrollers & Peripherals", daysRange: [31, 60], focus: "GPIO, ADC, PWM, timers, interrupts, UART/I2C/SPI", milestone: "Read I2C sensor over DMA with sleep mode" },
  { month: 3, title: "Sensors & Signal Conditioning", daysRange: [61, 90], focus: "Flow, ultrasonic, IMU, strain gauge bridges, calibration", milestone: "Calibrate a flow or temperature sensor" },
  { month: 4, title: "Embedded C & RTOS", daysRange: [91, 120], focus: "FreeRTOS tasks, queues, mutexes, ISR safety, Zephyr", milestone: "Multi-task sensor + comms firmware" },
  { month: 5, title: "Communication & RF Engineering", daysRange: [121, 150], focus: "NB-IoT, LTE Cat 1, LoRaWAN IN865, antennas, link budget", milestone: "Verify 1 km LoRaWAN link margin" },
  { month: 6, title: "PCB Design & Power Integrity", daysRange: [151, 180], focus: "4-layer stack-up, 50 Ω microstrip, KiCad layout, ESD", milestone: "Export KiCad netlist & Gerber review" },
  { month: 7, title: "IoT Systems & Smart Metering", daysRange: [181, 210], focus: "22-section workflow, battery sizing, MQTT/CoAP, OTA", milestone: "Complete Smart Water Meter spec" },
  { month: 8, title: "Robotics & Motor Control", daysRange: [211, 240], focus: "DC/BLDC/Stepper, FOC, encoders, IMU fusion, ROS 2", milestone: "Run diff_drive_odom_node in ROS 2" },
  { month: 9, title: "Cloud, Gateways & Digital Twins", daysRange: [241, 270], focus: "MQTT brokers, AWS/Azure IoT, time-series DB, alerts", milestone: "Stream live telemetry into Digital Twin" },
  { month: 10, title: "Industrial & Safety-Critical Systems", daysRange: [271, 300], focus: "RS-485/Modbus, CAN FD, EMC/EMI, SIL disclaimers", milestone: "Design vibration FFT monitor" },
  { month: 11, title: "Edge AI & TinyML", daysRange: [301, 330], focus: "Vibration anomaly detection, quantization, TFLite Micro", milestone: "Deploy anomaly classifier on MCU" },
  { month: 12, title: "Capstone Engineering Project", daysRange: [331, 365], focus: "End-to-end device: requirements → PCB → firmware → cloud", milestone: "Full documented capstone release" },
];

export const SAMPLE_DAILY_LESSONS: DailyLesson[] = [
  {
    day: 19,
    month: 1,
    title: "Capacitors: Charge, Discharge & RC Time Constants",
    objective: "Compute τ = R×C and design an RC low-pass filter for sensor noise.",
    theory: "A capacitor opposes sudden changes in voltage. Through a resistor R, it reaches 63.2% of final voltage in 1τ and 99.3% in 5τ.",
    components: ["10 kΩ 0805 Resistor", "100 nF X7R MLCC", "LM358 Op-Amp"],
    exercise: "Simulate a 10 kΩ + 10 µF RC step response in the Engineering Simulation workspace.",
    calculationHint: "τ = 10,000 Ω × 10×10⁻⁶ F = 0.1 s (100 ms); 5τ = 500 ms.",
    quiz: {
      question: "After 1 time constant (1τ), a charging RC capacitor reaches approximately what percentage of the supply voltage?",
      options: ["36.8%", "50.0%", "63.2%", "99.3%"],
      correctIndex: 2,
      explanation: "1 − e⁻¹ ≈ 0.6321 (63.2%). After 5τ it reaches 99.3%.",
    },
  },
  {
    day: 125,
    month: 5,
    title: "LoRaWAN IN865 Link Budget & India WPC Limits",
    objective: "Verify regulatory EIRP compliance and Free-Space Path Loss over 5 km.",
    theory: "Under India WPC GSR 564(E), the 865–867 MHz band is de-licensed up to 1 W (30 dBm) EIRP.",
    components: ["STM32WL55", "Linx ANT-868-CW-HWR Dipole"],
    exercise: "Run the RF Link Budget calculator at 865.5 MHz, 5 km, +14 dBm TX, -130 dBm sensitivity.",
    calculationHint: "FSPL(865.5 MHz, 5 km) ≈ 105.2 dB.",
    quiz: {
      question: "What is the maximum de-licensed EIRP in India's 865–867 MHz band under WPC GSR 564(E)?",
      options: ["10 mW (10 dBm)", "25 mW (14 dBm)", "100 mW (20 dBm)", "1 Watt (30 dBm)"],
      correctIndex: 3,
      explanation: "WPC GSR 564(E) permits up to 1 Watt (30 dBm) EIRP in 865–867 MHz.",
    },
  },
  {
    day: 185,
    month: 7,
    title: "Water Meter Pulse Counting & Battery Budgeting",
    objective: "Size a 3.6V Li-SOCl2 cell for 10-year autonomous water meter operation.",
    theory: "Deep-sleep current dominates average draw when active TX bursts are infrequent (e.g. once per day).",
    components: ["ER18505 Li-SOCl2", "YF-S201 Hall Flow Sensor", "Quectel BC660K-GL"],
    exercise: "Use the Battery Runtime calculator with 4000 mAh, 15 µA sleep, 150 mA for 20s/day.",
    calculationHint: "Average current < 50 µA yields > 8 years at 80% usable capacity.",
    quiz: {
      question: "Why is a hybrid supercapacitor often paired with a Li-SOCl2 primary cell on NB-IoT meters?",
      options: [
        "To increase nominal voltage from 3.6V to 12V",
        "To buffer 200+ mA RF transmit peaks without voltage brownout",
        "To replace the microcontroller RTC",
        "To enable wireless charging",
      ],
      correctIndex: 1,
      explanation: "Li-SOCl2 cells have high internal impedance; a supercapacitor supplies high pulse current during TX.",
    },
  },
];

export function rescheduleMissedTask(
  tasks: CalendarTaskItem[],
  taskId: string,
  newDate: string,
): CalendarTaskItem[] {
  return tasks.map((t) =>
    t.id === taskId ? { ...t, date: newDate, status: "rescheduled" } : t,
  );
}

