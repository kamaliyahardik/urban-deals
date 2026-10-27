/**
 * Admin session helpers.
 *
 * - Token always lives in sessionStorage for the current tab.
 * - When "Save login info" is ticked at login, a PERSISTENT copy is kept in
 *   localStorage + a remember flag, so the admin skips the login page on the
 *   next browser session and lands straight in the dashboard.
 */

const TOKEN_KEY = "adminToken";
const REMEMBER_KEY = "adminRemembered";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? null
    );
  } catch {
    return null;
  }
}

export function isRemembered(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdminSession(token: string, remember: boolean) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_KEY, "1");
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    /* storage may be unavailable (private mode) — session still works in-memory */
  }
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* noop */
  }
}

/** Can the admin skip the login page? Only via the remembered flag + valid token. */
export function canAutoLogin(): boolean {
  return isRemembered() && Boolean(getAdminToken());
}
