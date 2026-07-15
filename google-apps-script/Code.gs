/**
 * Equilibrium Booking API — Google Apps Script (calendar-only)
 *
 * Window types (calendar event titles, exact match, case-insensitive):
 *   - "Equilibrium" — paid Kinesiology / Nutrition sessions
 *   - "Discovery"   — free Discovery / intro calls only
 *
 * Clients pick 15-minute starts inside the matching window type that do not
 * overlap other calendar events (including bookings and the other window type).
 *
 * SETUP:
 * 1. script.google.com → New project → paste this file
 *    (run as patricia@equilibriumhealth.nz)
 * 2. Set Script Properties (Project Settings → Script Properties):
 *    - CALENDAR_ID          = primary
 *    - OWNER_EMAIL          = patricia@equilibriumhealth.nz
 *    - SITE_URL             = https://equilibriumhealth.nz/
 *    - TIMEZONE             = Pacific/Auckland
 *    - AVAILABILITY_TITLE   = Equilibrium
 *    - DISCOVERY_TITLE      = Discovery
 *    - SLOT_INTERVAL        = 15
 * 3. Deploy → Web app → Execute as: Me → Anyone
 * 4. Copy Web App URL → GitHub Secret NEXT_PUBLIC_BOOKING_API_URL
 *
 * Patricia marks paid open time as "Equilibrium" and free-intro time as
 * "Discovery". Bookings must never use those titles (they would become windows).
 */

// ─── HTTP handlers ───────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    var windowKind = (e && e.parameter && e.parameter.windowKind) || '';

    if (action === 'availability') {
      var date = e.parameter.date;
      var duration = parseInt(e.parameter.duration, 10) || 60;
      return jsonResponse(getAvailability(date, duration, windowKind, e.parameter.serviceId));
    }

    if (action === 'availableDates') {
      var from = e.parameter.from;
      var to = e.parameter.to;
      var datesDuration = parseInt(e.parameter.duration, 10) || 60;
      return jsonResponse(getAvailableDates(from, to, datesDuration, windowKind, e.parameter.serviceId));
    }

    return jsonResponse({
      success: true,
      message: 'Equilibrium Booking API is running.',
      version: '3.2'
    });
  } catch (err) {
    return jsonResponse({ success: false, message: String(err) });
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    if (body.action === 'book') {
      return jsonResponse(createBooking(body));
    }

    return jsonResponse({ success: false, message: 'Unknown action.' });
  } catch (err) {
    return jsonResponse({ success: false, message: String(err) });
  }
}

// ─── Availability ────────────────────────────────────────────────────────────

/**
 * Resolve calendar window title from windowKind / serviceId.
 * discovery / free-15 → Discovery; everything else → Equilibrium (paid).
 */
function resolveAvailabilityTitle(windowKind, serviceId) {
  var kind = String(windowKind || '').trim().toLowerCase();
  var sid = String(serviceId || '').trim().toLowerCase();
  if (kind === 'discovery' || sid === 'free-15') {
    return getConfig('DISCOVERY_TITLE', 'Discovery');
  }
  return getConfig('AVAILABILITY_TITLE', 'Equilibrium');
}

function getAvailability(dateStr, durationMinutes, windowKind, serviceId) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { success: false, date: dateStr, slots: [], message: 'Invalid date.' };
  }

  durationMinutes = parseInt(durationMinutes, 10) || 60;
  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var interval = parseInt(getConfig('SLOT_INTERVAL', '15'), 10);
  if (isNaN(interval) || interval < 1) interval = 15;

  var calendarId = getConfig('CALENDAR_ID', 'primary');
  var titleMatch = resolveAvailabilityTitle(windowKind, serviceId);
  var classified = classifyDayEvents(calendarId, dateStr, tz, titleMatch);

  if (classified.windows.length === 0) {
    return {
      success: true,
      date: dateStr,
      slots: [],
      message: 'No ' + titleMatch + ' booking windows on this day.'
    };
  }

  var now = new Date();
  var slots = [];
  var seen = {};

  for (var w = 0; w < classified.windows.length; w++) {
    var window = classified.windows[w];
    var windowSlots = slotsInWindow(
      window.start,
      window.end,
      interval,
      durationMinutes,
      classified.busy,
      now,
      tz
    );
    for (var i = 0; i < windowSlots.length; i++) {
      var slot = windowSlots[i];
      if (!seen[slot]) {
        seen[slot] = true;
        slots.push(slot);
      }
    }
  }

  slots.sort();

  return {
    success: true,
    date: dateStr,
    slots: slots,
    windowTitle: titleMatch,
    message: slots.length === 0
      ? 'No times fit this session length within the open windows.'
      : undefined
  };
}

/**
 * Return YYYY-MM-DD dates in [fromStr, toStr] that have at least one bookable
 * slot for the given duration and window kind (Equilibrium vs Discovery).
 */
