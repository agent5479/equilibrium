import BookingForm from "@/components/BookingForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Book a Session",
  description:
    "Book a Kinesiology or Nutrition session with Patricia Smith at Equilibrium Kinesiology & Nutrition.",
  path: "/bookings/",
});

export default function BookingsPage() {
  return (
    <div className="booking-page">
      <header className="booking-page-header">
        <div className="container">
          <h1>Book a Session</h1>
          <p className="booking-page-lead">
            Choose a service and a time that works for you — openings update from
            Patricia&apos;s calendar in real time.
          </p>
          <a className="booking-phone-cta" href="tel:+6421991989">
            Prefer to call? <strong>021 991 989</strong>
          </a>
        </div>
      </header>

      <div className="container content-section">
        <div className="booking-layout">
          <div className="booking-main">
            <BookingForm />
          </div>

          <aside className="booking-aside">
            <div className="booking-aside-block">
              <h2>Get in touch</h2>
              <p>
                <span className="booking-aside-label">Phone</span>
                <a href="tel:+6421991989">021 991 989</a>
              </p>
              <p>
                <span className="booking-aside-label">Email</span>
                <a href="mailto:patricia@equilibriumhealth.nz">
                  patricia@equilibriumhealth.nz
                </a>
              </p>
            </div>

            <div className="booking-aside-block">
              <h2>Where we meet</h2>
              <p>
                Sessions by arrangement — at the Golden Bay Organics back office
                (47 Commercial Street, Takaka), at a private location, or online.
              </p>
            </div>

            <div className="booking-aside-block">
              <h2>What happens next</h2>
              <p>
                Your request is added to Patricia&apos;s calendar. You&apos;ll
                receive a confirmation email, and she will follow up if anything
                needs adjusting.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
