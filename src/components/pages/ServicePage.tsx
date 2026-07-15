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

function YogaLegacyNote() {
  return (
    <aside className="legacy-note" aria-label="About this page">
      <div className="container">
        <p>
          From Patricia&apos;s Yoga teaching years (2009–2021). She no longer offers Yoga
          classes — today she practises{" "}
          <Link href={routePath("/touch-for-health-kinesiology/")}>
            Touch for Health Kinesiology
          </Link>{" "}
          and Nutrition.{" "}
          <Link href={routePath("/bookings/")}>Book a session</Link>
          {" · "}
          <Link href={routePath("/yoga/")}>Teaching years overview</Link>
        </p>
      </div>
    </aside>
  );
}

export default function ServicePage({ page, slug }: ServicePageProps) {
  const sections = parseSections(page.blocks);
  const heroImage = getHeroImage(slug);
  const isYoga = isYogaLegacyPath(page.path);
  // Quieter title presentation for yoga — skip product-style hero overlays
  const useQuietTitle = isYoga;

  return (
    <>
      {heroImage && !useQuietTitle && (
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

      {(!heroImage || useQuietTitle) && (
        <div className="page-title-bar">
          <div className="container">
            <h1>{page.title}</h1>
          </div>
        </div>
      )}

      {isYoga && <YogaLegacyNote />}

      {sections.length >= 2 ? (
        <AlternatingSections
          sections={sections}
          pageSlug={slug}
          showCta={!isYoga}
        />
      ) : (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
          {!isYoga && (
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
