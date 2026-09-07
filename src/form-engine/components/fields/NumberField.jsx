import { useCallback, useEffect, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import { inputClass, labelClass, wrapperClass } from "../../styles/formtheme";

export default function NumberField({ field, form }) {
  const {
    id,
    label,
    placeHolder,
    precision,
    min,
    max,
    minLength,
    maxLength,
    disabled,
  } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [isFocused, setIsFocused] = useState(false);
  const [draftValue, setDraftValue] = useState(() => String(value ?? ""));

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(String(value ?? ""));
    }
  }, [isFocused, value]);

  const handleChange = useCallback(
    (event) => {
      const raw = event.target.value;
      setDraftValue(raw);

      if (raw === "") {
        form.methods.setValue(id, "");
        return;
      }

      const normalizedRaw = raw.replace(/^(-?)0+(?=\d)/, "$1");
      const numericValue = Number(normalizedRaw);
      if (Number.isNaN(numericValue)) return;

      const digitLength = raw.replace(/[-+.]/g, "").length;
      if (maxLength !== undefined && digitLength > Number(maxLength)) return;

      form.methods.setValue(id, numericValue);
    },
    [form, id, maxLength],
  );

  const handleBlur = useCallback(() => {
    const currentValue = draftValue;
    const normalizedValue =
      currentValue === "" || currentValue === undefined
        ? currentValue
        : Number(String(currentValue).replace(/^(-?)0+(?=\d)/, "$1"));

    if (normalizedValue !== currentValue && !Number.isNaN(normalizedValue)) {
      form.methods.setValue(id, normalizedValue);
    }

    if (
      precision !== undefined &&
      precision !== null &&
      precision !== "" &&
      currentValue !== "" &&
      currentValue !== undefined
    ) {
      form.methods.setValue(
        id,
        Number(Number(currentValue).toFixed(Number(precision))),
      );
      setDraftValue(
        String(Number(Number(currentValue).toFixed(Number(precision)))),
      );
    }

    form.methods.blurField(id);
  }, [draftValue, form, id, precision]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const raw = draftValue;
        if (raw !== "") {
          const normalizedValue = Number(raw.replace(/^(-?)0+(?=\d)/, "$1"));

          if (!Number.isNaN(normalizedValue)) {
            const normalizedText = String(normalizedValue);
            event.currentTarget.value = normalizedText;
            setDraftValue(normalizedText);
            form.methods.setValue(id, normalizedValue);
          }
        }

        form.methods.focusNext(id);
      }

      if (event.key === "Tab" && event.shiftKey && field.prevFocusField) {
        event.preventDefault();
        form.methods.focusPrev(id);
      }
    },
    [draftValue, form, id, field.prevFocusField],
  );

  return (
    <div className={`${wrapperClass} relative`}>
      {error && isFocused && (
        <div className="pointer-events-none absolute -top-9 left-0 z-20 max-w-[220px] rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold leading-4 text-red-700 shadow-lg">
          <span className="absolute -bottom-1.5 left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-red-200 bg-red-50" />
          {error}
        </div>
      )}

      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        id={id}
        ref={(node) => form.methods.registerRef(id, node)}
        type="number"
        value={isFocused ? draftValue : (value ?? "")}
        placeholder={placeHolder}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        onChange={handleChange}
        onBlur={(event) => {
          setIsFocused(false);
          handleBlur(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          setDraftValue(String(value ?? ""));
          event.target.select();
        }}
        onKeyDown={handleKeyDown}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />
    </div>
  );
}
