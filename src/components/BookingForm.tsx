"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BOOKING_SERVICES,
  fetchAvailability,
  fetchAvailableDates,
  submitBooking,
  type BookingRequest,
} from "@/lib/booking";

type FormState = "idle" | "loading-slots" | "submitting" | "success" | "error";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function maxDateIso(): string {
  const parts = todayIso().split("-").map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  d.setUTCMonth(d.getUTCMonth() + 3);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BookingForm() {
  const [serviceId, setServiceId] = useState(BOOKING_SERVICES[1].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesMessage, setDatesMessage] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotMessage, setSlotMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");
  const [bookingId, setBookingId] = useState("");

  const selectedService =
    BOOKING_SERVICES.find((s) => s.id === serviceId) ?? BOOKING_SERVICES[1];

  const loadDates = useCallback(async () => {
    setDatesLoading(true);
    setDate("");
    setTime("");
    setSlots([]);
    setSlotMessage("");

    const result = await fetchAvailableDates(
      todayIso(),
      maxDateIso(),
      selectedService.durationMinutes,
      selectedService.windowKind
    );

    setAvailableDates(result.dates);
    setDatesLoading(false);

    if (!result.success && result.message) {
      setFeedback(result.message);
      setDatesMessage("");
    } else {
      setFeedback("");
      setDatesMessage(result.message || "");
    }
  }, [selectedService.durationMinutes, selectedService.windowKind]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  const loadSlots = useCallback(async () => {
    if (!date) {
      setSlots([]);
      setSlotMessage("");
      return;
    }
    setFormState("loading-slots");
    setTime("");
    const result = await fetchAvailability(
      date,
      selectedService.durationMinutes,
      selectedService.windowKind
    );
    setSlots(result.slots);
    setFormState("idle");
    if (!result.success && result.message) {
      setFeedback(result.message);
      setSlotMessage("");
    } else {
      setFeedback("");
      setSlotMessage(result.message || "");
    }
  }, [date, selectedService.durationMinutes, selectedService.windowKind]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) {
      setFeedback("Please choose a date and time.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setFeedback("");

    const request: BookingRequest = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      serviceId: selectedService.id,
      serviceLabel: selectedService.label,
      durationMinutes: selectedService.durationMinutes,
      windowKind: selectedService.windowKind,
      preferredDate: date,
      preferredTime: time,
      message: message.trim() || undefined,
      sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
    };

    const result = await submitBooking(request);

    if (result.success) {
      setFormState("success");
      setFeedback(result.message);
      setBookingId(result.bookingId || "");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setDate("");
      setTime("");
      setSlots([]);
      setSlotMessage("");
      loadDates();
    } else {
      setFormState("error");
      setFeedback(result.message);
    }
  }

  if (formState === "success") {
    return (
      <div className="booking-success">
        <h2>Booking request received</h2>
        <p>{feedback}</p>
        {bookingId && (
          <p className="booking-reference">
            Reference: <strong>{bookingId}</strong>
          </p>
        )}
        <p>
          Patricia will confirm your appointment by email. If you need to change your
          booking, please contact her directly.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setFormState("idle");
            setFeedback("");
            setBookingId("");
          }}
        >
          Book another session
        </button>
      </div>
    );
  }

  const apiConfigured = Boolean(process.env.NEXT_PUBLIC_BOOKING_API_URL);
  const slotsLoading = formState === "loading-slots";

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {!apiConfigured && (
        <div className="booking-alert">
          Booking API URL is not configured. Add <code>NEXT_PUBLIC_BOOKING_API_URL</code>{" "}
          to your environment (or GitHub Secret) with your deployed Google Apps Script
          web app URL.
        </div>
      )}

      <div className="form-group">
        <label htmlFor="service">Service *</label>
        <select
          id="service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {BOOKING_SERVICES.map((service) => (
            <option key={service.id} value={service.id}>
              {service.label} — {service.price}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Preferred date *</label>
        <p className="booking-time-help">
          Only dates with open{" "}
          {selectedService.windowKind === "discovery" ? (
            <>
              <strong>Discovery</strong> windows
            </>
          ) : (
            <>
              <strong>Equilibrium</strong> windows
            </>
          )}{" "}
          for this session type are listed.
        </p>
        <select
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={datesLoading || availableDates.length === 0}
        >
          <option value="">
            {datesLoading
              ? "Loading available dates…"
              : availableDates.length === 0
                ? "No dates available"
                : "Choose a date"}
          </option>
          {availableDates.map((d) => (
            <option key={d} value={d}>
              {formatDateLabel(d)}
            </option>
          ))}
        </select>
        {!datesLoading && availableDates.length === 0 && (
          <p className="booking-slots-empty" style={{ marginTop: "0.75rem" }}>
            {datesMessage ||
              "No bookable dates in the next three months. Call Patricia on 021 991 989."}
          </p>
        )}
      </div>

      <fieldset className="form-group booking-time-fieldset">
        <legend>Preferred time *</legend>
        <p className="booking-time-help">
          {selectedService.windowKind === "discovery" ? (
            <>
              Free Discovery calls use calendar blocks titled &ldquo;Discovery&rdquo;.
            </>
          ) : (
            <>
              Paid sessions use calendar blocks titled &ldquo;Equilibrium&rdquo;.
            </>
          )}{" "}
          Times are 15-minute starts inside those windows that are still free. All times
          are New Zealand (Pacific/Auckland).
        </p>

        {!date && (
          <p className="booking-slots-empty">Select a date to see available times.</p>
        )}

        {date && slotsLoading && (
          <p className="booking-slots-empty">Loading available times…</p>
        )}

        {date && !slotsLoading && slots.length === 0 && (
          <p className="booking-slots-empty">
            {slotMessage ||
              "No times left on this day. Try another date, or call Patricia on 021 991 989."}
          </p>
        )}

        {date && !slotsLoading && slots.length > 0 && (
          <div
            className="booking-slot-grid"
            role="listbox"
            aria-label="Available times"
          >
            {slots.map((slot) => {
              const selected = time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`booking-slot${selected ? " booking-slot--selected" : ""}`}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}

        <input type="hidden" name="preferredTime" value={time} />
      </fieldset>

      <div className="form-group">
        <label htmlFor="booking-name">Full name *</label>
        <input
          type="text"
          id="booking-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="booking-email">Email *</label>
        <input
          type="email"
          id="booking-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="booking-phone">Phone</label>
        <input
          type="tel"
          id="booking-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="021 991 989"
        />
      </div>

      <div className="form-group">
        <label htmlFor="booking-message">Message (optional)</label>
        <textarea
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything Patricia should know before your session?"
        />
      </div>

      {feedback && formState === "error" && (
        <div className="booking-alert booking-alert-error">{feedback}</div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={formState === "submitting" || !apiConfigured}
      >
        {formState === "submitting" ? "Submitting…" : "Request booking"}
      </button>

      <p className="form-notice">
        Your booking will be added to Patricia&apos;s calendar and you will receive a
        confirmation email at the address you provide. Notifications go to{" "}
        patricia@equilibriumhealth.nz.
      </p>
    </form>
  );
}
