import Link from "next/link";
import { routePath } from "@/lib/paths";

const PRICES = [
  { duration: "30 minutes", price: "$80" },
  { duration: "60 minutes", price: "$120" },
  { duration: "90 minutes", price: "$160" },
  { duration: "120 minutes", price: "$195" },
];

export default function PricingPage() {
  return (
    <div className="container content-section">
      <p>
        Prices are for individual sessions and are the same for Nutritional and
        Kinesiology consultations. Both modalities can be combined as needed in
        each session.
      </p>

      <div className="pricing-cards">
        {PRICES.map((p) => (
          <div key={p.duration} className="price-card">
            <h3>{p.duration}</h3>
            <p className="price-amount">{p.price}</p>
          </div>
        ))}
        <div className="price-card price-card--featured">
          <h3>Total Wellness Package</h3>
          <p className="price-amount">$975</p>
          <p>8 sessions — much more</p>
        </div>
      </div>

      <section className="cta-band">
        <Link href={routePath("/bookings/")} className="btn-primary">
          Book a Session
        </Link>
      </section>
    </div>
  );
}
