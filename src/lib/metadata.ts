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
  type RecipeData,
  type TestimonialEntry,
} from "./types";
import { assetUrl } from "./paths";
import { BOOKING_SERVICES } from "./booking";
import { enrichRecipeEntry } from "./recipe-meta";

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
    "Touch for Health Kinesiology and Nutrition with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand (NZ). Book by phone or online — sessions at Golden Bay Organics or by private arrangement.",
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
  "/nutrition/recipes/":
    "Healthy recipes from Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand — real-food ideas from her nutrition practice.",
  "/nutrition/tips-on-nutrition/":
    "Nutrition tips from Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand — practical real-food guidance.",
  "/touch-for-health-kinesiology/":
    "Touch for Health Kinesiology with Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ — muscle testing to support vibrant health and balance.",
  "/touch-for-health-kinesiology-course/":
    "Learn Touch for Health Kinesiology with Patricia Smith in Takaka, Golden Bay, New Zealand. Level 1–2 workshops 28–31 August 2026.",
  "/total-wellness-package-8-sessions-much-more/":
    "Total Wellness Package with Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ — kinesiology, nutrition, and wellness.",
  "/yoga/":
    "Historical overview: Patricia Smith taught Yoga in Golden Bay, New Zealand from 2009 to 2021. Classes are no longer offered — her Equilibrium practice in Takaka is kinesiology and nutrition.",
  "/yoga/benefits-of-yoga/":
    "Historical notes from Patricia Smith's Yoga teaching years (2009–2021) in Golden Bay, NZ. Yoga classes are no longer offered.",
  "/yoga/timetable-and-prices/":
    "Archived class notes and fees from Patricia Smith's Yoga teaching years in Golden Bay, New Zealand. Yoga classes ended in 2021 and are no longer offered.",
  "/yoga/corporate-yoga/":
    "Historical notes: Yoga in workplace settings from Patricia Smith's teaching years in Golden Bay, NZ (2009–2021). Classes are no longer offered.",
  "/yoga/friendly-dos-for-yoga/":
    "Historical class etiquette from Patricia Smith's Yoga teaching practice in Golden Bay, New Zealand (2009–2021).",
  "/yoga/yoga-in-schools/":
    "Historical notes: Yoga in schools from Patricia Smith's teaching years in Golden Bay, NZ (2009–2021). Classes are no longer offered.",
  "/yogapatricias-yoga-background/":
    "Patricia Smith's Yoga teacher training and the years she spent teaching in Golden Bay, New Zealand (2009–2021). Historical background — classes are no longer offered.",
  "/visionboard-workshops/":
    "Vision board workshops with Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand.",
  "/local/":
    "Patricia Smith practises Touch for Health Kinesiology and Nutrition at Equilibrium in Takaka, Golden Bay, New Zealand (NZ).",
  "/support/":
    "How Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ supports food intolerances, adrenal fatigue, migraines, and metabolic balance with kinesiology and nutrition.",
  "/support/food-intolerances/":
    "Food intolerances and supplement matching with Touch for Health muscle testing — Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ.",
  "/support/adrenal-fatigue/":
    "Adrenal fatigue support with Touch for Health Kinesiology and Nutrition — Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ.",
  "/support/migraines-and-energy/":
    "Migraines and low energy support through nutrition and kinesiology — Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ.",
  "/support/metabolic-balance/":
    "Metabolic balance, post-menopause nutrition, and inflammation support — Patricia Smith at Equilibrium in Takaka, Golden Bay, NZ.",
};

/** Build a locality-aware description for recipe or category pages when scraped meta is empty. */
export function descriptionForContent(
  pagePath: string,
  content: {
    type: string;
    title: string;
    metaDescription?: string;
    description?: string;
  }
): string {
  const fromMeta = content.metaDescription?.trim();
  if (fromMeta) return fromMeta;

  if (content.type === "recipe") {
    const body = content.description?.trim();
    const base = body
      ? body.length > 140
        ? `${body.slice(0, 137).trim()}…`
        : body
      : `${content.title} — a recipe from Patricia Smith at Equilibrium.`;
    return `${base} Recipe by Patricia Smith, Equilibrium, Takaka, Golden Bay, NZ.`;
  }

  if (content.type === "recipe-category") {
    return `${content.title} recipes from Patricia Smith at Equilibrium in Takaka, Golden Bay, New Zealand.`;
  }

  return resolveDescription(pagePath, undefined);
}

export function resolveDescription(path: string, description?: string): string {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  return PAGE_DESCRIPTIONS[path] || DEFAULT_DESCRIPTION;
}

