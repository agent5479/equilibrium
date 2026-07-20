/**
 * Equilibrium API — Google Apps Script
 * Booking (calendar) + client list + admin email + contact/newsletter
 *
 * Window types (calendar event titles, exact match, case-insensitive):
 *   - "Equilibrium" — paid Kinesiology / Nutrition sessions
 *   - "Discovery"   — free Discovery / intro calls only
 *
 * SETUP:
 * 1. script.google.com → New project → paste this file
 *    (run as patricia@equilibriumhealth.nz)
 * 2. Set Script Properties (Project Settings → Script Properties):
 *    - CALENDAR_ID            = primary
 *    - OWNER_EMAIL            = patricia@equilibriumhealth.nz
 *    - SITE_URL               = https://equilibriumhealth.nz/
 *    - TIMEZONE               = Pacific/Auckland
 *    - AVAILABILITY_TITLE     = Equilibrium
 *    - DISCOVERY_TITLE        = Discovery
 *    - SLOT_INTERVAL          = 15
 *    - ADMIN_PASSWORD         = (same value as GitHub secret ADMIN_PASSWORD)
 *    - ADMIN_SESSION_SECRET   = (long random string)
 *    - CLIENTS_SHEET_ID       = (from setupClientsSheet, or your spreadsheet id)
 * 3. Run setupClientsSheet() once → paste returned id into CLIENTS_SHEET_ID
 * 4. Deploy → Web app → Execute as: Me → Anyone
 * 5. Copy Web App URL → GitHub Secret NEXT_PUBLIC_BOOKING_API_URL
 *
 * Patricia marks paid open time as "Equilibrium" and free-intro time as
 * "Discovery". Bookings must never use those titles (they would become windows).
 *
 * Never put ADMIN_PASSWORD in NEXT_PUBLIC_* — it must only live in Script
 * Properties (and optionally GitHub Secrets as an ops vault, not in the build).
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
      message: 'Equilibrium API is running.',
      version: '4.1'
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
    if (body.action === 'newsletterSubscribe') {
      return jsonResponse(newsletterSubscribe(body));
    }
    if (body.action === 'contact') {
      return jsonResponse(submitContact(body));
    }
    if (body.action === 'adminLogin') {
      return jsonResponse(adminLogin(body));
    }
    if (body.action === 'adminListClients') {
      return jsonResponse(adminListClients(body));
    }
    if (body.action === 'adminUpsertClient') {
      return jsonResponse(adminUpsertClient(body));
    }
    if (body.action === 'adminSendEmail') {
      return jsonResponse(adminSendEmail(body));
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

    try {
      var nameParts = splitName(data.name);
      upsertClientRow({
        email: data.email,
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        phone: data.phone || '',
        source: 'booking',
        subscribed: 'yes'
      });
    } catch (sheetErr) {
      // Booking succeeded; client sheet is best-effort.
      Logger.log('Client upsert after booking failed: ' + sheetErr);
    }

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

// ─── Clients sheet ───────────────────────────────────────────────────────────

var CLIENT_HEADERS = [
  'id',
  'email',
  'firstName',
  'lastName',
  'phone',
  'source',
  'subscribed',
  'createdAt',
  'updatedAt'
];

/**
 * Run once from the Apps Script editor. Creates a private Clients spreadsheet
 * (visible only to the script owner unless you share it) and stores its id in
 * CLIENTS_SHEET_ID. Do NOT share this sheet publicly or commit its id/data to GitHub.
 * Returns the spreadsheet id.
 */
function setupClientsSheet() {
  var existing = getConfig('CLIENTS_SHEET_ID', '');
  if (existing) {
    var sheet = getClientsSheet_();
    ensureClientHeaders_(sheet);
    return existing;
  }

  var ss = SpreadsheetApp.create('Equilibrium Clients');
  var sheet = ss.getSheets()[0];
  sheet.setName('Clients');
  sheet.getRange(1, 1, 1, CLIENT_HEADERS.length).setValues([CLIENT_HEADERS]);
  sheet.setFrozenRows(1);

  PropertiesService.getScriptProperties().setProperty('CLIENTS_SHEET_ID', ss.getId());
  // Log id only — never log client rows.
  Logger.log('CLIENTS_SHEET_ID set (keep Restricted; do not put in GitHub)');
  return ss.getId();
}

