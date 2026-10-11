import { HpCommonModal } from "@/hp-common-modal";
import {
  UserPlus,
  FileCheck,
  ShieldCheck,
  Laptop,
  CreditCard,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useOnboardingConfig from "./useOnboardingConfig";
import { formMethod, FormRenderer, useFormStore } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import Toggle from "@hooks/Toogle";

const OnboardingModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { onboardingSchema, initialValue } = useOnboardingConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(onboardingSchema);

  const onboardingId = extraParams?.id;
  const mode = extraParams?.mode;

  // Onboarding Checklist Toggle States
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const [backgroundCheckCompleted, setBackgroundCheckCompleted] = useState(false);
  const [itAssetsAssigned, setItAssetsAssigned] = useState(false);
  const [bankDetailsVerified, setBankDetailsVerified] = useState(false);
  const [orientationCompleted, setOrientationCompleted] = useState(false);

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...schemaWithOptions],
      initialValue,
    });
  }, []);

  const candidateVal = useFormStore(formmethod, (s) => s.values.candidate);
  const dateVal = useFormStore(formmethod, (s) => s.values.orientationDate);
  const buddyVal = useFormStore(formmethod, (s) => s.values.buddyEmployee);

  // Live progress percentage calculation across all data fields & verification checks
  const currentProgress = useMemo(() => {
    let score = 0;
    if (candidateVal) score += 10;
    if (dateVal) score += 10;
    if (buddyVal) score += 10;
    if (documentsSubmitted) score += 14;
    if (backgroundCheckCompleted) score += 14;
    if (itAssetsAssigned) score += 14;
    if (bankDetailsVerified) score += 14;
    if (orientationCompleted) score += 14;
    return Math.min(score, 100);
  }, [
    candidateVal,
    dateVal,
    buddyVal,
    documentsSubmitted,
    backgroundCheckCompleted,
    itAssetsAssigned,
    bankDetailsVerified,
    orientationCompleted,
  ]);

  // Keep a single form instance so values loaded by getById survive
  // when dropdown options arrive; only push the new options in.
  useEffect(() => {
    formmethod.methods.setSchema([...schemaWithOptions]);
  }, [schemaWithOptions]);

  // Dynamic Status Options: Only allow "Completed" when progress is 100%
  useEffect(() => {
    const isReadyForCompletion = currentProgress === 100;
    const statusOptions = isReadyForCompletion
      ? [
          { label: "Completed (Ready for Employee Conversion)", value: "Completed" },
          { label: "In Progress", value: "In Progress" },
          { label: "Pending", value: "Pending" },
          { label: "Cancelled", value: "Cancelled" },
        ]
      : [
          { label: "In Progress", value: "In Progress" },
          { label: "Pending", value: "Pending" },
          { label: "Cancelled", value: "Cancelled" },
        ];

    setSchemaWithOptions((prev) =>
      prev.map((field) =>
        field.id === "status" ? { ...field, options: statusOptions } : field
      )
    );
  }, [currentProgress]);

  const loadDropdowns = async () => {
    const [candRes, jobRes, empRes] = await Promise.all([
      apiCall({ id: "candHelp", api: api + apiEndpoints.recruitment.candidate.CandidateGetData, payload: {} }),
      apiCall({ id: "jobHelp", api: api + apiEndpoints.recruitment.jobOpening.JobOpeningHelp, payload: {} }),
      apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
    ]);

    const candOptions = (candRes?.data?.data || []).map((c) => ({
      label: `${c.candidateName} (${c.email})`,
      value: c._id,
    }));
    const activeJobs = (jobRes?.data?.data || []).filter(
      (j) => !j.jobStatus || j.jobStatus === "ACTIVE"
    );
    const jobOptions = activeJobs.map((j) => ({
      label: `${j.jobTitle} (${j.jobOpeningId})`,
      value: j._id,
    }));
    const empOptions = (empRes?.data?.data || []).map((e) => ({
      label: `${e.firstName || ""} ${e.lastName || ""} (${e.employeeId || ""})`,
      value: e._id,
    }));

    setSchemaWithOptions((prev) =>
      prev.map((field) => {
        if (field.id === "candidate") return { ...field, options: candOptions };
        if (field.id === "jobOpening") return { ...field, options: jobOptions };
        if (field.id === "buddyEmployee") return { ...field, options: empOptions };
        return field;
      })
    );
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        if (data.status === "Completed" && currentProgress < 100) {
          throw new Error(
            `Cannot complete onboarding. Current progress is ${currentProgress}%. All required onboarding data and checklist verifications must reach 100% before completion.`
          );
        }

        const payload = {
          ...data,
          progressPercentage: currentProgress,
          documentsSubmitted,
          backgroundCheckCompleted,
          itAssetsAssigned,
          bankDetailsVerified,
          orientationCompleted,
          ...(onboardingId && { _id: onboardingId }),
        };

        const res = await apiCall({
          id: "addEditOnboarding",
          api: api + apiEndpoints.recruitment.onboarding.OnboardingAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save onboarding record");
        }

        return res;
      },
      {
        successMessage: "Onboarding record saved successfully",
        onSuccess: async () => {
          onModalClose();
          await onSaved?.();
        },
      }
    );

    return result;
  };

  const getDataById = async () => {
    const res = await apiCall({
      id: "getOnboardingById",
      api: api + apiEndpoints.recruitment.onboarding.OnboardingGetByID,
      payload: { _id: onboardingId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        candidate: d.candidate?._id || d.candidate || "",
        jobOpening: d.jobOpening?._id || d.jobOpening || "",
        buddyEmployee: d.buddyEmployee?._id || d.buddyEmployee || "",
        orientationDate: formatDateForInput(d.orientationDate),
      });

      setDocumentsSubmitted(Boolean(d.documentsSubmitted));
      setBackgroundCheckCompleted(Boolean(d.backgroundCheckCompleted));
      setItAssetsAssigned(Boolean(d.itAssetsAssigned));
      setBankDetailsVerified(Boolean(d.bankDetailsVerified));
      setOrientationCompleted(Boolean(d.orientationCompleted));
    }
  };

  const handleClear = () => {
    formmethod.methods.reset();
    setDocumentsSubmitted(false);
    setBackgroundCheckCompleted(false);
    setItAssetsAssigned(false);
    setBankDetailsVerified(false);
    setOrientationCompleted(false);
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && onboardingId) {
      getDataById();
    }
  }, [open, mode, onboardingId]);

  return (
    <HpCommonModal
      open={open}
      title="Employee Onboarding"
      size="lg"
      icon={<UserPlus size={20} />}
      onSave={handleSave}
      onClose={onModalClose}
      onClear={handleClear}
      loading={formmethod.methods.isSubmitting()}
      showClearButton
      confirmBeforeClose
    >
      {/* Dynamic Live Progress Bar Indicator */}
      <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Onboarding Progress & Verifications
            </span>
            {currentProgress === 100 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                100% Ready for Completion
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                In Progress ({currentProgress}%)
              </span>
            )}
          </div>
          <span
            className={`text-sm font-extrabold ${
              currentProgress === 100 ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {currentProgress}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentProgress === 100
                ? "bg-emerald-500 shadow-xs"
                : currentProgress >= 50
                ? "bg-indigo-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          {currentProgress === 100
            ? "All verification checks and details are complete! You can now mark status as Completed to convert the candidate into an active Employee."
            : "Progress increases as candidate, orientation date, mentor, and verification checklist items are completed. 100% required to complete."}
        </p>
      </div>

      <FormRenderer formMethod={formmethod} formSchema={schemaWithOptions} />

      <div className="mt-5 space-y-3">
        <Toggle
          icon={<FileCheck className="h-4 w-4 text-indigo-600" />}
          title="ID & Academic Documents Submitted (+14%)"
          description="Verify employee certificates, resume, and government ID proof."
          value={documentsSubmitted}
          onChange={setDocumentsSubmitted}
        />

        <Toggle
          icon={<ShieldCheck className="h-4 w-4 text-indigo-600" />}
          title="Background Verification Completed (+14%)"
          description="Background check verified by the verification agency."
          value={backgroundCheckCompleted}
          onChange={setBackgroundCheckCompleted}
        />

        <Toggle
          icon={<Laptop className="h-4 w-4 text-indigo-600" />}
          title="IT Hardware & Laptop Assigned (+14%)"
          description="Laptop, email account, and access credentials have been assigned."
          value={itAssetsAssigned}
          onChange={setItAssetsAssigned}
        />

        <Toggle
          icon={<CreditCard className="h-4 w-4 text-indigo-600" />}
          title="Bank Account & PAN Verified (+14%)"
          description="Payroll bank account and tax documents verified."
          value={bankDetailsVerified}
          onChange={setBankDetailsVerified}
        />

        <Toggle
          icon={<GraduationCap className="h-4 w-4 text-indigo-600" />}
          title="Company Orientation Completed (+14%)"
          description="Orientation session and company policy induction completed."
          value={orientationCompleted}
          onChange={setOrientationCompleted}
        />
      </div>
    </HpCommonModal>
  );
};

export default OnboardingModal;
