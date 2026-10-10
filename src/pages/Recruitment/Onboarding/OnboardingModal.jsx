import { HpCommonModal } from "@/hp-common-modal";
import {
  UserPlus,
  FileCheck,
  ShieldCheck,
  Laptop,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useOnboardingConfig from "./useOnboardingConfig";
import { formMethod, FormRenderer } from "@/form-engine";
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

  // Onboarding Checklist Toggle States (following HolidayMasterModal reference pattern)
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
  }, [schemaWithOptions]);

  const loadDropdowns = async () => {
    const [candRes, jobRes, empRes] = await Promise.all([
      apiCall({ id: "candHelp", api: api + apiEndpoints.recruitment.candidate.CandidateGetData, payload: {} }),
      apiCall({ id: "jobHelp", api: api + apiEndpoints.recruitment.jobOpening.JobOpeningGetData, payload: {} }),
      apiCall({ id: "empHelp", api: api + apiEndpoints.employee.employee.EmployeeGetData, payload: {} }),
    ]);

    const candOptions = (candRes?.data?.data || []).map((c) => ({
      label: `${c.candidateName} (${c.email})`,
      value: c._id,
    }));
    const jobOptions = (jobRes?.data?.data || []).map((j) => ({
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
        const payload = {
          ...data,
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
      <FormRenderer formMethod={formmethod} formSchema={schemaWithOptions} />

      <div className="mt-5 space-y-3">
        <Toggle
          icon={<FileCheck className="h-4 w-4 text-indigo-600" />}
          title="ID & Academic Documents Submitted"
          description="Verify employee certificates, resume, and government ID proof."
          value={documentsSubmitted}
          onChange={setDocumentsSubmitted}
        />

        <Toggle
          icon={<ShieldCheck className="h-4 w-4 text-indigo-600" />}
          title="Background Verification Completed"
          description="Background check verified by the verification agency."
          value={backgroundCheckCompleted}
          onChange={setBackgroundCheckCompleted}
        />

        <Toggle
          icon={<Laptop className="h-4 w-4 text-indigo-600" />}
          title="IT Hardware & Laptop Assigned"
          description="Laptop, email account, and access credentials have been assigned."
          value={itAssetsAssigned}
          onChange={setItAssetsAssigned}
        />

        <Toggle
          icon={<CreditCard className="h-4 w-4 text-indigo-600" />}
          title="Bank Account & PAN Verified"
          description="Payroll bank account and tax documents verified."
          value={bankDetailsVerified}
          onChange={setBankDetailsVerified}
        />

        <Toggle
          icon={<GraduationCap className="h-4 w-4 text-indigo-600" />}
          title="Company Orientation Completed"
          description="Orientation session and company policy induction completed."
          value={orientationCompleted}
          onChange={setOrientationCompleted}
        />
      </div>
    </HpCommonModal>
  );
};

export default OnboardingModal;