function getClientsSheet_() {
  var id = getConfig('CLIENTS_SHEET_ID', '');
  if (!id) {
    throw new Error('CLIENTS_SHEET_ID is not set. Run setupClientsSheet() once.');
  }
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName('Clients') || ss.getSheets()[0];
  ensureClientHeaders_(sheet);
  return sheet;
}

function ensureClientHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), CLIENT_HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var needsWrite = false;
  for (var i = 0; i < CLIENT_HEADERS.length; i++) {
    if (String(headers[i] || '') !== CLIENT_HEADERS[i]) {
      needsWrite = true;
      break;
    }
  }
  if (needsWrite) {
    sheet.getRange(1, 1, 1, CLIENT_HEADERS.length).setValues([CLIENT_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function readAllClients_() {
  var sheet = getClientsSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow, CLIENT_HEADERS.length).getValues();
  var clients = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var email = String(row[1] || '').trim();
    if (!email) continue;
    clients.push({
      id: String(row[0] || ''),
      email: email,
      firstName: String(row[2] || ''),
      lastName: String(row[3] || ''),
      phone: String(row[4] || ''),
      source: String(row[5] || ''),
      subscribed: String(row[6] || 'yes').toLowerCase() === 'yes' ? 'yes' : 'no',
      createdAt: String(row[7] || ''),
      updatedAt: String(row[8] || ''),
      rowIndex: i + 2
    });
  }
  return clients;
}

function findClientByEmail_(email) {
  var normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  var clients = readAllClients_();
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].email.toLowerCase() === normalized) return clients[i];
  }
  return null;
}

