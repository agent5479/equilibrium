import Link from "next/link";
import type { PageData } from "@/lib/types";
import { parseTestimonials } from "@/lib/parse-content";
import { routePath } from "@/lib/paths";

export default function TestimonialsPage({ page }: { page: PageData }) {
  const testimonials = parseTestimonials(page.blocks);

  return (
    <div className="testimonials-page">
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <article key={i} className="testimonial-card">
            <span className="testimonial-quote-mark">&ldquo;</span>
            {t.category && <span className="testimonial-category">{t.category}</span>}
            <p className="testimonial-text">{t.quote}</p>
            {t.attribution && (
              <footer className="testimonial-attribution">— {t.attribution}</footer>
            )}
          </article>
        ))}
      </div>

      <section className="cta-band">
        <div className="container">
          <h2>Ready to start your own journey?</h2>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book a Session
          </Link>
        </div>
      </section>
    </div>
  );
}
