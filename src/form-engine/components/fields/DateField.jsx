import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

const pad2 = (n) => String(n).padStart(2, "0");

function todayParts() {
  const d = new Date();
  return {
    day: pad2(d.getDate()),
    month: pad2(d.getMonth() + 1),
    year: String(d.getFullYear()),
  };
}

function partsFromValue(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return { day: "", month: "", year: "" };
  return { year: m[1], month: m[2], day: m[3] };
}

function isRealDate(day, month, year) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export function getDateValidationError(day, month, year, { min, max } = {}) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (day === "" && month === "" && year === "") return "";

  if (day !== "" && (Number.isNaN(d) || d < 1 || d > 31)) {
    return "Day must be between 1 and 31";
  }

  if (month !== "" && (Number.isNaN(m) || m < 1 || m > 12)) {
    return "Month must be between 1 and 12";
  }

  if (year === "") {
    return "";
  }

  if (Number.isNaN(y) || y < 1000 || y > 9999) {
    return "Year must be valid";
  }

  if (day !== "" && month !== "" && !isRealDate(day, month, year)) {
    return "Enter a valid date";
  }

  if (day && month && year) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (min && iso < min) return `Date can't be before ${min}`;
    if (max && iso > max) return `Date can't be after ${max}`;
  }

  return "";
}

export default function DateField({ field, form }) {
  const {
    id,
    label,
    disabled,
    required,
    min,
    max,
emplo    defaultToday = false,
  } = field;

  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const formError = useFormStore(form, (snapshot) => snapshot.errors[id]);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [localError, setLocalError] = useState("");

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const lastEmitted = useRef(undefined);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const existing = form.methods.getValue(id);
    if (!existing && defaultToday) {
      const t = todayParts();
      setDay(t.day);
      setMonth(t.month);
      setYear(t.year);
      const iso = `${t.year}-${t.month}-${t.day}`;
      lastEmitted.current = iso;
      form.methods.setValue(id, iso);
    } else if (existing) {
      const p = partsFromValue(existing);
      setDay(p.day);
      setMonth(p.month);
      setYear(p.year);
      lastEmitted.current = existing;
    }
  }, []);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      const p = partsFromValue(value);
      setDay(p.day);
      setMonth(p.month);
      setYear(p.year);
      lastEmitted.current = value;
    }
  }, [value]);

  useEffect(() => {
    form.methods.registerRef(id, dayRef.current);
  }, [dayRef.current]);

  const validateAndCommit = useCallback(
    (d, m, y, { fillDefaults } = {}) => {
      const nextDay = d || "";
      const nextMonth = m || "";
      const nextYear = y || "";

      if (fillDefaults && nextDay.length === 2 && nextMonth.length === 2 && !nextYear) {
        const currentYear = todayParts().year;
        setYear(currentYear);
        return validateAndCommit(nextDay, nextMonth, currentYear);
      }

      if (!nextDay && !nextMonth && !nextYear) {
        lastEmitted.current = "";
        setLocalError("");
        form.methods.setValue(id, "");
        return;
      }

      const errorText = getDateValidationError(nextDay, nextMonth, nextYear, { min, max });
      if (errorText) {
        setLocalError(errorText);
        lastEmitted.current = undefined;
        return;
      }

      if (nextDay.length < 2 || nextMonth.length < 2 || nextYear.length < 4) {
        lastEmitted.current = undefined;
        setLocalError("");
        return;
      }

      const iso = `${nextYear}-${nextMonth}-${nextDay}`;
      setLocalError("");
      lastEmitted.current = iso;
      form.methods.setValue(id, iso);
    },
    [form, id, min, max],
  );

  const handleDayChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(v);
    validateAndCommit(v, month, year);

    if (v.length === 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const handleMonthChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(v);
    validateAndCommit(day, v, year);

    if (v.length === 2) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const handleYearChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(v);
    validateAndCommit(day, month, v);

    if (v.length === 4 && field.nextFocusField) {
      form.methods.focusNext(id);
    }
  };

  const handleBlur = () => {
    validateAndCommit(day, month, year, { fillDefaults: true });
    form.methods.blurField(id);
  };

  const makeKeyDownHandler = (segment) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.methods.focusNext(id);
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
      if (segment === "month") {
        setDay((d) => d.slice(0, -1));
        dayRef.current?.focus();
      } else if (segment === "year") {
        setMonth((m) => m.slice(0, -1));
        monthRef.current?.focus();
      } else if (segment === "day" && field.prevFocusField) {
        form.methods.focusPrev(id);
      }
      return;
    }

    if (e.key === "Tab" && e.shiftKey && segment === "day" && field.prevFocusField) {
      e.preventDefault();
      form.methods.focusPrev(id);
    }
  };

  const error = formError || localError;

  const segmentBase =
    "bg-transparent text-center outline-none tabular-nums placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400";

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={`${id}-day`} className={labelClass}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex h-8 items-center gap-0.5 rounded-sm border bg-white px-2.5 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 ${error
          ? "border-red-500"
          : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "bg-gray-50 opacity-70" : ""}`}
      >
        <input
          id={`${id}-day`}
          ref={dayRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="DD"
          value={day}
          disabled={disabled}
          onChange={handleDayChange}
          onKeyDown={makeKeyDownHandler("day")}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          aria-label="Day"
          aria-invalid={Boolean(error)}
          className={`${segmentBase} w-7`}
        />
        <span className="select-none text-gray-300">/</span>
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="MM"
          value={month}
          disabled={disabled}
          onChange={handleMonthChange}
          onKeyDown={makeKeyDownHandler("month")}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          aria-label="Month"
          aria-invalid={Boolean(error)}
          className={`${segmentBase} w-7`}
        />
        <span className="select-none text-gray-300">/</span>
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="YYYY"
          value={year}
          disabled={disabled}
          onChange={handleYearChange}
          onKeyDown={makeKeyDownHandler("year")}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          aria-label="Year"
          aria-invalid={Boolean(error)}
          className={`${segmentBase} w-12`}
        />

      </div>

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}