import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useTaxConfig from "./useTaxConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const TaxModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { taxSchema, initialValue } = useTaxConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(taxSchema);

  const taxId = extraParams?.id;
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
          ...(taxId ? { _id: taxId } : {}),
        };

        const res = await apiCall({
          id: "addEditTaxDeclaration",
          api: api + apiEndpoints.payroll.tax.TaxAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save tax declaration");
        }

        return res;
      },
      {
        successMessage: "Tax declaration saved successfully",
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
      id: "getTaxDeclarationById",
      api: api + apiEndpoints.payroll.tax.TaxGetByID,
      payload: { _id: taxId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
      });
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && taxId) {
      getDataById();
    }
  }, [open, mode, taxId]);

  return (
    <HpCommonModal
      open={open}
      title={taxId ? "Edit Tax Declaration" : "Declare IT Exemptions & Regime"}
      size="xl"
      icon={<ShieldCheck size={20} />}
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

export default TaxModal;
