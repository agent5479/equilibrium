export const PAGE_IMAGES: Record<string, string[]> = {
  "patricias-story": [
    "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
    "/assets/wp-content/uploads/2018/10/patricia-nutrition.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
    "/assets/wp-content/uploads/2021/07/Triangle.jpg",
  ],
  about: [
    "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
    "/assets/wp-content/uploads/2014/07/Salad-with-berries-710x375.jpg",
  ],
  nutrition: [
    "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
    "/assets/wp-content/uploads/2014/07/Salad-with-berries-710x375.jpg",
  ],
  "touch-for-health-kinesiology": [
    "/assets/wp-content/uploads/2018/10/tfh3.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
    "/assets/wp-content/uploads/2018/10/tfh4.jpg",
  ],
  "touch-for-health-kinesiology-course": [
    "/assets/wp-content/uploads/2021/09/IMG_2615r.jpg",
    "/assets/wp-content/uploads/2021/09/IMG20210727161555-2r.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
  ],
  "total-wellness-package-8-sessions-much-more": [
    "/assets/wp-content/uploads/2018/10/patricia-nutrition.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
  ],
  yoga: [
    "/assets/wp-content/uploads/2018/10/yoga-l-4.jpg",
    "/assets/wp-content/uploads/2018/10/yoga-l-3.jpg",
    "/assets/wp-content/uploads/2018/10/yoga-l-7.jpg",
  ],
  gallery: [
    "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
    "/assets/wp-content/uploads/2018/10/patricia-nutrition.jpg",
    "/assets/wp-content/uploads/2018/10/tfh2.jpg",
    "/assets/wp-content/uploads/2018/10/tfh3.jpg",
    "/assets/wp-content/uploads/2018/10/tfh4.jpg",
    "/assets/wp-content/uploads/2021/07/Triangle.jpg",
    "/assets/wp-content/uploads/2021/09/IMG_2615r.jpg",
    "/assets/wp-content/uploads/2021/09/IMG20210727161555-2r.jpg",
  ],
};

export const HERO_IMAGES: Record<string, string> = {
  "touch-for-health-kinesiology": "/assets/wp-content/uploads/2018/10/tfh3.jpg",
  "touch-for-health-kinesiology-course": "/assets/wp-content/uploads/2021/09/IMG_2615r.jpg",
  about: "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
  nutrition: "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
  "patricias-story": "/assets/wp-content/uploads/2021/06/Patricia-Smith-photo-1.jpg",
  yoga: "/assets/wp-content/uploads/2018/10/yoga-l-4.jpg",
  "total-wellness-package-8-sessions-much-more": "/assets/wp-content/uploads/2018/10/tfh2.jpg",
};

export function getPageImagePool(slug: string): string[] {
  const key = slug.replace(/__/g, "-").split("/").pop() || slug;
  if (PAGE_IMAGES[key]) return PAGE_IMAGES[key];
  if (key.startsWith("yoga")) return PAGE_IMAGES.yoga;
  return PAGE_IMAGES.about;
}

export function getHeroImage(slug: string): string | undefined {
  const key = slug.replace(/__/g, "-").split("/").pop() || slug;
  return HERO_IMAGES[key] || HERO_IMAGES[slug];
}
