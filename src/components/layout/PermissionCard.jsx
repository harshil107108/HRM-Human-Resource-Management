import { checkboxClass } from "@/form-engine/styles/formtheme";

// Uses the same checkbox look as the form-engine CheckboxField
// (hidden native input + styled box + check icon).
const PermissionCard = ({
    title,
    description,
    checked,
    onChange,
    disabled = false,
}) => {
    return (
        <label
            // `relative` keeps the sr-only (absolute) input inside the card;
            // without it the input escapes the page scroller and makes the
            // whole window scroll.
            className={`group relative flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-sky-300 hover:bg-sky-50"}`}
        >
            <input
                type="checkbox"
                checked={Boolean(checked)}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />

            <span
                aria-hidden="true"
                className={`${checkboxClass} mt-0.5 h-5 w-5 ${disabled ? "" : "group-hover:border-sky-400"}`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${checked ? "block" : "hidden"} h-3.5 w-3.5 text-white`}
                >
                    <path d="m5 12 4 4L19 6" />
                </svg>
            </span>

            <div>
                <h4 className="text-sm font-semibold text-slate-800">
                    {title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </label>
    );
};

export default PermissionCard;
