import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useLoanConfig from "./useLoanConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const LoanModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { loanSchema, initialValue } = useLoanConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(loanSchema);

  const loanId = extraParams?.id;
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
        const amount = Number(data.loanAmount) || 0;
        const repaid = Number(data.repaidAmount) || 0;
        const remaining = Math.max(0, amount - repaid);

        const payload = {
          ...data,
          remainingAmount: remaining,
          ...(loanId ? { _id: loanId } : {}),
        };

        const res = await apiCall({
          id: "addEditLoan",
          api: api + apiEndpoints.payroll.loan.LoanAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save loan application");
        }

        return res;
      },
      {
        successMessage: "Loan application saved successfully",
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
      id: "getLoanById",
      api: api + apiEndpoints.payroll.loan.LoanGetByID,
      payload: { _id: loanId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
        disbursementDate: formatDateForInput(d.disbursementDate),
      });
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && loanId) {
      getDataById();
    }
  }, [open, mode, loanId]);

  return (
    <HpCommonModal
      open={open}
      title={loanId ? "Edit Loan Application" : "Issue New Loan / Advance"}
      size="lg"
      icon={<CreditCard size={20} />}
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

export default LoanModal;
