import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAssistantRateLimit } from "@/lib/assistant/engine";
import { runHardwareResearch } from "@/lib/advanced/engines";

const schema = z.object({
  query: z.string().trim().min(2, "Enter a hardware research prompt.").max(2000),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for") ?? "local";
  const rate = checkAssistantRateLimit(`hr:${clientIp}`, 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Wait before retrying." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const grounded = runHardwareResearch(parsed.data.query, parsed.data.category);
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(grounded);
  }

  try {
    const context = grounded.recommendedComponents
      .map((c) => `- ${c.name} (${c.category}, ${c.operatingVoltage}, ${c.protocols.join("/")})`)
      .join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        system:
          "You are an AI Hardware Research Agent. Provide concise, accurate electronics architecture advice grounded on these catalog parts:\n" +
          context,
        messages: [{ role: "user", content: parsed.data.query }],
      }),
    });

    if (!res.ok) return NextResponse.json(grounded);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text;
    if (!text) return NextResponse.json(grounded);

    return NextResponse.json({
      ...grounded,
      mode: "anthropic" as const,
      summary: text,
    });
  } catch {
    return NextResponse.json(grounded);
  }
}

