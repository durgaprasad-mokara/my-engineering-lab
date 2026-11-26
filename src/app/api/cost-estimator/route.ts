import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatePrototypeCost } from "@/lib/advanced/engines";

const schema = z.object({
  projectName: z.string().trim().min(1).max(120),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        unitCostUsd: z.number().min(0).max(50000),
        qty: z.number().min(1).max(10000),
      }),
    )
    .min(1),
  pcbAreaCm2: z.number().min(1).max(2000),
  pcbLayers: z.union([z.literal(2), z.literal(4), z.literal(6)]),
  prototypeQty: z.number().min(1).max(5000),
  enclosureCostUsd: z.number().min(0).max(5000),
  shippingAndNreUsd: z.number().min(0).max(20000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid cost input." }, { status: 400 });
  }

  return NextResponse.json(estimatePrototypeCost(parsed.data));
}

