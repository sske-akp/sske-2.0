/**
 * authStore — the single source of truth for the JWT and the active company id.
 *
 * Lives outside React because the plain (non-component) service functions in
 * `services/*` route every request through `apiFetch`, which must read the
 * current token/company synchronously on each call. React state updates
 * asynchronously, so it cannot be that source of truth. localStorage is, and
 * `AuthProvider` mirrors it for reactive UI.
 *
 * All localStorage access is guarded for SSR (Next.js renders these modules on
 * the server, where `window` is undefined).
 */

const TOKEN_KEY = "sske.token";
const COMPANY_KEY = "sske.companyId";

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let onUnauthorized: (() => void) | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  if (!isBrowser()) return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function notify(): void {
  subscribers.forEach((cb) => cb());
}

export function getToken(): string | null {
  return read(TOKEN_KEY);
}

export function getCompanyId(): string | null {
  return read(COMPANY_KEY);
}

export function setToken(token: string | null): void {
  write(TOKEN_KEY, token);
  notify();
}

export function setCompanyId(companyId: string | null): void {
  write(COMPANY_KEY, companyId);
  notify();
}

/** Clear all auth state (logout / 401). */
export function clear(): void {
  write(TOKEN_KEY, null);
  write(COMPANY_KEY, null);
  notify();
}

/** Subscribe to any auth-state change. Returns an unsubscribe function. */
export function subscribe(cb: Subscriber): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

/**
 * Register the handler `apiFetch` calls on a 401. AuthProvider sets this to
 * clear the React Query cache and redirect to /login, so apiClient never needs
 * to import React or the router.
 */
export function setOnUnauthorized(cb: (() => void) | null): void {
  onUnauthorized = cb;
}

/** Invoked by apiClient when a request returns 401. */
export function handleUnauthorized(): void {
  clear();
  onUnauthorized?.();
}
