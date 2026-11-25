import { z } from "zod";

const isTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  headline: z.string().trim().max(200).optional().default(""),
  timezone: z.string().refine(isTimeZone, "Unknown time zone."),
  learningGoals: z
    .string()
    .optional()
    .default("")
    .transform((s) => s.split("\n").map((g) => g.trim()).filter(Boolean).slice(0, 20)),
});

export const preferencesSchema = z.object({
  regionCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a two-letter country code, e.g. IN."),
  unitsSystem: z.enum(["metric", "imperial"]),
  reminderTime: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() ? s.trim() : null))
    .refine((s) => s === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(s), "Use HH:MM (24-hour)."),
});
