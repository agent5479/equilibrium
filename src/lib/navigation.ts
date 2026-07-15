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
        label: "Nutrition",
        children: [
          { label: "About", href: "/about/" },
          { label: "Recipes", href: "/nutrition/recipes/" },
          { label: "Tips on Nutrition", href: "/nutrition/tips-on-nutrition/" },
          { label: "Sessions and cost", href: "/nutrition/services-and-fees/" },
        ],
      },
      {
        label: "Touch for Health Kinesiology",
        href: "/touch-for-health-kinesiology/",
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
