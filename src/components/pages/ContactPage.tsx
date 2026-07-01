import ContactForms from "@/components/ContactForms";
import Link from "next/link";
import { routePath } from "@/lib/paths";

export default function ContactPage() {
  return (
    <div className="container content-section">
      <p>
        Prefer to book online?{" "}
        <Link href={routePath("/bookings/")}>Book a session here</Link>.
      </p>

      <div className="contact-layout">
        <ContactForms />

        <aside className="contact-sidebar">
          <div className="contact-info-card">
            <h3>Patricia</h3>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+6421991989">021 991 989</a>
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:goldenbayorganicstakaka@gmail.com">
                goldenbayorganicstakaka@gmail.com
              </a>
            </p>
            <p>
              Touch for Health Kinesiology and Nutrition — online or in person.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
