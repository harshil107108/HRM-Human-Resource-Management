import React, { useCallback } from "react";
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
    useFormStore(form);

    const {
        id,
        label,
        description,
        disabled,
        required,
        checkedValue = true,
        uncheckedValue = false,
    } = field;

    const value = form.methods.getValue(id);
    const error = form.methods.getErrors()[id];

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
        value === checkedValue ||
        value === true ||
        value === "true" ||
        value === 1;

    const handleChange = useCallback(
        (event) => {
            const nextValue = event.target.checked
                ? checkedValue
                : uncheckedValue;

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
        <div className={`${wrapperClass} gap-2`}>
            <label
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-md p-1"
            >
                <span className="relative flex shrink-0 items-center justify-center">
                    <input
                        id={id}
                        ref={(node) => form.methods.registerRef(id, node)}
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        disabled={disabled}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        aria-invalid={Boolean(error)}
                        className="peer sr-only"
                    />
                    <span
                        className={`${checkboxClass} ${sizeClass} ${error ? "border-red-500" : ""
                            } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"} peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-100`}
                        style={sizeStyle}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`${isChecked ? "block" : "hidden"} h-3 w-3 text-white`}
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </span>
                </span>

                <span className="flex min-w-0 flex-col">
                    {label && (
                        <span className={`${labelClass} flex items-center gap-1`}>
                            {label}
                            {required && <span className="text-red-500">*</span>}
                        </span>
                    )}

                    {description && (
                        <span className="text-xs leading-5 text-slate-500">
                            {description}
                        </span>
                    )}
                </span>
            </label>

            {error && <p className={errorClass}>{error}</p>}
        </div>
    );
}