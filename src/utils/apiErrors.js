/**
 * apiErrors.js
 * ---------------------------------------------------------------------------
 * Turns any failure (axios error, fetch-style error, thrown Error, backend
 * `{ success:false, message }` body) into a user-facing description:
 *
 *   { title, message, details, retryable, status, iconName }
 *
 * Rules:
 *   - Never show stack traces, HTML error pages or database internals.
 *   - Keep authored backend messages ("Asset Name is required") for 4xx.
 *   - 5xx bodies from this backend carry raw `error.message`, so known
 *     Mongoose/MongoDB shapes are translated and anything else is replaced
 *     with a generic message.
 *   - Network failures, timeouts, 429 and 502–504 are marked retryable.
 * Pure module (no DOM / React) so it can be unit tested with node --test.
 * ---------------------------------------------------------------------------
 */

export const GENERIC_ERROR_MESSAGE =
  "We couldn't complete your request. Please try again in a moment.";

const MAX_MESSAGE_LENGTH = 300;

const UNSAFE_PATTERNS = [
  /\n\s*at\s+\S+/, // stack frame
  /\bat\s+[\w$.<>]+\s+\(.*:\d+:\d+\)/, // inline stack frame
  /<\/?(html|body|head|pre|!doctype)/i, // HTML error page
  /\b(Mongo\w*Error|MongooseError|Sequelize\w*|SyntaxError|TypeError|ReferenceError|RangeError)\b/,
  /\bE11000\b/,
  /\b(ECONNREFUSED|ECONNRESET|ENOTFOUND|EADDRINUSE)\b/,
  /Cannot (read|set) propert/i,
  /is not a function|is not defined|undefined|null/i,
  /\bCast to \w+ failed\b/,
  /validation failed:/i,
  /\bat path\b/,
];

