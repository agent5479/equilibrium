import type { Metadata } from "next";
import {
  SITE_NAME,
  SITE_URL,
  SITE_OWNER,
  SITE_LOCALITY,
  SITE_REGION,
  SITE_COUNTRY,
  SITE_COUNTRY_CODE,
  SITE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
} from "./types";
import { assetUrl } from "./paths";

/** Takaka / Golden Bay Organics approximate coordinates for geo meta. */
export const SITE_GEO = {
  latitude: "-40.8587",
  longitude: "172.8060",
  placename: `${SITE_LOCALITY}, ${SITE_REGION}, ${SITE_COUNTRY}`,
  region: `NZ-${SITE_LOCALITY}`,
} as const;

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
    "Touch for Health Kinesiology and Nutrition with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand. Bring your whole being back into balance — live like you love yourself.",
  "/patricias-story/":
    "Meet Patricia Smith — Nutritionist (B.Sc.) and Touch for Health Kinesiology practitioner at Equilibrium in Takaka, Golden Bay, NZ. Yoga teaching (2009–2021) remains part of her background.",
  "/about/":
    "About Patricia Smith's nutrition approach at Equilibrium in Takaka, Golden Bay, New Zealand: real food, personalised advice, and kinesiology-guided support.",
  "/contact/":
    "Contact Patricia Smith at Equilibrium Kinesiology & Nutrition in Takaka, Golden Bay, NZ. Phone 021 991 989 — sessions at Golden Bay Organics or by private arrangement.",
  "/bookings/":
    "Book a free intro or Kinesiology / Nutrition session with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand. Or call 021 991 989.",
  "/testimonials/":
    "Client testimonials for Patricia Smith's Equilibrium practice in Takaka, Golden Bay, NZ — including reviews from her Yoga teaching years.",
  "/gallery/":
    "Photo gallery from Equilibrium Kinesiology & Nutrition with Patricia Smith in Takaka, Golden Bay, New Zealand.",
  "/nutrition/":
    "Nutrition services with Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ — real food for optimal results, supported by kinesiology muscle testing.",
  "/nutrition/services-and-fees/":
    "Nutrition and Kinesiology consultation fees with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand.",
  "/touch-for-health-kinesiology/":
    "Touch for Health Kinesiology with Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ — muscle testing to support vibrant health and balance.",
  "/touch-for-health-kinesiology-course/":
    "Learn Touch for Health Kinesiology with Patricia Smith in Takaka, Golden Bay, New Zealand. Level 1–2 workshops 28–31 August 2026.",
  "/total-wellness-package-8-sessions-much-more/":
    "Total Wellness Package with Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ — kinesiology, nutrition, and wellness.",
  "/yoga/":
    "Patricia Smith taught Yoga in Golden Bay, New Zealand from 2009 to 2021. How those years still inform her Equilibrium practice in Takaka.",
  "/yoga/benefits-of-yoga/":
    "From Patricia Smith's Yoga teaching years in Golden Bay, NZ — accessible practice for body, mind and wellbeing.",
  "/yoga/timetable-and-prices/":
    "Class notes and fees from Patricia Smith's Yoga teaching years in Golden Bay, New Zealand. Yoga classes are no longer offered.",
  "/yoga/corporate-yoga/":
    "From Patricia Smith's teaching years in Golden Bay, NZ — Yoga offered in workplace settings.",
  "/yoga/friendly-dos-for-yoga/":
    "Class etiquette from Patricia Smith's Yoga teaching practice in Golden Bay, New Zealand.",
  "/yoga/yoga-in-schools/":
    "From Patricia Smith's teaching years in Golden Bay, NZ — Yoga offered in schools.",
  "/yogapatricias-yoga-background/":
    "Patricia Smith's Yoga teacher training and the years she spent teaching in Golden Bay, New Zealand (2009–2021).",
  "/visionboard-workshops/":
    "Vision board workshops with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand.",
  "/local/":
    "Patricia Smith practises Touch for Health Kinesiology and Nutrition at Equilibrium in Takaka, Golden Bay, New Zealand (NZ).",
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
    title: { absolute: fullTitle },
    description: desc,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_OWNER, url: `${SITE_URL}/patricias-story/` }],
    creator: SITE_OWNER,
    publisher: SITE_NAME,
    other: {
      "geo.region": SITE_COUNTRY_CODE,
      "geo.placename": SITE_GEO.placename,
      "geo.position": `${SITE_GEO.latitude};${SITE_GEO.longitude}`,
      ICBM: `${SITE_GEO.latitude}, ${SITE_GEO.longitude}`,
    },
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
    alternateName: ["Equilibrium", "Equilibrium Takaka", "Patricia Smith Equilibrium"],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-NZ",
    keywords: SITE_KEYWORDS.join(", "),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#patricia-smith`,
    name: SITE_OWNER,
    jobTitle: "Nutritionist and Touch for Health Kinesiology Practitioner",
    url: `${SITE_URL}/patricias-story/`,
    image: `${SITE_URL}/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg`,
    email: "patricia@equilibriumhealth.nz",
    telephone: "+6421991989",
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_LOCALITY,
      addressRegion: SITE_REGION,
      addressCountry: SITE_COUNTRY_CODE,
    },
    knowsAbout: [
      "Touch for Health Kinesiology",
      "Nutrition",
      "Holistic health",
      "Yoga teaching (historical)",
    ],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    alternateName: "Equilibrium",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: "patricia@equilibriumhealth.nz",
    telephone: "+6421991989",
    image: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    logo: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    founder: { "@id": `${SITE_URL}/#patricia-smith` },
    employee: { "@id": `${SITE_URL}/#patricia-smith` },
    address: {
      "@type": "PostalAddress",
      streetAddress: "47 Commercial Street",
      addressLocality: SITE_LOCALITY,
      addressRegion: SITE_REGION,
      addressCountry: SITE_COUNTRY_CODE,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_GEO.latitude,
      longitude: SITE_GEO.longitude,
    },
    areaServed: [
      {
        "@type": "City",
        name: SITE_LOCALITY,
      },
      {
        "@type": "Place",
        name: SITE_REGION,
      },
      {
        "@type": "Country",
        name: SITE_COUNTRY,
      },
    ],
    priceRange: "$$",
    sameAs: ["https://www.facebook.com/equilibriumnutritionandyoga"],
    knowsAbout: [
      "Touch for Health Kinesiology",
      "Nutrition",
      "Holistic health",
      "Yoga teaching (historical)",
      SITE_OWNER,
      SITE_LOCALITY,
      SITE_REGION,
      SITE_COUNTRY,
    ],
    keywords: SITE_KEYWORDS.join(", "),
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
