import React from "react";
import { Building2 } from "lucide-react";

const Toggle = ({
    name,
    defaultValue = false,
    value,
    onChange,
    title = "Head Office",
    description = "Mark this option as enabled.",
    disabled = false,
    toggleData,
    setToggleData,
}) => {
    const checkedValue = value ?? toggleData?.[name] ?? defaultValue;

    const handleChange = (checked) => {
        if (onChange) {
            onChange(checked);
            return;
        }

        setToggleData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    return (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                        <Building2 className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            {title}
                        </h3>

                        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <label
                    className={`relative inline-flex items-center ${disabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                        }`}
                >
                    <input
                        type="checkbox"
                        name={name}
                        checked={Boolean(checkedValue)}
                        disabled={disabled}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="peer sr-only"
                    />

                    <div
                        className="
                            h-5
                            w-9
                            rounded-full
                            bg-slate-300
                            transition-colors
                            duration-200
                            peer-checked:bg-indigo-600
                            after:absolute
                            after:left-[2px]
                            after:top-[2px]
                            after:h-4
                            after:w-4
                            after:rounded-full
                            after:bg-white
                            after:shadow-sm
                            after:transition-transform
                            after:duration-200
                            peer-checked:after:translate-x-4
                        "
                    />
                </label>
            </div>
        </div>
    );
};

export default Toggle;