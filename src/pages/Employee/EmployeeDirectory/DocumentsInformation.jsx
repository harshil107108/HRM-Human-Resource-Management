import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Save,
  FileText,
  Upload,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";

const UploadCard = ({ title }) => {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition hover:border-indigo-300 hover:bg-indigo-50/30">
      <label className="flex cursor-pointer flex-col items-center justify-center">

        <FileText
          size={28}
          className="mb-3 text-slate-400"
        />

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Drag & Drop or Click to Upload
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
          <Upload size={14} />
          Upload
        </div>

        <input
          type="file"
          className="hidden"
        />
      </label>
    </div>
  );
};

const DocumentsInformation = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  formmethod,
}) => {
  const { documentInformationSchema } = useEmployeeConfig();

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
          Documents Information
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add employee identification details and upload supporting documents.
        </p>

      </header>

      {/* Card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Document Fields */}

        <FormRenderer
          formMethod={formmethod}
          formSchema={documentInformationSchema}
        />

        {/* Divider */}

        <div className="my-8 border-t border-slate-100" />

        {/* Upload Section */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <UploadCard
            title="Resume Upload"
          />

          <UploadCard
            title="Offer Letter Upload"
          />

          <UploadCard
            title="Appointment Letter Upload"
          />

          <UploadCard
            title="Other Documents Upload"
          />

        </div>

        {/* Footer */}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-3">

            

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

    </div>
  );
};

export default DocumentsInformation;