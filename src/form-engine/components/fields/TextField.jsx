import React, { useCallback } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function TextField({ field, form }) {
  const { id, label, placeHolder, disabled, maxLength } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);

  const handleChange = useCallback(
    (event) => form.methods.setValue(id, event.target.value),
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

      <input
        id={id}
        ref={(node) => form.methods.registerRef(id, node)}
        type="text"
        value={value ?? ""}
        placeholder={placeHolder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? "border-red-500 focus:border-red-500" : ""
          }`}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
