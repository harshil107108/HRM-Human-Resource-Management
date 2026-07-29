import React from "react";
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    Save,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";

const OrganizationInformation = ({
    onNext,
    onBack,
    currentStep,
    totalSteps,
    formmethod,
}) => {

    const { organizationInformationSchema } = useEmployeeConfig();

    return (
        <div className="w-full">

            <header className="mb-7">

                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">

                    <span>Employee Management</span>

                    <ChevronRight className="h-3 w-3" />

                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>

                </div>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Organization Information
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Assign the employee to the appropriate company,
                    department, reporting manager and employment details.
                </p>

            </header>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                <FormRenderer
                    formMethod={formmethod}
                    formSchema={organizationInformationSchema}
                />

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                    >
                        <ArrowLeft size={16} />
                        Previous
                    </button>

                    <div className="flex gap-3">

                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <Save size={16} />
                            Save Draft
                        </button>

                        <button
                            type="button"
                            onClick={onNext}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Next
                            <ArrowRight size={16} />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default OrganizationInformation;