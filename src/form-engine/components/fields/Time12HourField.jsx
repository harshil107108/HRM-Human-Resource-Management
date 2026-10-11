import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  wrapperClass,
} from "../../styles/formtheme";
import FieldErrorTooltip from "./FieldErrorTooltip";

const EMPTY_TIME = { digits: "", period: "" };

function parseStoredTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || "");
  if (!match) return EMPTY_TIME;

  const hour24 = Number(match[1]);
  const hour12 = hour24 % 12 || 12;
  return {
    digits: `${String(hour12).padStart(2, "0")}${match[2]}`,
    period: hour24 < 12 ? "AM" : "PM",
  };
}

function formatInputValue({ digits, period }) {
  const time = digits.length >= 2
    ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
    : digits;
  return `${time}${period ? ` ${period}` : ""}`;
}

function validateTime({ digits, period }) {
  if (!digits && !period) return "";
  if (digits.length > 4) return "Enter the time as HH:MM AM or HH:MM PM.";

  if (digits.length >= 2) {
    const hour = Number(digits.slice(0, 2));
    if (hour < 1 || hour > 12) return "Hour must be between 01 and 12.";
  }

  if (digits.length === 4) {
    const minute = Number(digits.slice(2, 4));
    if (minute < 0 || minute > 59) {
      return "Minutes must be between 00 and 59.";
    }
  }

  if (digits.length !== 4 || !period) {
    return "Complete the time, then press A for AM or P for PM.";
  }

  return "";
}

function toStoredTime({ digits, period }) {
  const hour12 = Number(digits.slice(0, 2));
  const minute = digits.slice(2, 4);
  const hour24 = (hour12 % 12) + (period === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

export default function Time12HourField({ field, form }) {
  const { id, label, disabled, required } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [parts, setParts] = useState(() => parseStoredTime(value));
  const [validationError, setValidationError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let previousValue = form.methods.getValue(id);
    const unsubscribe = form.methods.subscribe(() => {
      const nextValue = form.methods.getValue(id);
      if (Object.is(previousValue, nextValue)) return;

      previousValue = nextValue;
      setParts(parseStoredTime(nextValue));
      setValidationError("");
      form.methods.setInputError?.(id, null);
    });

    return unsubscribe;
  }, [form, id]);

  useEffect(
    () => () => form.methods.setInputError?.(id, null),
    [form, id],
  );

  const handleChange = (event) => {
    const rawValue = event.target.value;
    let digits = rawValue.replace(/\D/g, "").slice(0, 4);
    if (
      parts.digits === "1" &&
      digits.length === 2 &&
      Number(digits[1]) > 2
    ) {
      digits = `01${digits[1]}`;
    } else if (digits.length === 1 && digits !== "1") {
      digits = `0${digits}`;
    }
    const normalizedValue = rawValue.trim().toUpperCase();
    const period = /(?:P|PM)$/.test(normalizedValue)
      ? "PM"
      : /(?:A|AM)$/.test(normalizedValue)
        ? "AM"
        : "";
    const nextParts = { digits, period };
    const nextError = validateTime(nextParts);

    setParts(nextParts);
    setValidationError(nextError);
    form.methods.setInputError?.(id, nextError || null);

    if (!digits && !period) {
      form.methods.setValue(id, "", { triggerHooks: false });
    } else if (!nextError) {
      form.methods.setValue(id, toStoredTime(nextParts), {
        triggerHooks: false,
      });
    }
  };

  const displayError = error || validationError;
  const displayParts =
    parts.digits || parts.period ? parts : parseStoredTime(value);
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      form.methods.focusNext(id);
      return;
    }

    const key = event.key.toUpperCase();
    if (key !== "A" && key !== "P") return;

    event.preventDefault();
    const nextParts = {
      ...parts,
      period: key === "A" ? "AM" : "PM",
    };
    const nextError = validateTime(nextParts);
    setParts(nextParts);
    setValidationError(nextError);
    form.methods.setInputError?.(id, nextError || null);

    if (!nextError) {
      form.methods.setValue(id, toStoredTime(nextParts), {
        triggerHooks: false,
      });
    }
  };

  return (
    <div className={`${wrapperClass} relative`}>
      {displayError && isFocused && (
        <FieldErrorTooltip message={displayError} />
      )}

      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <Clock3
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          id={id}
          ref={(node) => form.methods.registerRef(id, node)}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={formatInputValue(displayParts)}
          placeholder="hh:mm AM/PM"
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            form.methods.blurField(id);
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(displayError)}
          className={`${inputClass} pl-9 ${
            displayError ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
      </div>
      <span className="text-[10px] font-medium text-slate-500">
        Type HH:MM, then press A for AM or P for PM.
      </span>
    </div>
  );
}
