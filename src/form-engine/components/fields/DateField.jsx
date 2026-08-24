import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  errorClass,
  inputClass,
  labelClass,
  wrapperClass,
} from "../../styles/formtheme";

/* ============================================================
   DateField — segmented DD/MM/YYYY input + calendar dropdown
   ============================================================
   Drop-in usage:
     <DateField
       id="voucherDate"
       label="Voucher Date"
       required
       value={value}          // ISO "YYYY-MM-DD" or ""
       onChange={setValue}    // (iso) => void
       min="2020-01-01"       // optional
       max="2030-12-31"       // optional
       defaultToday           // optional: prefill today's date if empty
     />

   To wire into your existing form store, replace the `value` /
   `onChange` props below with:
       value={useFormStore(form, s => s.values[id])}
       onChange={(iso) => form.methods.setValue(id, iso)}
   and call form.methods.blurField(id) / focusNext(id) in the
   spots marked "// FORM STORE HOOK" further down.
   ============================================================ */

const pad2 = (n) => String(n).padStart(2, "0");

function todayParts() {
  const d = new Date();
  return { day: pad2(d.getDate()), month: pad2(d.getMonth() + 1), year: String(d.getFullYear()) };
}

function partsFromValue(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return { day: "", month: "", year: "" };
  return { year: m[1], month: m[2], day: m[3] };
}

