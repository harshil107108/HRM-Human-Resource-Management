import React from "react";

const InfoItem = ({
    icon,
    label,
    value,
}) => {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">

            <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
                {icon}
            </div>

            <div className="flex-1">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
                    {value}
                </p>

            </div>

        </div>
    );
};

export default InfoItem;