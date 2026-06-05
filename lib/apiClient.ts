/**
 * apiClient — the single fetch wrapper every service routes through.
 *
 * Responsibilities:
 *  - Prepend NEXT_PUBLIC_API_URL.
 *  - Inject `Authorization: Bearer <jwt>` and `X-Company-Id: <companyId>` from
 *    authStore on every request (the Phase 3 backend needs both to resolve the
 *    company schema).
 *  - Centralize 401 handling (clear auth + redirect, via authStore).
 *  - Preserve existing error behaviour: throw the response text body so callers
 *    surface the backend's message.
 */
import { getToken, getCompanyId, handleUnauthorized } from "@/lib/authStore";
import type { Company, LoginResponse, User } from "@/types/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export interface ApiFetchOptions {
  method?: string;
  /** Object body → JSON.stringify + `Content-Type: application/json`. */
  json?: unknown;
  /** Raw body escape hatch (e.g. FormData) — no Content-Type is set. */
  body?: BodyInit;
  /** Extra headers, merged last so callers can override. */
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip auth headers + 401 handling (only for /auth/login). */
  skipAuth?: boolean;
  /** Response parsing. Default "json"; use "none" for 204/DELETE. */
  parse?: "json" | "text" | "none";
}

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const { method, json, body, headers, signal, skipAuth, parse = "json" } = opts;

  const finalHeaders: Record<string, string> = {};

  let finalBody: BodyInit | undefined = body;
  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(json);
  }

  if (!skipAuth) {
    const token = getToken();
    const companyId = getCompanyId();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
    if (companyId) finalHeaders["X-Company-Id"] = companyId;
  }

  // Caller-supplied headers win.
  if (headers) Object.assign(finalHeaders, headers);

  const response = await fetch(`${baseUrl}${path}`, {
    method: method ?? "GET",
    headers: finalHeaders,
    body: finalBody,
    signal,
  });

  if (!skipAuth && response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (parse === "none") return undefined as T;
  if (parse === "text") return (await response.text()) as T;
  return (await response.json()) as T;
}

/**
 * Pull a human-readable message out of an error response. FastAPI returns
 * `{ "detail": "..." }` (or a list for validation errors); fall back to the
 * raw text, then the status text.
 */
async function extractErrorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  if (text) {
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    } catch {
      /* not JSON — use the raw text below */
    }
    return text;
  }
  return response.statusText || "Request failed";
}

// --- Auth endpoint helpers -------------------------------------------------

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    json: { email, password },
    skipAuth: true,
  });
}

export function getCompanies(): Promise<Company[]> {
  return apiFetch<Company[]>("/auth/companies");
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}
