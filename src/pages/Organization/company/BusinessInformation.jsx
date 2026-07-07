import React from "react";
import { ArrowLeft, ArrowRight, Info, ChevronRight } from "lucide-react";
import useCompanyConfig from "./useCompanyConfig";
import { FormRenderer } from "@/form-engine";

export default function BusinessSetup({
  onNext,
  onBack,
  currentStep = 1,
  totalSteps = 4,
  formmethod,
}) {
  const { businessInfoSchema1, businessInfoSchema2 } = useCompanyConfig();

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
          Business Information
        </h1>
        <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
          Provide the essential tax and legal registration details for your
          organization. This information ensures compliance and proper payroll
          tax filing.
        </p>
      </header>

      <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">
        <FormRenderer
          formMethod={formmethod}
          formSchema={businessInfoSchema1}
        />

        <div className="h-[1px] bg-slate-100 w-full mt-7" />

        <FormRenderer
          formMethod={formmethod}
          formSchema={businessInfoSchema2}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Company Size
            </label>

            <div className="grid grid-cols-3 gap-3">
              {["1-50", "51-500", "500+"].map((sizeOpt, idx) => (
                <button
                  key={sizeOpt}
                  type="button"
                  className={`py-2.5 text-center text-xs font-semibold rounded-lg border transition-all ${idx === 1
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  {sizeOpt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />

            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Ensure all registration IDs match your official government
              documents. Inaccurate data may delay payroll processing.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
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
}
