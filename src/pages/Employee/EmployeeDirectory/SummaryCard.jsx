import React from "react";
import { Pencil } from "lucide-react";

const SummaryCard = ({
    title,
    icon,
    children,
    onEdit,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        {icon}
                    </div>

                    <div>

                        <h3 className="text-base font-semibold text-slate-800">
                            {title}
                        </h3>

                        <p className="text-xs text-slate-500">
                            Review the entered information.
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                >
                    <Pencil size={15} />
                    Edit
                </button>

            </div>

            {/* Body */}

            <div className="grid gap-4 p-6 md:grid-cols-2">

                {children}

            </div>

        </div>
    );
};

export default SummaryCard;