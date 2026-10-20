import { HpCommonModal } from "@/hp-common-modal";
import { FileCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useOfferLetterConfig from "./useOfferLetterConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import MailSendingModal from "./MailSendingModal";

const OfferLetterModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { offerSchema, initialValue } = useOfferLetterConfig();
  const { apiCall } = useApiCall();
  const { successAlert } = useAlert();
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

  const [mailModal, setMailModal] = useState({
    isOpen: false,
    status: "sending",
    candidateName: "",
    candidateEmail: "",
    message: "",
    error: "",
  });

  // Update status dropdown options depending on whether the offer is already Sent
  useEffect(() => {
    const isSent =
      loadedStatus === "Sent" ||
      loadedStatus === "Accepted" ||
      loadedStatus === "Declined";

    // When email has sent, we do NOT allow status to change to Draft or Expired.
    // Candidate/HR can only choose Sent, Accepted, or Declined.
    const statusOptions = isSent
      ? [
          { label: "Sent (Awaiting Candidate Response)", value: "Sent" },
          { label: "Accepted (Candidate Accepted)", value: "Accepted" },
          { label: "Declined (Candidate Rejected)", value: "Declined" },
        ]
      : [
          { label: "Draft", value: "Draft" },
          { label: "Sent (Send Offer to Candidate)", value: "Sent" },
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
    let savedMsg = "Offer letter saved successfully";
    let isEmailDispatch = false;

    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const isSentPreviously =
          loadedStatus === "Sent" ||
          loadedStatus === "Accepted" ||
          loadedStatus === "Declined";

        // Requirement 1: Offer letter must be Sent before it can be Accepted or Declined
        if (
          (data.status === "Accepted" || data.status === "Declined") &&
          !isSentPreviously
        ) {
          throw new Error("Offer letter must be marked as 'Sent' before it can be Accepted or Declined.");
        }

        // Requirement 2: When email has sent, we cannot change status to Draft or Expired.
        if (
          isSentPreviously &&
          (data.status === "Draft" || data.status === "Expired")
        ) {
          throw new Error(
            "Offer letter email has already been sent to candidate. You cannot change status back to Draft or Expired. Only Accepted or Declined are allowed."
          );
        }

        const payload = offerId ? { ...data, _id: offerId } : data;

        if (data.status === "Sent") {
          isEmailDispatch = true;
          const candField = schemaWithOptions.find((f) => f.id === "candidate");
          const selectedOption = candField?.options?.find(
            (opt) => opt.value === data.candidate
          );
          const candName = selectedOption
            ? selectedOption.label.split("(")[0].trim()
            : "Candidate";
          const candEmail = selectedOption?.label.includes("(")
            ? selectedOption.label.split("(")[1].replace(")", "").trim()
            : "";

          setMailModal({
            isOpen: true,
            status: "sending",
            candidateName: candName,
            candidateEmail: candEmail,
            message: "",
            error: "",
          });
        }

        try {
          const res = await apiCall({
            id: "addEditOfferLetter",
            api: api + apiEndpoints.recruitment.offer.OfferAddEdit,
            payload,
            showSuccessAlert: false,
          });

          if (!res?.success) {
            if (isEmailDispatch) {
              setMailModal((prev) => ({
                ...prev,
                status: "error",
                error: res?.message || "Failed to deliver offer email.",
              }));
            }
            throw new Error(res?.message || "Failed to save offer letter");
          }

          if (res?.data?.message) {
            savedMsg = res.data.message;
          }

          if (isEmailDispatch) {
            setMailModal((prev) => ({
              ...prev,
              status: "success",
              message: res?.data?.message || "Offer letter sent successfully!",
            }));
          }

          return res;
        } catch (err) {
          if (isEmailDispatch) {
            setMailModal((prev) => ({
              ...prev,
              status: "error",
              error: err?.message || "Failed to dispatch offer email.",
            }));
          }
          throw err;
        }
      },
      {
        successMessage: null,
        onSuccess: async () => {
          if (!isEmailDispatch) {
            successAlert({
              title: "Offer Saved",
              text: savedMsg,
            });
            onModalClose();
            await onSaved?.();
          }
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
    <>
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

      <MailSendingModal
        {...mailModal}
        onClose={() => {
          setMailModal((prev) => ({ ...prev, isOpen: false }));
          if (mailModal.status === "success") {
            onModalClose();
            onSaved?.();
          }
        }}
      />
    </>
  );
};

export default OfferLetterModal;
