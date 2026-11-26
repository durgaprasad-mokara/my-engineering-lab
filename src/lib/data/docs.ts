import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface DocMeta {
  slug: string;
  title: string;
  file: string;
}

const DOCS_DIR = path.join(process.cwd(), "docs");

export const DOCS: DocMeta[] = [
  { slug: "prd", title: "Product Requirements", file: "01-PRD.md" },
  { slug: "architecture", title: "System Architecture", file: "02-SYSTEM-ARCHITECTURE.md" },
  { slug: "database", title: "Database Schema", file: "03-DATABASE-SCHEMA.md" },
  { slug: "design-system", title: "UX/UI Design System", file: "04-DESIGN-SYSTEM.md" },
  { slug: "folder-structure", title: "Folder Structure", file: "05-FOLDER-STRUCTURE.md" },
  { slug: "roadmap", title: "Development Roadmap", file: "06-DEVELOPMENT-ROADMAP.md" },
  { slug: "phase-1-plan", title: "Phase 1 Plan", file: "07-PHASE-1-PLAN.md" },
  { slug: "phase-1-report", title: "Phase 1 Progress Report", file: "progress/PHASE-1.md" },
  { slug: "phase-2-report", title: "Phase 2 Progress Report", file: "progress/PHASE-2.md" },
  { slug: "phase-3-report", title: "Phase 3 Progress Report", file: "progress/PHASE-3.md" },
  { slug: "phase-4-report", title: "Phase 4 Progress Report", file: "progress/PHASE-4.md" },
  { slug: "phase-5-report", title: "Phase 5 Progress Report", file: "progress/PHASE-5.md" },
  { slug: "phase-6-report", title: "Phase 6 Progress Report", file: "progress/PHASE-6.md" },
  { slug: "phase-7-report", title: "Phase 7 Progress Report", file: "progress/PHASE-7.md" },
  { slug: "phase-8-report", title: "Phase 8 Progress Report", file: "progress/PHASE-8.md" },
  { slug: "phase-9-report", title: "Phase 9 Progress Report", file: "progress/PHASE-9.md" },
  { slug: "phase-10-report", title: "Phase 10 Progress Report", file: "progress/PHASE-10.md" },
  { slug: "phase-11-report", title: "Phase 11 Progress Report", file: "progress/PHASE-11.md" },
  { slug: "phase-12-report", title: "Phase 12 Progress Report", file: "progress/PHASE-12.md" },
];

export async function readDoc(slug: string): Promise<{ meta: DocMeta; body: string } | null> {
  const meta = DOCS.find((d) => d.slug === slug);
  if (!meta) return null;
  try {
    const body = await fs.readFile(path.join(DOCS_DIR, meta.file), "utf8");
    return { meta, body };
  } catch {
    return null;
  }
}

export async function listDocs(): Promise<(DocMeta & { available: boolean; excerpt: string })[]> {
  return Promise.all(
    DOCS.map(async (d) => {
      const doc = await readDoc(d.slug);
      const excerpt =
        doc?.body
          .split("\n")
          .find((l) => l.trim() && !l.startsWith("#") && !l.startsWith("|") && !l.startsWith(">") && !l.startsWith("---"))
          ?.trim()
          .slice(0, 180) ?? "";
      return { ...d, available: Boolean(doc), excerpt };
    }),
  );
}
