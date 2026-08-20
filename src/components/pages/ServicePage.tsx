import type { PageData } from "@/lib/types";
import { parseSections } from "@/lib/parse-content";
import AlternatingSections from "@/components/AlternatingSections";
import OptimizedImage from "@/components/OptimizedImage";
import { getHeroImage } from "@/lib/page-images";
import Link from "next/link";
import { routePath } from "@/lib/paths";
import PageRenderer from "@/components/PageRenderer";
import JsonLd from "@/components/JsonLd";
import WhoThisHelps from "@/components/WhoThisHelps";
import {
  breadcrumbJsonLd,
  practiceServiceJsonLd,
} from "@/lib/metadata";

interface ServicePageProps {
  page: PageData;
  slug: string;
}

function isYogaLegacyPath(path: string): boolean {
  return path.startsWith("/yoga/") || path === "/yoga/" || path === "/yogapatricias-yoga-background/";
}

function isSupportPath(path: string): boolean {
  return path === "/support/" || path.startsWith("/support/");
}

function YogaLegacyNote() {
  return (
    <aside className="legacy-note" aria-label="About this page">
      <div className="container">
        <p>
          <strong>Historical archive.</strong> Patricia taught Yoga in Golden Bay from 2009 to
          2021. She no longer offers Yoga classes — these pages remain as background to her
          practice. Today she offers{" "}
          <Link href={routePath("/touch-for-health-kinesiology/")}>
            Touch for Health Kinesiology
          </Link>{" "}
          and Nutrition at Equilibrium in Takaka.{" "}
          <Link href={routePath("/bookings/")}>Book a kinesiology / nutrition session</Link>
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

function breadcrumbsFor(page: PageData) {
  const items: { name: string; path: string }[] = [
    { name: "Home", path: "/" },
  ];
  if (isYogaLegacyPath(page.path)) {
    items.push({ name: "Yoga teaching years", path: "/yoga/" });
    if (page.path !== "/yoga/") {
      items.push({ name: page.title, path: page.path });
    }
  } else if (isSupportPath(page.path)) {
    items.push({ name: "Who this helps", path: "/support/" });
    if (page.path !== "/support/") {
      items.push({ name: page.title, path: page.path });
    }
  } else {
    items.push({ name: page.title, path: page.path });
  }
  return breadcrumbJsonLd(items);
}

export default function ServicePage({ page, slug }: ServicePageProps) {
  const sections = parseSections(page.blocks);
  const heroImage = getHeroImage(slug);
  const isYoga = isYogaLegacyPath(page.path);
  const isSupport = isSupportPath(page.path);
  const isNutritionAbout = slug === "about" || slug === "nutrition";
  const showWhoThisHelps =
    isNutritionAbout ||
    slug === "touch-for-health-kinesiology" ||
    isSupport;
  const useQuietTitle = isYoga || isSupport;
  const serviceLd = practiceServiceJsonLd(page.path);
  const breadcrumbLd = breadcrumbsFor(page);

  return (
    <>
      <JsonLd data={[breadcrumbLd, ...(serviceLd ? [serviceLd] : [])]} />

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
          showCta={!isYoga && !isNutritionAbout && !isSupport}
        />
      ) : (
        <div className="container content-section">
          <PageRenderer blocks={page.blocks} filterSidebar />
          {!isYoga && !isNutritionAbout && !isSupport && (
            <section className="cta-band">
              <Link href={routePath("/bookings/")} className="btn-primary">
                Book a Session
              </Link>
            </section>
          )}
        </div>
      )}

      {showWhoThisHelps && !isSupport && (
        <div className="container content-section">
          <WhoThisHelps />
        </div>
      )}

      {isSupport && page.path !== "/support/" && (
        <section className="cta-band">
          <div className="container">
            <Link href={routePath("/bookings/")} className="btn-primary">
              Book a Session
            </Link>
            {" "}
            <Link href={routePath("/contact/")} className="btn-secondary">
              Contact Patricia
            </Link>
          </div>
        </section>
      )}

      {isNutritionAbout && <NutritionCta />}
    </>
  );
}
