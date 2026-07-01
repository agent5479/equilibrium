export interface BookingService {
  id: string;
  label: string;
  durationMinutes: number;
  price: string;
}

export const BOOKING_SERVICES: BookingService[] = [
  {
    id: "free-15",
    label: "Free 15-minute online intro session",
    durationMinutes: 15,
    price: "Free",
  },
  {
    id: "session-30",
    label: "30 minute Kinesiology / Nutrition session",
    durationMinutes: 30,
    price: "$80",
  },
  {
    id: "session-60",
    label: "60 minute Kinesiology / Nutrition session",
    durationMinutes: 60,
    price: "$120",
  },
  {
    id: "session-90",
    label: "90 minute Kinesiology / Nutrition session",
    durationMinutes: 90,
    price: "$160",
  },
  {
    id: "session-120",
    label: "120 minute Kinesiology / Nutrition session",
    durationMinutes: 120,
    price: "$195",
  },
];

export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  serviceId: string;
  serviceLabel: string;
  durationMinutes: number;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  sourceUrl?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  date: string;
  slots: string[];
  message?: string;
}

export function getBookingApiUrl(): string {
  return process.env.NEXT_PUBLIC_BOOKING_API_URL || "";
}

export async function fetchAvailability(
  date: string,
  durationMinutes: number
): Promise<AvailabilityResponse> {
  const apiUrl = getBookingApiUrl();
  if (!apiUrl) {
    return {
      success: false,
      date,
      slots: [],
      message: "Booking API is not configured.",
    };
  }

  const url = new URL(apiUrl);
  url.searchParams.set("action", "availability");
  url.searchParams.set("date", date);
  url.searchParams.set("duration", String(durationMinutes));

  const response = await fetch(url.toString());
  if (!response.ok) {
    return {
      success: false,
      date,
      slots: [],
      message: "Could not load availability.",
    };
  }

  return response.json() as Promise<AvailabilityResponse>;
}

export async function submitBooking(
  request: BookingRequest
): Promise<BookingResponse> {
  const apiUrl = getBookingApiUrl();
  if (!apiUrl) {
    return {
      success: false,
      message:
        "Online booking is not configured yet. Please contact Patricia by phone or email.",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "book",
        ...request,
      }),
    });

    const data = (await response.json()) as BookingResponse;
    return data;
  } catch {
    return {
      success: false,
      message: "Something went wrong submitting your booking. Please try again or contact Patricia directly.",
    };
  }
}
