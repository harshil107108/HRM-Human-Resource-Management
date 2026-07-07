import React, { useCallback } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function NumberField({ field, form }) {
  useFormStore(form);

  const { id, label, placeHolder, precision, min, max, disabled } = field;

  const value = form.methods.getValue(id);
  const error = form.methods.getErrors()[id];

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
        type="number"
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
