# Phase 2: Booking Platform

## Status: Implemented

The booking system connects the static React site to Patricia's Google Calendar and Gmail.

## Components

| Piece | Location |
|-------|----------|
| Booking form (React) | `src/components/BookingForm.tsx` |
| Booking page | `src/app/bookings/` |
| API client | `src/lib/booking/index.ts` |
| Google Apps Script | `google-apps-script/Code.gs` |
| Setup guide | `docs/google-apps-script-setup.md` |

## Architecture

```
React Site (/bookings/)
    → GET  Apps Script ?action=availability&date=&duration=
    → POST Apps Script { action: "book", ... }
        → Check Calendar availability
        → Create Calendar event (+ guest invites for client and owner)
        → Email client + Patricia
    → Return bookingId + confirmation
```

No Google Sheet is required — bookings live in Google Calendar.

## GitHub Secret (required for live booking)

In [agent5479/equilibrium → Settings → Secrets and variables → Actions](https://github.com/agent5479/equilibrium/settings/secrets/actions):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BOOKING_API_URL` | Your Apps Script web app URL ending in `/exec` |

The deploy workflow (`.github/workflows/deploy.yml`) injects this at build time. **Push to `main` after adding the secret** to redeploy with booking enabled.

Example URL format:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Local development

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_BOOKING_API_URL with your Apps Script URL
npm run dev
```

Open http://localhost:3000/equilibrium/bookings/

## Contact form (future)

The contact form on `/contact/` can be wired to the same Apps Script endpoint with `action: "contact"` — not yet implemented.
