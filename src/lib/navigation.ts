export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: "Patricia's Story", href: "/patricias-story/" },
  {
    label: "Services",
    children: [
      {
        label: "Yoga",
        children: [
          { label: "Corporate Yoga", href: "/yoga/corporate-yoga/" },
          { label: "Friendly Do's for Yoga", href: "/yoga/friendly-dos-for-yoga/" },
          { label: "Timetable and Prices", href: "/yoga/timetable-and-prices/" },
          { label: "Benefits of Yoga", href: "/yoga/benefits-of-yoga/" },
          { label: "Yoga in Schools", href: "/yoga/yoga-in-schools/" },
        ],
      },
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
