import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useReimbursementConfig from "./useReimbursementConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const ReimbursementModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { reimbursementSchema, initialValue } = useReimbursementConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(reimbursementSchema);

  const claimId = extraParams?.id;
  const mode = extraParams?.mode;

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...schemaWithOptions],
      initialValue,
    });
  }, [schemaWithOptions]);

  const loadEmployeeHelp = async () => {
    const res = await apiCall({
      id: "getEmployeeHelp",
      api: api + apiEndpoints.employee.employee.EmployeeGetData,
      payload: {},
    });
    if (res?.success) {
      const options = (res.data?.data || []).map((emp) => ({
        label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || ""})`,
        value: emp._id,
      }));
      setSchemaWithOptions((prev) =>
        prev.map((field) =>
          field.id === "employeeId" ? { ...field, options } : field
        )
      );
    }
  };

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = {
          ...data,
          ...(claimId ? { _id: claimId } : {}),
        };

        const res = await apiCall({
          id: "addEditReimbursement",
          api: api + apiEndpoints.payroll.reimbursement.ReimbursementAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save reimbursement claim");
        }

        return res;
      },
      {
        successMessage: "Reimbursement claim saved successfully",
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
      id: "getReimbursementById",
      api: api + apiEndpoints.payroll.reimbursement.ReimbursementGetByID,
      payload: { _id: claimId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
        claimDate: formatDateForInput(d.claimDate),
      });
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && claimId) {
      getDataById();
    }
  }, [open, mode, claimId]);

  return (
    <HpCommonModal
      open={open}
      title={claimId ? "Edit Reimbursement Claim" : "File Reimbursement Expense"}
      size="lg"
      icon={<Receipt size={20} />}
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

export default ReimbursementModal;