/** Build a search-optimised document title with brand + local cues when missing. */
export function formatPageTitle(title: string): string {
  const hasBrand = /Equilibrium/i.test(title);
  const hasPerson = /Patricia Smith/i.test(title);
  const hasLocation = /Takaka|Golden Bay|\bNew Zealand\b|\bNZ\b/i.test(title);

  let full = title.trim();
  if (!hasBrand) full = `${full} – ${SITE_NAME}`;
  if (full === SITE_NAME || (hasBrand && !hasPerson && !hasLocation)) {
    full = `${SITE_NAME} — ${SITE_OWNER} | ${SITE_LOCALITY}, ${SITE_REGION}, NZ`;
  } else if (!hasLocation) {
    full = `${full} | ${SITE_LOCALITY}, NZ`;
  }
  return full;
}

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  type = "website",
}: MetaInput): Metadata {
  const fullTitle = formatPageTitle(title);
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parsePriceToNumber(price: string): number | undefined {
  if (/free/i.test(price)) return 0;
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function areaServedNodes() {
  return [
    { "@type": "City", name: SITE_LOCALITY },
    { "@type": "Place", name: SITE_REGION },
    { "@type": "Country", name: SITE_COUNTRY },
  ];
}

/** Offers for Discovery call + paid sessions from booking config. */
export function bookingOfferNodes() {
  return BOOKING_SERVICES.map((service) => {
    const amount = parsePriceToNumber(service.price);
    return {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-${service.id}`,
      name: service.label,
      url: `${SITE_URL}/bookings/`,
      priceCurrency: "NZD",
      ...(amount !== undefined ? { price: String(amount) } : {}),
      availability: "https://schema.org/InStock",
      areaServed: areaServedNodes(),
      seller: { "@id": `${SITE_URL}/#business` },
    };
  });
}

const PACKAGE_OFFER = {
  "@type": "Offer",
  "@id": `${SITE_URL}/#offer-total-wellness`,
  name: "Total Wellness Package",
  url: `${SITE_URL}/total-wellness-package-8-sessions-much-more/`,
  price: "975",
  priceCurrency: "NZD",
  availability: "https://schema.org/InStock",
  areaServed: areaServedNodes(),
  seller: { "@id": `${SITE_URL}/#business` },
};

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
      "Food intolerances",
      "Adrenal fatigue support",
      "Yoga teaching (historical)",
    ],
  };
}

export function reviewNodes(testimonials: TestimonialEntry[]) {
  return testimonials.map((t, index) => ({
    "@type": "Review",
    "@id": `${SITE_URL}/testimonials/#review-${index + 1}`,
    author: {
      "@type": "Person",
      name: t.name,
    },
    reviewBody: stripHtml(t.quote).slice(0, 5000),
    itemReviewed: { "@id": `${SITE_URL}/#business` },
  }));
}

export function reviewsJsonLd(testimonials: TestimonialEntry[]) {
  return {
    "@context": "https://schema.org",
    "@graph": reviewNodes(testimonials),
  };
}

