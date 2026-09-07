import { useCallback, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  checkboxClass,
  errorClass,
  labelClass,
  wrapperClass,
} from "../../styles/formtheme";

const sizeClassMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
};

export default function CheckboxField({ field, form }) {
  const {
    id,
    label,
    description,
    disabled,
    required,
    checkedValue = true,
    uncheckedValue = false,
  } = field;

  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [isFocused, setIsFocused] = useState(false);

  const resolvedSize = field.size ?? field.checkboxSize ?? "md";
  const sizeClass =
    typeof resolvedSize === "string" && sizeClassMap[resolvedSize]
      ? sizeClassMap[resolvedSize]
      : "";
  const sizeStyle =
    typeof resolvedSize === "number"
      ? { width: `${resolvedSize}px`, height: `${resolvedSize}px` }
      : undefined;

  const isChecked =
    value === checkedValue || value === true || value === "true" || value === 1;

  const handleChange = useCallback(
    (event) => {
      const nextValue = event.target.checked ? checkedValue : uncheckedValue;

      form.methods.setValue(id, nextValue);
    },
    [checkedValue, form, id, uncheckedValue],
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
    [field.prevFocusField, form, id],
  );

  return (
    <div className={`${wrapperClass} relative`}>
      {error && isFocused && (
        <div className="pointer-events-none absolute -top-8 left-0 z-20 max-w-[220px] rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold leading-4 text-red-700 shadow-lg">
          <span className="absolute -bottom-1.5 left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-red-200 bg-red-50" />
          {error}
        </div>
      )}
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <label
        htmlFor={id}
        className={`group flex min-h-8 items-center gap-2 text-xs text-slate-700 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      >
        <input
          id={id}
          ref={(node) => form.methods.registerRef(id, node)}
          type="checkbox"
          checked={Boolean(isChecked)}
          disabled={disabled}
          onChange={handleChange}
          onBlur={(event) => {
            setIsFocused(false);
            handleBlur(event);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(error)}
          className="peer sr-only"
          style={sizeStyle}
        />
        <span
          aria-hidden="true"
          className={`${checkboxClass} ${sizeClass} ${error ? "border-red-500" : ""} ${disabled ? "" : "group-hover:border-sky-400"}`}
          style={sizeStyle}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${isChecked ? "block" : "hidden"} h-3.5 w-3.5 text-white`}
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
        {description && <span>{description}</span>}
      </label>

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
