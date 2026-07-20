# Phase 2: Booking Platform

## Status: Implemented

The booking system connects the static React site to Patricia's Google Calendar and Gmail (`patricia@equilibriumhealth.nz`).

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
        → Find calendar events titled "Equilibrium" (open windows)
        → Offer 15-minute starts that fit duration and avoid busy events
    → POST Apps Script { action: "book", ... }
        → Re-check slot
        → Create Calendar event (+ guest invites for client and patricia@)
        → Email client + Patricia
    → Return bookingId + confirmation
```

No Google Sheet is required — bookings live in Google Calendar. Patricia marks bookable time by creating events titled **Equilibrium**.

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

Open http://localhost:3000/bookings/

## Contact form / newsletter / admin

- Contact and newsletter forms on `/contact/` → Apps Script `action: "contact"` / `"newsletterSubscribe"`.
- Client list and bulk email at `/admin/` (password + session token; Clients Google Sheet).
- Setup: [google-apps-script-setup.md](google-apps-script-setup.md).
