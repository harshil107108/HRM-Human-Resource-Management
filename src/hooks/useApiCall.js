/**
 * useApiCall.js
 * ------------------------------------------------------------------
 * Industry-grade React hook for handling API calls with:
 *  - Zero try/catch boilerplate at the call site
 *  - Built-in, user-friendly error dialog (fully overridable)
 *  - "Try again" for transient failures (offline, timeout, 429, 502-504)
 *  - Per-id pending state (supports multiple simultaneous calls)
 *  - Auto-cancel of duplicate in-flight requests (same id)
 *  - Global config (set once in app entry) + per-call config override
 *  - Consistent { success, data, error } response shape
 *
 * Dialogs/toasts come from the shared feedback system
 * (src/components/feedback), so they match every other popup.
 * ------------------------------------------------------------------
 *
 * USAGE
 * -----
 * // 1) One-time setup (App.js / index.js) — point the hook at your backend:
 * import { configureApiCall } from './useApiCall';
 * configureApiCall({ baseURL: 'http://192.168.77.6:8001' });
 *
 * // 2) In any component:
 * const { apiCall, isPending } = useApiCall();
 *
 * const res = await apiCall({
 *   id: 'getUser',
 *   api: 'api/getuser',       // <-- just the endpoint path (string)
 *   payload: { userId: 1 },   // optional, sent as body (POST) or query (GET)
 *   method: 'get',            // optional, defaults to 'post'
 * });
 *
 * if (res.success) console.log(res.data);
 * // On failure, popup is already shown automatically. No try/catch needed.
 * // If the user chooses "Try again" on a transient failure, apiCall
 * // re-sends the request and resolves with that attempt's result.
 *
 * // Granular loading state:
 * isPending('getUser')   -> boolean for that specific call
 * isPending()            -> boolean, true if ANY call is pending
 * ------------------------------------------------------------------
 */

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { errorDialog, showToast } from "@/components/feedback";
import { describeApiError } from "@/utils/apiErrors";
import { beginActivity } from "@/utils/networkActivity";

// ============================================================
// GLOBAL CONFIG
// Call configureApiCall() once (e.g. in App.js / index.js) to
// customize behavior app-wide without touching this file again.
// ============================================================
const defaultGetErrorMessage = (error) => describeApiError(error).message;

const defaultConfig = {
  // Base URL prepended to every "api" string you pass to apiCall().
  // e.g. baseURL: 'http://192.168.77.6:8001'  +  api: 'api/getuser'
  //      -> http://192.168.77.6:8001/api/getuser
  baseURL: "",
  headers: {},

  // Default HTTP method used when apiCall() doesn't specify one.
  defaultMethod: "post",

  showErrorAlert: true,
  showSuccessAlert: false,

  // Offer "Try again" on network/timeout/429/5xx-gateway failures.
  retryOnTransientError: true,

  // null -> a title matching the failure ("Can't reach the server", ...)
  errorTitle: null,
  successTitle: "Saved successfully",
  successMessage: "Your changes have been saved.",

  // Extra options for the error dialog / success toast
  // (e.g. { title, text } overrides). Names kept for compatibility.
  swalErrorOptions: {},
  swalSuccessOptions: {},

  // Customize how the error message is extracted from different
  // API/error shapes (axios, fetch, custom backend error format, etc.)
  // The default hides stack traces / database internals.
  getErrorMessage: defaultGetErrorMessage,

  // Global hooks, useful for logging/analytics/sentry etc.
  onError: null,
  onSuccess: null,
};

let globalConfig = { ...defaultConfig };

// The actual axios instance used for every call. Rebuilt whenever
// baseURL / headers change via configureApiCall().
let axiosInstance = axios.create({
  baseURL: globalConfig.baseURL,
  headers: globalConfig.headers,
});

/**
 * Override global defaults. Call once at app bootstrap.
 * Supports: baseURL, headers, defaultMethod, alert text/options,
 * getErrorMessage, onError, onSuccess.
 * @param {Partial<typeof defaultConfig>} customConfig
 */
export function configureApiCall(customConfig = {}) {
  globalConfig = { ...globalConfig, ...customConfig };
  axiosInstance = axios.create({
    baseURL: globalConfig.baseURL,
    headers: globalConfig.headers,
  });
}

/**
 * Attach an axios request/response interceptor (e.g. to inject an
 * auth token on every request). Returns the eject function.
 */
export function addApiInterceptor({
  onRequest,
  onResponse,
  onResponseError,
} = {}) {
  const reqId = onRequest
    ? axiosInstance.interceptors.request.use(onRequest)
    : null;
  const resId =
    onResponse || onResponseError
      ? axiosInstance.interceptors.response.use(onResponse, onResponseError)
      : null;

  return () => {
    if (reqId !== null) axiosInstance.interceptors.request.eject(reqId);
    if (resId !== null) axiosInstance.interceptors.response.eject(resId);
  };
}

const isAbortError = (error) =>
  error?.name === "CanceledError" ||
  error?.name === "AbortError" ||
  axios.isCancel?.(error);

