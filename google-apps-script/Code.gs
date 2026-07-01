/**
 * Equilibrium Booking API — Google Apps Script (calendar-only)
 *
 * SETUP:
 * 1. script.google.com → New project → paste this file
 * 2. Set Script Properties (Project Settings → Script Properties):
 *    - CALENDAR_ID     = primary
 *    - OWNER_EMAIL     = goldenbayorganicstakaka@gmail.com
 *    - SITE_URL        = https://agent5479.github.io/equilibrium/
 *    - TIMEZONE        = Pacific/Auckland
 *    - BUSINESS_START  = 09:00
 *    - BUSINESS_END    = 17:00
 *    - SLOT_INTERVAL   = 30
 *    - BOOKING_DAYS    = 1,2,3,4,5
 * 3. Deploy → Web app → Execute as: Me → Anyone
 * 4. Copy Web App URL → GitHub Secret NEXT_PUBLIC_BOOKING_API_URL
 */

// ─── HTTP handlers ───────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';

    if (action === 'availability') {
      var date = e.parameter.date;
      var duration = parseInt(e.parameter.duration, 10) || 60;
      return jsonResponse(getAvailability(date, duration));
    }

    return jsonResponse({
      success: true,
      message: 'Equilibrium Booking API is running.',
      version: '2.0'
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

function getAvailability(dateStr, durationMinutes) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { success: false, date: dateStr, slots: [], message: 'Invalid date.' };
  }

  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var bookingDays = getConfig('BOOKING_DAYS', '1,2,3,4,5').split(',').map(Number);
  var dayOfWeek = parseDateInTz(dateStr, tz).getDay();
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

  return { success: true, date: dateStr, slots: available };
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

  return CalendarApp.getCalendarById(calendarId)
    .getEvents(dayStart, dayEnd)
    .map(function (ev) {
      return { start: ev.getStartTime(), end: ev.getEndTime() };
    });
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

  var tz = getConfig('TIMEZONE', 'Pacific/Auckland');
  var siteUrl = getConfig('SITE_URL', 'https://agent5479.github.io/equilibrium/');
  var duration = parseInt(data.durationMinutes, 10);
  var dateStr = data.preferredDate;
  var timeStr = data.preferredTime;

  var availability = getAvailability(dateStr, duration);
  if (availability.slots.indexOf(timeStr) === -1) {
    return { success: false, message: 'That time slot is no longer available. Please choose another.' };
  }

  var startTime = combineDateTime(dateStr, timeStr, tz);
  var endTime = new Date(startTime.getTime() + duration * 60000);
  var bookingId = 'EQ-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd') + '-' + randomId(4);
  var calendarId = getConfig('CALENDAR_ID', 'primary');
  var ownerEmail = getConfig('OWNER_EMAIL', 'goldenbayorganicstakaka@gmail.com');

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
    'Booked via ' + siteUrl
  ].join('\n');

  var guests = data.email;
  if (ownerEmail && ownerEmail !== data.email) {
    guests = data.email + ',' + ownerEmail;
  }

  var event = calendar.createEvent(eventTitle, startTime, endTime, {
    description: eventDescription,
    location: 'Online or in person — Equilibrium Kinesiology & Nutrition',
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
    '',
    data.message ? 'Your message: ' + data.message : '',
    '',
    'A Google Calendar invitation has been sent to this email address.',
    'Please accept the invite in your inbox to add the appointment to your calendar.',
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
