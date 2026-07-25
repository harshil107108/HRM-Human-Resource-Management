import { FormRenderer } from "@/form-engine";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import useDesignationConfig from "./useDesignationConfig";

const Organization = ({
    onNext,
    onBack,
    currentStep = 0,
    totalSteps = 4,
    formmethod,
}) => {
    const { basicInfoSchema, basicInfoSchema2 } = useDesignationConfig();

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
                    Basic Information
                </h1>
                <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
                    Enter the basic details of the designation
                </p>
            </header>

            <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">

                <FormRenderer formMethod={formmethod} formSchema={basicInfoSchema} />

                <div className="mt-4 mb-4">
                    <label
                        htmlFor="branchDescription"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Description
                    </label>

                    <textarea
                        id="branchDescription"
                        rows={3}
                        placeholder="Briefly describe the department's core function and objectives..."
                        className=" w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <FormRenderer formMethod={formmethod} formSchema={basicInfoSchema2} />

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

export default Organization