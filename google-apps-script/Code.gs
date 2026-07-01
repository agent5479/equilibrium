/**
 * Equilibrium Booking API — Google Apps Script
 *
 * SETUP:
 * 1. Create a new Google Sheet (e.g. "Equilibrium Bookings")
 * 2. Extensions → Apps Script → paste this file
 * 3. Run setupSheet() once from the editor (authorize when prompted)
 * 4. Set Script Properties (Project Settings → Script Properties):
 *    - CALENDAR_ID     = primary  (or your calendar ID)
 *    - OWNER_EMAIL     = goldenbayorganicstakaka@gmail.com
 *    - TIMEZONE        = Pacific/Auckland
 *    - BUSINESS_START  = 09:00
 *    - BUSINESS_END    = 17:00
 *    - SLOT_INTERVAL   = 30       (minutes between slot starts)
 *    - BOOKING_DAYS    = 1,2,3,4,5  (Mon=1 … Sun=7, comma-separated)
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL → GitHub Secret NEXT_PUBLIC_BOOKING_API_URL
 */

var SHEET_NAME = 'Bookings';

var HEADERS = [
  'Booking ID',
  'Created At',
  'Status',
  'Client Name',
  'Client Email',
  'Client Phone',
  'Service',
  'Duration (minutes)',
  'Price',
  'Appointment Date',
  'Appointment Start',
  'Appointment End',
  'Calendar Event ID',
  'Client Message',
  'Source URL',
  'Confirmed At',
  'Owner Notes'
];

// ─── HTTP handlers ───────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';

    if (action === 'availability') {
      var date = e.parameter.date;
      var duration = parseInt(e.parameter.duration, 10) || 60;
      var result = getAvailability(date, duration);
      return jsonResponse(result);
    }

    return jsonResponse({
      success: true,
      message: 'Equilibrium Booking API is running.',
      version: '1.0'
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
      var result = createBooking(body);
      return jsonResponse(result);
    }

    return jsonResponse({ success: false, message: 'Unknown action.' });
  } catch (err) {
    return jsonResponse({ success: false, message: String(err) });
  }
}

// ─── Setup ───────────────────────────────────────────────────────────────────

