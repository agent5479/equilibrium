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

function NutritionCta() {
  return (
    <section className="cta-band">
      <div className="container">
        <h2>Sessions and booking</h2>
        <p>
          See session lengths and fees, or book a Kinesiology / Nutrition session
          with Patricia.
        </p>
        <div className="home-hero-actions">
          <Link
            href={routePath("/nutrition/services-and-fees/")}
            className="btn-secondary"
          >
            Sessions and cost
          </Link>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book a Session
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ServicePage({ page, slug }: ServicePageProps) {
  const sections = parseSections(page.blocks);
  const heroImage = getHeroImage(slug);
  const isYoga = isYogaLegacyPath(page.path);
  const isNutritionAbout = slug === "about" || slug === "nutrition";
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
          showCta={!isYoga && !isNutritionAbout}
        />
      ) : (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
          {!isYoga && !isNutritionAbout && (
            <section className="cta-band">
              <Link href={routePath("/bookings/")} className="btn-primary">
                Book a Session
              </Link>
            </section>
          )}
        </div>
      )}

      {isNutritionAbout && <NutritionCta />}
    </>
  );
}
