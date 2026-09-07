import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import useJobOpeningConfig from "./useJobOpeningConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import { formatDateForInput } from "@/utils/dateUtils";

const JobOpening = () => {
  const locationData = useLocation();
  const JobOpeningId = locationData?.state?.jobOpeningId;
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { successAlert } = useAlert();

  const {
    jobInformationSchema,
    positionInformationSchema,
    hiringInformationSchema,
    salaryInformationSchema,
    jobDescriptionSchema,
    publishingInformationSchema,
    additionalInformationSchema,
  } = useJobOpeningConfig();

  const generateJobOpeningId = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `${randomNumber}`;
  };

  const initialValue = {
    jobTitle: "",
    jobOpeningId: generateJobOpeningId(),
    department: "",
    designation: "",
    company: "",
    branch: "",
    numberOfPositions: 1,
    employmentType: "",
    workMode: "",
    experienceRequired: "",
    minimumExperience: 0,
    maximumExperience: 0,
    hiringManager: "",
    recruiter: "",
    priority: "NORMAL",
    targetJoiningDate: "",
    salaryType: "",
    minimumSalary: 0,
    maximumSalary: 0,
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
    isActive: true,
  };

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [
        ...jobInformationSchema,
        ...positionInformationSchema,
        ...hiringInformationSchema,
        ...salaryInformationSchema,
        ...jobDescriptionSchema,
        ...publishingInformationSchema,
        ...additionalInformationSchema,
      ],
      initialValue,
    });
  }, []);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = {
          ...data,
        };

        if (JobOpeningId) {
          payload._id = JobOpeningId;
        }

        const res = await apiCall({
          id: "jobOpeningAddEdit",
          api: api + apiEndpoints.recruitment.jobOpening.JobOpeningAddEdit,
          payload,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save Job Opening");
        }

        return res;
      },
      {
        onSuccess: async () => {
          successAlert({
            title: JobOpeningId ? "Job Opening Updated" : "Job Opening Added",

            text: JobOpeningId
              ? "Job Opening updated successfully."
              : "Job Opening added successfully.",
          });

          navigate(-1);
        },
      },
    );

    return result;
  };

  const getDataById = async () => {
    if (!JobOpeningId) return;

    const res = await apiCall({
      id: "getJobOpeningById",
      api: api + apiEndpoints?.recruitment?.jobOpening?.JobOpeningGetByID,
      payload: {
        _id: JobOpeningId,
      },
    });

    if (res?.success) {
      const data = res?.data?.data;

      if (!data) return;

      const finalData = {
        ...data,
        department: data.department?._id || "",
        designation: data.designation?._id || "",
        company: data.company?._id || "",
        branch: data.branch?._id || "",
        hiringManager: data.hiringManager?._id || "",
        recruiter: data.recruiter?._id || "",
        targetJoiningDate: formatDateForInput(data.targetJoiningDate),
        publishDate: formatDateForInput(data.publishDate),
        closingDate: formatDateForInput(data.closingDate),
      };

      formmethod.methods.setValues(finalData);
    }
  };

  useEffect(() => {
    if (JobOpeningId) {
      getDataById();
    }
  }, [JobOpeningId]);

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
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <HpFooter
          onBack={handleBack}
          onClear={handleClear}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default JobOpening;
