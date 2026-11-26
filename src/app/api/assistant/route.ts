import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildRuleBasedAssistantReply,
  checkAssistantRateLimit,
  retrieveKnowledgeContext,
} from "@/lib/assistant/engine";

const requestSchema = z.object({
  prompt: z.string().trim().min(2, "Enter an engineering question or requirement.").max(4000),
});

export async function POST(req: Request) {
  const clientIp = req.headers.get("x-forwarded-for") ?? "local";
  const rate = checkAssistantRateLimit(clientIp, 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded (20 requests/minute). Please wait before retrying." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const prompt = parsed.data.prompt;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(buildRuleBasedAssistantReply(prompt));
  }

  const citations = retrieveKnowledgeContext(prompt);
  const kbContext = citations.map((c) => `- [${c.kind}] ${c.title} (${c.href})`).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system:
          "You are the My Engineering Lab AI Assistant. Separate verified facts from assumptions, cite matched Knowledge Base records, and ask clarifying questions when specs are missing.\n\nMatched KB context:\n" +
          (kbContext || "None"),
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(buildRuleBasedAssistantReply(prompt));
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    if (!text) {
      return NextResponse.json(buildRuleBasedAssistantReply(prompt));
    }

    return NextResponse.json({
      mode: "anthropic",
      answer: text,
      citations,
      facts: ["Generated via Anthropic Claude grounded with Knowledge Base records."],
      assumptions: [],
      nextQuestions: [],
    });
  } catch {
    return NextResponse.json(buildRuleBasedAssistantReply(prompt));
  }
}

