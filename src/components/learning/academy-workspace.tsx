"use client";

import * as React from "react";
import { BookOpen, CheckCircle2, GraduationCap, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CURRICULUM_12_MONTHS,
  SAMPLE_DAILY_LESSONS,
} from "@/lib/learning/curriculum";

export function AcademyWorkspace() {
  const [completedDays, setCompletedDays] = React.useState<number[]>([1, 2, 3, 18]);
  const [selectedDay, setSelectedDay] = React.useState<number>(SAMPLE_DAILY_LESSONS[0]!.day);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [submittedQuiz, setSubmittedQuiz] = React.useState(false);

  const lesson = SAMPLE_DAILY_LESSONS.find((l) => l.day === selectedDay) ?? SAMPLE_DAILY_LESSONS[0]!;

  const handleSelectLesson = (day: number) => {
    setSelectedDay(day);
    setSelectedOption(null);
    setSubmittedQuiz(false);
  };

  const toggleComplete = (day: number) => {
    setCompletedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="size-4 text-accent" />
              365-Day Engineering Curriculum (12 Months)
            </CardTitle>
            <CardDescription>
              Structured progression from electronics fundamentals to IoT, robotics, Edge AI, and capstone delivery.
            </CardDescription>
          </div>
          <Badge variant="accent" className="font-mono">
            {completedDays.length} / 365 Days Completed
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CURRICULUM_12_MONTHS.map((m) => (
            <div key={m.month} className="rounded-md border bg-surface-raised/30 p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-accent">
                  Month {m.month} (Days {m.daysRange[0]}–{m.daysRange[1]})
                </span>
              </div>
              <div className="font-semibold text-foreground">{m.title}</div>
              <p className="text-[11px] text-muted-foreground">{m.focus}</p>
              <div className="pt-1 text-[10px] text-success">Milestone: {m.milestone}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interactive Daily Lesson & Quiz */}
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="size-4 text-accent" />
              Featured Daily Lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {SAMPLE_DAILY_LESSONS.map((l) => {
              const done = completedDays.includes(l.day);
              return (
                <button
                  key={l.day}
                  type="button"
                  onClick={() => handleSelectLesson(l.day)}
                  className={`flex w-full items-start justify-between rounded-md border p-3 text-left text-xs transition-colors ${
                    lesson.day === l.day
                      ? "border-accent bg-accent/10"
                      : "bg-surface-raised/30 hover:border-primary/40"
                  }`}
                >
                  <div>
                    <div className="font-mono text-[10px] text-accent">Day {l.day} · Month {l.month}</div>
                    <div className="font-semibold text-foreground">{l.title}</div>
                  </div>
                  {done && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="xl:col-span-8">
          <CardHeader className="border-b pb-3">
            <div>
              <Badge variant="outline" className="mb-1 font-mono text-[10px]">
                Day {lesson.day} · Month {lesson.month}
              </Badge>
              <CardTitle className="text-base">{lesson.title}</CardTitle>
              <CardDescription>{lesson.objective}</CardDescription>
            </div>
            <Button
              size="sm"
              variant={completedDays.includes(lesson.day) ? "secondary" : "default"}
              onClick={() => toggleComplete(lesson.day)}
            >
              <CheckCircle2 className="size-3.5" />
              {completedDays.includes(lesson.day) ? "Completed" : "Mark Day Complete"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 p-5 text-xs">
            <div className="rounded-md border bg-surface-raised/30 p-3.5 space-y-1">
              <div className="font-semibold text-foreground">Core Theory</div>
              <p className="leading-relaxed text-muted-foreground">{lesson.theory}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border bg-surface-raised/30 p-3">
                <div className="mb-1.5 font-semibold text-foreground">Lab Components</div>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.components.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-md border bg-surface-raised/30 p-3">
                <div className="mb-1 font-semibold text-foreground">Hands-on Exercise & Math</div>
                <p className="text-muted-foreground">{lesson.exercise}</p>
                <p className="mt-1 font-mono text-[11px] text-accent">{lesson.calculationHint}</p>
              </div>
            </div>

            {/* Quiz */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <HelpCircle className="size-4 text-accent" />
                Daily Checkpoint Quiz
              </div>
              <p className="text-sm font-medium text-foreground">{lesson.quiz.question}</p>
              <div className="space-y-1.5">
                {lesson.quiz.options.map((opt, idx) => {
                  const isPicked = selectedOption === idx;
                  const isCorrect = idx === lesson.quiz.correctIndex;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedOption(idx);
                        setSubmittedQuiz(false);
                      }}
                      className={`block w-full rounded-md border px-3 py-2 text-left transition-colors ${
                        submittedQuiz && isCorrect
                          ? "border-success bg-success/15 text-success"
                          : submittedQuiz && isPicked && !isCorrect
                            ? "border-danger bg-danger/15 text-danger"
                            : isPicked
                              ? "border-accent bg-accent/15 text-foreground"
                              : "bg-surface hover:bg-surface-raised"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  disabled={selectedOption === null}
                  onClick={() => setSubmittedQuiz(true)}
                >
                  Check Answer
                </Button>
                {submittedQuiz && (
                  <span className="text-xs text-muted-foreground">{lesson.quiz.explanation}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

