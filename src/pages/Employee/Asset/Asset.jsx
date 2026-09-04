import { formMethod, FormRenderer } from "@/form-engine";
import { Image, Upload, FileText } from "lucide-react";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useAssetConfig from "./useAssetConfig";
import { useNavigate } from "react-router-dom";

const Asset = () => {
  const navigate = useNavigate();

  const {
    basicInformationSchema,
    assetDetailsSchema,
    purchaseInformationSchema,
    organizationInformationSchema,
    assetStatusSchema,
    assignmentInformationSchema,
  } = useAssetConfig();

  const formmethod = formMethod.createForm({
    schema: [
      ...basicInformationSchema,
      ...assetDetailsSchema,
      ...purchaseInformationSchema,
      ...organizationInformationSchema,
      ...assetStatusSchema,
      ...assignmentInformationSchema,
    ],

    initialValue: {},
  });

  const handleClear = () => {
    formmethod.methods.reset();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="hp-company-page">
      <HpHeader title="Asset" className="hp-company-page__header" />

      <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">
        <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
              Basic Information
            </h2>
          </div>

          <div className="p-4">
            <div className="mb-6 flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <Image className="h-12 w-12 text-slate-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Asset Image
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WEBP. Max size 2 MB.
                </p>

                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Upload className="h-4 w-4" />
                  Upload New
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </label>
              </div>
            </div>

            <FormRenderer
              formMethod={formmethod}
              formSchema={basicInformationSchema}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Asset Details
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={assetDetailsSchema}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Purchase Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={purchaseInformationSchema}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Organization Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={organizationInformationSchema}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Asset Status
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={assetStatusSchema}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Assignment Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={assignmentInformationSchema}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Documents
              </h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#fafcfd]">
                  <FileText className="mb-3 h-9 w-9 text-[#94a3b8]" />

                  <h3 className="text-sm font-semibold text-[#334155]">
                    Purchase Invoice
                  </h3>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Drag & Drop or Click to Upload
                  </p>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338ca]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </button>
                </div>

                <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#fafcfd]">
                  <FileText className="mb-3 h-9 w-9 text-[#94a3b8]" />

                  <h3 className="text-sm font-semibold text-[#334155]">
                    Warranty Document
                  </h3>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Drag & Drop or Click to Upload
                  </p>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338ca]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </button>
                </div>

                <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd5e1] bg-[#fafcfd]">
                  <FileText className="mb-3 h-9 w-9 text-[#94a3b8]" />

                  <h3 className="text-sm font-semibold text-[#334155]">
                    Other Documents
                  </h3>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Drag & Drop or Click to Upload
                  </p>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338ca]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-4">
          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Additional Information
              </h2>
            </div>

            <div className="p-4">
              <label
                htmlFor="assetDescription"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Description
              </label>

              <textarea
                id="assetDescription"
                name="assetDescription"
                rows={3}
                //   value={formmethod.methods.watch("assetDescription") || ""}
                //   onChange={(e) =>
                //     formmethod.methods.setValue(
                //       "assetDescription",
                //       e.target.value,
                //     )
                //   }
                placeholder="Briefly describe the asset..."
                className=" w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        <HpFooter
          onBack={handleBack}
          onClear={handleClear}
          //    onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default Asset;
