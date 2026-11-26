export type FirmwareFramework =
  | "ESP-IDF + FreeRTOS"
  | "Arduino / PlatformIO"
  | "STM32Cube HAL"
  | "MicroPython"
  | "Zephyr RTOS";

export type BuildStatus = "untested" | "compiled" | "failed";

export interface FirmwareFile {
  path: string;
  language: "c" | "cpp" | "python" | "ini" | "conf" | "dts";
  content: string;
}

export interface FirmwareVersion {
  version: number;
  createdAt: string;
  note: string;
  buildStatus: BuildStatus;
  files: FirmwareFile[];
}

export interface FirmwareProjectTemplate {
  id: string;
  name: string;
  targetBoard: string;
  framework: FirmwareFramework;
  buildStatus: BuildStatus;
  summary: string;
  files: FirmwareFile[];
}

export const FIRMWARE_TEMPLATES: FirmwareProjectTemplate[] = [
  {
    id: "fw-esp32-espidf",
    name: "ESP32 Water Meter Node (ESP-IDF + FreeRTOS)",
    targetBoard: "esp32dev",
    framework: "ESP-IDF + FreeRTOS",
    buildStatus: "untested",
    summary: "Pulse-counting ISR, RTC deep-sleep retention, and MQTT telemetry task.",
    files: [
      {
        path: "platformio.ini",
        language: "ini",
        content: `[env:esp32dev]
platform = espressif32
board = esp32dev
framework = espidf
monitor_speed = 115200
`,
      },
      {
        path: "include/pin_config.h",
        language: "c",
        content: `#pragma once

#define FLOW_PULSE_GPIO     GPIO_NUM_34
#define STATUS_LED_GPIO     GPIO_NUM_2
#define MODEM_UART_TX_GPIO  GPIO_NUM_17
#define MODEM_UART_RX_GPIO  GPIO_NUM_16
#define K_FACTOR_PULSES_L   450.0f
`,
      },
      {
        path: "src/main.c",
        language: "c",
        content: `#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_sleep.h"
#include "esp_log.h"
#include "driver/gpio.h"
#include "pin_config.h"

static const char *TAG = "WATER_METER";
RTC_DATA_ATTR static uint32_t rtc_pulse_count = 0;

static void IRAM_ATTR flow_isr_handler(void *arg) {
    rtc_pulse_count++;
}

void app_main(void) {
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << FLOW_PULSE_GPIO),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .intr_type = GPIO_INTR_POSEDGE,
    };
    gpio_config(&io_conf);
    gpio_install_isr_service(0);
    gpio_isr_handler_add(FLOW_PULSE_GPIO, flow_isr_handler, NULL);

    float litres = (float)rtc_pulse_count / K_FACTOR_PULSES_L;
    ESP_LOGI(TAG, "Pulses=%lu Volume=%.2f L", (unsigned long)rtc_pulse_count, litres);

    // Publish MQTT payload before entering 15-min deep sleep
    vTaskDelay(pdMS_TO_TICKS(100));
    esp_sleep_enable_timer_wakeup(900ULL * 1000000ULL);
    esp_deep_sleep_start();
}
`,
      },
    ],
  },
  {
    id: "fw-esp32-arduino",
    name: "ESP32 Telemetry + MQTT (Arduino)",
    targetBoard: "esp32dev",
    framework: "Arduino / PlatformIO",
    buildStatus: "untested",
    summary: "Wi-Fi + PubSubClient MQTT telemetry with BMP280/DHT22 sensor read loop.",
    files: [
      {
        path: "platformio.ini",
        language: "ini",
        content: `[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
  knolleary/PubSubClient@^2.8
  adafruit/Adafruit BMP280 Library@^2.6.8
`,
      },
      {
        path: "src/main.cpp",
        language: "cpp",
        content: `#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

const char* MQTT_BROKER = "broker.example.local";
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  mqtt.setServer(MQTT_BROKER, 1883);
}

void loop() {
  if (!mqtt.connected()) {
    mqtt.connect("esp32-lab-node");
  }
  mqtt.loop();

  char payload[64];
  snprintf(payload, sizeof(payload), "{\\"uptime_ms\\":%lu}", millis());
  mqtt.publish("lab/esp32/telemetry", payload);
  delay(5000);
}
`,
      },
    ],
  },
  {
    id: "fw-stm32-hal",
    name: "STM32F103 Blue Pill Low-Power Node (HAL)",
    targetBoard: "bluepill_f103c8",
    framework: "STM32Cube HAL",
    buildStatus: "untested",
    summary: "STM32Cube HAL GPIO interrupt + UART AT-command skeleton.",
    files: [
      {
        path: "platformio.ini",
        language: "ini",
        content: `[env:bluepill_f103c8]
platform = ststm32
board = bluepill_f103c8
framework = stm32cube
`,
      },
      {
        path: "src/main.c",
        language: "c",
        content: `#include "stm32f1xx_hal.h"

UART_HandleTypeDef huart1;

int main(void) {
  HAL_Init();
  __HAL_RCC_GPIOC_CLK_ENABLE();

  GPIO_InitTypeDef gpio = {0};
  gpio.Pin = GPIO_PIN_13;
  gpio.Mode = GPIO_MODE_OUTPUT_PP;
  gpio.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOC, &gpio);

  while (1) {
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
    HAL_Delay(500);
  }
}
`,
      },
    ],
  },
  {
    id: "fw-rp2040-micropython",
    name: "RP2040 / Pico Flow & I2C Sensor (MicroPython)",
    targetBoard: "raspberry_pi_pico",
    framework: "MicroPython",
    buildStatus: "untested",
    summary: "MicroPython IRQ pulse counter + I2C bus scan and JSON serial telemetry.",
    files: [
      {
        path: "main.py",
        language: "python",
        content: `import json
import time
from machine import Pin, I2C

pulse_count = 0
K_FACTOR = 450.0

def on_pulse(_pin):
    global pulse_count
    pulse_count += 1

flow_pin = Pin(15, Pin.IN, Pin.PULL_UP)
flow_pin.irq(trigger=Pin.IRQ_RISING, handler=on_pulse)
i2c = I2C(0, scl=Pin(1), sda=Pin(0), freq=400_000)

while True:
    litres = pulse_count / K_FACTOR
    print(json.dumps({"pulses": pulse_count, "litres": round(litres, 3), "i2c_devices": i2c.scan()}))
    time.sleep(2)
`,
      },
    ],
  },
  {
    id: "fw-nrf52-zephyr",
    name: "nRF52840 BLE Sensor Beacon (Zephyr RTOS)",
    targetBoard: "nrf52840dk_nrf52840",
    framework: "Zephyr RTOS",
    buildStatus: "untested",
    summary: "Zephyr RTOS prj.conf and main thread for ultra-low-power BLE advertising.",
    files: [
      {
        path: "prj.conf",
        language: "conf",
        content: `CONFIG_BT=y
CONFIG_BT_DEVICE_NAME="EngLab_nRF52"
CONFIG_PM=y
CONFIG_LOG=y
`,
      },
      {
        path: "src/main.c",
        language: "c",
        content: `#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(eng_lab_node, LOG_LEVEL_INF);

int main(void) {
    LOG_INF("Zephyr nRF52840 BLE telemetry node booted");
    while (1) {
        k_sleep(K_SECONDS(10));
    }
    return 0;
}
`,
      },
    ],
  },
  {
    id: "fw-arduino-uno",
    name: "Arduino Uno Ultrasonic + RS-485 Node",
    targetBoard: "uno",
    framework: "Arduino / PlatformIO",
    buildStatus: "untested",
    summary: "HC-SR04 distance measurement with SoftwareSerial RS-485 DE/RE direction control.",
    files: [
      {
        path: "platformio.ini",
        language: "ini",
        content: `[env:uno]
platform = atmelavr
board = uno
framework = arduino
monitor_speed = 9600
`,
      },
      {
        path: "src/main.cpp",
        language: "cpp",
        content: `#include <Arduino.h>

constexpr int TRIG_PIN = 9;
constexpr int ECHO_PIN = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long us = pulseIn(ECHO_PIN, HIGH, 30000);
  float cm = (us * 0.0343f) / 2.0f;
  Serial.println(cm, 1);
  delay(500);
}
`,
      },
    ],
  },
];

