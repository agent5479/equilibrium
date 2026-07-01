export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
}

// Phase 2: POST to Google Apps Script endpoint configured via GitHub Secrets
export async function submitBooking(
  request: BookingRequest
): Promise<BookingResponse> {
  void request;
  return {
    success: false,
    message: "Booking integration not yet implemented.",
  };
}
