import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { PlayCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import usePayrollProcessConfig from "./usePayrollProcessConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const PayrollProcessModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { payrollProcessSchema, initialValue } = usePayrollProcessConfig();
  const { apiCall } = useApiCall();

  const processId = extraParams?.id;
  const mode = extraParams?.mode;

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...payrollProcessSchema],
      initialValue,
    });
  }, [payrollProcessSchema]);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = {
          ...data,
          ...(processId ? { _id: processId } : {}),
        };

        const res = await apiCall({
          id: "addEditPayrollProcess",
          api: api + apiEndpoints.payroll.process.ProcessAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save payroll process batch");
        }

        return res;
      },
      {
        successMessage: "Payroll process saved successfully",
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
      id: "getPayrollProcessById",
      api: api + apiEndpoints.payroll.process.ProcessGetByID,
      payload: { _id: processId },
    });

    if (res?.success && res.data?.data) {
      formmethod.methods.setValues(res.data.data);
    }
  };

  useEffect(() => {
    if (open && mode === "edit" && processId) {
      getDataById();
    }
  }, [open, mode, processId]);

  return (
    <HpCommonModal
      open={open}
      title={processId ? "Edit Payroll Batch" : "Execute New Payroll Cycle"}
      size="lg"
      icon={<PlayCircle size={20} />}
      onSave={handleSave}
      onClose={onModalClose}
      onClear={() => formmethod.methods.reset()}
      loading={formmethod.methods.isSubmitting()}
      showClearButton
      confirmBeforeClose
    >
      <FormRenderer formMethod={formmethod} formSchema={payrollProcessSchema} />
    </HpCommonModal>
  );
};

export default PayrollProcessModal;
