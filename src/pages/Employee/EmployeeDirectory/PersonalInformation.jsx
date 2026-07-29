import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronRight,
  Save,
  User,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";

const PersonalInformation = ({
  onNext,
  onBack,
  currentStep = 0,
  totalSteps = 7,
  formmethod,
}) => {
  const { personalInformationSchema } = useEmployeeConfig();

  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    setPreview(null);
  };

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
          Personal Information
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Complete the employee's personal information before moving to the
          organization details.
        </p>

      </header>

      {/* Card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Profile Upload */}

        <div className="mb-8 flex items-start gap-5">

          <div className="relative">

            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">

              {preview ? (
                <img
                  src={preview}
                  alt="Employee"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-slate-400" />
              )}

            </div>

            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <Camera size={15} />

            </label>

          </div>

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              Employee Profile Picture
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG or GIF. Max size 2 MB.
            </p>

            <div className="mt-4 flex items-center gap-3">

              <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">

                Upload New

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

              </label>

              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
              >
                Remove
              </button>

            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="mb-7 border-t border-slate-100"></div>

        {/* Form */}

        <FormRenderer
          formMethod={formmethod}
          formSchema={personalInformationSchema}
        />

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

export default PersonalInformation;