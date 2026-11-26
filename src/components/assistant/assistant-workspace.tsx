"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, ExternalLink, Loader2, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ASSISTANT_20_STEPS, type AssistantReply } from "@/lib/assistant/engine";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reply?: AssistantReply;
}

export function AssistantWorkspace() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([1, 2]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Describe your engineering requirement in plain language (e.g. *\"industrial water meter with flow sensor, ESP32, 4G/NB-IoT and cloud monitoring\"*). I will search the Knowledge Base, separate facts from assumptions, and guide you through the 20-step workflow.",
    },
  ]);

  const sendPrompt = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    setError(null);
    setLoading(true);
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: clean }]);
    setPrompt("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Assistant request failed.");
      } else {
        const reply = data as AssistantReply;
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: reply.answer, reply },
        ]);
      }
    } catch {
      setError("Network error calling /api/assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Chat Pane (8 cols) */}
      <Card className="flex flex-col xl:col-span-8">
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-violet" />
              AI Engineering Assistant
            </CardTitle>
            <CardDescription>
              Grounded in stored Knowledge Base records (components, sensors, MCUs, comms, antennas).
            </CardDescription>
          </div>
          <Badge variant="outline">Rate-limited · Server Route</Badge>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              "Smart water meter with flow sensor, NB-IoT and 10-year battery",
              "Railway bridge strain & vibration monitor over RS-485 and 4G",
              "Differential-drive rover with ESP32 and LiDAR",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendPrompt(q)}
                className="rounded-full border bg-surface-raised/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-accent/50 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border p-3.5 text-xs ${
                  m.role === "user"
                    ? "ml-auto max-w-[85%] border-primary/40 bg-primary/10"
                    : "border-border bg-surface-raised/40"
                }`}
              >
                {m.reply && (
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={m.reply.mode === "anthropic" ? "live" : "demo"}>
                      {m.reply.mode === "anthropic" ? "Claude API" : "KB Rule-Based Fallback"}
                    </Badge>
                  </div>
                )}

                <div className="prose prose-invert prose-xs max-w-none leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>

                {m.reply && m.reply.citations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                    {m.reply.citations.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="inline-flex items-center gap-1 rounded border bg-background px-2 py-0.5 text-[10px] text-accent hover:underline"
                      >
                        {c.kind}: {c.title}
                        <ExternalLink className="size-2.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div role="alert" className="rounded border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(prompt);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask about component selection, link budgets, battery sizing, or firmware…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
              Send
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 20-Step Requirement Workflow (4 cols) */}
      <Card className="xl:col-span-4">
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle className="text-sm">20-Step Requirement Workflow</CardTitle>
            <CardDescription>{completedSteps.length} / 20 steps reviewed</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="max-h-[520px] overflow-y-auto p-3">
          <ul className="space-y-1.5">
            {ASSISTANT_20_STEPS.map((s) => {
              const done = completedSteps.includes(s.step);
              return (
                <li key={s.step}>
                  <button
                    type="button"
                    onClick={() =>
                      setCompletedSteps((prev) =>
                        prev.includes(s.step) ? prev.filter((x) => x !== s.step) : [...prev, s.step],
                      )
                    }
                    className={`flex w-full items-start gap-2 rounded-md border p-2 text-left text-xs transition-colors ${
                      done ? "border-success/30 bg-success/5" : "border-transparent bg-surface-raised/30 hover:border-border"
                    }`}
                  >
                    <CheckCircle2 className={`mt-0.5 size-3.5 shrink-0 ${done ? "text-success" : "text-muted-foreground/40"}`} />
                    <div>
                      <div className="font-semibold text-foreground">
                        {s.step}. {s.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{s.question}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

