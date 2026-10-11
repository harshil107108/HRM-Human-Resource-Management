import { checkboxClass } from "@/form-engine/styles/formtheme";

const sizeClassMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

/**
 * HpCheckbox
 * ---------------------------------------------------------------------------
 * Standalone checkbox with the same look as the form-engine CheckboxField
 * (hidden native input + styled box + tick), for places that aren't driven
 * by a form store: permission matrices, tables, cards.
 *
 * `indeterminate` shows a filled box with a dash ("some selected").
 * `decorative` renders a non-interactive sample (e.g. in a legend).
 * ---------------------------------------------------------------------------
 */
export default function HpCheckbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  size = "md",
  label,
  ariaLabel,
  title,
  className = "",
  decorative = false,
}) {
  const isOn = checked || indeterminate;

  return (
    <label
      title={title}
      aria-hidden={decorative || undefined}
      className={`group relative inline-flex items-center gap-2 text-xs text-slate-700 ${
        decorative ? "pointer-events-none" : disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={Boolean(checked)}
        disabled={disabled}
        tabIndex={decorative ? -1 : undefined}
        readOnly={decorative || undefined}
        aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
        aria-checked={indeterminate ? "mixed" : Boolean(checked)}
        onChange={(event) => onChange?.(event.target.checked, event)}
      />
      <span
        aria-hidden="true"
        className={`${checkboxClass} ${sizeClassMap[size] || sizeClassMap.md} ${
          indeterminate ? "border-sky-600 bg-sky-600" : ""
        } ${disabled ? "" : "group-hover:border-sky-400"}`}
      >
        {indeterminate ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="h-3 w-3 text-white">
            <path d="M6 12h12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${isOn ? "block" : "hidden"} h-3.5 w-3.5 text-white`}
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
