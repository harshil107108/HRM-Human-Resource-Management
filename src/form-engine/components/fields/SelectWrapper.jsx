import React, { useCallback } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function SelectWrapper({ field, form }) {
  useFormStore(form);

  const { id, label, placeHolder, options = [], disabled } = field;

  const value = form.methods.getValue(id);
  const error = form.methods.getErrors()[id];

  const handleChange = useCallback(
    (event) => {
      form.methods.setValue(id, event.target.value);
    },
    [form, id],
  );

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

  const handleBlur = useCallback(() => {
    form.methods.blurField(id);
  }, [form, id]);

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          ref={(node) => form.methods.registerRef(id, node)}
          value={value ?? ""}
          disabled={disabled}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(error)}
          className={`${inputClass} appearance-none pr-10 ${error ? "border-red-500 focus:border-red-500" : "cursor-pointer"
            }`}
        >
          <option value="" disabled hidden>
            {placeHolder || "Select..."}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
