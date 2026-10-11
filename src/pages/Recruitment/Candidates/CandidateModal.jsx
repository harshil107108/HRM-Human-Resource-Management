import { HpCommonModal } from "@/hp-common-modal";
import { UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useCandidateConfig from "./useCandidateConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const CandidateModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { candidateSchema, initialValue } = useCandidateConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(candidateSchema);

  const candidateId = extraParams?.id;
  const mode = extraParams?.mode;

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...schemaWithOptions],
      initialValue,
    });
  }, []);

  // Keep a single form instance so values loaded by getById survive
  // when dropdown options arrive; only push the new options in.
  useEffect(() => {
    formmethod.methods.setSchema([...schemaWithOptions]);
  }, [schemaWithOptions]);

  const loadJobOpeningsHelp = async () => {
    const res = await apiCall({
      id: "getJobOpeningHelp",
      api: api + apiEndpoints.recruitment.jobOpening.JobOpeningHelp,
      payload: {},
    });
    if (res?.success) {
      const activeJobs = (res.data?.data || []).filter(
        (job) => !job.jobStatus || job.jobStatus === "ACTIVE"
      );
      const options = activeJobs.map((job) => ({
        label: `${job.jobTitle || ""} (${job.jobOpeningId || ""})`,
        value: job._id,
      }));
      setSchemaWithOptions((prev) =>
        prev.map((field) =>
          field.id === "jobOpening" ? { ...field, options } : field
        )
      );
    }
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = candidateId ? { ...data, _id: candidateId } : data;

        const res = await apiCall({
          id: "addEditCandidate",
          api: api + apiEndpoints.recruitment.candidate.CandidateAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save candidate");
        }

        return res;
      },
      {
        successMessage: "Candidate saved successfully",
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
      id: "getCandidateById",
      api: api + apiEndpoints.recruitment.candidate.CandidateGetByID,
      payload: { _id: candidateId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      let firstName = d.firstName || "";
      let middleName = d.middleName || "";
      let lastName = d.lastName || "";

      if (!firstName && !lastName && d.candidateName) {
        const parts = d.candidateName.trim().split(/\s+/);
        firstName = parts[0] || "";
        middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
        lastName = parts.length > 1 ? parts[parts.length - 1] : "";
      }

      formmethod.methods.setValues({
        ...d,
        firstName,
        middleName,
        lastName,
        jobOpening: d.jobOpening?._id || d.jobOpening || "",
      });
    }
  };

  useEffect(() => {
    loadJobOpeningsHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && candidateId) {
      getDataById();
    }
  }, [open, mode, candidateId]);

  return (
    <HpCommonModal
      open={open}
      title="Candidate Profile"
      size="lg"
      icon={<UserCheck size={20} />}
      onSave={handleSave}
      onClose={onModalClose}
      onClear={() => formmethod.methods.reset()}
      loading={formmethod.methods.isSubmitting()}
      showClearButton
      confirmBeforeClose
    >
      <FormRenderer formMethod={formmethod} formSchema={schemaWithOptions} />
    </HpCommonModal>
  );
};

export default CandidateModal;
