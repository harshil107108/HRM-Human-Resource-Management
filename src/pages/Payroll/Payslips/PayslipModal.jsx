import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import usePayslipConfig from "./usePayslipConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const PayslipModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { payslipSchema, initialValue } = usePayslipConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(payslipSchema);

  const payslipId = extraParams?.id;
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
        const basic = Number(data.basicSalary) || 0;
        const hra = Number(data.hra) || 0;
        const spec = Number(data.specialAllowance) || 0;
        const gross = Number(data.grossEarnings) || (basic + hra + spec);
        const deductions = Number(data.totalDeductions) || 0;
        const net = Number(data.netPay) || (gross - deductions);

        const payload = {
          ...data,
          grossEarnings: gross,
          totalDeductions: deductions,
          netPay: net,
          ...(payslipId ? { _id: payslipId } : {}),
        };

        const res = await apiCall({
          id: "addEditPayslip",
          api: api + apiEndpoints.payroll.payslip.PayslipAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to generate payslip");
        }

        return res;
      },
      {
        successMessage: "Payslip saved successfully",
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
      id: "getPayslipById",
      api: api + apiEndpoints.payroll.payslip.PayslipGetByID,
      payload: { _id: payslipId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
        paymentDate: formatDateForInput(d.paymentDate),
      });
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && payslipId) {
      getDataById();
    }
  }, [open, mode, payslipId]);

  return (
    <HpCommonModal
      open={open}
      title={payslipId ? "Edit Payslip" : "Generate Employee Payslip"}
      size="xl"
      icon={<FileText size={20} />}
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

export default PayslipModal;