function getAvailableDates(fromStr, toStr, durationMinutes, windowKind, serviceId) {
  if (!fromStr || !/^\d{4}-\d{2}-\d{2}$/.test(fromStr) ||
      !toStr || !/^\d{4}-\d{2}-\d{2}$/.test(toStr)) {
    return { success: false, dates: [], message: 'Invalid from/to date.' };
  }

  durationMinutes = parseInt(durationMinutes, 10) || 60;
  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var interval = parseInt(getConfig('SLOT_INTERVAL', '15'), 10);
  if (isNaN(interval) || interval < 1) interval = 15;

  var calendarId = getConfig('CALENDAR_ID', 'primary');
  var titleMatch = resolveAvailabilityTitle(windowKind, serviceId);
  var target = String(titleMatch).trim().toLowerCase();

  var rangeStart = combineDateTime(fromStr, '00:00', tz);
  var rangeEnd = combineDateTime(toStr, '23:59', tz);
  var events = CalendarApp.getCalendarById(calendarId).getEvents(rangeStart, rangeEnd);

  var windowsByDay = {};
  var busyByDay = {};

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var dayKey = Utilities.formatDate(ev.getStartTime(), tz, 'yyyy-MM-dd');
    var period = { start: ev.getStartTime(), end: ev.getEndTime() };
    var title = String(ev.getTitle() || '').trim().toLowerCase();

    if (title === target) {
      if (!windowsByDay[dayKey]) windowsByDay[dayKey] = [];
      windowsByDay[dayKey].push(period);
    } else {
      if (!busyByDay[dayKey]) busyByDay[dayKey] = [];
      busyByDay[dayKey].push(period);
    }
  }

  var now = new Date();
  var dates = Object.keys(windowsByDay).sort();
  var available = [];

  for (var d = 0; d < dates.length; d++) {
    var day = dates[d];
    if (day < fromStr || day > toStr) continue;

    var windows = windowsByDay[day];
    var busy = busyByDay[day] || [];
    var hasSlot = false;

    for (var w = 0; w < windows.length && !hasSlot; w++) {
      var windowSlots = slotsInWindow(
        windows[w].start,
        windows[w].end,
        interval,
        durationMinutes,
        busy,
        now,
        tz
      );
      if (windowSlots.length > 0) hasSlot = true;
    }

    if (hasSlot) available.push(day);
  }

  return {
    success: true,
    dates: available,
    windowTitle: titleMatch,
    message: available.length === 0
      ? 'No dates with ' + titleMatch + ' booking windows in this period.'
      : undefined
  };
}

/**
 * Split the day's events into matching availability windows vs busy blocks.
 *
 * - Events whose title matches the requested window title (Equilibrium or Discovery)
 *   = open bookable window for that service type.
 * - Every other event (the other window type, site bookings, personal appointments)
 *   = busy and excluded from offered slots.
 */
function classifyDayEvents(calendarId, dateStr, tz, availabilityTitle) {
  var dayStart = combineDateTime(dateStr, '00:00', tz);
  var dayEnd = combineDateTime(dateStr, '23:59', tz);
  var events = CalendarApp.getCalendarById(calendarId).getEvents(dayStart, dayEnd);
  var target = String(availabilityTitle || 'Equilibrium').trim().toLowerCase();

  var windows = [];
  var busy = [];

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var period = { start: ev.getStartTime(), end: ev.getEndTime() };
    var title = String(ev.getTitle() || '').trim().toLowerCase();

    if (title === target) {
      windows.push(period);
    } else {
      busy.push(period);
    }
  }

  return { windows: windows, busy: busy };
}

/**
 * Offer starts every intervalMinutes inside [windowStart, windowEnd] that leave
 * room for durationMinutes and do not overlap any busy period (existing bookings).
 */
function slotsInWindow(windowStart, windowEnd, intervalMinutes, durationMinutes, busyPeriods, now, tz) {
  var slots = [];
  var cursor = new Date(windowStart.getTime());

  while (cursor.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
    var slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
    if (cursor > now && !isOverlapping(cursor, slotEnd, busyPeriods)) {
      slots.push(Utilities.formatDate(cursor, tz, 'HH:mm'));
    }
    cursor = new Date(cursor.getTime() + intervalMinutes * 60000);
  }

  return slots;
}

function isOverlapping(start, end, busyPeriods) {
  for (var i = 0; i < busyPeriods.length; i++) {
    var b = busyPeriods[i];
    if (start < b.end && end > b.start) return true;
  }
  return false;
}

// ─── Create booking ──────────────────────────────────────────────────────────

