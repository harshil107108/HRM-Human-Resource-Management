import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Info,
  Briefcase,
  MapPin,
  Check,
  Map,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReviewSetup({
  onBack,
  currentStep = 3,
  totalSteps = 4,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="w-full space-y-8 select-none">
      <header className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
          <span>Organization Setup</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Review &amp; Submit
        </h1>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl">
          Please double-check all the information you've entered. Once you
          create the company, these settings will be applied as the
          organizational default.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:border-indigo-500/30 group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Info className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">
                Basic Info
              </h3>
            </div>

            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <dl className="space-y-3 text-xs">
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Company Name
              </dt>
              <dd className="text-slate-800 font-semibold mt-0.5">
                Acme Global Industries
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Legal Entity Type
              </dt>
              <dd className="text-slate-800 font-semibold mt-0.5">
                Corporation (Inc.)
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Industry
              </dt>
              <dd className="text-slate-800 font-semibold mt-0.5">
                Information Technology &amp; Services
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all hover:border-indigo-500/30 group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">
                Business Info
              </h3>
            </div>

            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <dl className="space-y-3 text-xs">
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Tax ID / EIN
              </dt>
              <dd className="text-slate-800 font-semibold mt-0.5">
                12-3456789
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Company Website
              </dt>
              <dd className="text-indigo-600 font-semibold mt-0.5 hover:underline cursor-pointer">
                www.acmeglobal.com
              </dd>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                Verified Tax Status
              </span>
            </div>
          </dl>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] md:col-span-2 transition-all hover:border-indigo-500/30 group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">Address</h3>
            </div>

            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1 space-y-1 text-xs">
              <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">
                Corporate Headquarters
              </dt>
              <address className="text-slate-800 font-semibold not-italic leading-relaxed">
                795 Folsom Ave, Suite 600
                <br />
                San Francisco, CA 94107
                <br />
                United States
              </address>
            </div>

            <div className="w-full md:w-72 h-28 rounded-xl border border-slate-200 overflow-hidden relative bg-slate-50 flex items-center justify-center shrink-0">
              <svg
                className="absolute inset-0 w-full h-full opacity-40"
                viewBox="0 0 200 200"
                fill="none"
              >
                <path
                  d="M 0 50 L 200 40 M 0 130 L 200 120 M 0 160 L 200 170"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <path
                  d="M 50 0 L 40 200 M 120 0 L 130 200 M 160 0 L 150 200"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <path
                  d="M-10 10 C 60 40, 40 120, -10 180"
                  stroke="#d9f2ff"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-500/20 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-md relative z-10" />

              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-500 flex items-center gap-1 shadow-sm">
                <Map className="w-2.5 h-2.5" />
                <span>San Francisco</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="w-full md:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            className={`w-full md:w-auto px-5 py-3 rounded-lg font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 ${isSuccess
              ? "bg-indigo-600 text-white cursor-default"
              : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
              }`}
          >
            <span>
              {isSubmitting ? "Creating..." : isSuccess ? "Company Created!" : "Create Company"}
            </span>
            {isSuccess ? (<Check className="w-4 h-4 text-white" />) : (<CheckCircle2 className="w-4 h-4 text-white" />)}
          </button>
        </div>
      </div>
    </div>
  );
}
