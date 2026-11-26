import { describe, expect, it } from "vitest";
import {
  ASSISTANT_20_STEPS,
  buildRuleBasedAssistantReply,
  checkAssistantRateLimit,
  retrieveKnowledgeContext,
} from "@/lib/assistant/engine";
import {
  CLOUD_PATTERNS,
  DEFAULT_ALERT_RULES,
  DEFAULT_DEVICES,
  evaluateDeviceAlerts,
} from "@/lib/cloud/telemetry";
import {
  CURRICULUM_12_MONTHS,
  SAMPLE_DAILY_LESSONS,
  rescheduleMissedTask,
} from "@/lib/learning/curriculum";

describe("Phase 10: AI Engineering Assistant", () => {
  it("defines the 20-step requirement workflow", () => {
    expect(ASSISTANT_20_STEPS).toHaveLength(20);
    expect(ASSISTANT_20_STEPS[0]!.step).toBe(1);
    expect(ASSISTANT_20_STEPS[19]!.step).toBe(20);
  });

  it("retrieves grounded Knowledge Base citations and builds rule-based reply", () => {
    const hits = retrieveKnowledgeContext("smart water meter nb-iot");
    expect(hits.length).toBeGreaterThan(0);

    const reply = buildRuleBasedAssistantReply("smart water meter over nb-iot");
    expect(reply.mode).toBe("rule_based_kb");
    expect(reply.facts.length).toBeGreaterThan(0);
    expect(reply.assumptions.length).toBeGreaterThan(0);
    expect(reply.nextQuestions.length).toBeGreaterThan(0);
  });

  it("enforces sliding-window rate limits", () => {
    const key = `test-client-${Date.now()}`;
    expect(checkAssistantRateLimit(key, 2, 60_000, 1000).allowed).toBe(true);
    expect(checkAssistantRateLimit(key, 2, 60_000, 2000).allowed).toBe(true);
    expect(checkAssistantRateLimit(key, 2, 60_000, 3000).allowed).toBe(false);
    // Window expires after 60s
    expect(checkAssistantRateLimit(key, 2, 60_000, 65_000).allowed).toBe(true);
  });
});

describe("Phase 11: Gateway, Cloud & Digital Twin", () => {
  it("evaluates device telemetry alert thresholds accurately", () => {
    const healthy = DEFAULT_DEVICES.find((d) => d.id === "dev-wm-01")!;
    expect(evaluateDeviceAlerts(healthy, DEFAULT_ALERT_RULES)).toHaveLength(0);

    const faulty = DEFAULT_DEVICES.find((d) => d.id === "dev-wm-02")!;
    const alerts = evaluateDeviceAlerts(faulty, DEFAULT_ALERT_RULES);
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it("provides cloud broker integration patterns", () => {
    expect(CLOUD_PATTERNS.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Phase 12: Learning Academy & Calendar", () => {
  it("covers all 12 months and 365 days seamlessly", () => {
    expect(CURRICULUM_12_MONTHS).toHaveLength(12);
    expect(CURRICULUM_12_MONTHS[0]!.daysRange[0]).toBe(1);
    expect(CURRICULUM_12_MONTHS[11]!.daysRange[1]).toBe(365);
  });

  it("provides daily lessons with valid quiz indices and reschedules missed tasks", () => {
    for (const l of SAMPLE_DAILY_LESSONS) {
      expect(l.quiz.options.length).toBeGreaterThanOrEqual(3);
      expect(l.quiz.correctIndex).toBeGreaterThanOrEqual(0);
      expect(l.quiz.correctIndex).toBeLessThan(l.quiz.options.length);
    }

    const updated = rescheduleMissedTask(
      [{ id: "t1", date: "2026-11-25", title: "Day 18", dayNumber: 18, status: "missed", reminderTime: "18:00" }],
      "t1",
      "2026-11-27",
    );
    expect(updated[0]!.status).toBe("rescheduled");
    expect(updated[0]!.date).toBe("2026-11-27");
  });
});

