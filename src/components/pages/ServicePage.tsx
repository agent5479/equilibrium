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

function isYogaLegacyPath(path: string): boolean {
  return path.startsWith("/yoga/") || path === "/yoga/" || path === "/yogapatricias-yoga-background/";
}

function YogaLegacyBanner() {
  return (
    <aside className="legacy-banner" aria-label="Historical archive notice">
      <div className="container">
        <p className="legacy-banner__label">Archive — Yoga teaching history</p>
        <p>
          Patricia taught Yoga from 2009 to 2021. These pages are kept as a legacy portfolio.
          She no longer offers Yoga classes. Today&apos;s practice is{" "}
          <strong>Touch for Health Kinesiology and Nutrition</strong>.
        </p>
        <p className="legacy-banner__actions">
          <Link href={routePath("/touch-for-health-kinesiology/")}>Kinesiology</Link>
          <span aria-hidden="true"> · </span>
          <Link href={routePath("/bookings/")}>Book a session</Link>
          <span aria-hidden="true"> · </span>
          <Link href={routePath("/contact/")}>Contact</Link>
        </p>
      </div>
    </aside>
  );
}

export default function ServicePage({ page, slug }: ServicePageProps) {
  const sections = parseSections(page.blocks);
  const heroImage = getHeroImage(slug);
  const showLegacyBanner = isYogaLegacyPath(page.path);

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

      {showLegacyBanner && <YogaLegacyBanner />}

      {sections.length >= 2 ? (
        <AlternatingSections
          sections={sections}
          pageSlug={slug}
          showCta={!showLegacyBanner}
        />
      ) : (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
          {!showLegacyBanner && (
            <section className="cta-band">
              <Link href={routePath("/bookings/")} className="btn-primary">
                Book a Session
              </Link>
            </section>
          )}
        </div>
      )}
    </>
  );
}
