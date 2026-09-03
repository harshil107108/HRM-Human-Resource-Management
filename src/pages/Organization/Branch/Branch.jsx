import { formMethod } from "@/form-engine";
import useBranchConfig from "./useBranchConfig";
import HpHeader from "@/hooks/HpHeader";
import { FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import { useMemo, useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateForInput } from "@/utils/dateUtils";
import useAlert from "@/hooks/useAlert";


const Branch = () => {

  const locationData = useLocation();
  const branchId = locationData.state.branchid;
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { successAlert } = useAlert()

  const [branchImage, setBranchImage] = useState(null);
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



  const { contactInfoSchema, basicInfoSchema, addressSchema } = useBranchConfig();

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [
        ...basicInfoSchema,
        ...addressSchema,
        ...contactInfoSchema,
      ],
      initialValue,
    });
  }, []);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        if (branchImage) {
          formData.append("branchImage", branchImage);
        }

        const res = await apiCall({
          id: "branchAddEdit",
          api: api + apiEndpoints.organization.branch.BranchAddEdit,
          payload: formData,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save Branch");
        }

        return res;
      },
      {
        onSuccess: async () => {
          successAlert({
            title: "Branch Added",
            text: "Branch Added successfully.",
          });

          navigate(-1);
        },
      }
    );

    return result;
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

    setBranchImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const getDataById = async () => {
    if (!branchId) return;

    const res = await apiCall({
      id: "getCompanyById",
      api: api + apiEndpoints.organization.branch.BranchGetByID,
      payload: {
        _id: branchId,
      },
    });

    if (res?.success) {
      const data = res.data.data;

      formmethod.methods.setValues({
        ...data,
        parentcompany: data.parentcompany._id,
        country: data.country?._id || "",
        state: data.state?._id || "",
        city: data.city?._id || "",
        establishDate: formatDateForInput(data.establishDate)
      });

      if (data.branchImage) {
        setImagePreview(
          `${api}${data.branchImage}`
        );
      }
    }
  };

  useEffect(() => {
    if (branchId) {
      getDataById();
    }
  }, [branchId]);


  return (
    <>
      <div className="hp-company-page">
        <HpHeader
          title="Branch"
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

            {/* Card Body */}
            <div className="p-4">

              {/* Company Logo */}
              <div className="mb-3 flex flex-col items-start gap-6 border-b border-slate-100 pb-6 md:flex-row md:items-center">

                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/50">

                  {(imagePreview || branchImage) ? (
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
                    Branch Logo
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Preferred size: 512x512px. Supported formats: PNG, JPG, SVG.
                  </p>

                  <input
                    type="file"
                    id="branchImage"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="branchImage"
                    className="mt-2.5 inline-block cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Choose File
                  </label>
                </div>

              </div>
              <FormRenderer formMethod={formmethod} formSchema={basicInfoSchema} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Branch Address
                </h2>
              </div>

              <div className="p-4">
                <FormRenderer formMethod={formmethod} formSchema={addressSchema} />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Contact Information
                  </h2>
                </div>

                <div className="p-4">
                  <FormRenderer
                    formMethod={formmethod}
                    formSchema={contactInfoSchema}
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

export default Branch;
