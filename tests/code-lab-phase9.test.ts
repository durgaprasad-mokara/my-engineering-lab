import { describe, expect, it } from "vitest";
import {
  FIRMWARE_TEMPLATES,
  createInitialVersion,
  exportFirmwareBundleText,
  saveFirmwareVersion,
} from "@/lib/code-lab/templates";

describe("Phase 9: Embedded Code Lab", () => {
  it("provides at least 6 firmware templates across ESP-IDF, Arduino, STM32, MicroPython, and Zephyr", () => {
    expect(FIRMWARE_TEMPLATES.length).toBeGreaterThanOrEqual(6);
    const frameworks = new Set(FIRMWARE_TEMPLATES.map((t) => t.framework));
    expect(frameworks.has("ESP-IDF + FreeRTOS")).toBe(true);
    expect(frameworks.has("Arduino / PlatformIO")).toBe(true);
    expect(frameworks.has("STM32Cube HAL")).toBe(true);
    expect(frameworks.has("MicroPython")).toBe(true);
    expect(frameworks.has("Zephyr RTOS")).toBe(true);
  });

  it("enforces honest 'untested' build status on all templates and new snapshots", () => {
    for (const tpl of FIRMWARE_TEMPLATES) {
      expect(tpl.buildStatus).toBe("untested");
      expect(tpl.files.length).toBeGreaterThan(0);
    }

    const first = FIRMWARE_TEMPLATES[0]!;
    const v1 = createInitialVersion(first, "2026-11-26T00:00:00Z");
    expect(v1.version).toBe(1);
    expect(v1.buildStatus).toBe("untested");

    const updatedFiles = first.files.map((f) => ({ ...f, content: `${f.content}\n// edited` }));
    const history = saveFirmwareVersion([v1], updatedFiles, "Added sleep hook", "2026-11-26T01:00:00Z");
    expect(history).toHaveLength(2);
    expect(history[1]!.version).toBe(2);
    expect(history[1]!.buildStatus).toBe("untested");
    expect(history[1]!.note).toBe("Added sleep hook");
  });

  it("exports a multi-file firmware bundle with untested warning header", () => {
    const tpl = FIRMWARE_TEMPLATES[0]!;
    const bundle = exportFirmwareBundleText(tpl.name, tpl.files);
    expect(bundle).toContain("Build Status: UNTESTED");
    for (const f of tpl.files) {
      expect(bundle).toContain(`// --- FILE: ${f.path} ---`);
    }
  });

  it("uses unique template IDs and file paths per template", () => {
    const ids = FIRMWARE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tpl of FIRMWARE_TEMPLATES) {
      const paths = tpl.files.map((f) => f.path);
      expect(new Set(paths).size).toBe(paths.length);
    }
  });
});

