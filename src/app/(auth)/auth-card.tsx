import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/layout/logo";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r lg:block">
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <span className="text-sm font-bold tracking-[0.1em]">MY ENGINEERING LAB</span>
          </Link>
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              From a plain-language requirement to a <span className="text-accent">documented, testable</span> engineering design.
            </h2>
            <p className="text-sm text-muted-foreground">
              Components, sensors, communications, antennas, firmware, cloud and learning — in one workspace, with every
              technical value traceable to its source.
            </p>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">IoT · Robotics · Electronics · Industrial</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <LogoMark /> <span className="text-sm font-bold tracking-[0.1em]">MY ENGINEERING LAB</span>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-xs text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function DemoNotice() {
  return (
    <div className="mb-5 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
      <p className="font-medium">Supabase is not configured — running in demo mode.</p>
      <p className="mt-1 text-warning/80">
        Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="font-mono">.env.local</code> to enable sign-in.{" "}
        <Link href="/dashboard" className="underline underline-offset-2">Continue to the demo dashboard</Link>.
      </p>
    </div>
  );
}
