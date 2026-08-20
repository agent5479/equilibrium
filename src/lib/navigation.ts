export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Patricia's Story",
    children: [
      { label: "Her story", href: "/patricias-story/" },
      { label: "Yoga teaching years", href: "/yoga/" },
    ],
  },
  {
    label: "Services",
    children: [
      {
        label: "Touch for Health Kinesiology",
        href: "/touch-for-health-kinesiology/",
      },
      {
        label: "Nutrition",
        href: "/about/",
      },
      {
        label: "Who this helps",
        href: "/support/",
      },
      {
        label: "Food intolerances",
        href: "/support/food-intolerances/",
      },
      {
        label: "Adrenal fatigue",
        href: "/support/adrenal-fatigue/",
      },
      {
        label: "Migraines and energy",
        href: "/support/migraines-and-energy/",
      },
      {
        label: "Metabolic balance",
        href: "/support/metabolic-balance/",
      },
    ],
  },
  {
    label: "Total Wellness Package",
    href: "/total-wellness-package-8-sessions-much-more/",
  },
  {
    label: "Events/Courses",
    children: [
      {
        label: "Touch For Health Kinesiology Course",
        href: "/touch-for-health-kinesiology-course/",
      },
    ],
  },
  { label: "Gallery", href: "/gallery/" },
  { label: "Testimonials", href: "/testimonials/" },
  { label: "Book a Session", href: "/bookings/" },
  { label: "Contact", href: "/contact/" },
];