function upsertClientRow(data) {
  var email = String(data.email || '').trim();
  if (!isValidEmail(email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var now = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd'T'HH:mm:ss");
  var sheet = getClientsSheet_();
  var existing = findClientByEmail_(email);

  var firstName = String(data.firstName != null ? data.firstName : (existing ? existing.firstName : '')).trim();
  var lastName = String(data.lastName != null ? data.lastName : (existing ? existing.lastName : '')).trim();
  var phone = String(data.phone != null ? data.phone : (existing ? existing.phone : '')).trim();
  var source = String(data.source || (existing ? existing.source : 'manual')).trim() || 'manual';
  var subscribed = String(
    data.subscribed != null
      ? data.subscribed
      : (existing ? existing.subscribed : 'yes')
  ).toLowerCase() === 'no' ? 'no' : 'yes';

  if (existing) {
    // Keep original source unless explicitly updating from admin with a source.
    if (!data.source) source = existing.source || source;
    sheet.getRange(existing.rowIndex, 1, 1, CLIENT_HEADERS.length).setValues([[
      existing.id,
      email,
      firstName,
      lastName,
      phone,
      source,
      subscribed,
      existing.createdAt || now,
      now
    ]]);
    return {
      success: true,
      message: 'Client updated.',
      client: {
        id: existing.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        source: source,
        subscribed: subscribed,
        createdAt: existing.createdAt || now,
        updatedAt: now
      }
    };
  }

  var id = 'CL-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd') + '-' + randomId(4);
  sheet.appendRow([id, email, firstName, lastName, phone, source, subscribed, now, now]);
  return {
    success: true,
    message: 'Client added.',
    client: {
      id: id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      source: source,
      subscribed: subscribed,
      createdAt: now,
      updatedAt: now
    }
  };
}

function splitName(fullName) {
  var parts = String(fullName || '').trim().split(/\s+/);
  if (parts.length === 0 || (parts.length === 1 && !parts[0])) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

// ─── Public contact / newsletter ─────────────────────────────────────────────

function newsletterSubscribe(data) {
  var email = String(data.email || '').trim();
  if (!isValidEmail(email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  var result = upsertClientRow({
    email: email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phone: data.phone || '',
    source: 'newsletter',
    subscribed: 'yes'
  });

  if (!result.success) return result;

  try {
    var ownerEmail = getConfig('OWNER_EMAIL', 'patricia@equilibriumhealth.nz');
    GmailApp.sendEmail(
      ownerEmail,
      'Newsletter signup: ' + email,
      [
        'New newsletter subscriber:',
        '',
        '  Email: ' + email,
        '  Name:  ' + ([data.firstName, data.lastName].filter(Boolean).join(' ') || '(none)'),
        '  Phone: ' + (data.phone || 'Not provided')
      ].join('\n'),
      { name: 'Equilibrium Website' }
    );
  } catch (notifyErr) {
    Logger.log('Newsletter owner notify failed: ' + notifyErr);
  }

  return {
    success: true,
    message: 'Thanks for subscribing! You are on the list.'
  };
}

function submitContact(data) {
  var name = String(data.name || '').trim();
  var email = String(data.email || '').trim();
  var subject = String(data.subject || '').trim();
  var message = String(data.message || '').trim();

  if (!name) return { success: false, message: 'Please provide your name.' };
  if (!isValidEmail(email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }
  if (!message) return { success: false, message: 'Please enter a message.' };

  var nameParts = splitName(name);
  try {
    upsertClientRow({
      email: email,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      source: 'contact',
      subscribed: 'yes'
    });
  } catch (sheetErr) {
    Logger.log('Contact client upsert failed: ' + sheetErr);
  }

  var ownerEmail = getConfig('OWNER_EMAIL', 'patricia@equilibriumhealth.nz');
  var siteUrl = getConfig('SITE_URL', 'https://equilibriumhealth.nz/');
  var mailSubject = subject
    ? 'Website enquiry: ' + subject
    : 'Website enquiry from ' + name;

  GmailApp.sendEmail(
    ownerEmail,
    mailSubject,
    [
      'New enquiry from the website:',
      '',
      '  Name:    ' + name,
      '  Email:   ' + email,
      '  Subject: ' + (subject || '(none)'),
      '',
      'Message:',
      message,
      '',
      'Sent via ' + siteUrl
    ].join('\n'),
    {
      name: 'Equilibrium Website',
      replyTo: email
    }
  );

  return {
    success: true,
    message: 'Thank you — your message has been sent. Patricia will be in touch soon.'
  };
}

// ─── Admin auth + actions ────────────────────────────────────────────────────

var ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function adminLogin(data) {
  var throttle = checkAdminLoginThrottle_();
  if (throttle.blocked) {
    return { success: false, message: throttle.message };
  }

  var password = String(data.password || '');
  var expected = getConfig('ADMIN_PASSWORD', '');
  var sessionSecret = getConfig('ADMIN_SESSION_SECRET', '');

  if (!expected || !sessionSecret) {
    return {
      success: false,
      message: 'Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET Script Properties.'
    };
  }

  if (!secureStringEqual_(password, expected)) {
    recordAdminLoginFail_();
    // Slow brute-force attempts (Apps Script web app is public).
    Utilities.sleep(400);
    return { success: false, message: 'Incorrect password.' };
  }

  clearAdminLoginFails_();
  var expiresAt = Date.now() + ADMIN_TOKEN_TTL_MS;
  var token = createAdminToken_(expiresAt, sessionSecret);
  return {
    success: true,
    message: 'Logged in.',
    token: token,
    expiresAt: expiresAt
  };
}

function checkAdminLoginThrottle_() {
  var cache = CacheService.getScriptCache();
  var fails = parseInt(cache.get('admin_login_fails') || '0', 10);
  if (fails >= 8) {
    return {
      blocked: true,
      message: 'Too many failed sign-in attempts. Try again in about 15 minutes.'
    };
  }
  return { blocked: false };
}

function recordAdminLoginFail_() {
  var cache = CacheService.getScriptCache();
  var fails = parseInt(cache.get('admin_login_fails') || '0', 10) + 1;
  cache.put('admin_login_fails', String(fails), 900);
}

function clearAdminLoginFails_() {
  CacheService.getScriptCache().remove('admin_login_fails');
}

function requireAdmin_(token) {
  var sessionSecret = getConfig('ADMIN_SESSION_SECRET', '');
  if (!sessionSecret) {
    return { ok: false, message: 'Admin session is not configured.' };
  }
  if (!verifyAdminToken_(token, sessionSecret)) {
    return { ok: false, message: 'Session expired or invalid. Please log in again.' };
  }
  return { ok: true };
}

function createAdminToken_(expiresAt, secret) {
  var payload = String(expiresAt);
  var sig = bytesToHex_(Utilities.computeHmacSha256Signature(payload, secret));
  return payload + '.' + sig;
}

function verifyAdminToken_(token, secret) {
  if (!token || typeof token !== 'string') return false;
  var parts = String(token).split('.');
  if (parts.length !== 2) return false;
  var expiresAt = parseInt(parts[0], 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  var expected = bytesToHex_(Utilities.computeHmacSha256Signature(parts[0], secret));
  return secureStringEqual_(parts[1], expected);
}

function adminListClients(data) {
  var auth = requireAdmin_(data.token);
  if (!auth.ok) return { success: false, message: auth.message };

  try {
    var clients = readAllClients_().map(function (c) {
      return {
        id: c.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        source: c.source,
        subscribed: c.subscribed,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
    });
    return { success: true, clients: clients };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

function adminUpsertClient(data) {
  var auth = requireAdmin_(data.token);
  if (!auth.ok) return { success: false, message: auth.message };

  try {
    return upsertClientRow({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      source: data.source || 'manual',
      subscribed: data.subscribed
    });
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

function adminSendEmail(data) {
  var auth = requireAdmin_(data.token);
  if (!auth.ok) return { success: false, message: auth.message };

  var subject = String(data.subject || '').trim();
  var body = String(data.body || '').trim();
  var emails = data.emails;

  if (!subject) return { success: false, message: 'Subject is required.' };
  if (!body) return { success: false, message: 'Message body is required.' };
  if (!emails || !emails.length) {
    return { success: false, message: 'Select at least one recipient.' };
  }

  var sent = 0;
  var failed = [];

  for (var i = 0; i < emails.length; i++) {
    var to = String(emails[i] || '').trim();
    if (!isValidEmail(to)) {
      failed.push(to || '(empty)');
      continue;
    }
    try {
      GmailApp.sendEmail(to, subject, body, {
        name: 'Equilibrium Kinesiology & Nutrition'
      });
      sent++;
    } catch (sendErr) {
      failed.push(to);
      Logger.log('Send failed for ' + to + ': ' + sendErr);
    }
  }

  return {
    success: failed.length === 0,
    message: failed.length === 0
      ? 'Sent ' + sent + ' email' + (sent === 1 ? '' : 's') + '.'
      : 'Sent ' + sent + ', failed ' + failed.length + '.',
    sent: sent,
    failed: failed
  };
}

function secureStringEqual_(a, b) {
  var left = String(a || '');
  var right = String(b || '');
  var max = Math.max(left.length, right.length);
  var diff = left.length ^ right.length;
  for (var i = 0; i < max; i++) {
    var lc = i < left.length ? left.charCodeAt(i) : 0;
    var rc = i < right.length ? right.charCodeAt(i) : 0;
    diff |= lc ^ rc;
  }
  return diff === 0;
}

function bytesToHex_(bytes) {
  var out = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    if (b < 0) b += 256;
    var hex = b.toString(16);
    out += hex.length === 1 ? '0' + hex : hex;
  }
  return out;
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
