import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { DollarSign } from "lucide-react";
import { useEffect, useMemo } from "react";
import useSalaryStructureConfig from "./useSalaryStructureConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const SalaryStructureModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { salaryStructureSchema, initialValue } = useSalaryStructureConfig();
  const { apiCall } = useApiCall();

  const structureId = extraParams?.id;
  const mode = extraParams?.mode;

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: [...salaryStructureSchema],
      initialValue,
    });
  }, [salaryStructureSchema]);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        const basic = Number(data.basicSalary) || 0;
        const hra = Number(data.hra) || 0;
        const da = Number(data.da) || 0;
        const conv = Number(data.conveyance) || 0;
        const spec = Number(data.specialAllowance) || 0;
        const gross = basic + hra + da + conv + spec;

        const epf = Number(data.epf) || 0;
        const esi = Number(data.esi) || 0;
        const pt = Number(data.professionalTax) || 0;
        const totalDeductions = epf + esi + pt;
        const netSalary = gross - totalDeductions;

        const payload = {
          ...data,
          grossSalary: gross,
          totalDeductions,
          netSalary,
          ...(structureId ? { _id: structureId } : {}),
        };

        const res = await apiCall({
          id: "addEditSalaryStructure",
          api: api + apiEndpoints.payroll.salaryStructure.StructureAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save salary structure");
        }

        return res;
      },
      {
        successMessage: "Salary structure saved successfully",
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
      id: "getSalaryStructureById",
      api: api + apiEndpoints.payroll.salaryStructure.StructureGetByID,
      payload: { _id: structureId },
    });

    if (res?.success && res.data?.data) {
      formmethod.methods.setValues(res.data.data);
    }
  };

  useEffect(() => {
    if (open && mode === "edit" && structureId) {
      getDataById();
    }
  }, [open, mode, structureId]);

  return (
    <HpCommonModal
      open={open}
      title={structureId ? "Edit Salary Structure" : "Add Salary Structure"}
      size="xl"
      icon={<DollarSign size={20} />}
      onSave={handleSave}
      onClose={onModalClose}
      onClear={() => formmethod.methods.reset()}
      loading={formmethod.methods.isSubmitting()}
      showClearButton
      confirmBeforeClose
    >
      <FormRenderer formMethod={formmethod} formSchema={salaryStructureSchema} />
    </HpCommonModal>
  );
};

export default SalaryStructureModal;
