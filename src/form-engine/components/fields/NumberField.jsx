import React, { useCallback, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function NumberField({ field, form }) {
  const { id, label, placeHolder, precision, min, max, disabled } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (event) => {
      const raw = event.target.value;

      if (raw === "") {
        form.methods.setValue(id, "");
        return;
      }

      const numericValue = Number(raw);
      if (Number.isNaN(numericValue)) return;

      form.methods.setValue(id, numericValue);
    },
    [form, id],
  );

  const handleBlur = useCallback(() => {
    const currentValue = form.methods.getValue(id);

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
    }

    form.methods.blurField(id);
  }, [form, id, precision]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        form.methods.focusNext(id);
      }

      if (event.key === "Tab" && event.shiftKey && field.prevFocusField) {
        event.preventDefault();
        form.methods.focusPrev(id);
      }
    },
    [form, id, field.prevFocusField],
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
        value={value ?? ""}
        placeholder={placeHolder}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        onBlur={(event) => {
          setIsFocused(false);
          handleBlur(event);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? "border-red-500 focus:border-red-500" : ""
          }`}
      />
    </div>
  );
}
