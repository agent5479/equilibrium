import { getBookingApiUrl } from "@/lib/booking";

const TOKEN_KEY = "eq_admin_token";
const EXPIRES_KEY = "eq_admin_expires";

export interface AdminClient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  source: string;
  subscribed: "yes" | "no";
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  expiresAt?: number;
}

export interface AdminListResponse {
  success: boolean;
  message?: string;
  clients?: AdminClient[];
}

export interface AdminSendResponse {
  success: boolean;
  message: string;
  sent?: number;
  failed?: string[];
}

export interface AdminUpsertResponse {
  success: boolean;
  message: string;
  client?: AdminClient;
}

function apiNotConfigured(): string {
  return "API is not configured. Set NEXT_PUBLIC_BOOKING_API_URL.";
}

async function postAdmin<T>(body: Record<string, unknown>): Promise<T> {
  const apiUrl = getBookingApiUrl();
  if (!apiUrl) {
    return { success: false, message: apiNotConfigured() } as T;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  } catch {
    return {
      success: false,
      message: "Could not reach the server. Please try again.",
    } as T;
  }
}

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expires = Number(sessionStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || !expires || Date.now() > expires) {
    clearAdminSession();
    return null;
  }
  return token;
}

export function storeAdminSession(token: string, expiresAt: number): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
}

export async function adminLogin(password: string): Promise<AdminLoginResponse> {
  const result = await postAdmin<AdminLoginResponse>({
    action: "adminLogin",
    password,
  });
  if (result.success && result.token && result.expiresAt) {
    storeAdminSession(result.token, result.expiresAt);
  }
  return result;
}

export async function adminListClients(
  token: string
): Promise<AdminListResponse> {
  return postAdmin<AdminListResponse>({
    action: "adminListClients",
    token,
  });
}

export async function adminUpsertClient(
  token: string,
  client: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    source?: string;
    subscribed?: string;
  }
): Promise<AdminUpsertResponse> {
  return postAdmin<AdminUpsertResponse>({
    action: "adminUpsertClient",
    token,
    ...client,
  });
}

export async function adminSendEmail(
  token: string,
  payload: { subject: string; body: string; emails: string[] }
): Promise<AdminSendResponse> {
  return postAdmin<AdminSendResponse>({
    action: "adminSendEmail",
    token,
    ...payload,
  });
}
