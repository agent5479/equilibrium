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
