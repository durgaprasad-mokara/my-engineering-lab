"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile, type FormState } from "./actions";
import type { ProfileData } from "@/lib/data/profile";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const disabled = profile.mode === "demo";
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" defaultValue={profile.displayName} disabled={disabled} />
          <FieldError message={state.fieldErrors?.displayName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timezone">Time zone (IANA)</Label>
          <Input id="timezone" name="timezone" defaultValue={profile.timezone} placeholder="Asia/Kolkata" disabled={disabled} />
          <FieldError message={state.fieldErrors?.timezone} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" defaultValue={profile.headline} placeholder="e.g. Embedded engineer exploring industrial IoT" disabled={disabled} />
        <FieldError message={state.fieldErrors?.headline} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="learningGoals">Learning goals (one per line)</Label>
        <Textarea id="learningGoals" name="learningGoals" defaultValue={profile.learningGoals.join("\n")} rows={4} disabled={disabled} />
      </div>
      {state.error && <p role="alert" className="text-xs text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-success">Profile saved.</p>}
      <Button type="submit" disabled={disabled || pending}>
        {pending && <Loader2 className="animate-spin" />} Save profile
      </Button>
      {disabled && <p className="text-[11px] text-muted-foreground">Editing is disabled in demo mode.</p>}
    </form>
  );
}
