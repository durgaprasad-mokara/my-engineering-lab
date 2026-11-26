"use client";

import { useActionState, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { resendConfirmation, signIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

export function LoginForm({ next, disabled }: { next?: string; disabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState<AuthState | null>(null);
  const [resending, setResending] = useState(false);

  const isUnconfirmed = Boolean(state.error && /not confirmed/i.test(state.error));

  const handleResend = async () => {
    setResending(true);
    const res = await resendConfirmation(email);
    setResendState(res);
    setResending(false);
  };

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={disabled}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!state.fieldErrors?.email}
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required disabled={disabled} aria-invalid={!!state.fieldErrors?.password} />
        <FieldError message={state.fieldErrors?.password} />
      </div>
      {state.error && (
        <div role="alert" className="space-y-2 rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
          <p>{state.error}</p>
          {isUnconfirmed && (
            <div className="space-y-1.5 border-t border-danger/20 pt-2 text-[11px] text-foreground/90">
              <p>
                To skip email confirmation, disable <strong>Confirm email</strong> in{" "}
                <span className="font-mono">Supabase → Authentication → Providers → Email</span>, or resend the link:
              </p>
              <Button type="button" size="sm" variant="outline" onClick={handleResend} disabled={resending || !email}>
                {resending ? <Loader2 className="animate-spin" /> : <MailCheck />}
                Resend confirmation email
              </Button>
            </div>
          )}
        </div>
      )}
      {resendState?.message && (
        <p className="rounded-md border border-success/30 bg-success/10 p-2.5 text-xs text-success">
          {resendState.message}
        </p>
      )}
      {resendState?.error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
          {resendState.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={disabled || pending}>
        {pending && <Loader2 className="animate-spin" />} Sign in
      </Button>
    </form>
  );
}
