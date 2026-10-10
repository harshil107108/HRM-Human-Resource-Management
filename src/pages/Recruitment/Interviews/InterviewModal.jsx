import { HpCommonModal } from "@/hp-common-modal";
import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useInterviewConfig from "./useInterviewConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const InterviewModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { interviewSchema, initialValue } = useInterviewConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(interviewSchema);

  const interviewId = extraParams?.id;
  const mode = extraParams?.mode;

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...schemaWithOptions],
      initialValue: {
        ...initialValue,
        ...(extraParams?.defaultValues || {}),
      },
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
        if (field.id === "interviewer") return { ...field, options: empOptions };
        return field;
      })
    );
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = interviewId ? { ...data, _id: interviewId } : data;

        const res = await apiCall({
          id: "addEditInterview",
          api: api + apiEndpoints.recruitment.interview.InterviewAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to schedule interview");
        }

        // Sync candidate stage to "Interview"
        if (data?.candidate) {
          try {
            await apiCall({
              id: "syncCandidateStageToInterview",
              api: api + apiEndpoints.recruitment.candidate.CandidateAddEdit,
              payload: {
                _id: data.candidate,
                stage: "Interview",
              },
            });
          } catch (err) {
            console.error("Failed to sync candidate stage:", err);
          }
        }

        return res;
      },
      {
        successMessage: "Interview scheduled successfully",
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
      id: "getInterviewById",
      api: api + apiEndpoints.recruitment.interview.InterviewGetByID,
      payload: { _id: interviewId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        candidate: d.candidate?._id || d.candidate || "",
        jobOpening: d.jobOpening?._id || d.jobOpening || "",
        interviewer: d.interviewer?._id || d.interviewer || "",
        scheduledDate: formatDateForInput(d.scheduledDate),
      });
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && interviewId) {
      getDataById();
    } else if (open && mode === "add" && extraParams?.defaultValues) {
      formmethod.methods.setValues({
        ...initialValue,
        ...extraParams.defaultValues,
      });
    }
  }, [open, mode, interviewId, extraParams?.defaultValues]);

  return (
    <HpCommonModal
      open={open}
      title="Interview Scheduler"
      size="lg"
      icon={<Calendar size={20} />}
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

export default InterviewModal;
