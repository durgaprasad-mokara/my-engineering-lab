import { describe, expect, it } from "vitest";
import {
  EXPLORER_3D_MODELS,
  EXPLORER_VIEW_MODES,
  PIN_SIGNAL_COLORS,
  getExplorerModel,
  isValidViewMode,
} from "@/lib/knowledge/explorer-3d";

describe("Phase 4: 3D Component Explorer", () => {
  it("defines all 7 required engineering view modes", () => {
    expect(EXPLORER_VIEW_MODES).toHaveLength(7);
    const ids = EXPLORER_VIEW_MODES.map((m) => m.id);
    expect(ids).toEqual(["3d", "exploded", "pinout", "circuit", "pcb", "wiring", "architecture"]);
    expect(isValidViewMode("exploded")).toBe(true);
    expect(isValidViewMode("unknown")).toBe(false);
  });

  it("provides at least 5 distinct 3D models with unique slugs and fidelity labels", () => {
    expect(EXPLORER_3D_MODELS.length).toBeGreaterThanOrEqual(5);
    const slugs = EXPLORER_3D_MODELS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const model of EXPLORER_3D_MODELS) {
      expect(model.fidelity).toBe("illustrative");
      expect(model.sourceLabel).toBe("illustrative");
      expect(model.fidelityNote.length).toBeGreaterThan(10);
      expect(model.parts.length).toBeGreaterThanOrEqual(3);
      expect(model.pins.length).toBeGreaterThanOrEqual(4);
      expect(model.wiring.length).toBeGreaterThanOrEqual(3);
      expect(model.architecture.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("ensures every part has valid 3D coordinates and explode offsets", () => {
    for (const model of EXPLORER_3D_MODELS) {
      const partIds = model.parts.map((p) => p.id);
      expect(new Set(partIds).size).toBe(partIds.length);
      for (const part of model.parts) {
        expect(part.basePosition).toHaveLength(3);
        expect(part.explodeOffset).toHaveLength(3);
        expect(part.name.length).toBeGreaterThan(0);
        expect(part.role.length).toBeGreaterThan(0);
      }
    }
  });

  it("ensures every pin has a valid signal type, 3D position and voltage label", () => {
    for (const model of EXPLORER_3D_MODELS) {
      const pinIds = model.pins.map((p) => p.pin);
      expect(new Set(pinIds).size).toBe(pinIds.length);
      for (const pin of model.pins) {
        expect(PIN_SIGNAL_COLORS[pin.signalType]).toBeDefined();
        expect(pin.position).toHaveLength(3);
        expect(pin.voltage.length).toBeGreaterThan(0);
        expect(pin.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves models by slug and falls back safely to the default model", () => {
    expect(getExplorerModel("lm358-ic").name).toContain("LM358");
    expect(getExplorerModel("hc-sr04-3d").pins).toHaveLength(4);
    expect(getExplorerModel("non-existent-slug").slug).toBe(EXPLORER_3D_MODELS[0]!.slug);
  });
});

