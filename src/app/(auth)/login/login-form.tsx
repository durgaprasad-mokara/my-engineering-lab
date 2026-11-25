"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

export function LoginForm({ next, disabled }: { next?: string; disabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={disabled} aria-invalid={!!state.fieldErrors?.email} />
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required disabled={disabled} aria-invalid={!!state.fieldErrors?.password} />
        <FieldError message={state.fieldErrors?.password} />
      </div>
      {state.error && <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={disabled || pending}>
        {pending && <Loader2 className="animate-spin" />} Sign in
      </Button>
    </form>
  );
}
