import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useCompanyConfig from "./useCompanyConfig";
import { useMemo, useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";


const Company = () => {
  const locationData = useLocation();
  const companyId = locationData.state.companyid;
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { successAlert } = useAlert()

  const [companyImage, setCompanyImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const { businessInfoSchema1, AdditionalBusinessInformation, basicInfoSchema, addressSchema } = useCompanyConfig();


  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [
        ...businessInfoSchema1,
        ...AdditionalBusinessInformation,
        ...basicInfoSchema,
        ...addressSchema,
      ],
      initialValue,
    });
  }, []);

  const handleSave = async () => {
    const data = formmethod.methods.getValues();

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (companyImage) {
      formData.append("companyImage", companyImage);
    }

    const res = await apiCall({
      id: "companyAddEdit",
      api: api + apiEndpoints.organization.company.CompanyAddEdit,
      payload: formData,
    });

    if (res?.success) {
      navigate(-1);
      if (res.success) {
        successAlert({
          title: "Company Added",
          text: "Company Added successfully.",
        });
      }
    }
  };

  const handleClear = () => {
    formmethod.methods.reset();
  }

  const handleBack = () => {
    navigate(-1);
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCompanyImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const getDataById = async () => {
    if (!companyId) return;

    const res = await apiCall({
      id: "getCompanyById",
      api: api + apiEndpoints.organization.company.CompanyGetByID,
      payload: {
        _id: companyId,
      },
    });

    if (res?.success) {
      const data = res.data.data;

      formmethod.methods.setValues({
        ...data,

        country: data.country?._id || "",
        state: data.state?._id || "",
        city: data.city?._id || "",
        establishDate: formatDateForInput(data.establishDate)
      });

      if (data.companyImage) {
        setImagePreview(
          `${api}${data.companyImage}`
        );
      }
    }
  };

  useEffect(() => {
    if (companyId) {
      getDataById();
    }
  }, [companyId]);



  return (
    <>
      <div className="hp-company-page">
        <HpHeader
          title="Company"
          className="hp-company-page__header"
        />

        <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">


          <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

            {/* Card Header */}
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Basic Information
              </h2>
            </div>

            <div className="p-4">
              <div className="mb-3 flex flex-col items-start gap-6 border-b border-slate-100 pb-6 md:flex-row md:items-center">

                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/50">

                  {(imagePreview || companyImage) ? (
                    <img
                      src={imagePreview}
                      alt="Company Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">
                      Upload Logo
                    </span>
                  )}

                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Company Logo
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Preferred size: 512x512px. Supported formats: PNG, JPG, SVG.
                  </p>

                  <input
                    type="file"
                    id="companyImage"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="companyImage"
                    className="mt-2.5 inline-block cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Choose File
                  </label>
                </div>

              </div>

              <FormRenderer
                formMethod={formmethod}
                formSchema={basicInfoSchema}
              />

            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Company Address
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer
                  formMethod={formmethod}
                  formSchema={addressSchema}
                />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Business Information
                  </h2>
                </div>

                <div className="p-4">
                  <FormRenderer
                    formMethod={formmethod}
                    formSchema={businessInfoSchema1}
                  />
                </div>

              </div>

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Additional Business Information
                  </h2>
                </div>

                <div className="p-4">
                  <FormRenderer
                    formMethod={formmethod}
                    formSchema={AdditionalBusinessInformation}
                  />
                </div>

              </div>

            </div>

          </div>

          <HpFooter
            onBack={handleBack}
            onClear={handleClear}
            onSave={handleSave}
          />

        </div>
      </div>
    </>
  );
};

export default Company;
