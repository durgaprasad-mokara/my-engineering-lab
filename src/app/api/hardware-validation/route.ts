import { NextResponse } from "next/server";
import { z } from "zod";
import { validateHardwareDesign } from "@/lib/advanced/engines";

const schema = z.object({
  projectName: z.string().trim().min(1).max(120),
  supplyVoltageV: z.number().min(0.8).max(60),
  mcuLogicVoltageV: z.number().min(1.2).max(12),
  regulatorMaxCurrentMa: z.number().min(10).max(50000),
  ambientTempC: z.number().min(-40).max(125),
  components: z
    .array(
      z.object({
        name: z.string().min(1),
        voltageV: z.number().min(0.5).max(60),
        currentMa: z.number().min(0).max(50000),
        interfaceType: z.enum(["I2C", "SPI", "UART", "Analog", "Power", "GPIO"]),
        i2cAddress: z.string().optional(),
        fiveVTolerant: z.boolean().optional(),
      }),
    )
    .min(1),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid validation payload." }, { status: 400 });
  }

  return NextResponse.json(validateHardwareDesign(parsed.data));
}

