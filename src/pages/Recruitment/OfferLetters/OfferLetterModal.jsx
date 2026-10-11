import { HpCommonModal } from "@/hp-common-modal";
import { FileCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useOfferLetterConfig from "./useOfferLetterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const OfferLetterModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { offerSchema, initialValue } = useOfferLetterConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(offerSchema);

  const offerId = extraParams?.id;
  const mode = extraParams?.mode;
  const [loadedStatus, setLoadedStatus] = useState("Draft");

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...schemaWithOptions],
      initialValue,
    });
  }, []);

  // Update status dropdown options depending on whether the offer is already Sent
  useEffect(() => {
    const isSent = loadedStatus === "Sent" || loadedStatus === "Accepted" || loadedStatus === "Declined";
    const statusOptions = isSent
      ? [
          { label: "Sent (Awaiting Candidate Response)", value: "Sent" },
          { label: "Accepted (Candidate Accepted)", value: "Accepted" },
          { label: "Declined (Candidate Rejected)", value: "Declined" },
          { label: "Draft", value: "Draft" },
          { label: "Expired", value: "Expired" },
          { label: "Revoked", value: "Revoked" },
        ]
      : [
          { label: "Draft", value: "Draft" },
          { label: "Sent (Send Offer to Candidate)", value: "Sent" },
          { label: "Expired", value: "Expired" },
          { label: "Revoked", value: "Revoked" },
        ];

    setSchemaWithOptions((prev) =>
      prev.map((field) =>
        field.id === "status" ? { ...field, options: statusOptions } : field
      )
    );
  }, [loadedStatus]);

  // Keep a single form instance so values loaded by getById survive
  // when dropdown options arrive; only push the new options in.
  useEffect(() => {
    formmethod.methods.setSchema([...schemaWithOptions]);
  }, [schemaWithOptions]);

  const loadDropdowns = async () => {
    const [candRes, jobRes, desigRes, deptRes] = await Promise.all([
      apiCall({ id: "candHelp", api: api + apiEndpoints.recruitment.candidate.CandidateGetData, payload: {} }),
      apiCall({ id: "jobHelp", api: api + apiEndpoints.recruitment.jobOpening.JobOpeningHelp, payload: {} }),
      apiCall({ id: "desigHelp", api: api + apiEndpoints.organization.designation.DesignationGetData, payload: {} }),
      apiCall({ id: "deptHelp", api: api + apiEndpoints.organization.department.DepartmentGetData, payload: {} }),
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
    const desigOptions = (desigRes?.data?.data || []).map((d) => ({
      label: d.designationname,
      value: d._id,
    }));
    const deptOptions = (deptRes?.data?.data || []).map((d) => ({
      label: d.departmentname,
      value: d._id,
    }));

    setSchemaWithOptions((prev) =>
      prev.map((field) => {
        if (field.id === "candidate") return { ...field, options: candOptions };
        if (field.id === "jobOpening") return { ...field, options: jobOptions };
        if (field.id === "offeredDesignation") return { ...field, options: desigOptions };
        if (field.id === "offeredDepartment") return { ...field, options: deptOptions };
        return field;
      })
    );
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        // Enforce requirement: Offer letter must be Sent before it can be Accepted or Declined
        if (
          (data.status === "Accepted" || data.status === "Declined") &&
          loadedStatus !== "Sent" &&
          loadedStatus !== "Accepted" &&
          loadedStatus !== "Declined"
        ) {
          throw new Error("Offer letter must be marked as 'Sent' before it can be Accepted or Declined.");
        }

        const payload = offerId ? { ...data, _id: offerId } : data;

        const res = await apiCall({
          id: "addEditOfferLetter",
          api: api + apiEndpoints.recruitment.offer.OfferAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save offer letter");
        }

        return res;
      },
      {
        successMessage: "Offer letter saved successfully",
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
      id: "getOfferLetterById",
      api: api + apiEndpoints.recruitment.offer.OfferGetByID,
      payload: { _id: offerId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      setLoadedStatus(d.status || "Draft");
      formmethod.methods.setValues({
        ...d,
        candidate: d.candidate?._id || d.candidate || "",
        jobOpening: d.jobOpening?._id || d.jobOpening || "",
        offeredDesignation: d.offeredDesignation?._id || d.offeredDesignation || "",
        offeredDepartment: d.offeredDepartment?._id || d.offeredDepartment || "",
        joiningDate: formatDateForInput(d.joiningDate),
        validUntil: formatDateForInput(d.validUntil),
      });
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && offerId) {
      getDataById();
    }
  }, [open, mode, offerId]);

  return (
    <HpCommonModal
      open={open}
      title="Offer Letter"
      size="lg"
      icon={<FileCheck size={20} />}
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

export default OfferLetterModal;
