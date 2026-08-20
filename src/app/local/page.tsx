import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import {
  SITE_NAME,
  SITE_OWNER,
  SITE_LOCALITY,
  SITE_REGION,
  SITE_COUNTRY,
  SITE_COUNTRY_CODE,
} from "@/lib/types";
import { routePath } from "@/lib/paths";
import { SUPPORT_TOPICS } from "@/components/WhoThisHelps";
import { BOOKING_SERVICES } from "@/lib/booking";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: `${SITE_OWNER} — ${SITE_NAME} | ${SITE_LOCALITY}, ${SITE_REGION}, ${SITE_COUNTRY_CODE}`,
  description: `${SITE_OWNER} practises Touch for Health Kinesiology and Nutrition at ${SITE_NAME} in ${SITE_LOCALITY}, ${SITE_REGION}, ${SITE_COUNTRY} (NZ). Book online or call 021 991 989.`,
  path: "/local/",
});

/**
 * Crawlable location / identity page for search discovery.
 * Linked from humans.txt, footer, and sitemap — not a primary nav item.
 */
export default function LocalPracticePage() {
  return (
    <article className="container" style={{ padding: "2.5rem 1.25rem 4rem", maxWidth: 720 }}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Local practice", path: "/local/" },
        ])}
      />
      <h1>
        {SITE_OWNER} — {SITE_NAME}
      </h1>
      <p style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
        Touch for Health Kinesiology and Nutrition in{" "}
        <strong>
          {SITE_LOCALITY}, {SITE_REGION}, {SITE_COUNTRY} (NZ)
        </strong>
        .
      </p>
      <p>
        {SITE_OWNER} is a qualified Nutritionist (B.Sc.) and a registered Touch for Health
        Kinesiology practitioner. Sessions are available by phone or{" "}
        <Link href={routePath("/bookings/")}>online booking</Link> — at Golden Bay Organics (47
        Commercial Street, {SITE_LOCALITY}) or by private arrangement, including online.
      </p>
      <ul>
        <li>
          <strong>Practitioner:</strong> {SITE_OWNER}
        </li>
        <li>
          <strong>Practice:</strong> {SITE_NAME} (Equilibrium)
        </li>
        <li>
          <strong>Location:</strong> {SITE_LOCALITY}, {SITE_REGION}, {SITE_COUNTRY} / NZ
        </li>
        <li>
          <strong>Address:</strong> Golden Bay Organics, 47 Commercial Street, {SITE_LOCALITY}
        </li>
        <li>
          <strong>Phone:</strong> <a href="tel:+6421991989">021 991 989</a>
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:patricia@equilibriumhealth.nz">patricia@equilibriumhealth.nz</a>
        </li>
      </ul>

      <h2>Active services</h2>
      <ul>
        <li>
          <Link href={routePath("/touch-for-health-kinesiology/")}>
            Touch for Health Kinesiology
          </Link>
        </li>
        <li>
          <Link href={routePath("/about/")}>Nutrition</Link>
        </li>
        <li>
          <Link href={routePath("/total-wellness-package-8-sessions-much-more/")}>
            Total Wellness Package
          </Link>
        </li>
        <li>
          <Link href={routePath("/touch-for-health-kinesiology-course/")}>
            Touch for Health Kinesiology Course
          </Link>
        </li>
        <li>
          <Link href={routePath("/nutrition/services-and-fees/")}>Sessions and cost</Link>
        </li>
      </ul>

      <h2>Session options</h2>
      <ul>
        {BOOKING_SERVICES.map((service) => (
          <li key={service.id}>
            {service.label} — {service.price}
          </li>
        ))}
      </ul>
      <p>
        <Link href={routePath("/bookings/")}>Book online</Link>
      </p>

      <h2>Who this helps</h2>
      <ul>
        {SUPPORT_TOPICS.map((topic) => (
          <li key={topic.href}>
            <Link href={routePath(topic.href)}>{topic.title}</Link> — {topic.blurb}
          </li>
        ))}
      </ul>
      <p>
        <Link href={routePath("/support/")}>All support topics</Link>
      </p>

      <p>
        <Link href={routePath("/patricias-story/")}>Patricia&apos;s story</Link>
        {" · "}
        <Link href={routePath("/contact/")}>Contact</Link>
        {" · "}
        <Link href={routePath("/bookings/")}>Book a session</Link>
        {" · "}
        <Link href={routePath("/")}>Home</Link>
      </p>
    </article>
  );
}
