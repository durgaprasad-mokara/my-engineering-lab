import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { DOCS, readDoc } from "@/lib/data/docs";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: DOCS.find((d) => d.slug === slug)?.title ?? "Documentation" };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await readDoc(slug);
  if (!doc) notFound();
  const idx = DOCS.findIndex((d) => d.slug === slug);
  const prev = DOCS[idx - 1];
  const next = DOCS[idx + 1];
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/documentation" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All documents
      </Link>
      <Card className="p-5 sm:p-8">
        <article className="prose-eng">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.body}</ReactMarkdown>
        </article>
      </Card>
      <div className="mt-4 flex justify-between text-xs">
        {prev ? <Link href={`/documentation/${prev.slug}`} className="text-accent hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/documentation/${next.slug}`} className="text-accent hover:underline">{next.title} →</Link> : <span />}
      </div>
    </div>
  );
}
