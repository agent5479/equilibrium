# SEO off-site checklist

Companion checklist for [equilibriumhealth.nz](https://equilibriumhealth.nz/). On-site schema, support pages, and crawl signals are handled in the repo; these items need Patricia / DNS / Google accounts.

## 1. Google Business Profile (GBP)

- [ ] Business name matches site: **Equilibrium Kinesiology & Nutrition** (or the exact trading name used on the site).
- [ ] Primary category and services mirror the site: Touch for Health Kinesiology, Nutrition, Total Wellness Package, TFH course (as applicable).
- [ ] NAP matches the site:
  - Address: Golden Bay Organics, 47 Commercial Street, Takaka
  - Phone: 021 991 989
  - Website: `https://equilibriumhealth.nz/`
- [ ] Hours and appointment notes match how sessions are actually offered (in person / online).
- [ ] Photos and description mention Patricia Smith, Takaka, Golden Bay, NZ.
- [ ] Link to key pages: bookings, kinesiology, nutrition, and relevant `/support/` topics where GBP allows service links.

## 2. Domain consolidation (`equilibrium.kiwi.nz`)

If the old WordPress host still resolves:

- [ ] Set **301 redirects** from every `equilibrium.kiwi.nz` URL to the matching `https://equilibriumhealth.nz/…` path.
- [ ] Prefer HTTPS-only on the new domain.
- [ ] In Google Search Console: verify `equilibriumhealth.nz`, submit `https://equilibriumhealth.nz/sitemap.xml`, and use Change of Address if Google still has the kiwi.nz property as primary.
- [ ] After redirects settle, confirm Search Console coverage for `/support/*`, `/recipes/*`, `/local/`, `/bookings/`.

## 3. Brand demand (beyond organic search)

- [ ] Keep Facebook ([equilibriumnutritionandyoga](https://www.facebook.com/equilibriumnutritionandyoga)) NAP and offers aligned with the site; add `sameAs` in code only when a stable profile URL exists.
- [ ] Use the email / newsletter list as owned traffic (Discovery call and course dates).
- [ ] Share first-party recipes and client-outcome stories that link back to `/support/…` or `/recipes/…` pages.
- [ ] Promote branded searches: “Patricia Smith Equilibrium”, “Equilibrium Takaka”.

## 4. Bing / other

- [ ] Bing Webmaster: property verified via [`public/BingSiteAuth.xml`](../public/BingSiteAuth.xml); submit the same sitemap.
- [ ] Spot-check AI answers (Perplexity / ChatGPT browsing) for correct location, services, and that yoga is historical only.

## Related on-site surfaces

| Surface | URL |
|---------|-----|
| Live site | https://equilibriumhealth.nz/ |
| Local discovery | https://equilibriumhealth.nz/local/ |
| Support hub | https://equilibriumhealth.nz/support/ |
| Bookings | https://equilibriumhealth.nz/bookings/ |
| Sitemap | https://equilibriumhealth.nz/sitemap.xml |
| robots | https://equilibriumhealth.nz/robots.txt |
