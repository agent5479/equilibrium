# Google Sheets setup — Equilibrium Bookings

## Quick setup

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet named **Equilibrium Bookings**.
2. Open **Extensions → Apps Script**.
3. Delete any default code and paste the contents of [`google-apps-script/Code.gs`](../google-apps-script/Code.gs).
4. Save the project (e.g. name it **Equilibrium Booking API**).
5. In the Apps Script editor, select `setupSheet` from the function dropdown and click **Run**.
   - Authorize the script when prompted (Calendar, Gmail, Sheets access).
6. Set **Script Properties** (gear icon → Project Settings → Script Properties):

| Property | Example value | Description |
|----------|---------------|-------------|
| `CALENDAR_ID` | `primary` | Google Calendar ID (use `primary` for default calendar) |
| `OWNER_EMAIL` | `goldenbayorganicstakaka@gmail.com` | Patricia's email — receives new-booking alerts |
| `TIMEZONE` | `Pacific/Auckland` | NZ timezone for all times |
| `BUSINESS_START` | `09:00` | First bookable slot start |
| `BUSINESS_END` | `17:00` | Last slot must end by this time |
| `SLOT_INTERVAL` | `30` | Minutes between slot start times |
| `BOOKING_DAYS` | `1,2,3,4,5` | Days open for booking (Mon=1 … Sun=7) |

7. **Deploy → New deployment → Web app**
   - Execute as: **Me** (Patricia's account)
   - Who has access: **Anyone**
8. Copy the **Web App URL** — this goes into GitHub Secrets as `NEXT_PUBLIC_BOOKING_API_URL`.

---

## Column labels (row 1)

Run `setupSheet()` in Apps Script to create these headers automatically, or add them manually to the **Bookings** tab:

| Col | Header | Description |
|-----|--------|-------------|
| A | **Booking ID** | Unique reference, e.g. `EQ-20260701-A3K9` |
| B | **Created At** | When the booking was submitted (NZ time) |
| C | **Status** | `Confirmed`, `Cancelled`, or `Rescheduled` |
| D | **Client Name** | Full name |
| E | **Client Email** | Client email (also added as calendar guest) |
| F | **Client Phone** | Phone number (optional) |
| G | **Service** | Service label, e.g. "60 minute Kinesiology / Nutrition session" |
| H | **Duration (minutes)** | Session length: 15, 30, 60, 90, or 120 |
| I | **Price** | `$80`, `$120`, `Free`, etc. |
| J | **Appointment Date** | `YYYY-MM-DD` |
| K | **Appointment Start** | Start time `HH:mm` |
| L | **Appointment End** | End time `HH:mm` |
| M | **Calendar Event ID** | Google Calendar event ID (for updates/cancellation) |
| N | **Client Message** | Optional note from the client |
| O | **Source URL** | Page URL where booking was made |
| P | **Confirmed At** | When the calendar event was created |
| Q | **Owner Notes** | Patricia's internal notes (edit manually in the sheet) |

---

## What happens on each booking

1. Site checks calendar availability via `GET ?action=availability&date=…&duration=…`
2. Client submits the form → `POST` to the Apps Script web app
3. Script re-checks the slot is still free
4. Creates a Google Calendar event (client invited by email)
5. Appends a row to the **Bookings** sheet
6. Sends confirmation email to the client
7. Sends notification email to Patricia (`OWNER_EMAIL`)

---

## GitHub Secret

In your `agent5479/equilibrium` repo:

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BOOKING_API_URL` | Your deployed Apps Script web app URL |

The deploy workflow injects this at build time so the static site can call the API.

---

## Testing

1. Open the web app URL in a browser — you should see `{"success":true,"message":"Equilibrium Booking API is running."}`
2. Test availability: append `?action=availability&date=2026-07-15&duration=60`
3. Submit a test booking from `/equilibrium/bookings/` on the live site

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Booking API is not configured" on site | Add `NEXT_PUBLIC_BOOKING_API_URL` GitHub Secret and redeploy |
| No time slots shown | Check `BOOKING_DAYS`, business hours, and that the date is not in the past |
| Calendar event not created | Re-authorize script; confirm `CALENDAR_ID` is correct |
| Emails not sent | Gmail daily quota; ensure script runs as Patricia's account |
| CORS errors | POST must use `Content-Type: text/plain` (already configured in the site) |