// ============================================================
// HOOK
// ============================================================
export default function useApiCall() {
  const [pendingMap, setPendingMap] = useState({});
  const controllersRef = useRef({}); // id -> AbortController

  const setPendingFor = (id, value) => {
    setPendingMap((prev) => {
      if (value) return { ...prev, [id]: true };
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  /**
   * isPending(id?) -> boolean
   * - isPending('createUser') -> pending state of that specific call
   * - isPending()             -> true if ANY call is currently pending
   */
  const isPending = useCallback(
    (id) => (id ? !!pendingMap[id] : Object.keys(pendingMap).length > 0),
    [pendingMap],
  );

  /**
   * apiCall({ id, api, payload, method, params, config, silent })
   *
   * @param {string} id                 Unique key for this call (used for pending state + auto-cancel)
   * @param {string|Function} api       Endpoint path, e.g. 'api/getuser' (uses configured baseURL),
   *                                    a full URL, OR a custom function (payload, {signal}) => Promise
   *                                    for edge cases the built-in axios instance can't handle.
   * @param {*} [payload]               Sent as request body (post/put/patch) or query params (get/delete)
   * @param {'get'|'post'|'put'|'patch'|'delete'} [method]  Defaults to globalConfig.defaultMethod ('post')
   * @param {object} [params]           Extra query params (merged in addition to payload for GET)
   * @param {object} [config]           Per-call override of global config
   * @param {boolean} [silent]          Shortcut to fully suppress the error popup for this call
   * @param {boolean} [showSuccessAlert] Show a "saved" toast when the call succeeds
   * @returns {Promise<{success:boolean, data:any, error:any, aborted?:boolean}>}
   */
  const apiCall = useCallback(
    async ({
      id,
      api,
      payload,
      method,
      params,
      config = {},
      silent = false,
      showSuccessAlert = false,
    }) => {
      if (!api) {
        throw new Error(
          'useApiCall: "api" is required (endpoint string, e.g. "api/getuser")',
        );
      }

      const callId =
        id || `call_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const mergedConfig = {
        ...globalConfig,
        ...config,
        showErrorAlert: silent
          ? false
          : (config.showErrorAlert ?? globalConfig.showErrorAlert),
      };

      setPendingFor(callId, true);

      const attempt = async () => {
        // Cancel a previous in-flight call sharing the same id
        controllersRef.current[callId]?.abort();
        const controller = new AbortController();
        controllersRef.current[callId] = controller;

        try {
          const httpMethod = (method || globalConfig.defaultMethod).toLowerCase();
          const isBodyMethod = ["post", "put", "patch"].includes(httpMethod);

          let data;

          if (typeof api === "function") {
            // Escape hatch: caller supplied a custom request function
            data = await api(payload, { signal: controller.signal });
          } else {
            const response = await axiosInstance.request({
              url: api, // e.g. 'api/getuser' -> resolved against configured baseURL
              method: httpMethod,
              data: isBodyMethod ? payload : undefined,
              params: isBodyMethod ? params : { ...payload, ...params },
              signal: controller.signal,
            });
            data = response.data;
          }

          if (showSuccessAlert || mergedConfig.showSuccessAlert) {
            const { title, text, timer } = mergedConfig.swalSuccessOptions || {};
            showToast({
              type: "success",
              title: title || mergedConfig.successTitle,
              message: text ?? mergedConfig.successMessage,
              duration: timer,
            });
          }

          mergedConfig.onSuccess?.(data, { id: callId, payload });

          return { success: true, data, error: null };
        } catch (error) {
          // Silently ignore aborted/canceled requests (not real errors)
          if (isAbortError(error)) {
            return { success: false, data: null, error, aborted: true };
          }

          mergedConfig.onError?.(error, { id: callId, payload });

          if (mergedConfig.showErrorAlert) {
            const described = describeApiError(error);
            const message =
              mergedConfig.getErrorMessage === defaultGetErrorMessage
                ? described.message
                : mergedConfig.getErrorMessage(error);
            const retryable =
              described.retryable && mergedConfig.retryOnTransientError !== false;

            const dialog = errorDialog({
              title: mergedConfig.errorTitle || described.title,
              text: message,
              details: described.details,
              iconName: described.iconName,
              retryable,
              ...mergedConfig.swalErrorOptions,
            });

            // Only wait for the user when "Try again" is on offer; plain
            // errors resolve immediately exactly as before.
            if (retryable) {
              const result = await dialog;
              if (result?.isConfirmed) return attempt();
            }
          }

          return { success: false, data: null, error };
        } finally {
          if (controllersRef.current[callId] === controller) {
            delete controllersRef.current[callId];
          }
        }
      };

      // Reported app-wide so page loaders can wait for data to arrive.
      const endActivity = beginActivity();
      try {
        return await attempt();
      } finally {
        endActivity();
        // Only clear pending if no newer call with the same id took over.
        if (!controllersRef.current[callId]) setPendingFor(callId, false);
      }
    },
    [],
  );

  /**
   * Manually cancel an in-flight call by id.
   */
  const cancel = useCallback((id) => {
    controllersRef.current[id]?.abort();
  }, []);

  /**
   * Cancel all in-flight calls (e.g. on component unmount).
   */
  const cancelAll = useCallback(() => {
    Object.values(controllersRef.current).forEach((c) => c.abort());
    controllersRef.current = {};
  }, []);

  return { apiCall, isPending, cancel, cancelAll };
}
