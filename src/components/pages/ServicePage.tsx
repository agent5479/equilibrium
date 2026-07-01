import type { PageData } from "@/lib/types";
import { parseSections } from "@/lib/parse-content";
import AlternatingSections from "@/components/AlternatingSections";
import OptimizedImage from "@/components/OptimizedImage";
import { getHeroImage } from "@/lib/page-images";
import Link from "next/link";
import { routePath } from "@/lib/paths";
import PageRenderer from "@/components/PageRenderer";

interface ServicePageProps {
  page: PageData;
  slug: string;
}

export default function ServicePage({ page, slug }: ServicePageProps) {
  const sections = parseSections(page.blocks);
  const heroImage = getHeroImage(slug);

  return (
    <>
      {heroImage && (
        <section className="page-hero">
          <OptimizedImage
            src={heroImage}
            alt={page.title}
            sizes="100vw"
            priority
          />
          <div className="page-hero-overlay">
            <div className="container">
              <h1>{page.title}</h1>
            </div>
          </div>
        </section>
      )}

      {!heroImage && (
        <div className="page-title-bar">
          <div className="container">
            <h1>{page.title}</h1>
          </div>
        </div>
      )}

      {sections.length >= 2 ? (
        <AlternatingSections sections={sections} pageSlug={slug} showCta />
      ) : (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
          <section className="cta-band">
            <Link href={routePath("/bookings/")} className="btn-primary">
              Book a Session
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
