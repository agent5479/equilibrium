import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import SectionBackground from "@/components/SectionBackground";
import { routePath } from "@/lib/paths";

const FOOD_SLIDESHOW = [
  "/assets/wp-content/uploads/2018/10/patricia-nutrition.jpg",
  "/assets/wp-content/uploads/2014/07/Ruby-Kraut-520x375.jpg",
  "/assets/wp-content/uploads/2016/03/nut-and-seed-cracker-710x375.jpg",
  "/assets/wp-content/uploads/2014/07/lunch-710x375.jpg",
  "/assets/wp-content/uploads/2014/07/Cabbage-patch-2-710x375.jpg",
  "/assets/wp-content/uploads/2014/07/Paleotakes5-chorizoquiche600x600_1-710x375.jpg",
  "/assets/wp-content/uploads/2014/07/Salad-with-berries-710x375.jpg",
  "/assets/wp-content/uploads/2016/04/Avocado-green-smoothie-620x375.jpg",
];

const TFH_IMAGES = [
  "/assets/wp-content/uploads/2018/10/tfh4.jpg",
  "/assets/wp-content/uploads/2018/10/tfh3.jpg",
  "/assets/wp-content/uploads/2018/10/tfh2.jpg",
  "/assets/wp-content/uploads/2018/10/tfh1.jpg",
];

export default function HomePage() {
  return (
    <>
      <SectionBackground
        image="/assets/wp-content/uploads/2014/07/shutterstock_125340167.jpg"
        overlayColor="#ffffff"
        overlayOpacity={0.5}
        minHeight="520px"
        className="home-section home-section--hero"
      >
        <div className="container home-hero-inner">
          <OptimizedImage
            src="/assets/wp-content/uploads/2023/02/logo.png"
            alt="Equilibrium Kinesiology & Nutrition"
            className="home-hero-logo"
            sizes="220px"
            priority
          />
          <div className="home-intro-grid">
            <div className="zigzag-image zigzag-image--compact">
              <OptimizedImage
                src="/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg"
                alt="Patricia Smith"
                sizes="(max-width: 768px) 100vw, 280px"
                priority
              />
            </div>
            <div className="home-intro-text">
              <h1>Welcome to Equilibrium</h1>
              <h3 className="home-tagline">Live Like You Love YourSelf</h3>
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
                Using Touch for Health Kinesiology and Nutrition to help you find your own
                true Equilibrium.
              </p>
              <p>
                Patricia is a qualified Nutritionist (B.Sc.) and a registered Touch for Health
                Kinesiology Practitioner. She also taught Yoga from 2009 to 2021 — that
                experience still informs her work today.{" "}
                <Link href={routePath("/yoga/")} className="home-quiet-link">
                  Yoga teaching years
                </Link>
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
          </div>
        </div>
      </SectionBackground>

      <SectionBackground
        image="/assets/wp-content/uploads/2014/07/fruit_bg.jpg"
        position="right bottom"
        size="55% auto"
        overlayColor="#fdf7f9"
        overlayOpacity={0.35}
        className="home-section home-section--nutrition"
      >
        <div className="container home-split">
          <div className="home-split-content">
            <h2 className="home-section-heading">Let&apos;s talk about food</h2>
            <p className="home-section-sub">Real food for OPTIMAL RESULTS</p>
            <h4>My approach to diet is about real food, about food that supports you on all levels</h4>
            <p>
              It is not a &ldquo;one diet for all&rdquo; solution, but a way of working with you
              to help you to choose and create food that feeds your body and soul. It is based on
              years of research combined with practical experience of raising a family in the 21st
              century and now strongly enhanced by Kinesiology.
            </p>
            <p>
              The big advantage that I can bring to your table (pun intended) and health outcome
              is muscle testing to find out what food is beneficial for you and what food
              isn&apos;t. And if we find any sensitivities (food or other sources) then there&apos;s
              a high chance that I can clear that sensitivity in one session for you. Yes, even
              allergies can be overcome!
            </p>
            <p>
              My advice is based on eating for optimal health and longevity by eating real and
              unprocessed food, taking in account your current health situation, your likes and
              dislikes and your lifestyle. When we work together we&apos;ll start from where you are
              at and work towards your goals in health and wellbeing, incorporating all the aspects
              that play a part in how you can achieve long lasting health.
            </p>
            <Link href={routePath("/nutrition/recipes/")} className="btn-primary">
              Browse Recipes
            </Link>
          </div>
          <div className="home-slideshow" aria-label="Recipe photos">
            {FOOD_SLIDESHOW.slice(0, 4).map((src) => (
              <OptimizedImage
                key={src}
                src={src}
                alt=""
                sizes="(max-width: 768px) 100vw, 240px"
              />
            ))}
          </div>
        </div>
      </SectionBackground>

      <section className="home-section home-section--tfh">
        <div className="container home-split home-split--reverse">
          <div className="home-slideshow home-slideshow--tfh" aria-label="Kinesiology photos">
            {TFH_IMAGES.map((src) => (
              <OptimizedImage key={src} src={src} alt="" sizes="(max-width: 768px) 100vw, 240px" />
            ))}
          </div>
          <div className="home-split-content">
            <h2 className="home-section-heading">Touch for Health Kinesiology</h2>
            <h4>
              What is health? It is not just the absence of disease, it is feeling at your best
              on all levels.
            </h4>
            <p>
              Disease takes months and years to develop. Wouldn&apos;t it be great to support your
              body in such a way that disease has no chance of even developing?
            </p>
            <p>
              With Touch for Health Kinesiology I have the tools to talk to your body, mind and
              emotions. I&apos;m creating the space and support for you to achieve optimum vibrant
              health. Our bodies are always talking to us, it&apos;s up to us to listen and act —
              Touch for Health Kinesiology enables us to listen and to take the right steps.
            </p>
            <p>
              I&apos;m also teaching all four levels of the TFH syllabus. You&apos;ll learn tools and
              techniques that will enable you to help yourself, your family, friends and your
              clients to achieve better health and happiness.
            </p>
            <Link href={routePath("/touch-for-health-kinesiology/")} className="btn-primary">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="offer-banner">
        <div className="container">
          <h2>Free 15-minute online sessions for new clients</h2>
          <p>
            A chance to find out if a longer session is right for you — no obligation.
            Prefer to talk first? Call Patricia on{" "}
            <a href="tel:+6421991989">021 991 989</a>.
          </p>
          <Link href={routePath("/bookings/")} className="btn-primary">
            Book your free session
          </Link>
        </div>
      </section>
    </>
  );
}
