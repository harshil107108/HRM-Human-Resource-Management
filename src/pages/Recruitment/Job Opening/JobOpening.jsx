import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useJobOpeningConfig from "./useJobOpeningConfig";
import { useNavigate } from "react-router-dom";

const JobOpening = () => {
  const navigate = useNavigate();

  const {
    jobInformationSchema,
    positionInformationSchema,
    hiringInformationSchema,
    salaryInformationSchema,
    jobDescriptionSchema,
    publishingInformationSchema,
    additionalInformationSchema,
  } = useJobOpeningConfig();

  const formmethod = formMethod.createForm({
    schema: [
      ...jobInformationSchema,
      ...positionInformationSchema,
      ...hiringInformationSchema,
      ...salaryInformationSchema,
      ...jobDescriptionSchema,
      ...publishingInformationSchema,
      ...additionalInformationSchema,
    ],

    initialValue: {
      jobTitle: "",
      jobOpeningId: "",
      departmentId: "",
      designationId: "",
      companyId: "",
      branchId: "",
      locationId: "",

      numberOfPositions: 1,
      employmentType: "",
      workMode: "",
      experienceRequired: "",
      minimumExperience: "",
      maximumExperience: "",

      hiringManagerId: "",
      recruiterId: "",
      priority: "NORMAL",
      targetJoiningDate: "",

      salaryType: "",
      minimumSalary: "",
      maximumSalary: "",
      currency: "INR",

      jobSummary: "",
      jobResponsibilities: "",
      requiredSkills: "",
      preferredSkills: "",
      qualifications: "",

      jobStatus: "DRAFT",
      publishDate: "",
      closingDate: "",
      publishOnCareerPage: false,
      allowInternalApplications: false,

      remarks: "",
    },
  });

  const handleClear = () => {
    formmethod.methods.reset();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="hp-company-page">
      <HpHeader
        title="Create Job Opening"
        className="hp-company-page__header"
      />

      <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">
        {/* =========================================================
    JOB INFORMATION + POSITION INFORMATION
========================================================= */}

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* JOB INFORMATION */}

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Job Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={jobInformationSchema}
              />
            </div>
          </div>

          {/* POSITION INFORMATION */}

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Position Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={positionInformationSchema}
              />
            </div>
          </div>
        </div>

        {/* =========================================================
    HIRING INFORMATION + SALARY INFORMATION
========================================================= */}

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* HIRING INFORMATION */}

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Hiring Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={hiringInformationSchema}
              />
            </div>
          </div>

          {/* SALARY INFORMATION */}

          <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
              <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

              <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                Salary Information
              </h2>
            </div>

            <div className="p-4">
              <FormRenderer
                formMethod={formmethod}
                formSchema={salaryInformationSchema}
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            JOB DESCRIPTION
        ========================================================== */}

        <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
              Job Description
            </h2>
          </div>

          <div className="p-4">
            <FormRenderer
              formMethod={formmethod}
              formSchema={jobDescriptionSchema}
            />
          </div>
        </div>

        {/* =========================================================
            PUBLISHING
        ========================================================== */}

        <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
              Publishing
            </h2>
          </div>

          <div className="p-4">
            <FormRenderer
              formMethod={formmethod}
              formSchema={publishingInformationSchema}
            />
          </div>
        </div>

        {/* =========================================================
            ADDITIONAL INFORMATION
        ========================================================== */}

        <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
              Additional Information
            </h2>
          </div>

          <div className="p-4">
            <FormRenderer
              formMethod={formmethod}
              formSchema={additionalInformationSchema}
            />
          </div>
        </div>

        {/* =========================================================
            FOOTER
        ========================================================== */}

        <HpFooter
          onBack={handleBack}
          onClear={handleClear}
          // onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default JobOpening;
