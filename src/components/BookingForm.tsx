"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BOOKING_SERVICES,
  fetchAvailability,
  submitBooking,
  type BookingRequest,
} from "@/lib/booking";

type FormState = "idle" | "loading-slots" | "submitting" | "success" | "error";

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function maxDateIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export default function BookingForm() {
  const [serviceId, setServiceId] = useState(BOOKING_SERVICES[1].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");
  const [bookingId, setBookingId] = useState("");

  const selectedService =
    BOOKING_SERVICES.find((s) => s.id === serviceId) ?? BOOKING_SERVICES[1];

  const loadSlots = useCallback(async () => {
    if (!date) {
      setSlots([]);
      return;
    }
    setFormState("loading-slots");
    setTime("");
    const result = await fetchAvailability(date, selectedService.durationMinutes);
    setSlots(result.slots);
    setFormState("idle");
    if (!result.success && result.message) {
      setFeedback(result.message);
    } else {
      setFeedback("");
    }
  }, [date, selectedService.durationMinutes]);

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

      <div className="booking-datetime">
        <div className="form-group">
          <label htmlFor="date">Preferred date *</label>
          <input
            type="date"
            id="date"
            value={date}
            min={todayIso()}
            max={maxDateIso()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Preferred time *</label>
          <select
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={!date || formState === "loading-slots" || slots.length === 0}
          >
            <option value="">
              {formState === "loading-slots"
                ? "Loading times…"
                : slots.length === 0
                  ? date
                    ? "No times available"
                    : "Select a date first"
                  : "Choose a time"}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        confirmation email. All times are New Zealand (Pacific/Auckland).
      </p>
    </form>
  );
}
