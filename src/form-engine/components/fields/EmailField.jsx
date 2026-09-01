import React, { useCallback, useState } from "react";
import { useFormStore } from "../../hooks/useFormStore";
import {
    inputClass,
    labelClass,
    wrapperClass,
} from "../../styles/formtheme";

export default function EmailField({ field, form }) {
    const { id, label, placeHolder, disabled, maxLength } = field;
    const value = useFormStore(form, (snapshot) => snapshot.values[id]);
    const error = useFormStore(form, (snapshot) => snapshot.errors[id]);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback(
        (event) => {
            form.methods.setValue(id, event.target.value.trimStart());
        },
        [form, id],
    );

    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                const validation = form.methods.validateField?.(id);
                if (validation && !validation.isValid) {
                    form.methods.focusField(id);
                    return;
                }
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
        const validation = form.methods.validateField?.(id);
        if (validation && !validation.isValid) {
            form.methods.focusField(id);
            setIsFocused(true);
            return;
        }
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

            <input
                id={id}
                ref={(node) => form.methods.registerRef(id, node)}
                type="email"
                inputMode="email"
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
                className={`${inputClass} ${error ? "border-red-500 focus:border-red-500" : ""}`}
            />
        </div>
    );
}
