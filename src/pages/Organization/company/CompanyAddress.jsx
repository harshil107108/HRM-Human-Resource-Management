import React from "react";
import useCompanyConfig from "./useCompanyConfig";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { formMethod, FormRenderer } from "@/form-engine";

const CompanyAddress = ({
  onNext,
  onBack,
  currentStep = 2,
  totalSteps = 4,
}) => {
  const { addressSchema } = useCompanyConfig();
  const initialValue = {
    registrationNumber: null,
    panNumber: null,
    gstNumber: null,
    industry: "",
    date: Date.now(),
  };

  const formmethod = formMethod.createForm({
    schema: [...addressSchema],
    initialValue,
  });

  return (
    <div className="w-full">
      <header className="mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
          <span>Organization Setup</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Company Address
        </h1>
        <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
          Add the office location details so the organization profile looks
          complete and ready for operations.
        </p>
      </header>

      <div className="bg-white border border-slate-200/85 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.015)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <FormRenderer formMethod={formmethod} formSchema={addressSchema} />
          </div>

          <div className="relative bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[500px]">
            <div className="absolute inset-0 bg-slate-50 overflow-hidden">
              <svg
                className="w-full h-full opacity-60"
                viewBox="0 0 200 200"
                fill="none"
              >
                <path
                  d="M 0 40 L 200 60 M 0 120 L 200 130 M 0 160 L 200 150"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />
                <path
                  d="M 40 0 L 60 200 M 120 0 L 110 200 M 170 0 L 180 200"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />
                <path
                  d="M-10 0 C 40 80, 20 140, -10 200"
                  stroke="#e2e8f0"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d="M-10 0 C 40 80, 20 140, -10 200"
                  stroke="#eff6ff"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute w-10 h-10 bg-indigo-500/20 rounded-full animate-ping" />
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-lg" />
              </div>

              <div className="absolute top-4 right-4 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm">
                <button className="p-2 border-b border-slate-100">+</button>
                <button className="p-2">−</button>
              </div>

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Live Preview
              </div>
            </div>

            <div className="relative z-10 m-4 bg-white/95 border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                🏢
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Corporate HQ Location
                </p>

                <p className="text-xs text-slate-500">
                  Enter your address to preview its location.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={() => onNext?.()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAddress;
