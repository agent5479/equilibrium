import Link from "next/link";
import { routePath } from "@/lib/paths";

export const SUPPORT_TOPICS = [
  {
    href: "/support/food-intolerances/",
    title: "Food intolerances",
    blurb: "Muscle testing to identify intolerances and suitable supplements.",
  },
  {
    href: "/support/adrenal-fatigue/",
    title: "Adrenal fatigue",
    blurb: "Kinesiology and nutrition support when energy and stress feel stuck.",
  },
  {
    href: "/support/migraines-and-energy/",
    title: "Migraines and energy",
    blurb: "Practical nutrition pathways for migraines and low energy.",
  },
  {
    href: "/support/metabolic-balance/",
    title: "Metabolic balance",
    blurb: "Food-led support for metabolic and post-menopause balance.",
  },
] as const;

export default function WhoThisHelps({ compact = false }: { compact?: boolean }) {
  return (
    <section className="who-this-helps" aria-labelledby="who-this-helps-heading">
      <div className={compact ? undefined : "container"}>
        <h2 id="who-this-helps-heading">Who this helps</h2>
        <p>
          Clients often come to Equilibrium in Takaka for these kinds of support — each page
          describes how Patricia works with kinesiology and nutrition.
        </p>
        <ul className="who-this-helps-list">
          {SUPPORT_TOPICS.map((topic) => (
            <li key={topic.href}>
              <Link href={routePath(topic.href)}>
                <strong>{topic.title}</strong>
                {!compact && <> — {topic.blurb}</>}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href={routePath("/support/")}>See all support topics</Link>
          {" · "}
          <Link href={routePath("/bookings/")}>Book a session</Link>
        </p>
      </div>
    </section>
  );
}
