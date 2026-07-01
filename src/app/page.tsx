import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/content";
import { buildMetadata, localBusinessJsonLd } from "@/lib/metadata";
import PageRenderer from "@/components/PageRenderer";

export function generateMetadata() {
  const page = getPageBySlug("home");
  if (!page) return {};
  return buildMetadata({
    title: page.title,
    description: page.metaDescription,
    path: "/",
    ogImage: page.ogImage,
  });
}

export default function HomePage() {
  const page = getPageBySlug("home");
  if (!page) notFound();

  const jsonLd = localBusinessJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <PageRenderer blocks={page.blocks} />
      </div>
    </>
  );
}
