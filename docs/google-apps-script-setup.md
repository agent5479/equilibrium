# Google Apps Script setup — Equilibrium API

Booking (Google Calendar) plus client list, admin email, contact form, and newsletter signup.

## Quick setup

1. Go to [Google Apps Script](https://script.google.com) signed in as **patricia@equilibriumhealth.nz** and create a new **standalone** project (not bound to a Sheet).
2. Delete any default code and paste the contents of [`google-apps-script/Code.gs`](../google-apps-script/Code.gs).
3. Save the project (e.g. name it **Equilibrium API**).
4. Set **Script Properties** (gear icon → Project Settings → Script Properties):

| Property | Example value | Description |
|----------|---------------|-------------|
| `CALENDAR_ID` | `primary` | Google Calendar ID (use `primary` for default calendar) |
| `OWNER_EMAIL` | `patricia@equilibriumhealth.nz` | Receives booking / enquiry / newsletter notifications |
| `SITE_URL` | `https://equilibriumhealth.nz/` | Link shown in confirmation emails |
| `TIMEZONE` | `Pacific/Auckland` | NZ timezone for all times |
| `AVAILABILITY_TITLE` | `Equilibrium` | Exact calendar event title for **paid** session windows |
| `DISCOVERY_TITLE` | `Discovery` | Exact calendar event title for **free Discovery** call windows |
| `SLOT_INTERVAL` | `15` | Minutes between offered start times inside each window |
| `ADMIN_PASSWORD` | *(strong password)* | Admin login for `/admin/` — same value as GitHub secret `ADMIN_PASSWORD` |
| `ADMIN_SESSION_SECRET` | *(long random string)* | HMAC key for admin session tokens |
| `CLIENTS_SHEET_ID` | *(from setup)* | Spreadsheet id for the Clients sheet |

5. In the Apps Script editor, run **`setupClientsSheet`** once (select the function → Run). Authorize when prompted. Copy the logged `CLIENTS_SHEET_ID=…` value into Script Properties if it was not auto-saved (the function also writes the property).
6. On Google Calendar (same account):
   - Create blocks titled **Equilibrium** for paid Kinesiology / Nutrition booking time
   - Create blocks titled **Discovery** for free Discovery / intro call time
7. **Deploy → New deployment → Web app**
   - Execute as: **Me** (patricia@equilibriumhealth.nz)
   - Who has access: **Anyone**
8. Copy the **Web App URL** — this goes into GitHub Secrets as `NEXT_PUBLIC_BOOKING_API_URL`.

After code changes, create a **New version** deployment so the live URL picks up updates.

---

## Admin password (GitHub Secret vs Script Property)

The site is static (GitHub Pages). **Do not** put `ADMIN_PASSWORD` in any `NEXT_PUBLIC_*` variable — that would publish it in the JavaScript bundle.

| Where | Purpose |
|-------|---------|
| **Apps Script** `ADMIN_PASSWORD` | Runtime check for `/admin/` login |
| **GitHub** secret `ADMIN_PASSWORD` | Ops vault only (same value) — **not** used at build time |
| **Apps Script** `ADMIN_SESSION_SECRET` | Signs short-lived session tokens (12 hours) |

To change the password: update the Script Property and the GitHub secret to the same new value.

---

## Client list + email (`/admin/`)

1. Open `https://equilibriumhealth.nz/admin/` and sign in with `ADMIN_PASSWORD`.
2. Clients are stored in the **Clients** sheet (`id`, `email`, `firstName`, `lastName`, `phone`, `source`, `subscribed`, `createdAt`, `updatedAt`).
3. Sources: `newsletter`, `booking`, `contact`, `manual`.
4. Select recipients → compose plain-text subject/body → **Send** (one Gmail message per recipient).
5. Newsletter signups, contact enquiries, and successful bookings upsert into the sheet automatically.

---

## How availability works

1. Site requests open dates via `GET ?action=availableDates&from=…&to=…&duration=…&windowKind=paid|discovery`
2. Site requests times for a chosen day via `GET ?action=availability&date=…&duration=…&windowKind=…`
3. Script finds that day's events matching the window title:
   - `windowKind=paid` (or default) → **Equilibrium**
   - `windowKind=discovery` (free intro) → **Discovery**
4. **Other events are busy** — including the *other* window type, site bookings (`Service — Client name`), and personal appointments. Those intervals are **excluded** from offered slots. You do **not** need to edit the window block after a booking.
5. Inside each matching window, start times are offered every `SLOT_INTERVAL` minutes where `start + duration` still fits and does not overlap busy time
6. Booked appointments are created with titles like `60 minute … — Client name` so they never count as open windows — **never rename a booking to `Equilibrium` or `Discovery`**
7. Creating a booking uses a script lock and re-checks the slot so two people cannot double-book the same time

---

## What happens on each booking

1. Site checks calendar availability via `GET ?action=availability&date=…&duration=…`
2. Client submits the form → `POST` to the Apps Script web app
3. Script acquires a lock, re-checks the slot is still free, then creates the calendar event
4. Creates a Google Calendar event (client + owner invited by email) — this event blocks that time for future bookers
5. Sends confirmation email to the client
6. Sends notification email to Patricia (`OWNER_EMAIL`)
7. Upserts the client into the Clients sheet (`source=booking`)

---

## Public POST actions

| `action` | Auth | Effect |
|----------|------|--------|
| `book` | none | Create calendar booking |
| `newsletterSubscribe` | none | Upsert subscribed client; notify owner |
| `contact` | none | Email owner; upsert client |
| `adminLogin` | password | Return session token |
| `adminListClients` | token | List sheet rows |
| `adminUpsertClient` | token | Add/update client |
| `adminSendEmail` | token | Send plain-text Gmail to `emails[]` |

All site `POST`s use `Content-Type: text/plain` (required for Apps Script CORS).

---

## GitHub Secrets

In your `agent5479/equilibrium` repo:

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BOOKING_API_URL` | Your deployed Apps Script web app URL ending in `/exec` |
| `ADMIN_PASSWORD` | Same value as Script Property `ADMIN_PASSWORD` (ops vault only — not injected into the build) |

The deploy workflow injects `NEXT_PUBLIC_BOOKING_API_URL` at build time so the static site can call the API.

---

## Testing

1. Open the web app URL in a browser — you should see `{"success":true,"message":"Equilibrium API is running.","version":"4.0"}`
2. Add an `Equilibrium` event on your calendar for a test day
3. Test availability: append `?action=availability&date=2026-07-15&duration=60`
4. Submit a test booking from `/bookings/` on the live site
5. Subscribe via `/contact/` newsletter form → confirm a row appears in the Clients sheet
6. Sign in at `/admin/` and send a test email to yourself

---

## Troubleshooting

| Issue | Fix |
|-------|------|
| "Booking API is not configured" / forms fail | Add `NEXT_PUBLIC_BOOKING_API_URL` GitHub Secret and redeploy |
| "CLIENTS_SHEET_ID is not set" | Run `setupClientsSheet()` and set the Script Property |
| Admin login "not configured" | Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` Script Properties |
| Incorrect password | Password is checked only in Apps Script — update Script Property (and GitHub secret to match) |
| No time slots shown | Create a calendar event titled exactly `Equilibrium` on that day on **patricia@’s primary calendar**; check it is long enough for the selected session duration; ensure the slot is not in the past or overlapped by another event |
| Page stuck on “Loading times…” / API 403 | Redeploy the web app with **Who has access: Anyone**. Open the `/exec` URL in an incognito window — you must see JSON (`version: 4.0`), not “You need access” |
| Calendar event not created | Re-authorize script; confirm `CALENDAR_ID` is `primary` and the script project + deploy run as patricia@ |
| Emails not sent | Gmail daily quota; ensure script runs as patricia@equilibriumhealth.nz |
| CORS errors | POST must use `Content-Type: text/plain` (already configured in the site) |

## Which Google Calendar is used?

Yes — a normal **Google Calendar**. The web app must be created and deployed while logged in as **patricia@equilibriumhealth.nz**, with **Execute as: Me**. Then `CALENDAR_ID=primary` is patricia’s primary calendar (the one that opens by default at [calendar.google.com](https://calendar.google.com) for that account). The `Equilibrium` availability blocks must be on that same calendar, not a different shared calendar unless you set `CALENDAR_ID` to that calendar’s ID.

## Security notes

- Apps Script access is **Anyone** (required for the public site). Admin actions require password + session token.
- Gmail has daily send limits — fine for a small practice list.
- `/admin/` is `noindex` and is not added to the sitemap; still treat the URL as private.