function createBooking(data) {
  var required = ['name', 'email', 'serviceLabel', 'durationMinutes', 'preferredDate', 'preferredTime'];
  for (var i = 0; i < required.length; i++) {
    if (!data[required[i]]) {
      return { success: false, message: 'Missing field: ' + required[i] };
    }
  }

  if (!isValidEmail(data.email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(30000);
  if (!gotLock) {
    return {
      success: false,
      message: 'The booking system is busy. Please try again in a moment.'
    };
  }

  try {
    var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
    var siteUrl = getConfig('SITE_URL', 'https://equilibriumhealth.nz/');
    var duration = parseInt(data.durationMinutes, 10);
    var dateStr = data.preferredDate;
    var timeStr = data.preferredTime;

    // Re-check under lock so two clients cannot grab the same slot.
    // Free Discovery intros use "Discovery" windows; paid use "Equilibrium".
    var availability = getAvailability(dateStr, duration, data.windowKind, data.serviceId);
    if (availability.slots.indexOf(timeStr) === -1) {
      return { success: false, message: 'That time slot is no longer available. Please choose another.' };
    }

    var startTime = combineDateTime(dateStr, timeStr, tz);
    var endTime = new Date(startTime.getTime() + duration * 60000);
    var bookingId = 'EQ-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd') + '-' + randomId(4);
    var calendarId = getConfig('CALENDAR_ID', 'primary');
    var ownerEmail = getConfig('OWNER_EMAIL', 'patricia@equilibriumhealth.nz');

    var calendar = CalendarApp.getCalendarById(calendarId);
    // Must NOT be titled "Equilibrium" or "Discovery" — bookings are busy blocks.
    var eventTitle = data.serviceLabel + ' — ' + data.name;
    var eventDescription = [
      'Booking ID: ' + bookingId,
      'Client: ' + data.name,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || 'Not provided'),
      'Service: ' + data.serviceLabel,
      'Duration: ' + duration + ' minutes',
      '',
      'Message:',
      data.message || '(none)',
      '',
      'Booked via ' + siteUrl
    ].join('\n');

    var guests = data.email;
    if (ownerEmail && ownerEmail !== data.email) {
      guests = data.email + ',' + ownerEmail;
    }

    var event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: eventDescription,
      location: 'Golden Bay Organics (back office), 47 Commercial St Takaka; private location by arrangement; or online — Equilibrium Kinesiology & Nutrition',
      guests: guests,
      sendInvites: true
    });

    sendConfirmationEmails(data, bookingId, dateStr, timeStr, endTime, tz, ownerEmail, siteUrl);

    return {
      success: true,
      message: 'Your booking is confirmed! Check your email for a calendar invitation to add this to your calendar.',
      bookingId: bookingId,
      eventId: event.getId()
    };
  } finally {
    lock.releaseLock();
  }
}

function sendConfirmationEmails(data, bookingId, dateStr, timeStr, endTime, tz, ownerEmail, siteUrl) {
  var endTimeStr = Utilities.formatDate(endTime, tz, 'HH:mm');
  var formattedDate = Utilities.formatDate(parseDateInTz(dateStr, tz), tz, 'EEEE, d MMMM yyyy');

  var clientSubject = 'Booking confirmed — Equilibrium Kinesiology & Nutrition';
  var clientBody = [
    'Kia ora ' + data.name + ',',
    '',
    'Your appointment is confirmed:',
    '',
    '  Service:   ' + data.serviceLabel,
    '  Date:      ' + formattedDate,
    '  Time:      ' + timeStr + ' – ' + endTimeStr + ' (NZ time)',
    '  Reference: ' + bookingId,
    '  Location:  By arrangement — Golden Bay Organics back office (47 Commercial St, Takaka), private venue, or online',
    '',
    data.message ? 'Your message: ' + data.message : '',
    '',
    'A Google Calendar invitation has been sent to this email address.',
    'Please accept the invite in your inbox to add the appointment to your calendar.',
    '',
    'If you need to reschedule, please contact Patricia:',
    '  Phone: 021 991 989',
    '  Email: ' + ownerEmail,
    '',
    'Ngā mihi,',
    'Patricia Smith',
    'Equilibrium Kinesiology & Nutrition'
  ].join('\n');

  GmailApp.sendEmail(data.email, clientSubject, clientBody, {
    name: 'Equilibrium Kinesiology & Nutrition'
  });

  var ownerSubject = 'New booking: ' + data.name + ' — ' + dateStr + ' ' + timeStr;
  var ownerBody = [
    'New booking received:',
    '',
    '  Reference: ' + bookingId,
    '  Client:    ' + data.name,
    '  Email:     ' + data.email,
    '  Phone:     ' + (data.phone || 'Not provided'),
    '  Service:   ' + data.serviceLabel + ' (' + data.durationMinutes + ' min)',
    '  Date:      ' + formattedDate,
    '  Time:      ' + timeStr + ' – ' + endTimeStr,
    '',
    'Message: ' + (data.message || '(none)'),
    '',
    'Booked via ' + siteUrl,
    '',
    'View in Google Calendar.'
  ].join('\n');

  GmailApp.sendEmail(ownerEmail, ownerSubject, ownerBody, {
    name: 'Equilibrium Booking System'
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getConfig(key, defaultValue) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  return value !== null && value !== '' ? value : defaultValue;
}

function combineDateTime(dateStr, timeStr, tz) {
  var parts = dateStr.split('-');
  var timeParts = timeStr.split(':');
  return new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
    parseInt(timeParts[0], 10),
    parseInt(timeParts[1], 10),
    0
  );
}

function parseDateInTz(dateStr, tz) {
  var parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomId(length) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
