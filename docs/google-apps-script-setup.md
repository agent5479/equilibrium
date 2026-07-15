# Google Apps Script setup — Equilibrium Bookings

Calendar-only booking API. Open slots come from calendar events Patricia titles **Equilibrium**.

## Quick setup

1. Go to [Google Apps Script](https://script.google.com) signed in as **patricia@equilibriumhealth.nz** and create a new **standalone** project (not bound to a Sheet).
2. Delete any default code and paste the contents of [`google-apps-script/Code.gs`](../google-apps-script/Code.gs).
3. Save the project (e.g. name it **Equilibrium Booking API**).
4. Set **Script Properties** (gear icon → Project Settings → Script Properties):

| Property | Example value | Description |
|----------|---------------|-------------|
| `CALENDAR_ID` | `primary` | Google Calendar ID (use `primary` for default calendar) |
| `OWNER_EMAIL` | `patricia@equilibriumhealth.nz` | Receives booking notifications |
| `SITE_URL` | `https://equilibriumhealth.nz/` | Link shown in confirmation emails |
| `TIMEZONE` | `Pacific/Auckland` | NZ timezone for all times |
| `AVAILABILITY_TITLE` | `Equilibrium` | Exact calendar event title that marks open booking windows (case-insensitive) |
| `SLOT_INTERVAL` | `15` | Minutes between offered start times inside each window |

5. On Google Calendar (same account), create blocks titled **Equilibrium** for the times you want to accept bookings.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me** (patricia@equilibriumhealth.nz)
   - Who has access: **Anyone**
7. Copy the **Web App URL** — this goes into GitHub Secrets as `NEXT_PUBLIC_BOOKING_API_URL`.

After code changes, create a **New version** deployment so the live URL picks up updates.

---

## How availability works

1. Site requests `GET ?action=availability&date=YYYY-MM-DD&duration=60`
2. Script finds that day's calendar events titled `Equilibrium` (open windows)
3. Other events (appointments, personal) are busy
4. Inside each window, start times are offered every `SLOT_INTERVAL` minutes where `start + duration` still fits and does not overlap busy time
5. Booked appointments are created with titles like `60 minute … — Client name` so they never count as open windows

---

## What happens on each booking

1. Site checks calendar availability via `GET ?action=availability&date=…&duration=…`
2. Client submits the form → `POST` to the Apps Script web app
3. Script re-checks the slot is still free
4. Creates a Google Calendar event (client + owner invited by email)
5. Sends confirmation email to the client
6. Sends notification email to Patricia (`OWNER_EMAIL`)

---

## GitHub Secret

In your `agent5479/equilibrium` repo:

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BOOKING_API_URL` | Your deployed Apps Script web app URL ending in `/exec` |

The deploy workflow injects this at build time so the static site can call the API.

---

## Testing

1. Open the web app URL in a browser — you should see `{"success":true,"message":"Equilibrium Booking API is running.","version":"3.0"}`
2. Add an `Equilibrium` event on your calendar for a test day
3. Test availability: append `?action=availability&date=2026-07-15&duration=60`
4. Submit a test booking from `/bookings/` on the live site

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Booking API is not configured" on site | Add `NEXT_PUBLIC_BOOKING_API_URL` GitHub Secret and redeploy |
| No time slots shown | Create a calendar event titled exactly `Equilibrium` on that day; check it is long enough for the selected session duration; ensure the slot is not in the past or overlapped by another event |
| Calendar event not created | Re-authorize script; confirm `CALENDAR_ID` is correct and the script runs as patricia@ |
| Emails not sent | Gmail daily quota; ensure script runs as patricia@equilibriumhealth.nz |
| CORS errors | POST must use `Content-Type: text/plain` (already configured in the site) |
