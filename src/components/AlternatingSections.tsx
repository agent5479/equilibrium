import Link from "next/link";
import type { ContentSection } from "@/lib/parse-content";
import PageRenderer from "@/components/PageRenderer";
import OptimizedImage from "@/components/OptimizedImage";
import { getPageImagePool } from "@/lib/page-images";
import { routePath } from "@/lib/paths";

interface AlternatingSectionsProps {
  sections: ContentSection[];
  pageSlug?: string;
  showCta?: boolean;
}

export default function AlternatingSections({
  sections,
  pageSlug = "about",
  showCta = true,
}: AlternatingSectionsProps) {
  const imagePool = getPageImagePool(pageSlug);
  let imageIndex = 0;

  return (
    <div className="alternating-sections">
      {sections.map((section, i) => {
        const image =
          section.image ||
          imagePool[imageIndex % imagePool.length] ||
          imagePool[0];
        if (!section.image) imageIndex++;

        const reverse = i % 2 === 1;
        const level = section.headingLevel || 2;
        const HeadingTag = `h${Math.min(level, 2)}` as "h1" | "h2";

        return (
          <section
            key={i}
            className={`zigzag-section${i % 2 === 1 ? " zigzag-section--alt" : ""}${reverse ? " zigzag-section--reverse" : ""}`}
          >
            <div className="container zigzag-inner">
              <div className="zigzag-image">
                <OptimizedImage
                  src={image}
                  alt={section.imageAlt || section.heading || "Equilibrium"}
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="zigzag-content">
                {section.heading && (
                  <HeadingTag className="zigzag-heading">{section.heading}</HeadingTag>
                )}
                <PageRenderer blocks={section.blocks} />
              </div>
            </div>
          </section>
        );
      })}

      {showCta && (
        <section className="cta-band">
          <div className="container">
            <h2>Ready to book a session?</h2>
            <p>Patricia offers Kinesiology and Nutrition sessions online or in person.</p>
            <Link href={routePath("/bookings/")} className="btn-primary">
              Book a Session
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
