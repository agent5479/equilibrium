import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { routePath } from "@/lib/paths";

const SERVICES = [
  {
    title: "Touch for Health Kinesiology",
    description: "Muscle testing to find what your body needs for balance and vibrant health.",
    image: "/assets/wp-content/uploads/2018/10/tfh2.jpg",
    href: "/touch-for-health-kinesiology/",
  },
  {
    title: "Nutrition",
    description: "Real food, personalised advice — grain free, natural, and full of goodness.",
    image: "/assets/wp-content/uploads/2018/10/patricia-nutrition.jpg",
    href: "/about/",
  },
  {
    title: "Yoga",
    description: "Accessible Hatha-based practice for body, mind and soul.",
    image: "/assets/wp-content/uploads/2021/07/Triangle.jpg",
    href: "/yoga/benefits-of-yoga/",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <OptimizedImage
            src="/assets/wp-content/uploads/2023/02/logo.png"
            alt="Equilibrium Kinesiology & Nutrition"
            className="home-hero-logo"
            sizes="320px"
            priority
          />
          <h1 className="home-tagline">Live Like You Love YourSelf</h1>
          <p className="home-hero-sub">
            Kinesiology, Nutrition, and Yoga with Patricia Smith
          </p>
          <div className="home-hero-actions">
            <Link href={routePath("/bookings/")} className="btn-primary">
              Book a free intro session
            </Link>
            <Link href={routePath("/contact/")} className="btn-secondary">
              Contact Patricia
            </Link>
          </div>
        </div>
      </section>

      <section className="zigzag-section zigzag-section--intro">
        <div className="container zigzag-inner">
          <div className="zigzag-image zigzag-image--compact">
            <OptimizedImage
              src="/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg"
              alt="Patricia Smith"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          </div>
          <div className="zigzag-content">
            <h2>Welcome to Equilibrium</h2>
            <p>
              MY OFFER FOR NEW CLIENTS: I&apos;m offering free 15-minute online sessions
              to support you in those challenging times. 15 minutes to find out if you
              would like to book a longer session.
            </p>
            <p>
              My mission is to help you to bring your whole being back into balance —
              and with that experience vibrant health and happiness!
            </p>
            <p>
              Using Touch for Health Kinesiology, Nutrition, and Yoga to help you to
              find your own true Equilibrium.
            </p>
            <p>
              Patricia is a qualified Nutritionist (B.Sc.), a registered Touch for Health
              Kinesiology Practitioner, and a Yoga Teacher.
            </p>
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="container">
          <h2 className="section-title">How Patricia can help</h2>
          <div className="service-card-grid">
            {SERVICES.map((service) => (
              <Link
                key={service.href}
                href={routePath(service.href)}
                className="service-card"
              >
                <div className="service-card-image">
                  <OptimizedImage
                    src={service.image}
                    alt={service.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="service-card-overlay">
                    <h3>{service.title}</h3>
                  </div>
                </div>
                <p>{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="offer-banner">
        <div className="container">
          <h2>Free 15-minute online sessions for new clients</h2>
          <p>
            A chance to find out if a longer session is right for you — no obligation.
          </p>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book your free session
          </Link>
        </div>
      </section>
    </>
  );
}
