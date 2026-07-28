"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BOOKING_SERVICES,
  fetchAvailability,
  fetchAvailableDates,
  submitBooking,
  type BookingRequest,
  type BookingService,
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

function formatDateChip(iso: string): { weekday: string; day: string; month: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    weekday: date.toLocaleDateString("en-NZ", {
      weekday: "short",
      timeZone: "UTC",
    }),
    day: date.toLocaleDateString("en-NZ", {
      day: "numeric",
      timeZone: "UTC",
    }),
    month: date.toLocaleDateString("en-NZ", {
      month: "short",
      timeZone: "UTC",
    }),
  };
}

function serviceTitle(service: BookingService): string {
  if (service.windowKind === "discovery") return "Discovery call";
  return `${service.durationMinutes} minutes`;
}

function serviceSubtitle(service: BookingService): string {
  if (service.windowKind === "discovery") {
    return "Free intro — find out if a longer session is right for you";
  }
  return "Kinesiology / Nutrition session";
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
      <div className="booking-success" role="status">
        <p className="booking-success-eyebrow">All set</p>
        <h2>Booking request received</h2>
        <p>{feedback}</p>
        {bookingId && (
          <p className="booking-reference">
            Reference: <strong>{bookingId}</strong>
          </p>
        )}
        <p>
          Patricia will confirm your appointment by email. If you need to change
          your booking, please contact her directly.
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
          Booking API URL is not configured. Add{" "}
          <code>NEXT_PUBLIC_BOOKING_API_URL</code> to your environment (or GitHub
          Secret) with your deployed Google Apps Script web app URL.
        </div>
      )}

      <section className="booking-section" aria-labelledby="booking-step-service">
        <header className="booking-section-header">
          <span className="booking-step-num" aria-hidden="true">
            1
          </span>
          <div>
            <h2 id="booking-step-service">Service</h2>
            <p className="booking-time-help">
              Pick the session length that suits you.
            </p>
          </div>
        </header>

        <div
          className="booking-service-grid"
          role="radiogroup"
          aria-labelledby="booking-step-service"
        >
          {BOOKING_SERVICES.map((service) => {
            const selected = serviceId === service.id;
            const featured = service.windowKind === "discovery";
            return (
              <button
                key={service.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={[
                  "booking-service",
                  selected ? "booking-service--selected" : "",
                  featured ? "booking-service--featured" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setServiceId(service.id)}
              >
                <span className="booking-service-top">
                  <span className="booking-service-title">
                    {serviceTitle(service)}
                  </span>
                  <span className="booking-service-price">{service.price}</span>
                </span>
                <span className="booking-service-sub">
                  {serviceSubtitle(service)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="booking-section" aria-labelledby="booking-step-when">
        <header className="booking-section-header">
          <span className="booking-step-num" aria-hidden="true">
            2
          </span>
          <div>
            <h2 id="booking-step-when">Date &amp; time</h2>
            <p className="booking-time-help">
              Only openings for this session type are shown. Times are New Zealand
              (Pacific/Auckland).
            </p>
          </div>
        </header>

        <div className="booking-when">
          <div className="booking-when-block">
            <h3 className="booking-subheading">Preferred date</h3>

            {datesLoading && (
              <p className="booking-slots-empty">Loading available dates…</p>
            )}

            {!datesLoading && availableDates.length === 0 && (
              <p className="booking-slots-empty">
                {datesMessage ||
                  "No bookable dates in the next three months. Call Patricia on 021 991 989."}
              </p>
            )}

            {!datesLoading && availableDates.length > 0 && (
              <div
                className="booking-date-grid"
                role="listbox"
                aria-label="Available dates"
              >
                {availableDates.map((d) => {
                  const selected = date === d;
                  const chip = formatDateChip(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={formatDateLabel(d)}
                      className={`booking-date${selected ? " booking-date--selected" : ""}`}
                      onClick={() => setDate(d)}
                    >
                      <span className="booking-date-weekday">{chip.weekday}</span>
                      <span className="booking-date-day">{chip.day}</span>
                      <span className="booking-date-month">{chip.month}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <fieldset className="booking-time-fieldset booking-when-block">
            <legend className="booking-subheading">Preferred time</legend>

            {!date && (
              <p className="booking-slots-empty">
                Select a date to see available times.
              </p>
            )}

            {date && slotsLoading && (
              <div className="booking-slot-grid booking-slot-grid--loading" aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="booking-slot-skeleton" />
                ))}
              </div>
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
            <input type="hidden" name="preferredDate" value={date} />
          </fieldset>
        </div>
      </section>

      <section className="booking-section" aria-labelledby="booking-step-details">
        <header className="booking-section-header">
          <span className="booking-step-num" aria-hidden="true">
            3
          </span>
          <div>
            <h2 id="booking-step-details">Your details</h2>
            <p className="booking-time-help">
              So Patricia can confirm your appointment.
            </p>
          </div>
        </header>

        <div className="booking-details-grid">
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
        </div>

        <div className="form-group">
          <label htmlFor="booking-phone">Phone</label>
          <input
            type="tel"
            id="booking-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="021 000 0000"
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
      </section>

      {feedback && formState === "error" && (
        <div className="booking-alert booking-alert-error" role="alert">
          {feedback}
        </div>
      )}

      <div className="booking-submit">
        <button
          type="submit"
          className="btn-primary booking-submit-btn"
          disabled={formState === "submitting" || !apiConfigured}
        >
          {formState === "submitting" ? "Submitting…" : "Request booking"}
        </button>

        <p className="form-notice booking-notice">
          Your booking will be added to Patricia&apos;s calendar and you will
          receive a confirmation email. Notifications go to{" "}
          patricia@equilibriumhealth.nz.
        </p>
      </div>
    </form>
  );
}
