"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updatePreferences, type FormState } from "../profile/actions";
import type { PreferencesData } from "@/lib/data/profile";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

export function SettingsForm({ prefs }: { prefs: PreferencesData }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePreferences, {});
  const disabled = prefs.mode === "demo";
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="regionCode">Region (ISO country code)</Label>
          <Input id="regionCode" name="regionCode" defaultValue={prefs.regionCode} maxLength={2} disabled={disabled} />
          <p className="text-[11px] text-muted-foreground">Sets default spectrum guidance (e.g. LoRa IN865 for IN).</p>
          <FieldError message={state.fieldErrors?.regionCode} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unitsSystem">Units</Label>
          <Select id="unitsSystem" name="unitsSystem" defaultValue={prefs.unitsSystem} disabled={disabled}>
            <option value="metric">Metric (SI)</option>
            <option value="imperial">Imperial</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reminderTime">Daily reminder time</Label>
          <Input id="reminderTime" name="reminderTime" type="time" defaultValue={prefs.reminderTime ?? ""} disabled={disabled} />
          <FieldError message={state.fieldErrors?.reminderTime} />
        </div>
      </div>
      {state.error && <p role="alert" className="text-xs text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-success">Settings saved.</p>}
      <Button type="submit" disabled={disabled || pending}>
        {pending && <Loader2 className="animate-spin" />} Save settings
      </Button>
    </form>
  );
}
