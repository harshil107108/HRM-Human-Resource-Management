import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useCompanyConfig from "./useCompanyConfig";


const Company = () => {

  const initialValue = {
    companyName: '',
    legalName: '',
    companyCode: '',
    businessEmail: '',
    phone: '',
    website: '',
    establishDate: '',
    registrationNumber: null,
    panNumber: null,
    gstNumber: null,
    industry: "",
    date: Date.now(),
    companySize: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    postalCode: "",
  };

  const { businessInfoSchema1, businessInfoSchema2, basicInfoSchema, addressSchema } =
    useCompanyConfig();

  const formmethod = formMethod.createForm({
    schema: [
      ...businessInfoSchema1,
      ...businessInfoSchema2,
      ...basicInfoSchema,
      ...addressSchema,
    ],
    initialValue,
  });

  return (
    <>
      <div className="hp-company-page">
        <HpHeader
          title="Company"
          className="hp-company-page__header"
        />

        <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">

          {/* =========================
            BASIC INFORMATION
        ========================== */}
          <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

            {/* Card Header */}
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Basic Information
              </h2>
            </div>

            {/* Card Body */}
            <div className="p-4">

              {/* Company Logo */}
              <div className="mb-3 flex flex-col items-start gap-6 border-b border-slate-100 pb-6 md:flex-row md:items-center">

                <div className="flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 transition-all hover:border-indigo-500 hover:bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500">
                    Upload Logo
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Company Logo
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Preferred size: 512x512px. Supported formats: PNG, JPG, SVG.
                  </p>

                  <button
                    type="button"
                    className="mt-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Choose File
                  </button>
                </div>

              </div>

              <FormRenderer
                formMethod={formmethod}
                formSchema={basicInfoSchema}
              />

            </div>
          </div>


          {/* =========================
            BOTTOM SECTION
        ========================== */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* =========================
              ADDRESS
          ========================== */}
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              {/* Card Header */}
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Company Address
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={addressSchema}
                />
              </div>

            </div>


            {/* =========================
              RIGHT SIDE
          ========================== */}
            <div className="flex flex-col gap-4">

              {/* =========================
                BUSINESS INFORMATION
            ========================== */}
              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                {/* Card Header */}
                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Business Information
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <FormRenderer
                    formMethod={formmethod}
                    formSchema={businessInfoSchema1}
                  />
                </div>

              </div>


              {/* =========================
                ADDITIONAL INFORMATION
            ========================== */}
              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                {/* Card Header */}
                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Additional Business Information
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <FormRenderer
                    formMethod={formmethod}
                    formSchema={businessInfoSchema2}
                  />
                </div>

              </div>

            </div>

          </div>

          <HpFooter />

        </div>
      </div>
    </>
  );
};

export default Company;
