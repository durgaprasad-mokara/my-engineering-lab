import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-2xl font-semibold">This route isn&apos;t part of the lab.</h1>
      <p className="max-w-md text-sm text-muted-foreground">Check the address, or use search (Ctrl K) from the dashboard.</p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
