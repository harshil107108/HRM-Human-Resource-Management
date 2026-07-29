import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const FooterActions = ({
    onBack,
    onSubmit,
    loading = false,
    disabled = false,
}) => {
    return (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <button
                type="button"
                disabled={disabled || loading}
                onClick={onSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <CheckCircle2 size={18} />

                {loading ? "Creating Employee..." : "Create Employee"}
            </button>

        </div>
    );
};

export default FooterActions;