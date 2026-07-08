import React, { useState } from "react";
import useDepatmentConfig from "./useDepatmentConfig";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { FormRenderer } from "@/form-engine";

const Employees = ({
    onNext,
    onBack,
    currentStep = 0,
    totalSteps = 4,
    formmethod,
}) => {
    const { employeeSchema } = useDepatmentConfig();

    const colors = [
        "#131b2e",
        "#ba1a1a",
        "#515f74",
        "#574425",
        "#76777d",
    ];

    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [allowFutureAssignments, setAllowFutureAssignments] = useState(true);

    return (
        <div className="w-full text-slate-700 font-sans antialiased selection:bg-indigo-100">
            <header className="mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    <span>Organization Setup</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Management
                </h1>
                <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
                    Assign management and operational policies.
                </p>
            </header>

            <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">

                <FormRenderer formMethod={formmethod} formSchema={employeeSchema} />

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Department Color */}

                    <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-800">
                            Department Color Label
                        </label>

                        <div className="flex flex-wrap gap-3">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`h-10 w-10 rounded-full border-4 transition-all duration-200 hover:scale-110 active:scale-95 ${selectedColor === color
                                        ? "border-white ring-2 ring-slate-900"
                                        : "border-transparent ring-2 ring-transparent"
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Visual tag used in organization charts and calendars.
                        </p>
                    </div>

                    {/* Future Assignment */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Allow Future Assignments
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Enable scheduling of hires for future dates.
                                </p>
                            </div>

                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={allowFutureAssignments}
                                    onChange={(e) =>
                                        setAllowFutureAssignments(e.target.checked)
                                    }
                                    className="peer sr-only"
                                />

                                <div
                                    className=" h-6 w-11 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-indigo-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5
          "
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                    <button
                        type="button"
                        onClick={() => onBack?.()}
                        disabled={currentStep === 0}
                        className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>

                    <button
                        id="next"
                        type="button"
                        onClick={() => onNext?.()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                    >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Employees;
