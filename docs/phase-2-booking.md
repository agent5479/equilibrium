# Phase 2: Booking Platform

## Overview

The booking system will integrate the static React site with Patricia's Google account:

1. **Google Calendar** — availability and event creation
2. **Google Sheets** — booking log and audit trail
3. **Google Apps Script** — serverless API endpoint (no backend hosting required)
4. **Gmail** — confirmation emails to client and Patricia

## Architecture

```
React Site (bookings page)
    → POST to Apps Script Web App URL (GitHub Secret)
        → Check Calendar availability
        → Create Calendar event
        → Append row to Sheets
        → Send confirmation emails via Gmail
    → Return success/error to client
```

## GitHub Secrets (phase 2)

| Secret | Purpose |
|--------|---------|
| `GOOGLE_APPS_SCRIPT_URL` | Deployed Apps Script web app endpoint |
| `RECAPTCHA_SITE_KEY` | Optional bot protection (public, can be in env) |
| `RECAPTCHA_SECRET_KEY` | Server-side verification in Apps Script |

## Implementation steps

1. Create Google Sheet with columns: timestamp, name, email, phone, service, date, time, status
2. Create Apps Script project bound to the Sheet
3. Implement `doPost(e)` handler: validate input, check calendar, create event, log row, send emails
4. Deploy as web app (execute as Patricia, accessible to anyone)
5. Wire `src/app/bookings/page.tsx` with date/time picker and form
6. Store `GOOGLE_APPS_SCRIPT_URL` in GitHub Secrets and inject at build time via env

## Contact form (phase 2 alternative)

Contact form can use the same Apps Script endpoint or a separate Mailchimp/reCAPTCHA integration.
