import React from "react";
import useBranchConfig from "./useBranchConfig";
import { ArrowLeft, ArrowRight, Building2, ChevronRight } from "lucide-react";
import { FormRenderer } from "@/form-engine";

const BasicInformation = ({
  onNext,
  onBack,
  currentStep = 0,
  totalSteps = 4,
  formmethod,
}) => {
  const { basicInfoSchema } = useBranchConfig();

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

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <Building2 className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Head Office
                </h3>

                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Mark this branch as the primary administrative office.
                </p>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
              />

              <div
                className="
          h-5
          w-9
          rounded-full
          bg-slate-300
          transition-colors
          duration-200
          peer-checked:bg-indigo-600
          after:absolute
          after:left-[2px]
          after:top-[2px]
          after:h-4
          after:w-4
          after:rounded-full
          after:bg-white
          after:shadow-sm
          after:transition-transform
          after:duration-200
          peer-checked:after:translate-x-4
        "
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="branchDescription"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Branch Description
          </label>

          <textarea
            id="branchDescription"
            rows={3}
            placeholder="Enter branch objectives, responsibilities, or operational details..."
            className="
      w-full
      resize-none
      rounded-md
      border
      border-slate-300
      bg-white
      px-3
      py-2
      text-sm
      text-slate-700
      placeholder:text-slate-400
      transition-all
      duration-200
      focus:border-indigo-500
      focus:outline-none
      focus:ring-2
      focus:ring-indigo-100
    "
          />

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              This description helps identify the purpose and operations of this branch.
            </p>

            <span className="text-[11px] text-slate-400">
              0 / 500
            </span>
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

export default BasicInformation;
