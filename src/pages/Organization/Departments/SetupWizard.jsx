import React from "react";
import { Briefcase, Check } from "lucide-react";

const SetupWizard = ({ steps = [], activeStep = 0, onStepSelect }) => {
  const progressWidth = `${((activeStep + 1) / steps.length) * 100}%`;

  return (
    <aside className="w-72 hidden lg:flex flex-col shrink-0 bg-white border border-slate-200/80 rounded-2xl p-6 h-fit shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">
              Setup Wizard
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
              Step {activeStep + 1} of {steps.length} Steps
            </p>
          </div>
        </div>

        <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <nav className="space-y-1.5">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isDisabled = index > activeStep + 1;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => !isDisabled && onStepSelect?.(index)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-left ${isActive
                ? "text-indigo-600 bg-indigo-50/60 border border-indigo-100/50 shadow-sm"
                : isCompleted
                  ? "text-slate-700 hover:bg-slate-50"
                  : "text-slate-400 opacity-60 cursor-not-allowed"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${isActive
                  ? "bg-indigo-600 border border-indigo-600 text-white"
                  : isCompleted
                    ? "bg-emerald-500 border border-emerald-500 text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-400"
                  }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SetupWizard;
