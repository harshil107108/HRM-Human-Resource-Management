/**
 * networkActivity.js
 * ---------------------------------------------------------------------------
 * App-wide counter of in-flight data requests. useApiCall and the form
 * engine's dropdown loader report here, which lets HpPageLoader keep a page
 * covered until its record AND all dropdown options have arrived — so the
 * user never sees an empty form "pop" into a filled one.
 *
 *   const end = beginActivity();   // request started
 *   try { await fetch(...) } finally { end(); }
 *
 * Pure module (no React / DOM), safe to import anywhere.
 * ---------------------------------------------------------------------------
 */

let activeCount = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(activeCount));
}

/**
 * Mark the start of a request. Returns an idempotent `end` function.
 * @returns {() => void}
 */
export function beginActivity() {
  activeCount += 1;
  emit();
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    activeCount = Math.max(0, activeCount - 1);
    emit();
  };
}

/** Track a promise for its lifetime. Returns the same promise. */
export function trackActivity(promise) {
  const end = beginActivity();
  return Promise.resolve(promise).finally(end);
}

export function getActivityCount() {
  return activeCount;
}

/** @returns {() => void} unsubscribe */
export function subscribeActivity(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
