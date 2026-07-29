import React from "react";
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    Save,
    Landmark,
    Wallet,
    Info,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";

const PayrollInformation = ({
    onNext,
    onBack,
    currentStep = 0,
    totalSteps = 7,
    formmethod,
}) => {
    const { payrollInformationSchema } = useEmployeeConfig();

    return (
        <div className="w-full">

            {/* Header */}

            <header className="mb-7">

                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">

                    <span>Employee Management</span>

                    <ChevronRight className="h-3 w-3" />

                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>

                </div>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Payroll Information
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Configure employee bank account and compensation details.
                </p>

            </header>

            <div className="grid grid-cols-12 gap-6">

                {/* Left */}

                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* Bank Details */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Landmark size={18} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Bank Details
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Standard disbursement information
                                </p>
                            </div>

                        </div>

                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={payrollInformationSchema.slice(0, 6)}
                        />

                    </div>

                    {/* Compensation */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Wallet size={18} />
                            </div>

                            <div>

                                <h2 className="text-base font-semibold text-slate-900">
                                    Compensation Structure
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Define salary components and annual package
                                </p>

                            </div>

                        </div>

                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={payrollInformationSchema.slice(6)}
                        />

                    </div>

                </div>

                {/* Right */}

                <div className="col-span-12 lg:col-span-4">

                    <div className="sticky top-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white shadow-lg">

                        <p className="text-xs font-semibold uppercase tracking-widest opacity-90">
                            Estimated Take Home
                        </p>

                        <h2 className="mt-3 text-4xl font-bold">
                            $8,450
                            <span className="ml-1 text-sm font-medium opacity-80">
                                /month
                            </span>
                        </h2>

                        <div className="mt-8 space-y-4 text-sm">

                            <div className="flex justify-between">
                                <span className="opacity-80">
                                    Taxes (Est.)
                                </span>

                                <span>-$1,250</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="opacity-80">
                                    PF Contribution
                                </span>

                                <span>-$420</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="opacity-80">
                                    Insurance Premium
                                </span>

                                <span>-$110</span>
                            </div>

                        </div>

                        <div className="my-6 border-t border-white/20" />

                        <div className="rounded-xl bg-white/10 p-4">

                            <div className="flex gap-3">

                                <Info
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />

                                <p className="text-xs leading-5 text-white/90">
                                    Payroll calculations shown here are
                                    estimates based on the salary details
                                    entered on this page.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Footer */}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                    <ArrowLeft size={16} />
                    Previous
                </button>

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        <Save size={16} />
                        Save Draft
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Next
                        <ArrowRight size={16} />
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PayrollInformation;