export function localBusinessJsonLd(testimonials?: TestimonialEntry[]) {
  const offers = [...bookingOfferNodes(), PACKAGE_OFFER];
  const reviews = testimonials ? reviewNodes(testimonials) : [];

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
    areaServed: areaServedNodes(),
    priceRange: "$$",
    sameAs: ["https://www.facebook.com/equilibriumnutritionandyoga"],
    makesOffer: offers,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kinesiology and Nutrition sessions",
      itemListElement: offers.map((offer, position) => ({
        "@type": "OfferCatalog",
        position: position + 1,
        itemOffered: offer,
      })),
    },
    ...(reviews.length > 0 ? { review: reviews } : {}),
    knowsAbout: [
      "Touch for Health Kinesiology",
      "Nutrition",
      "Holistic health",
      "Food intolerances",
      "Adrenal fatigue",
      "Migraines and energy",
      "Metabolic balance",
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
      item: item.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${item.path.endsWith("/") ? item.path : `${item.path}/`}`,
    })),
  };
}

export interface ServiceJsonLdInput {
  name: string;
  description: string;
  path: string;
  /** Schema.org service type id fragment, e.g. kinesiology */
  id: string;
  offers?: ReturnType<typeof bookingOfferNodes>;
}

export function serviceJsonLd({
  name,
  description,
  path,
  id,
  offers,
}: ServiceJsonLdInput) {
  const url = `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${id}`,
    name,
    description,
    url,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: areaServedNodes(),
    ...(offers && offers.length > 0 ? { offers } : {}),
  };
}

/** Named services for key practice pages. */
export function practiceServiceJsonLd(pagePath: string) {
  const offers = bookingOfferNodes();
  if (pagePath === "/touch-for-health-kinesiology/") {
    return serviceJsonLd({
      id: "kinesiology",
      name: "Touch for Health Kinesiology",
      description: resolveDescription(pagePath),
      path: pagePath,
      offers,
    });
  }
  if (pagePath === "/about/" || pagePath === "/nutrition/") {
    return serviceJsonLd({
      id: "nutrition",
      name: "Nutrition consultation",
      description: resolveDescription(pagePath),
      path: pagePath,
      offers,
    });
  }
  if (pagePath === "/total-wellness-package-8-sessions-much-more/") {
    return serviceJsonLd({
      id: "total-wellness",
      name: "Total Wellness Package",
      description: resolveDescription(pagePath),
      path: pagePath,
      offers: [PACKAGE_OFFER],
    });
  }
  if (pagePath === "/touch-for-health-kinesiology-course/") {
    return serviceJsonLd({
      id: "tfh-course",
      name: "Touch for Health Kinesiology Course",
      description: resolveDescription(pagePath),
      path: pagePath,
    });
  }
  if (pagePath === "/nutrition/services-and-fees/") {
    return serviceJsonLd({
      id: "sessions",
      name: "Kinesiology and Nutrition sessions",
      description: resolveDescription(pagePath),
      path: pagePath,
      offers: [...offers, PACKAGE_OFFER],
    });
  }
  if (pagePath.startsWith("/support/") && pagePath !== "/support/") {
    const titles: Record<string, string> = {
      "/support/food-intolerances/": "Food intolerances support",
      "/support/adrenal-fatigue/": "Adrenal fatigue support",
      "/support/migraines-and-energy/": "Migraines and energy support",
      "/support/metabolic-balance/": "Metabolic balance support",
    };
    return serviceJsonLd({
      id: pagePath.replace(/^\/support\/|\/$/g, "").replace(/\//g, "-"),
      name: titles[pagePath] || "Support",
      description: resolveDescription(pagePath),
      path: pagePath,
      offers,
    });
  }
  return null;
}

function htmlListItems(html: string): string[] {
  const items: string[] = [];
  const liMatches = html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  for (const match of liMatches) {
    const text = stripHtml(match[1]);
    if (text) items.push(text);
  }
  if (items.length > 0) return items;

  const amountName = html.matchAll(
    /<span class="amount">([\s\S]*?)<\/span>\s*<span class="name">([\s\S]*?)<\/span>/gi
  );
  for (const match of amountName) {
    const text = `${stripHtml(match[1])} ${stripHtml(match[2])}`.trim();
    if (text) items.push(text);
  }
  if (items.length > 0) return items;

  return stripHtml(html)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function recipeIngredientsFromData(recipe: RecipeData): string[] {
  if (recipe.ingredients?.trim()) {
    return htmlListItems(recipe.ingredients);
  }
  const items: string[] = [];
  let inIngredients = false;
  for (const block of recipe.blocks) {
    if (block.type === "heading" && block.text) {
      const t = block.text.toLowerCase();
      if (t === "ingredients") {
        inIngredients = true;
        continue;
      }
      if (t === "directions" || t === "instructions") break;
    }
    if (!inIngredients) continue;
    if (block.type === "paragraph" && block.html) {
      const text = stripHtml(block.html);
      if (text) items.push(text);
    }
    if (block.type === "list" && block.items) {
      items.push(...block.items.map((i) => stripHtml(i)).filter(Boolean));
    }
  }
  return items;
}

function recipeInstructionsFromData(recipe: RecipeData): object[] {
  const steps: string[] = [];
  if (recipe.directions?.trim()) {
    steps.push(...htmlListItems(recipe.directions));
  } else {
    let inDirections = false;
    for (const block of recipe.blocks) {
      if (block.type === "heading" && block.text) {
        const t = block.text.toLowerCase();
        if (t === "directions" || t === "instructions") {
          inDirections = true;
          continue;
        }
        if (inDirections && (t.includes("archives") || t.includes("available"))) break;
      }
      if (!inDirections) continue;
      if (block.type === "paragraph" && block.html) {
        const text = stripHtml(block.html);
        if (text && !text.toLowerCase().includes("no blog posts")) steps.push(text);
      }
      if (block.type === "list" && block.items) {
        steps.push(...block.items.map((i) => stripHtml(i)).filter(Boolean));
      }
    }
  }
  return steps.map((text, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text,
  }));
}

function toIsoDuration(label?: string): string | undefined {
  if (!label) return undefined;
  const hours = label.match(/(\d+)\s*h/i);
  const mins = label.match(/(\d+)\s*m/i);
  if (!hours && !mins) {
    const bare = label.match(/^(\d+)\s*min/i);
    if (bare) return `PT${bare[1]}M`;
    return undefined;
  }
  let out = "PT";
  if (hours) out += `${hours[1]}H`;
  if (mins) out += `${mins[1]}M`;
  return out === "PT" ? undefined : out;
}

export function recipeJsonLd(recipe: RecipeData) {
  const meta = enrichRecipeEntry(recipe);
  const imagePath = recipe.heroImage || recipe.ogImage || DEFAULT_OG_IMAGE;
  const absoluteImage = imagePath.startsWith("http")
    ? imagePath
    : `${SITE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  const ingredients = recipeIngredientsFromData(recipe);
  const instructions = recipeInstructionsFromData(recipe);
  const path = recipe.path.endsWith("/") ? recipe.path : `${recipe.path}/`;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${SITE_URL}${path}#recipe`,
    name: recipe.title,
    description: meta.description || resolveDescription(path, recipe.metaDescription),
    image: [absoluteImage],
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#patricia-smith`,
      name: SITE_OWNER,
    },
    datePublished: meta.date,
    prepTime: toIsoDuration(meta.prepTime),
    cookTime: toIsoDuration(meta.cookTime),
    recipeYield: meta.yields,
    recipeIngredient: ingredients.length > 0 ? ingredients : undefined,
    recipeInstructions: instructions.length > 0 ? instructions : undefined,
    keywords: recipe.categoryNames.join(", ") || undefined,
  };
}
