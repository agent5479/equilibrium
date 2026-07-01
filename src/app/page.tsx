import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/content";
import { buildMetadata, localBusinessJsonLd } from "@/lib/metadata";
import HomePage from "@/components/HomePage";

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

export default function Page() {
  const page = getPageBySlug("home");
  if (!page) notFound();

  const jsonLd = localBusinessJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
