import { describe, expect, it } from "vitest";
import {
  INDUSTRY_RESEARCH_PROFILES,
  IOT_22_SECTIONS,
  PROJECT_STATUS_FLOW,
  REFERENCE_PROJECTS,
  duplicateWorkspaceProject,
  exportProjectToMarkdown,
  nextProjectStatus,
} from "@/lib/projects/iot-workflow";

describe("Phase 7: IoT Projects & Industrial Applications", () => {
  it("defines the complete 22-section standardized IoT engineering workflow", () => {
    expect(IOT_22_SECTIONS).toHaveLength(22);
    const ids = IOT_22_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(22);
    expect(IOT_22_SECTIONS[0]!.number).toBe(1);
    expect(IOT_22_SECTIONS[21]!.number).toBe(22);
  });

  it("includes all 5 reference projects with mandatory safety disclaimers on railway systems", () => {
    expect(REFERENCE_PROJECTS.length).toBeGreaterThanOrEqual(5);
    const railwayProjects = REFERENCE_PROJECTS.filter((p) => p.industry === "railway");
    expect(railwayProjects.length).toBeGreaterThanOrEqual(2);
    for (const rp of railwayProjects) {
      expect(rp.safetyCritical).toBe(true);
      expect(rp.safetyDisclaimer).toBeTruthy();
      expect(rp.safetyDisclaimer).toContain("RESEARCH");
    }
  });

  it("handles project status lifecycle transitions cleanly", () => {
    expect(PROJECT_STATUS_FLOW).toEqual([
      "planning",
      "research",
      "design",
      "development",
      "testing",
      "completed",
    ]);
    expect(nextProjectStatus("planning")).toBe("research");
    expect(nextProjectStatus("testing")).toBe("completed");
    expect(nextProjectStatus("completed")).toBe("completed");
  });

  it("duplicates projects and exports structured 22-section Markdown", () => {
    const water = REFERENCE_PROJECTS.find((p) => p.id === "ref-water-meter")!;
    const copy = duplicateWorkspaceProject(water, "2026-11-26T00:00:00Z");
    expect(copy.id).not.toBe(water.id);
    expect(copy.name).toContain("(Copy)");
    expect(copy.isReference).toBe(false);
    expect(copy.status).toBe("planning");
    expect(copy.version).toBe(1);

    const md = exportProjectToMarkdown(water);
    expect(md).toContain(`# ${water.name}`);
    expect(md).toContain("## 22-Section Engineering Specification");
    expect(md).toContain("### 1. Problem Statement & Objectives");
    expect(md).toContain("### 22. Deployment & Maintenance SOP");
  });

  it("provides industry technology profiles with valid public URLs and research dates", () => {
    expect(INDUSTRY_RESEARCH_PROFILES.length).toBeGreaterThanOrEqual(5);
    for (const prof of INDUSTRY_RESEARCH_PROFILES) {
      expect(prof.sourceUrl).toMatch(/^https:\/\//);
      expect(prof.researchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(prof.keyTechnologies.length).toBeGreaterThan(0);
    }
  });
});

