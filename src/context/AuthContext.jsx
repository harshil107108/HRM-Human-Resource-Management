import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api, apiEndpoints } from "@/api/api";
import { addApiInterceptor } from "@/hooks/useApiCall";

/**
 * AuthContext
 * ---------------------------------------------------------------------------
 * Holds the signed-in session: token, user, effective permissions
 * ({ [menuCode]: ["view","add","edit","delete"] }) and the sidebar menu tree.
 *
 * - The token is sent on every useApiCall request (Authorization header).
 * - A 401 from the API (expired/invalid session) signs the user out.
 * - On reload the session is restored from storage and refreshed via /auth/me,
 *   so permission changes apply on the next page load.
 * ---------------------------------------------------------------------------
 */

const STORAGE_KEY = "hrm.session";
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredSession = (session) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode): the session lasts for this tab only.
  }
};

// Read synchronously so the first API call of a reload is already signed.
let currentToken = readStoredSession()?.token || null;

const isAuthEndpoint = (url = "") => url.includes(apiEndpoints.auth.login);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  // true while an existing session is being re-validated on load.
  const [restoring, setRestoring] = useState(Boolean(readStoredSession()?.token));

  const applySession = useCallback((next) => {
    currentToken = next?.token || null;
    writeStoredSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    applySession(null);
  }, [applySession]);

  // Attach the token; sign out when the API rejects the session.
  useEffect(() => {
    const eject = addApiInterceptor({
      onRequest: (config) => {
        if (currentToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      onResponseError: (error) => {
        if (error?.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
          applySession(null);
        }
        return Promise.reject(error);
      },
    });
    return eject;
  }, [applySession]);

  // Refresh user, permissions and menus from the server on load.
  useEffect(() => {
    const stored = readStoredSession();
    if (!stored?.token) return undefined;

    let cancelled = false;
    axios
      .post(api + apiEndpoints.auth.me, {}, { headers: { Authorization: `Bearer ${stored.token}` } })
      .then((res) => {
        if (!cancelled && res.data?.success) applySession({ token: stored.token, ...res.data.data });
      })
      .catch((error) => {
        // Only a rejected session signs out; a network blip keeps the cached one.
        if (!cancelled && error?.response?.status === 401) applySession(null);
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (username, password) => {
      try {
        const res = await axios.post(api + apiEndpoints.auth.login, { username, password });
        if (!res.data?.success) {
          return { success: false, message: res.data?.message || "Sign in failed." };
        }
        applySession(res.data.data);
        return { success: true };
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          (error?.response ? "Sign in failed. Please try again." : "Can't reach the server. Check your connection.");
        return { success: false, message };
      }
    },
    [applySession],
  );

  // Re-fetch user, permissions and menus (e.g. after changing role permissions).
  const refreshSession = useCallback(async () => {
    if (!currentToken) return;
    try {
      const res = await axios.post(api + apiEndpoints.auth.me, {}, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (res.data?.success) applySession({ token: currentToken, ...res.data.data });
    } catch (error) {
      if (error?.response?.status === 401) applySession(null);
    }
  }, [applySession]);

  const value = useMemo(() => {
    const permissions = session?.permissions || {};
    const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
    const can = (menuCode, action = "view") =>
      isSuperAdmin || Boolean(permissions[menuCode]?.includes(action));

    return {
      isAuthenticated: Boolean(session?.token),
      restoring,
      user: session?.user || null,
      permissions,
      menus: session?.menus || [],
      routes: session?.routes || [],
      isSuperAdmin,
      can,
      login,
      logout,
      refreshSession,
    };
  }, [session, restoring, login, logout, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
