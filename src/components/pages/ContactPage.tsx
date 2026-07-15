import ContactForms from "@/components/ContactForms";
import Link from "next/link";
import { routePath } from "@/lib/paths";

/** Golden Bay Organics — 47 Commercial St, Takaka (~40.8587°S, 172.8060°E) */
const OSM_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=172.8010%2C-40.8620%2C172.8110%2C-40.8555&layer=mapnik&marker=-40.8587%2C172.8060";
const OSM_LINK =
  "https://www.openstreetmap.org/?mlat=-40.8587&mlon=172.8060#map=17/-40.8587/172.8060";

export default function ContactPage() {
  return (
    <div className="container content-section">
      <p className="contact-phone-lead">
        Prefer to book by phone? Call Patricia on{" "}
        <a href="tel:+6421991989">
          <strong>021 991 989</strong>
        </a>
        . You can also{" "}
        <Link href={routePath("/bookings/")}>book a session online</Link>.
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
            <p>
              <strong>Storefront:</strong> Golden Bay Organics
              <br />
              47 Commercial Street, Takaka
            </p>
            <p>
              Sessions by arrangement — in the shop back office, at a private
              location, or online.
            </p>
          </div>

          <div className="contact-map">
            <iframe
              title="Map of Golden Bay Organics, 47 Commercial Street, Takaka"
              src={OSM_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="contact-map-link"
              href={OSM_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open map — 47 Commercial St, Takaka
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
