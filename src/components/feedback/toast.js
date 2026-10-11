/**
 * toast.js
 * ---------------------------------------------------------------------------
 * Lightweight, dependency-free toast manager.
 *
 * Why not SweetAlert2 toasts? Swal can only show ONE popup at a time, so a
 * Swal toast silently closes any open confirm/error dialog (and vice versa).
 * These toasts live in their own region and never interfere with dialogs or
 * HpCommonModal.
 *
 * Features:
 *   - success / error / warning / info variants
 *   - auto-dismiss with a visible countdown, paused on hover/focus
 *   - de-duplication: an identical visible toast is "bumped" instead of stacked
 *   - max visible count (oldest is dismissed first)
 *   - aria-live announcements (polite for status, assertive for errors)
 *   - hold()/release() so toasts raised while a blocking dialog is open are
 *     shown once it closes (keeps them out of Swal's aria-hidden background)
 *
 * Usage:
 *   import { toast } from "@/components/feedback";
 *   toast.success({ title: "Saved", message: "Employee updated." });
 *   toast.error("Upload failed", { duration: 0 });   // 0 = persistent
 * ---------------------------------------------------------------------------
 */

import "./feedback.css";
import { ICONS } from "./icons";

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;
const MAX_VISIBLE = 4;
const EXIT_MS = 160;

const VARIANTS = new Set(["success", "error", "warning", "info"]);

let region = null;
let holdCount = 0;
const heldQueue = [];
const active = new Map(); // id -> toast record
let idCounter = 0;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function getRegion() {
  if (region && region.isConnected) return region;
  region = document.createElement("ol");
  region.className = "hrm-toast-region";
  region.setAttribute("aria-label", "Notifications");
  // Each toast carries its own role (status/alert); the region itself is a
  // plain landmark list so screen readers don't double-announce.
  document.body.appendChild(region);
  return region;
}

function normalizeVariant(type) {
  if (type === "danger") return "error";
  if (type === "question") return "info";
  return VARIANTS.has(type) ? type : "info";
}

function buildToastElement(record) {
  const { variant, title, message, action } = record;

  const slot = document.createElement("li");
  slot.className = "hrm-toast-slot";

  const el = document.createElement("div");
  el.className = `hrm-toast hrm-toast--${variant}`;
  el.setAttribute("role", variant === "error" ? "alert" : "status");
  el.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");
  el.setAttribute("aria-atomic", "true");

  const icon = document.createElement("span");
  icon.className = "hrm-toast__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = ICONS[variant]; // static, trusted markup

  const body = document.createElement("div");
  body.className = "hrm-toast__body";

  if (title) {
    const titleEl = document.createElement("p");
    titleEl.className = "hrm-toast__title";
    titleEl.textContent = title; // never innerHTML for user/server text
    body.appendChild(titleEl);
  }

  if (message) {
    const messageEl = document.createElement("p");
    messageEl.className = "hrm-toast__message";
    messageEl.textContent = message;
    body.appendChild(messageEl);
  }

  if (action?.label && typeof action.onClick === "function") {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "hrm-toast__action";
    actionBtn.textContent = action.label;
    actionBtn.addEventListener("click", () => {
      action.onClick();
      dismiss(record.id, "action");
    });
    body.appendChild(actionBtn);
  }

  const close = document.createElement("button");
  close.type = "button";
  close.className = "hrm-toast__close";
  close.setAttribute("aria-label", "Dismiss notification");
  close.innerHTML = ICONS.close;
  close.addEventListener("click", () => dismiss(record.id, "close"));

  el.append(icon, body, close);

  if (record.duration > 0) {
    const progress = document.createElement("span");
    progress.className = "hrm-toast__progress";
    progress.setAttribute("aria-hidden", "true");
    el.style.setProperty("--hrm-toast-duration", `${record.duration}ms`);
    el.appendChild(progress);
  }

  // Pause the countdown while the user is reading or interacting.
  const pause = () => pauseTimer(record);
  const resume = () => resumeTimer(record);
  el.addEventListener("mouseenter", pause);
  el.addEventListener("mouseleave", resume);
  el.addEventListener("focusin", pause);
  el.addEventListener("focusout", (event) => {
    if (!el.contains(event.relatedTarget)) resume();
  });

  slot.appendChild(el);
  record.slot = slot;
  record.el = el;
}

function startTimer(record) {
  if (record.duration <= 0) return;
  record.startedAt = Date.now();
  record.timeoutId = window.setTimeout(() => dismiss(record.id, "timer"), record.remaining);
}

function pauseTimer(record) {
  if (record.duration <= 0 || record.paused || record.leaving) return;
  record.paused = true;
  window.clearTimeout(record.timeoutId);
  record.remaining = Math.max(0, record.remaining - (Date.now() - record.startedAt));
  record.el.classList.add("is-paused");
}

function resumeTimer(record) {
  if (record.duration <= 0 || !record.paused || record.leaving) return;
  record.paused = false;
  record.el.classList.remove("is-paused");
  startTimer(record);
}

function restartTimer(record) {
  if (record.duration <= 0) return;
  window.clearTimeout(record.timeoutId);
  record.remaining = record.duration;
  record.paused = false;
  record.el.classList.remove("is-paused");

  // Restart the CSS progress animation from full width.
  const progress = record.el.querySelector(".hrm-toast__progress");
  if (progress) {
    progress.style.animation = "none";
    void progress.offsetWidth; // flush so the animation restarts
    progress.style.animation = "";
  }
  startTimer(record);
}

