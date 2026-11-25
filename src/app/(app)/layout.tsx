import { AppShell } from "@/components/layout/app-shell";
import { getCatalogueSearchItems } from "@/lib/data/catalogue-search";
import { getViewer } from "@/lib/data/viewer";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [{ viewer, notifications }, catalogueItems] = await Promise.all([
    getViewer(),
    getCatalogueSearchItems(),
  ]);
  return (
    <AppShell viewer={viewer} notifications={notifications} catalogueItems={catalogueItems}>
      {children}
    </AppShell>
  );
}