function isRealDate(day, month, year) {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!d || !m || !y) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function toIso(day, month, year) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function addDays(iso, delta) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function clampToRange(iso, min, max) {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

export function getDateValidationError(day, month, year, { min, max } = {}) {
  const d = Number(day), m = Number(month), y = Number(year);

  if (day === "" && month === "" && year === "") return "";
  if (day !== "" && (Number.isNaN(d) || d < 1 || d > 31)) return "Day must be between 1 and 31";
  if (month !== "" && (Number.isNaN(m) || m < 1 || m > 12)) return "Month must be between 1 and 12";
  if (year === "") return "";
  if (Number.isNaN(y) || y < 1000 || y > 9999) return "Year must be valid";
  if (day !== "" && month !== "" && !isRealDate(day, month, year)) return "Enter a valid date";

  if (day && month && year) {
    const iso = toIso(day, month, year);
    if (min && iso < min) return `Date can't be before ${formatDisplay(min)}`;
    if (max && iso > max) return `Date can't be after ${formatDisplay(max)}`;
  }
  return "";
}

function formatDisplay(iso) {
  const { day, month, year } = partsFromValue(iso);
  if (!day) return iso;
  return `${day}/${month}/${year}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const EMPTY_FORM_STORE = {
  methods: {
    subscribe: () => () => { },
    getSnapshot: () => ({ values: {}, errors: {} }),
  },
};

function buildCalendarGrid(viewYear, viewMonth /* 0-11 */) {
  const first = new Date(viewYear, viewMonth, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, monthOffset: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, monthOffset: 0 });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const nextDay = cells.length - (startOffset + daysInMonth) + 1;
    cells.push({ day: nextDay, inMonth: false, monthOffset: 1 });
    if (cells.length >= 42) break;
  }
  return cells;
}

function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
    </svg>
  );
}
function ChevronIcon({ direction = "left", ...props }) {
  const d = direction === "left" ? "M14.5 4.5L8 11l6.5 6.5" : "M8.5 4.5L15 11l-6.5 6.5";
  return (
    <svg viewBox="0 0 22 22" width="14" height="14" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

export default function DateField({ field, form, ...standaloneProps }) {
  const {
    id = "date-field",
    label,
    disabled,
    required,
    min,
    max,
    defaultToday = false,
    value: standaloneValue,
    onChange: standaloneOnChange,
    onBlur: standaloneOnBlur,
  } = field || standaloneProps;
  const store = form || EMPTY_FORM_STORE;
  const formValue = useFormStore(store, (snapshot) => snapshot.values[id]);
  const formError = useFormStore(store, (snapshot) => snapshot.errors[id]);
  const controlledValue = form ? formValue : standaloneValue;
  const onChange = form
    ? (nextValue) => form.methods.setValue(id, nextValue)
    : standaloneOnChange;
  const onBlur = form
    ? () => form.methods.blurField(id)
    : standaloneOnBlur;
  const isControlled = controlledValue !== undefined;
  const [innerValue, setInnerValue] = useState("");
  const value = isControlled ? controlledValue : innerValue;

  const commitValue = useCallback(
    (iso) => {
      if (!isControlled) setInnerValue(iso);
      onChange?.(iso);
    },
    [isControlled, onChange],
  );

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });
  const [focusedDay, setFocusedDay] = useState(null); // "YYYY-MM-DD" while calendar open

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastEmitted = useRef(undefined);
  const initialized = useRef(false);

  // initial load / default-today
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!value && defaultToday) {
      const t = todayParts();
      setDay(t.day); setMonth(t.month); setYear(t.year);
      const iso = toIso(t.day, t.month, t.year);
      lastEmitted.current = iso;
      commitValue(iso);
    } else if (value) {
      const p = partsFromValue(value);
      setDay(p.day); setMonth(p.month); setYear(p.year);
      lastEmitted.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // external value changes (e.g. form reset)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      const p = partsFromValue(value);
      setDay(p.day); setMonth(p.month); setYear(p.year);
      lastEmitted.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // close calendar on outside click
  useEffect(() => {
    if (!calendarOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [calendarOpen]);

  const validateAndCommit = useCallback(
    (d, m, y, { fillDefaults } = {}) => {
      const nextDay = d || "", nextMonth = m || "", nextYear = y || "";

      if (fillDefaults && nextDay.length === 2 && nextMonth.length === 2 && !nextYear) {
        const currentYear = todayParts().year;
        setYear(currentYear);
        return validateAndCommit(nextDay, nextMonth, currentYear);
      }

      if (!nextDay && !nextMonth && !nextYear) {
        lastEmitted.current = "";
        setError("");
        commitValue("");
        return;
      }

      const errText = getDateValidationError(nextDay, nextMonth, nextYear, { min, max });
      if (errText) {
        setError(errText);
        lastEmitted.current = undefined;
        return;
      }

      if (nextDay.length < 2 || nextMonth.length < 2 || nextYear.length < 4) {
        lastEmitted.current = undefined;
        setError("");
        return;
      }

      const iso = toIso(nextDay, nextMonth, nextYear);
      setError("");
      lastEmitted.current = iso;
      commitValue(iso);
      setViewDate({ year: Number(nextYear), month: Number(nextMonth) - 1 });
    },
    [commitValue, min, max],
  );

  const handleDayChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(v);
    validateAndCommit(v, month, year);
    if (v.length === 2) { monthRef.current?.focus(); monthRef.current?.select(); }
  };
  const handleMonthChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(v);
    validateAndCommit(day, v, year);
    if (v.length === 2) { yearRef.current?.focus(); yearRef.current?.select(); }
  };
  const handleYearChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(v);
    validateAndCommit(day, month, v);
  };

  const handleBlur = (e) => {
    // don't fire "leaving the field" logic when focus just moved between
    // the day/month/year segments of this same widget
    if (wrapperRef.current && wrapperRef.current.contains(e.relatedTarget)) return;
    validateAndCommit(day, month, year, { fillDefaults: true });
    onBlur?.(); // FORM STORE HOOK: form.methods.blurField(id)
  };

  const makeKeyDownHandler = (segment) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndCommit(day, month, year, { fillDefaults: true });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCalendarOpen(true);
      return;
    }
    if (e.key === "ArrowRight") {
      const el = e.target;
      if (el.selectionStart === el.value.length) {
        e.preventDefault();
        if (segment === "day") monthRef.current?.focus();
        if (segment === "month") yearRef.current?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      const el = e.target;
      if (el.selectionStart === 0) {
        e.preventDefault();
        if (segment === "month") dayRef.current?.focus();
        if (segment === "year") monthRef.current?.focus();
      }
      return;
    }
    if (e.key === "Backspace" && e.target.value === "") {
      e.preventDefault();
      if (segment === "month") { setDay((d) => d.slice(0, -1)); dayRef.current?.focus(); }
      else if (segment === "year") { setMonth((m) => m.slice(0, -1)); monthRef.current?.focus(); }
    }
  };

  const stepDay = (delta) => {
    if (disabled) return;
    const base = value || toIso(todayParts().day, todayParts().month, todayParts().year);
    const next = clampToRange(addDays(base, delta), min, max);
    const p = partsFromValue(next);
    setDay(p.day); setMonth(p.month); setYear(p.year);
    setError("");
    lastEmitted.current = next;
    commitValue(next);
    setViewDate({ year: Number(p.year), month: Number(p.month) - 1 });
  };

  // ---- calendar ----
  const openCalendar = () => {
    if (disabled) return;
    const base = value && !error ? value : toIso(todayParts().day, todayParts().month, todayParts().year);
    const p = partsFromValue(base);
    setViewDate({ year: Number(p.year), month: Number(p.month) - 1 });
    setFocusedDay(base);
    setCalendarOpen((o) => !o);
  };

  const selectDate = (iso) => {
    if (min && iso < min) return;
    if (max && iso > max) return;
    const p = partsFromValue(iso);
    setDay(p.day); setMonth(p.month); setYear(p.year);
    setError("");
    lastEmitted.current = iso;
    commitValue(iso);
    setCalendarOpen(false);
    dayRef.current?.focus();
  };

  const goMonth = (delta) => {
    setViewDate((v) => {
      let m = v.month + delta, y = v.year;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  };

  const handleCalendarKeyDown = (e) => {
    if (!focusedDay) return;
    const key = e.key;
    const stepMap = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (key in stepMap) {
      e.preventDefault();
      const next = addDays(focusedDay, stepMap[key]);
      setFocusedDay(next);
      const p = partsFromValue(next);
      setViewDate({ year: Number(p.year), month: Number(p.month) - 1 });
      return;
    }
    if (key === "PageUp") { e.preventDefault(); goMonth(-1); return; }
    if (key === "PageDown") { e.preventDefault(); goMonth(1); return; }
    if (key === "Home") {
      e.preventDefault();
      const p = partsFromValue(focusedDay);
      setFocusedDay(toIso("01", p.month, p.year));
      return;
    }
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      selectDate(focusedDay);
      return;
    }
    if (key === "Escape") {
      e.preventDefault();
      setCalendarOpen(false);
      dayRef.current?.focus();
    }
  };

  const cells = useMemo(() => buildCalendarGrid(viewDate.year, viewDate.month), [viewDate]);

  const displayError = error || formError;
  const segmentBase =
    "h-7 bg-transparent text-center text-xs font-semibold text-slate-800 outline-none tabular-nums placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500";

  return (
    <div className={wrapperClass} ref={wrapperRef}>
      {label && (
        <label htmlFor={`${id}-day`} className={labelClass}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`${inputClass} flex items-center gap-1 px-2.5 py-0 ${displayError ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100" : ""}`}
        >
          <button
            type="button"
            tabIndex={-1}
            onClick={openCalendar}
            disabled={disabled}
            aria-label="Open calendar"
            className="flex items-center justify-center text-slate-400 hover:text-sky-600 disabled:cursor-not-allowed"
          >
            <CalendarIcon />
          </button>

          <div className="flex items-center gap-0.5">
            <input
              id={`${id}-day`} ref={dayRef} type="text" inputMode="numeric" maxLength={2}
              placeholder="DD" value={day} disabled={disabled}
              onChange={handleDayChange} onKeyDown={makeKeyDownHandler("day")}
              onBlur={handleBlur} onFocus={(e) => e.target.select()}
              aria-label="Day" aria-invalid={Boolean(error)} className={`${segmentBase} w-6`}
            />
            <span className="select-none text-slate-300">/</span>
            <input
              ref={monthRef} type="text" inputMode="numeric" maxLength={2}
              placeholder="MM" value={month} disabled={disabled}
              onChange={handleMonthChange} onKeyDown={makeKeyDownHandler("month")}
              onBlur={handleBlur} onFocus={(e) => e.target.select()}
              aria-label="Month" aria-invalid={Boolean(error)} className={`${segmentBase} w-6`}
            />
            <span className="select-none text-slate-300">/</span>
            <input
              ref={yearRef} type="text" inputMode="numeric" maxLength={4}
              placeholder="YYYY" value={year} disabled={disabled}
              onChange={handleYearChange} onKeyDown={makeKeyDownHandler("year")}
              onBlur={handleBlur} onFocus={(e) => e.target.select()}
              aria-label="Year" aria-invalid={Boolean(error)} className={`${segmentBase} w-10`}
            />
          </div>

          <div className="ml-auto flex items-center">
            <button type="button" tabIndex={-1} disabled={disabled} onClick={() => stepDay(-1)}
              aria-label="Previous day" className="flex h-6 w-5 items-center justify-center text-slate-400 hover:text-sky-600 disabled:cursor-not-allowed">
              <ChevronIcon direction="left" />
            </button>
            <button type="button" tabIndex={-1} disabled={disabled} onClick={() => stepDay(1)}
              aria-label="Next day" className="flex h-6 w-5 items-center justify-center text-slate-400 hover:text-sky-600 disabled:cursor-not-allowed">
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>

        {calendarOpen && (
          <div
            role="dialog" aria-label="Choose date" onKeyDown={handleCalendarKeyDown}
            className="absolute z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-lg"
          >
            <div className="mb-1 flex items-center justify-between px-1">
              <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month"
                className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-100">
                <ChevronIcon direction="left" />
              </button>
              <span className="text-sm font-medium text-gray-800">
                {MONTH_NAMES[viewDate.month]} {viewDate.year}
              </span>
              <button type="button" onClick={() => goMonth(1)} aria-label="Next month"
                className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-100">
                <ChevronIcon direction="right" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 px-1">
              {WEEKDAY_LABELS.map((wd) => (
                <div key={wd} className="flex h-6 items-center justify-center text-[11px] font-medium text-gray-400">
                  {wd}
                </div>
              ))}
              {cells.map((cell, idx) => {
                const cellYear = viewDate.year + (viewDate.month + cell.monthOffset < 0 ? -1 : viewDate.month + cell.monthOffset > 11 ? 1 : 0);
                const cellMonth = ((viewDate.month + cell.monthOffset) + 12) % 12;
                const iso = toIso(pad2(cell.day), pad2(cellMonth + 1), String(cellYear));
                const isOutOfRange = (min && iso < min) || (max && iso > max);
                const isSelected = value === iso;
                const isFocused = focusedDay === iso;
                const isToday = iso === toIso(todayParts().day, todayParts().month, todayParts().year);

                return (
                  <button
                    key={idx} type="button" tabIndex={-1}
                    disabled={isOutOfRange}
                    onClick={() => selectDate(iso)}
                    onMouseEnter={() => setFocusedDay(iso)}
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-[13px] transition-colors",
                      !cell.inMonth ? "text-gray-300" : "text-gray-700",
                      isOutOfRange ? "cursor-not-allowed text-gray-200" : "hover:bg-blue-50",
                      isSelected ? "bg-blue-600 text-white hover:bg-blue-600" : "",
                      !isSelected && isFocused ? "ring-1 ring-blue-400" : "",
                      !isSelected && isToday ? "font-semibold text-blue-600" : "",
                    ].join(" ")}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-gray-100 px-1 pt-1.5">
              <button type="button"
                onClick={() => selectDate(toIso(todayParts().day, todayParts().month, todayParts().year))}
                className="text-[12px] font-medium text-blue-600 hover:underline">
                Today
              </button>
              <button type="button" onClick={() => setCalendarOpen(false)}
                className="text-[12px] text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {displayError && <p className={errorClass}>{displayError}</p>}
      {!displayError && (min || max) && (
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          {min && max ? `Allowed: ${formatDisplay(min)} – ${formatDisplay(max)}`
            : min ? `Not before ${formatDisplay(min)}`
              : `Not after ${formatDisplay(max)}`}
        </p>
      )}
    </div>
  );
}