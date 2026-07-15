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
    <>
      <div className="page-title-bar">
        <div className="container">
          <h1>Book a Session</h1>
        </div>
      </div>
      <div className="container content-section">
        <p>
          Prefer to arrange by phone? Call Patricia on{" "}
          <a href="tel:+6421991989">
            <strong>021 991 989</strong>
          </a>
          . Sessions meet by arrangement — at the Golden Bay Organics back office
          (47 Commercial Street, Takaka), at a private location, or online.
        </p>
        <p>
          Or choose your service and a preferred date and time below. Available slots
          are loaded from Patricia&apos;s Google Calendar in real time.
        </p>
        <BookingForm />
      </div>
    </>
  );
}
