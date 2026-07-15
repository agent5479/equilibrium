import type { TestimonialEntry } from "@/lib/types";

function quoteParagraphs(quote: string): string[] {
  return quote
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function TestimonialsPage({
  testimonials,
}: {
  testimonials: TestimonialEntry[];
}) {
  return (
    <div className="testimonials-page">
      <div className="container">
        <p className="testimonials-intro">
          Includes clients from Patricia&apos;s Yoga teaching years as well as Nutrition and
          Kinesiology — kept here as a record of the practice and reputation she has built.
        </p>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <article key={t.name} className="testimonial-card">
              <div className="testimonial-content">
                {quoteParagraphs(t.quote).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <footer className="testimonial-meta">
                <strong className="testimonial-name">{t.name}</strong>
                {t.category && (
                  <span className="testimonial-category">{t.category}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