/**
 * Run once from the Apps Script editor to create the Bookings sheet with headers.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#b8517f')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  // Set column widths for readability
  var widths = [140, 160, 100, 150, 200, 120, 220, 80, 70, 120, 100, 100, 200, 250, 200, 160, 200];
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }

  Logger.log('Sheet "' + SHEET_NAME + '" is ready with ' + HEADERS.length + ' columns.');
}

// ─── Availability ────────────────────────────────────────────────────────────

function getAvailability(dateStr, durationMinutes) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { success: false, date: dateStr, slots: [], message: 'Invalid date.' };
  }

  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var bookingDays = getConfig('BOOKING_DAYS', '1,2,3,4,5').split(',').map(Number);
  var dayOfWeek = parseDateInTz(dateStr, tz).getDay();
  // JS getDay(): Sun=0 … Sat=6 → convert to ISO Mon=1 … Sun=7
  var isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

  if (bookingDays.indexOf(isoDay) === -1) {
    return { success: true, date: dateStr, slots: [], message: 'No bookings on this day.' };
  }

  var businessStart = getConfig('BUSINESS_START', '09:00');
  var businessEnd = getConfig('BUSINESS_END', '17:00');
  var interval = parseInt(getConfig('SLOT_INTERVAL', '30'), 10);

  var allSlots = generateTimeSlots(businessStart, businessEnd, interval, durationMinutes);
  var calendarId = getConfig('CALENDAR_ID', 'primary');
  var busyPeriods = getBusyPeriods(calendarId, dateStr, tz);

  var available = allSlots.filter(function (slot) {
    var slotStart = combineDateTime(dateStr, slot, tz);
    var slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    return !isOverlapping(slotStart, slotEnd, busyPeriods) && slotStart > new Date();
  });

  return {
    success: true,
    date: dateStr,
    slots: available.map(function (s) { return s; })
  };
}

function generateTimeSlots(startTime, endTime, intervalMinutes, durationMinutes) {
  var slots = [];
  var start = parseTimeString(startTime);
  var end = parseTimeString(endTime);
  var current = start;

  while (current + durationMinutes <= end) {
    slots.push(formatTimeString(current));
    current += intervalMinutes;
  }

  return slots;
}

function parseTimeString(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatTimeString(totalMinutes) {
  var h = Math.floor(totalMinutes / 60);
  var m = totalMinutes % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

function getBusyPeriods(calendarId, dateStr, tz) {
  var dayStart = combineDateTime(dateStr, '00:00', tz);
  var dayEnd = combineDateTime(dateStr, '23:59', tz);

  var events = CalendarApp.getCalendarById(calendarId)
    .getEvents(dayStart, dayEnd);

  return events.map(function (ev) {
    return { start: ev.getStartTime(), end: ev.getEndTime() };
  });
}

function isOverlapping(start, end, busyPeriods) {
  for (var i = 0; i < busyPeriods.length; i++) {
    var b = busyPeriods[i];
    if (start < b.end && end > b.start) {
      return true;
    }
  }
  return false;
}

// ─── Create booking ──────────────────────────────────────────────────────────

function createBooking(data) {
  // Validate required fields
  var required = ['name', 'email', 'serviceLabel', 'durationMinutes', 'preferredDate', 'preferredTime'];
  for (var i = 0; i < required.length; i++) {
    if (!data[required[i]]) {
      return { success: false, message: 'Missing field: ' + required[i] };
    }
  }

  if (!isValidEmail(data.email)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var duration = parseInt(data.durationMinutes, 10);
  var dateStr = data.preferredDate;
  var timeStr = data.preferredTime;

  // Re-check availability (prevent double-booking)
  var availability = getAvailability(dateStr, duration);
  if (availability.slots.indexOf(timeStr) === -1) {
    return { success: false, message: 'That time slot is no longer available. Please choose another.' };
  }

  var startTime = combineDateTime(dateStr, timeStr, tz);
  var endTime = new Date(startTime.getTime() + duration * 60000);
  var bookingId = 'EQ-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd') + '-' + randomId(4);
  var now = new Date();
  var calendarId = getConfig('CALENDAR_ID', 'primary');
  var ownerEmail = getConfig('OWNER_EMAIL', 'goldenbayorganicstakaka@gmail.com');

  // Create calendar event
  var calendar = CalendarApp.getCalendarById(calendarId);
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
    'Booked via equilibrium.kiwi.nz'
  ].join('\n');

  var event = calendar.createEvent(eventTitle, startTime, endTime, {
    description: eventDescription,
    guests: data.email,
    sendInvites: true
  });

  var eventId = event.getId();

  // Log to sheet
  var sheet = getOrCreateSheet();
  var price = getServicePrice(data.serviceId);
  var row = [
    bookingId,
    Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss"),
    'Confirmed',
    data.name,
    data.email,
    data.phone || '',
    data.serviceLabel,
    duration,
    price,
    dateStr,
    timeStr,
    Utilities.formatDate(endTime, tz, 'HH:mm'),
    eventId,
    data.message || '',
    data.sourceUrl || '',
    Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss"),
    ''
  ];
  sheet.appendRow(row);

  // Send confirmation emails
  sendConfirmationEmails(data, bookingId, dateStr, timeStr, endTime, tz, ownerEmail);

  return {
    success: true,
    message: 'Your booking is confirmed! A confirmation email has been sent to ' + data.email + '.',
    bookingId: bookingId
  };
}

function sendConfirmationEmails(data, bookingId, dateStr, timeStr, endTime, tz, ownerEmail) {
  var endTimeStr = Utilities.formatDate(endTime, tz, 'HH:mm');
  var formattedDate = Utilities.formatDate(parseDateInTz(dateStr, tz), tz, 'EEEE, d MMMM yyyy');

  var clientSubject = 'Booking confirmed — Equilibrium Kinesiology & Nutrition';
  var clientBody = [
    'Kia ora ' + data.name + ',',
    '',
    'Your appointment is confirmed:',
    '',
    '  Service:  ' + data.serviceLabel,
    '  Date:     ' + formattedDate,
    '  Time:     ' + timeStr + ' – ' + endTimeStr + ' (NZ time)',
    '  Reference: ' + bookingId,
    '',
    data.message ? 'Your message: ' + data.message : '',
    '',
    'A calendar invitation has been sent to this email address.',
    '',
    'If you need to reschedule, please contact Patricia:',
    '  Phone: 021 991 989',
    '  Email: goldenbayorganicstakaka@gmail.com',
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
    'View in Google Calendar and the Bookings sheet.'
  ].join('\n');

  GmailApp.sendEmail(ownerEmail, ownerSubject, ownerBody, {
    name: 'Equilibrium Booking System'
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  return sheet;
}

function getConfig(key, defaultValue) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  return value !== null && value !== '' ? value : defaultValue;
}

function getServicePrice(serviceId) {
  var prices = {
    'free-15': 'Free',
    'session-30': '$80',
    'session-60': '$120',
    'session-90': '$160',
    'session-120': '$195'
  };
  return prices[serviceId] || '';
}

function combineDateTime(dateStr, timeStr, tz) {
  var parts = dateStr.split('-');
  var timeParts = timeStr.split(':');
  // Build in script timezone
  var d = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
    parseInt(timeParts[0], 10),
    parseInt(timeParts[1], 10),
    0
  );
  return d;
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
