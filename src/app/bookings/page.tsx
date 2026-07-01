import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Bookings",
  description: "Book a session with Patricia Smith at Equilibrium Kinesiology & Nutrition.",
  path: "/bookings/",
});

export default function BookingsPage() {
  return (
    <div className="container content-section">
      <h1>Bookings</h1>
      <p>
        Online booking is coming soon. This page will connect to Patricia&apos;s Google Calendar
        for availability and appointment scheduling.
      </p>
      <p>
        In the meantime, please{" "}
        <Link href="/contact/">contact Patricia</Link> directly by phone or email.
      </p>
    </div>
  );
}
