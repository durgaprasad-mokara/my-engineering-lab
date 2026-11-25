import { AppShell } from "@/components/layout/app-shell";
import { getViewer } from "@/lib/data/viewer";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { viewer, notifications } = await getViewer();
  return (
    <AppShell viewer={viewer} notifications={notifications}>
      {children}
    </AppShell>
  );
}
