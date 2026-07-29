import React from "react";
import { CheckCircle2 } from "lucide-react";

const DeclarationCard = ({
    checked,
    onChange,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <label className="flex items-start gap-3">

                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <div>

                    <div className="flex items-center gap-2">

                        <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                        />

                        <h3 className="font-semibold text-slate-800">
                            Confirmation
                        </h3>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        I confirm that all employee information has been
                        reviewed and verified. The employee profile is ready
                        for onboarding and system activation.
                    </p>

                </div>

            </label>

        </div>
    );
};

export default DeclarationCard;