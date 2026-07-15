import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION } from "./types";
import { assetUrl } from "./paths";

interface MetaInput {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
}

/** Fallback SEO blurbs when a page has no scraped meta description. */
const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/":
    "Touch for Health Kinesiology and Nutrition with Patricia Smith in Golden Bay, New Zealand. Bring your whole being back into balance — live like you love yourself.",
  "/patricias-story/":
    "Meet Patricia Smith — Nutritionist (B.Sc.) and Touch for Health Kinesiology practitioner in Golden Bay. Yoga teaching (2009–2021) remains part of her background.",
  "/about/":
    "About Patricia's nutrition approach: real food, personalised advice, and kinesiology-guided support for optimal health.",
  "/contact/":
    "Contact Patricia Smith at Equilibrium Kinesiology & Nutrition. Phone 021 991 989 — sessions at Golden Bay Organics, Takaka, or by private arrangement.",
  "/bookings/":
    "Book a free intro or Kinesiology / Nutrition session with Patricia Smith. Real-time calendar availability. Or call 021 991 989.",
  "/testimonials/":
    "Client testimonials for Patricia Smith's Kinesiology and Nutrition practice — including reviews from her Yoga teaching years.",
  "/gallery/":
    "Photo gallery from Equilibrium Kinesiology & Nutrition — workshops, sessions, and practice history with Patricia Smith.",
  "/nutrition/":
    "Nutrition services with Patricia Smith — real food for optimal results, supported by kinesiology muscle testing.",
  "/nutrition/recipes/":
    "Grain free, sugar free recipes full of goodness from Equilibrium Kinesiology & Nutrition.",
  "/nutrition/services-and-fees/":
    "Nutrition and Kinesiology consultation fees and session options with Patricia Smith at Equilibrium.",
  "/nutrition/tips-on-nutrition/":
    "Practical nutrition tips from Patricia Smith at Equilibrium Kinesiology & Nutrition.",
  "/touch-for-health-kinesiology/":
    "Touch for Health Kinesiology with Patricia Smith — muscle testing to support vibrant health and balance.",
  "/touch-for-health-kinesiology-course/":
    "Learn Touch for Health Kinesiology with Patricia Smith. Course levels, dates, and fees.",
  "/total-wellness-package-8-sessions-much-more/":
    "Total Wellness Package — an integrated programme of kinesiology, nutrition, and wellness with Patricia Smith.",
  "/yoga/":
    "Archive of Patricia Smith's Yoga teaching (2009–2021). She now practices Touch for Health Kinesiology and Nutrition.",
  "/yoga/benefits-of-yoga/":
    "Archive: benefits of Yoga from Patricia Smith's teaching years (2009–2021).",
  "/yoga/timetable-and-prices/":
    "Archive: historical Yoga timetable and prices. Yoga classes are no longer offered.",
  "/yoga/corporate-yoga/":
    "Archive: Corporate Yoga offerings from Patricia Smith's teaching years.",
  "/yoga/friendly-dos-for-yoga/":
    "Archive: friendly do's for Yoga from Patricia Smith's teaching years.",
  "/yoga/yoga-in-schools/":
    "Archive: Yoga in schools from Patricia Smith's teaching years.",
  "/yogapatricias-yoga-background/":
    "Patricia Smith's Yoga teacher training and teaching background (2009–2021).",
  "/visionboard-workshops/":
    "Vision board workshops with Patricia Smith at Equilibrium Kinesiology & Nutrition.",
};

export function resolveDescription(path: string, description?: string): string {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  return PAGE_DESCRIPTIONS[path] || DEFAULT_DESCRIPTION;
}

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  type = "website",
}: MetaInput): Metadata {
  const fullTitle = title.includes("Equilibrium") ? title : `${title} – ${SITE_NAME}`;
  const desc = resolveDescription(path, description);
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;
  const image = assetUrl(ogImage) || DEFAULT_OG_IMAGE;
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description: desc,
    keywords: [
      "kinesiology",
      "nutrition",
      "Touch for Health",
      "Patricia Smith",
      "Equilibrium",
      "Golden Bay",
      "Takaka",
      "New Zealand",
      "holistic health",
    ],
    authors: [{ name: "Patricia Smith" }],
    creator: "Patricia Smith",
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: title }],
      locale: "en_NZ",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [absoluteImage],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-NZ",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: "goldenbayorganicstakaka@gmail.com",
    telephone: "+6421991989",
    image: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    logo: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "47 Commercial Street",
      addressLocality: "Takaka",
      addressRegion: "Golden Bay",
      addressCountry: "NZ",
    },
    areaServed: [
      {
        "@type": "Place",
        name: "Golden Bay",
      },
      {
        "@type": "Country",
        name: "New Zealand",
      },
    ],
    priceRange: "$$",
    sameAs: ["https://www.facebook.com/equilibriumnutritionandyoga"],
    knowsAbout: [
      "Touch for Health Kinesiology",
      "Nutrition",
      "Holistic health",
      "Yoga teaching (historical)",
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${item.path}`,
    })),
  };
}
