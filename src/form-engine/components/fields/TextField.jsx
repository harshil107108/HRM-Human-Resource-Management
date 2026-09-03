import { useCallback, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormStore } from "../../hooks/useFormStore";
import {
  inputClass,
  labelClass,
  wrapperClass,
} from "../../styles/formtheme";

export default function TextField({ field, form }) {
  const { id, label, placeHolder, disabled, maxLength } = field;
  const value = useFormStore(form, (snapshot) => snapshot.values[id]);
  const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = field.inputType === "password";

  const handleChange = useCallback(
    (event) => {
      const nextValue = field.textTransform === "uppercase"
        ? event.target.value.toUpperCase()
        : event.target.value;

      form.methods.setValue(id, nextValue);
    },
    [field.textTransform, form, id],
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

      <div className="relative">
        <input
          id={id}
          ref={(node) => form.methods.registerRef(id, node)}
          type={isPassword && showPassword ? "text" : field.inputType || "text"}
          value={value ?? ""}
          placeholder={placeHolder}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          onBlur={(event) => {
            setIsFocused(false);
            handleBlur(event);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(error)}
          className={`${inputClass} ${isPassword ? "pr-10" : ""} ${field.textTransform === "uppercase" ? "uppercase" : ""} ${error ? "border-red-500 focus:border-red-500" : ""
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