export function isSafeMessage(message) {
  if (typeof message !== "string") return false;
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return false;
  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** "bankName" / "bank_name" -> "Bank name" */
export function humanizeField(field = "") {
  const words = String(field)
    .replace(/\.\d+\./g, " ")
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bId\b$/i, "")
    .trim()
    .toLowerCase();
  if (!words) return "This field";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Translate well-known MongoDB / Mongoose error messages. */
export function translateDatabaseMessage(message) {
  if (typeof message !== "string") return null;

  if (/\bE11000\b|duplicate key/i.test(message)) {
    const keyMatch = message.match(/dup key:\s*\{\s*"?([\w.]+)"?\s*:/i) ||
      message.match(/index:\s*([\w.]+?)_\d+/i);
    const field = keyMatch ? humanizeField(keyMatch[1]) : null;
    return {
      message: field
        ? `A record with this ${field.toLowerCase()} already exists.`
        : "A record with the same details already exists.",
      details: [],
    };
  }

  const validation = message.match(/validation failed:\s*([\s\S]*)$/i);
  if (validation) {
    const details = validation[1]
      .split(/,\s*(?=[\w.]+:\s)/)
      .map((part) => {
        const [, path, reason = ""] = part.match(/^([\w.]+):\s*([\s\S]*)$/) || [];
        if (!path) return null;
        const label = humanizeField(path);
        if (/is required/i.test(reason)) return `${label} is required.`;
        if (/Cast to/i.test(reason)) return `${label} has an invalid value.`;
        if (/is not a valid enum value/i.test(reason)) return `${label} has an unsupported value.`;
        if (/(shorter|longer|less|more) than/i.test(reason)) return `${label} is out of the allowed range.`;
        return `${label} is invalid.`;
      })
      .filter(Boolean);
    return {
      message: "Please review the highlighted information and try again.",
      details,
    };
  }

  if (/\bCast to ObjectId failed\b/i.test(message)) {
    return {
      message: "The selected record is invalid or no longer exists. Refresh the page and try again.",
      details: [],
    };
  }

  return null;
}

/** Collect server-provided validation details: string[] or { field: msg } */
function extractDetails(data) {
  const raw = data?.errors ?? data?.error?.details;
  if (!raw) return [];
  const list = Array.isArray(raw)
    ? raw.map((item) =>
        typeof item === "string" ? item : item?.message || item?.msg || null,
      )
    : typeof raw === "object"
      ? Object.entries(raw).map(([field, value]) => {
          const text = typeof value === "string" ? value : value?.message;
          return text ? (isSafeMessage(text) ? text : `${humanizeField(field)} is invalid.`) : null;
        })
      : [];
  return list.filter((item) => typeof item === "string" && isSafeMessage(item)).slice(0, 8);
}

/**
 * @param {any} error
 * @returns {{title:string, message:string, details:string[], retryable:boolean, status:number|null, iconName:string}}
 */
export function describeApiError(error) {
  const response = error?.response;
  const status = typeof response?.status === "number" ? response.status : null;
  const data = response?.data ?? error?.data;
  const serverMessage =
    (typeof data === "string" ? data : null) ||
    data?.message ||
    data?.error?.message ||
    (typeof data?.error === "string" ? data.error : null);

  const result = {
    title: "Something went wrong",
    message: GENERIC_ERROR_MESSAGE,
    details: extractDetails(data),
    retryable: false,
    status,
    iconName: "error",
  };

  // ---- No response at all: offline / CORS / timeout -----------------------
  if (!response && (error?.isAxiosError || error?.request || error?.code)) {
    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT" || /timeout/i.test(error?.message || "")) {
      return {
        ...result,
        title: "The request timed out",
        message: "The server is taking too long to respond. Please try again.",
        retryable: true,
      };
    }
    return {
      ...result,
      title: "Can't reach the server",
      message: "Check your internet connection and try again.",
      retryable: true,
      iconName: "offline",
    };
  }

  const translated = translateDatabaseMessage(serverMessage);
  if (translated) {
    return {
      ...result,
      title: status && status >= 500 ? "Unable to save" : "Please check your input",
      message: translated.message,
      details: translated.details.length ? translated.details : result.details,
    };
  }

  const safeServerMessage = isSafeMessage(serverMessage) ? serverMessage.trim() : null;

  switch (true) {
    case status === 400 || status === 422:
      return {
        ...result,
        title: "Please check your input",
        message: safeServerMessage || "Some of the information provided is invalid.",
      };
    case status === 401:
      return {
        ...result,
        title: "Session expired",
        message: safeServerMessage || "Your session has expired. Please sign in again to continue.",
        iconName: "lock",
      };
    case status === 403:
      return {
        ...result,
        title: "Access denied",
        message: safeServerMessage || "You don't have permission to perform this action.",
        iconName: "lock",
      };
    case status === 404:
      return {
        ...result,
        title: "Not found",
        message: safeServerMessage || "The requested record could not be found. It may have been removed.",
      };
    case status === 409:
      return {
        ...result,
        title: "Conflict",
        message: safeServerMessage || "This record conflicts with existing data.",
      };
    case status === 413:
      return {
        ...result,
        title: "File too large",
        message: "The uploaded file is larger than the server allows.",
      };
    case status === 429:
      return {
        ...result,
        title: "Too many requests",
        message: "Please wait a moment and try again.",
        retryable: true,
      };
    case status === 502 || status === 503 || status === 504:
      return {
        ...result,
        title: "Service unavailable",
        message: "The service is temporarily unavailable. Please try again shortly.",
        retryable: true,
      };
    case status !== null && status >= 500:
      // Raw server internals are never shown for 5xx unless clearly authored.
      return { ...result, message: safeServerMessage || GENERIC_ERROR_MESSAGE };
    case status !== null:
      return { ...result, message: safeServerMessage || GENERIC_ERROR_MESSAGE };
    default: {
      // Non-HTTP error (thrown in app code or a custom request function).
      const ownMessage = error?.message;
      return {
        ...result,
        message: safeServerMessage || (isSafeMessage(ownMessage) ? ownMessage : GENERIC_ERROR_MESSAGE),
      };
    }
  }
}
