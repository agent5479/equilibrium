import type { PageData } from "@/lib/types";
import { parseSections } from "@/lib/parse-content";
import AlternatingSections from "@/components/AlternatingSections";
import OptimizedImage from "@/components/OptimizedImage";
import Link from "next/link";
import { routePath } from "@/lib/paths";

export default function CoursePage({ page }: { page: PageData }) {
  const sections = parseSections(page.blocks);

  return (
    <>
      <section className="page-hero">
        <OptimizedImage
          src="/assets/wp-content/uploads/2021/09/IMG_2615r.jpg"
          alt="Touch For Health Kinesiology Course"
          sizes="100vw"
          priority
        />
        <div className="page-hero-overlay">
          <div className="container">
            <h1>{page.title}</h1>
          </div>
        </div>
      </section>

      <AlternatingSections
        sections={sections}
        pageSlug="touch-for-health-kinesiology-course"
        showCta={false}
      />

      <section className="pricing-cards container">
        <div className="price-card price-card--featured">
          <h3>Per weekend</h3>
          <p className="price-amount">$330</p>
          <p>
            Per level (2 full days) — plus TFH workbook; final certification
            after Level 4
          </p>
        </div>
        <div className="price-card">
          <h3>TFH Intro workshop</h3>
          <p className="price-amount">$25</p>
          <p>Koha-based · 2 hour introduction</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Upcoming workshops — Golden Bay</h2>
          <p>
            <strong>Level 1:</strong> 28–29 August 2026
            <br />
            <strong>Level 2:</strong> 30–31 August 2026
          </p>
          <p>
            Intro workshop: Saturday 25 July 2026, 1:30–3:30pm at Bay Yoga
            ($25, koha-based).
          </p>
          <p>Phone: 021 991 989 · patricia@equilibriumhealth.nz</p>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book or Enquire
          </Link>
        </div>
      </section>
    </>
  );
}
