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
          Choose your service and a preferred date and time. Available slots are loaded
          from Patricia&apos;s Google Calendar in real time.
        </p>
        <BookingForm />
      </div>
    </>
  );
}
