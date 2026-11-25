import { describe, expect, it } from "vitest";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

describe("breadcrumbs", () => {
  it("uses navigation titles for top-level sections", () => {
    expect(buildBreadcrumbs("/sensors")).toEqual([
      { label: "Lab", href: "/dashboard" },
      { label: "Sensors Library", href: "/sensors" },
    ]);
  });

  it("title-cases deeper segments and accepts overrides", () => {
    const c = buildBreadcrumbs("/documentation/design-system", { "/documentation/design-system": "UX/UI Design System" });
    expect(c.map((x) => x.label)).toEqual(["Lab", "Documentation", "UX/UI Design System"]);
    expect(buildBreadcrumbs("/documentation/phase-1-plan").at(-1)?.label).toBe("Phase 1 Plan");
  });
});
