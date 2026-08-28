/**
 * useApiCall.js
 * ------------------------------------------------------------------
 * Industry-grade React hook for handling API calls with:
 *  - Zero try/catch boilerplate at the call site
 *  - Built-in SweetAlert2 error popup (fully overridable)
 *  - Per-id pending state (supports multiple simultaneous calls)
 *  - Auto-cancel of duplicate in-flight requests (same id)
 *  - Global config (set once in app entry) + per-call config override
 *  - Consistent { success, data, error } response shape
 *
 * Peer dependency: sweetalert2  ->  npm i sweetalert2
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
 *
 * // Granular loading state:
 * isPending('getUser')   -> boolean for that specific call
 * isPending()            -> boolean, true if ANY call is pending
 * ------------------------------------------------------------------
 */

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// ============================================================
// GLOBAL CONFIG
// Call configureApiCall() once (e.g. in App.js / index.js) to
// customize behavior app-wide without touching this file again.
// ============================================================
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

  errorTitle: "Something went wrong",
  successTitle: "Success",

  swalErrorOptions: {},
  swalSuccessOptions: {},

  // Customize how the error message is extracted from different
  // API/error shapes (axios, fetch, custom backend error format, etc.)
  getErrorMessage: (error) =>
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unexpected error occurred. Please try again.",

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

      // Cancel a previous in-flight call sharing the same id
      controllersRef.current[callId]?.abort();
      const controller = new AbortController();
      controllersRef.current[callId] = controller;

      setPendingFor(callId, true);

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
          Swal.fire({
            icon: "success",
            title: mergedConfig.successTitle,
            text: "Data saved successfully!",
            timer: 1000,
            showConfirmButton: false,
            timerProgressBar: true,
            ...mergedConfig.swalSuccessOptions,
          });
        }

        mergedConfig.onSuccess?.(data, { id: callId, payload });

        return { success: true, data, error: null };
      } catch (error) {
        // Silently ignore aborted/canceled requests (not real errors)
        if (error?.name === "CanceledError" || error?.name === "AbortError") {
          return { success: false, data: null, error, aborted: true };
        }

        const message = mergedConfig.getErrorMessage(error);

        if (mergedConfig.showErrorAlert) {
          Swal.fire({
            icon: "error",
            title: mergedConfig.errorTitle,
            text: message,
            confirmButtonText: "OK",
            ...mergedConfig.swalErrorOptions,
          });
        }

        mergedConfig.onError?.(error, { id: callId, payload });

        return { success: false, data: null, error };
      } finally {
        setPendingFor(callId, false);
        delete controllersRef.current[callId];
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
