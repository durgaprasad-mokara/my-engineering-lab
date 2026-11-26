import { describe, expect, it } from "vitest";
import { NAV_GROUPS, NAV_ITEMS, PLANNED_SECTIONS, findNavItem, navItemsByGroup, searchNav } from "@/lib/navigation";

describe("navigation", () => {
  it("defines all 33 sections including all advanced modules", () => {
    expect(NAV_ITEMS).toHaveLength(33);
  });

  it("has unique slugs and hrefs", () => {
    expect(new Set(NAV_ITEMS.map((i) => i.slug)).size).toBe(NAV_ITEMS.length);
    expect(new Set(NAV_ITEMS.map((i) => i.href)).size).toBe(NAV_ITEMS.length);
  });

  it("assigns each section a valid phase, group and at least one capability", () => {
    const groups = new Set(NAV_GROUPS.map((g) => g.id));
    for (const i of NAV_ITEMS) {
      expect(i.phase).toBeGreaterThanOrEqual(1);
      expect(i.phase).toBeLessThanOrEqual(13);
      expect(groups.has(i.group)).toBe(true);
      expect(i.capabilities.length).toBeGreaterThan(0);
    }
  });

  it("marks all 33 sections across Phases 1 through 12 as available", () => {
    for (const i of NAV_ITEMS) expect(i.status === "available").toBe(i.phase <= 12);
    expect(PLANNED_SECTIONS).toHaveLength(0);
  });

  it("groups every item exactly once", () => {
    const grouped = navItemsByGroup().flatMap((g) => g.items);
    expect(grouped).toHaveLength(NAV_ITEMS.length);
  });

  it("finds the section for nested paths", () => {
    expect(findNavItem("/documentation/prd")?.slug).toBe("documentation");
    expect(findNavItem("/")).toBeUndefined();
  });

  it("searches titles and keywords", () => {
    expect(searchNav("esp32").map((i) => i.slug)).toContain("microcontrollers");
    expect(searchNav("LoRaWAN").map((i) => i.slug)).toContain("communication");
    expect(searchNav("")).toHaveLength(33);
  });
});
