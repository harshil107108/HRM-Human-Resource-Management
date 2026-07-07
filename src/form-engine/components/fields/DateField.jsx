import React, { useCallback } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

/**
 * DateField
 * ---------
 * Native <input type="date">. Schema options:
 *   id, label, placeHolder, disabled, required
 *   min          - earliest selectable date, "YYYY-MM-DD"
 *   max          - latest selectable date, "YYYY-MM-DD"
 *   nextFocusField / prevFocusField
 *   onChange(form) / onBlur(form)
 *
 * Note: native date inputs always store/emit "YYYY-MM-DD" strings
 * regardless of the user's locale display format, so `form.methods.getValue(id)`
 * is safe to feed straight into `new Date(value)` or a date library.
 */
export default function DateField({ field, form }) {
  useFormStore(form);

  const { id, label, placeHolder, min, max, disabled } = field;

  const value = form.methods.getValue(id);
  const error = form.methods.getErrors()[id];

  const handleChange = useCallback(
    (event) => form.methods.setValue(id, event.target.value),
    [form, id],
  );

  const handleBlur = useCallback(() => {
    form.methods.blurField(id);
  }, [form, id]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        form.methods.focusNext(id);
        return;
      }

      if (event.key === "Tab" && event.shiftKey && field.prevFocusField) {
        event.preventDefault();
        form.methods.focusPrev(id);
      }
    },
    [form, id, field.prevFocusField],
  );

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        id={id}
        ref={(node) => form.methods.registerRef(id, node)}
        type="date"
        value={value ?? ""}
        placeholder={placeHolder}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
