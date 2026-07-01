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

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  type = "website",
}: MetaInput): Metadata {
  const fullTitle = title.includes("Equilibrium") ? title : `${title} – ${SITE_NAME}`;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const image = assetUrl(ogImage) || DEFAULT_OG_IMAGE;
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL.replace(/\/equilibrium$/, "")}${image}`;

  return {
    title: fullTitle,
    description: desc,
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

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: "patricia@equilibrium.kiwi.nz",
    telephone: "+6421991989",
    image: `${SITE_URL}/assets/wp-content/uploads/2023/02/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NZ",
    },
    sameAs: ["https://www.facebook.com/equilibriumnutritionandyoga"],
  };
}
