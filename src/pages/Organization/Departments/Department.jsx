import { formMethod } from "@/form-engine";
import useDepatmentConfig from "./useDepatmentConfig";
import HpHeader from "@/hooks/HpHeader";
import { FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import { useMemo, useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import useAlert from "@/hooks/useAlert";

const Department = () => {
  const locationData = useLocation();
  const departmentId = locationData.state.departmentid;
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { successAlert } = useAlert()

  const initialValue = {
    company: '',
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

  const { basicInfoSchema, employeeSchema, managementSchema } = useDepatmentConfig();

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [
        ...basicInfoSchema,
        ...employeeSchema,
        ...managementSchema,
      ],
      initialValue,
    });
  }, []);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const res = await apiCall({
          id: "departmentAddEdit",
          api: api + apiEndpoints.organization.department.DepartmentAddEdit,
          payload: data,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save Department");
        }

        return res;
      },
      {
        onSuccess: async () => {
          successAlert({
            title: "Department Added",
            text: "Department added successfully.",
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

  const getDataById = async () => {
    if (!departmentId) return;

    const res = await apiCall({
      id: "getCompanyById",
      api: api + apiEndpoints.organization.department.DepartmentGetByID,
      payload: {
        _id: departmentId,
      },
    });

    if (res?.success) {
      const data = res.data.data;

      formmethod.methods.setValues({
        ...data,
        company: data?.company?._id || "",
        branch: data?.branch?._id || "",
        description: data?.description || "",
        parentdepartment: data.parentdepartment?._id || "",
        reportingdepartment: data.reportingdepartment?._id || "",
      });

    }
  };

  useEffect(() => {
    if (departmentId) {
      getDataById();
    }
  }, [departmentId]);


  return (
    <>
      <div className="hp-company-page">
        <HpHeader
          title="Department"
          className="hp-company-page__header"
        />

        <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">


          <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Basic Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer formMethod={formmethod} formSchema={basicInfoSchema} />

              <div className="mt-4">
                <label
                  htmlFor="branchDescription"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Description
                </label>

                <textarea
                  id="branchDescription"
                  onChange={(e) =>
                    formmethod.methods.setValue("description", e.target.value)
                  }
                  value={formmethod.methods.watch('description')}
                  rows={3}
                  placeholder="Briefly describe the department's core function and objectives..."
                  className=" w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">


            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              {/* Card Header */}
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Employee
                </h2>
              </div>

              <div className="p-4">

                <FormRenderer formMethod={formmethod} formSchema={employeeSchema} />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Management
                  </h2>
                </div>

                <div className="p-4">
                  <FormRenderer formMethod={formmethod} formSchema={managementSchema} />
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

export default Department;
