import { useCallback, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  labelClass,
  textareaClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function TextareaField({ field, form }) {
  const { id, label, placeHolder, disabled, maxLength, rows } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (event) => {
      const nextValue =
        field.textTransform === "uppercase"
          ? event.target.value.toUpperCase()
          : event.target.value;

      form.methods.setValue(id, nextValue);
    },
    [field.textTransform, form, id],
  );

  const handleBlur = useCallback(() => {
    form.methods.blurField(id);
  }, [form, id]);

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

      <textarea
        id={id}
        ref={(node) => form.methods.registerRef(id, node)}
        value={value ?? ""}
        placeholder={placeHolder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        onChange={handleChange}
        onBlur={() => {
          setIsFocused(false);
          handleBlur();
        }}
        onFocus={() => setIsFocused(true)}
        aria-invalid={Boolean(error)}
        className={`${textareaClass} ${field.textTransform === "uppercase" ? "uppercase" : ""} ${error ? "border-red-500 focus:border-red-500" : ""}`}
      />
    </div>
  );
}
