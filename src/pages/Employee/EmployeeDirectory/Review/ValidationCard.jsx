import React from "react";
import { BadgeCheck } from "lucide-react";

const ValidationCard = () => {
    return (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">

            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                        <BadgeCheck size={22} />

                    </div>

                    <div>

                        <h3 className="text-sm font-semibold text-slate-800">
                            Data Validation
                        </h3>

                        <p className="text-xs text-slate-500">
                            All mandatory fields completed.
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-3 p-5">

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                    <span className="text-sm font-medium text-slate-700">
                        Validation Status
                    </span>

                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                        Passed
                    </span>

                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-sm leading-6 text-slate-600">
                        Final review completed successfully.
                        Employee profile is ready for onboarding,
                        document verification and account provisioning.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default ValidationCard;