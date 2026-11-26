import type { CircuitEdge, CircuitNode, PcbStackup } from "./types";

/**
 * Generates a KiCad-compatible S-expression netlist (.net) from circuit nodes and edges.
 */
export function generateKicadNetlist(
  projectName: string,
  nodes: CircuitNode[],
  edges: CircuitEdge[],
): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const compBlocks = nodes
    .map(
      (n, idx) => `    (comp (ref "U${idx + 1}")
      (value "${n.label.replace(/"/g, "")}")
      (footprint "${n.footprint}")
      (datasheet "~")
      (fields
        (field (name "Kind") "${n.kind}")
        (field (name "NominalVoltage") "${n.voltageV}V")))`,
    )
    .join("\n");

  const nodeIdx = new Map(nodes.map((n, i) => [n.id, `U${i + 1}`]));

  const netBlocks = edges
    .map(
      (e, idx) => `    (net (code "${idx + 1}") (name "${e.signal.replace(/"/g, "")}")
      (node (ref "${nodeIdx.get(e.fromNodeId) ?? "U0"}") (pin "${e.fromPin}"))
      (node (ref "${nodeIdx.get(e.toNodeId) ?? "U0"}") (pin "${e.toPin}")))`,
    )
    .join("\n");

  return `(export (version "E")
  (design
    (source "${projectName.replace(/"/g, "")}")
    (date "${dateStr}")
    (tool "My Engineering Lab — PCB Preparation (Phase 5)"))
  (components
${compBlocks}
  )
  (nets
${netBlocks}
  )
)
`;
}

/**
 * Generates a pick-and-place / footprint placement CSV for PCB layout preparation.
 */
export function generatePlacementCsv(nodes: CircuitNode[], stackup: PcbStackup): string {
  const header = ["Ref", "Label", "Footprint", "X_mm", "Y_mm", "Layer", "Board_W_mm", "Board_H_mm"];
  const rows = nodes.map((n, idx) =>
    [
      `U${idx + 1}`,
      `"${n.label.replace(/"/g, "")}"`,
      n.footprint,
      ((n.x / 600) * stackup.boardWidthMm).toFixed(2),
      ((n.y / 380) * stackup.boardHeightMm).toFixed(2),
      "F.Cu",
      String(stackup.boardWidthMm),
      String(stackup.boardHeightMm),
    ].join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

