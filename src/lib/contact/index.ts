import { getBookingApiUrl } from "@/lib/booking";

export interface ContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface NewsletterRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface FormResponse {
  success: boolean;
  message: string;
}

function apiNotConfigured(): FormResponse {
  return {
    success: false,
    message:
      "Online forms are not configured yet. Please call 021 991 989 or email Patricia.",
  };
}

async function postForm(
  body: Record<string, unknown>
): Promise<FormResponse> {
  const apiUrl = getBookingApiUrl();
  if (!apiUrl) return apiNotConfigured();

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as FormResponse;
  } catch {
    return {
      success: false,
      message:
        "Something went wrong. Please try again or contact Patricia directly.",
    };
  }
}

export async function submitContact(
  request: ContactRequest
): Promise<FormResponse> {
  return postForm({ action: "contact", ...request });
}

export async function submitNewsletter(
  request: NewsletterRequest
): Promise<FormResponse> {
  return postForm({ action: "newsletterSubscribe", ...request });
}
