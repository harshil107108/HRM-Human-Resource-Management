import React from "react";
import { ArrowLeft, ArrowRight, Info, ChevronRight } from "lucide-react";
import useBranchConfig from "./useBranchConfig";
import { FormRenderer } from "@/form-engine";

export default function BusinessSetup({
  onNext,
  onBack,
  currentStep = 1,
  totalSteps = 4,
  formmethod,
}) {
  const { contactInfoSchema } = useBranchConfig();

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
          Contact Information
        </h1>
        <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
          Specify the official communication channels for this branch location.
        </p>
      </header>

      <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">
        <FormRenderer
          formMethod={formmethod}
          formSchema={contactInfoSchema}
        />

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
