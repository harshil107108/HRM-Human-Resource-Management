import React from "react";
import useCompanyConfig from "./useCompanyConfig";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { FormRenderer } from "@/form-engine";

const BasicInformation = ({
  onNext,
  onBack,
  currentStep = 0,
  totalSteps = 4,
  formmethod,
}) => {
  const { basicInfoSchema } = useCompanyConfig();

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
          Let's start with the foundational details of your organization to
          personalize your HRM environment.
        </p>
      </header>

      <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-100 mb-3">
          <div className="w-28 h-28 border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shrink-0">
            <span className="text-[10px] font-bold text-slate-500">
              Upload Logo
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">Company Logo</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Preferred size: 512x512px. Supported formats: PNG, JPG, SVG.
            </p>
            <button
              type="button"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2.5"
            >
              Choose File
            </button>
          </div>
        </div>

        <FormRenderer formMethod={formmethod} formSchema={basicInfoSchema} />

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

export default BasicInformation;