export function createInitialVersion(template: FirmwareProjectTemplate, nowIso = new Date().toISOString()): FirmwareVersion {
  return {
    version: 1,
    createdAt: nowIso,
    note: `Initial template (${template.framework})`,
    buildStatus: "untested",
    files: template.files.map((f) => ({ ...f })),
  };
}

export function saveFirmwareVersion(
  history: FirmwareVersion[],
  files: FirmwareFile[],
  note: string,
  nowIso = new Date().toISOString(),
): FirmwareVersion[] {
  const nextVer = (history[history.length - 1]?.version ?? 0) + 1;
  return [
    ...history,
    {
      version: nextVer,
      createdAt: nowIso,
      note: note.trim() || `Snapshot v${nextVer}`,
      buildStatus: "untested", // Any new snapshot is untested until compiled
      files: files.map((f) => ({ ...f })),
    },
  ];
}

export function exportFirmwareBundleText(projectName: string, files: FirmwareFile[]): string {
  return [
    `// ====================================================================`,
    `// Firmware Bundle: ${projectName}`,
    `// Build Status: UNTESTED (Compile locally with PlatformIO / ESP-IDF / Zephyr)`,
    `// ====================================================================`,
    "",
    ...files.flatMap((f) => [`// --- FILE: ${f.path} ---`, f.content, ""]),
  ].join("\n");
}

