"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

const fields = [
  { name: "displayName", label: "Name", type: "text", auto: "name" },
  { name: "email", label: "Email", type: "email", auto: "email" },
  { name: "password", label: "Password", type: "password", auto: "new-password", hint: "At least 10 characters with a letter and a number." },
  { name: "confirmPassword", label: "Confirm password", type: "password", auto: "new-password" },
] as const;

export function SignupForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  if (state.message) {
    return <p role="status" className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">{state.message}</p>;
  }
  return (
    <form action={action} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.name} className="space-y-1.5">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input id={f.name} name={f.name} type={f.type} autoComplete={f.auto} required disabled={disabled} aria-invalid={!!state.fieldErrors?.[f.name]} />
          {"hint" in f && !state.fieldErrors?.[f.name] && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
          <FieldError message={state.fieldErrors?.[f.name]} />
        </div>
      ))}
      {state.error && <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={disabled || pending}>
        {pending && <Loader2 className="animate-spin" />} Create account
      </Button>
    </form>
  );
}