function findDuplicate(variant, title, message) {
  for (const record of active.values()) {
    if (
      !record.leaving &&
      record.variant === variant &&
      record.title === title &&
      record.message === message
    ) {
      return record;
    }
  }
  return null;
}

function mount(record) {
  const host = getRegion();
  buildToastElement(record);
  active.set(record.id, record);
  // Newest on top.
  host.insertBefore(record.slot, host.firstChild);
  startTimer(record);

  const visible = [...active.values()].filter((r) => !r.leaving);
  if (visible.length > MAX_VISIBLE) {
    visible
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, visible.length - MAX_VISIBLE)
      .forEach((r) => dismiss(r.id, "overflow"));
  }
}

/**
 * Dismiss a toast by id. Safe to call multiple times.
 */
export function dismiss(id, reason = "programmatic") {
  const record = active.get(id);
  if (!record || record.leaving) return;
  record.leaving = true;
  window.clearTimeout(record.timeoutId);

  const finish = () => {
    if (!active.has(id)) return;
    active.delete(id);
    record.slot.remove();
    record.resolve({ id, reason });
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }

  record.el.classList.add("is-leaving");
  // Collapse the slot so the remaining toasts glide into place.
  window.setTimeout(() => record.slot.classList.add("is-collapsed"), EXIT_MS - 40);
  window.setTimeout(finish, EXIT_MS + 180);
}

/**
 * Show a toast.
 * @param {object} options
 * @param {"success"|"error"|"warning"|"info"|"danger"} [options.type]
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {number} [options.duration] ms; 0 or Infinity = stays until dismissed
 * @param {{label: string, onClick: Function}} [options.action]
 * @returns {{ id: string, dismiss: () => void, closed: Promise<{id, reason}> }}
 */
export function showToast({ type = "success", title = "", message = "", duration, action } = {}) {
  const variant = normalizeVariant(type);
  const safeTitle = title == null ? "" : String(title).trim();
  const safeMessage = message == null ? "" : String(message).trim();
  const fallbackTitle = !safeTitle && !safeMessage ? defaultTitle(variant) : safeTitle;

  let resolvedDuration = duration ?? (variant === "error" ? ERROR_DURATION : DEFAULT_DURATION);
  if (!Number.isFinite(resolvedDuration) || resolvedDuration < 0) resolvedDuration = 0;

  if (typeof document === "undefined") {
    return { id: "", dismiss: () => {}, closed: Promise.resolve({ id: "", reason: "ssr" }) };
  }

  const duplicate = findDuplicate(variant, fallbackTitle, safeMessage);
  if (duplicate) {
    duplicate.el.classList.remove("is-bumped");
    void duplicate.el.offsetWidth;
    duplicate.el.classList.add("is-bumped");
    restartTimer(duplicate);
    return { id: duplicate.id, dismiss: () => dismiss(duplicate.id), closed: duplicate.closed };
  }

  idCounter += 1;
  const record = {
    id: `hrm-toast-${idCounter}`,
    variant,
    title: fallbackTitle,
    message: safeMessage,
    action,
    duration: resolvedDuration,
    remaining: resolvedDuration,
    createdAt: Date.now() + idCounter / 1000,
    paused: false,
    leaving: false,
  };
  record.closed = new Promise((resolve) => {
    record.resolve = resolve;
  });

  if (holdCount > 0) {
    heldQueue.push(record);
  } else {
    mount(record);
  }

  return { id: record.id, dismiss: () => dismiss(record.id), closed: record.closed };
}

function defaultTitle(variant) {
  switch (variant) {
    case "success":
      return "Done";
    case "error":
      return "Something went wrong";
    case "warning":
      return "Please note";
    default:
      return "Notice";
  }
}

/**
 * Defer new toasts until release() is called. Used while a blocking dialog is
 * open so toasts appear after it closes (and are announced to screen readers).
 * @returns {() => void} release function (idempotent)
 */
export function holdToasts() {
  holdCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holdCount = Math.max(0, holdCount - 1);
    if (holdCount === 0) {
      heldQueue.splice(0).forEach((record) => {
        // A held duplicate may have become visible meanwhile.
        const duplicate = findDuplicate(record.variant, record.title, record.message);
        if (duplicate) {
          restartTimer(duplicate);
          duplicate.closed.then(record.resolve);
          return;
        }
        mount(record);
      });
    }
  };
}

export function dismissAllToasts() {
  [...active.keys()].forEach((id) => dismiss(id, "programmatic"));
}

export const toast = {
  show: showToast,
  success: (title, options = {}) => showToast(toArgs("success", title, options)),
  error: (title, options = {}) => showToast(toArgs("error", title, options)),
  warning: (title, options = {}) => showToast(toArgs("warning", title, options)),
  info: (title, options = {}) => showToast(toArgs("info", title, options)),
  dismiss,
  dismissAll: dismissAllToasts,
};

function toArgs(type, titleOrOptions, options) {
  if (titleOrOptions && typeof titleOrOptions === "object") {
    return { ...titleOrOptions, type };
  }
  return { ...options, title: titleOrOptions, type };
}
  