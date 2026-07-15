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
        <div className="price-card">
          <h3>Per weekend</h3>
          <p className="price-amount">$495</p>
          <p>Per level (2 full days)</p>
        </div>
        <div className="price-card price-card--featured">
          <h3>All four levels</h3>
          <p className="price-amount">$1,790</p>
          <p>Pre-pay all four levels — includes book, workbook &amp; certification</p>
        </div>
        <div className="price-card">
          <h3>TFH Intro workshop</h3>
          <p className="price-amount">$25</p>
          <p>2 hour introduction</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Contact Patricia for the next intake</h2>
          <p>Phone: 021 991 989 · patricia@equilibriumhealth.nz</p>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book or Enquire
          </Link>
        </div>
      </section>
    </>
  );
}
