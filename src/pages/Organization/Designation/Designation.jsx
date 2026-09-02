import { formMethod } from "@/form-engine";
import useDesignationConfig from "./useDesignationConfig";
import HpHeader from "@/hooks/HpHeader";
import { FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import Toggle from "@/hooks/Toogle";
import { useEffect, useState } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";


const Designation = () => {
  const { apiCall } = useApiCall();

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

  const [EmployeeData, setEmployeeData] = useState();

  const { basicInfoSchema, jobAssignmentSchema, employmentSchema, reportingStructreSchema, workSchema, gradeSchema, payrollSchema, payrollToggleConfig } = useDesignationConfig({ EmployeeData });

  const formmethod = formMethod.createForm({
    schema: [
      ...basicInfoSchema,
      ...jobAssignmentSchema,
      ...employmentSchema,
      ...reportingStructreSchema,
      ...workSchema,
      ...gradeSchema,
      ...payrollSchema,
    ],
    initialValue,
  });


  const getEmployeeData = async () => {
    const res = await apiCall({
      id: "companyAddEdit",
      api: api + apiEndpoints.employee.employee.EmployeeHelp,
      payload: {},
    });

    if (res.success) {
      const data = res.data.data;

      const employeeOptions = data.map((employee) => ({
        label: employee.employeeName,
        value: employee._id,
      }));

      setEmployeeData(employeeOptions);
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, [])

  return (
    <>
      <div className="hp-company-page">
        <HpHeader
          title="Designation"
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
                  Job Assignment
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-4">

                <FormRenderer formMethod={formmethod} formSchema={jobAssignmentSchema} />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                {/* Card Header */}
                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Employment Details
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <FormRenderer formMethod={formmethod} formSchema={employmentSchema} />
                </div>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-5">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              {/* Card Header */}
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Work Information
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-4">

                <FormRenderer formMethod={formmethod} formSchema={workSchema} />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                {/* Card Header */}
                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Reporting Structure
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <FormRenderer formMethod={formmethod} formSchema={reportingStructreSchema} />
                </div>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-5">
            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              {/* Card Header */}
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Grade & Level
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-4">

                <FormRenderer formMethod={formmethod} formSchema={gradeSchema} />
              </div>

            </div>

            <div className="flex flex-col gap-4">

              <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                {/* Card Header */}
                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                  <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                  <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                    Payroll & System Mapping
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <FormRenderer formMethod={formmethod} formSchema={payrollSchema} />
                </div>

              </div>
            </div>

          </div>


          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

              {/* Card Header */}
              <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                  Payroll Eligibility
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {payrollToggleConfig.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">
                          {item.title}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Enable or disable this option for the employee.
                        </p>
                      </div>

                      <Toggle
                        name={item.id}
                        formMethod={formmethod}
                        defaultValue={item.defaultValue}
                        title={item.title}
                      />
                    </div>
                  ))}
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

export default Designation;
