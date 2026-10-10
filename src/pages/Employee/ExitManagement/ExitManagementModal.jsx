import { HpCommonModal } from "@/hp-common-modal";
import { UserMinus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useExitManagementConfig from "./useExitManagementConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const ExitManagementModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { exitSchema, initialValue } = useExitManagementConfig();
  const { apiCall } = useApiCall();
  const [schemaWithOptions, setSchemaWithOptions] = useState(exitSchema);

  const exitId = extraParams?.id;
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
        const payload = exitId ? { ...data, _id: exitId } : data;

        const res = await apiCall({
          id: "addEditExit",
          api: api + apiEndpoints.employee.exit.ExitAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save exit record");
        }

        return res;
      },
      {
        successMessage: "Exit record saved successfully",
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
      id: "getExitById",
      api: api + apiEndpoints.employee.exit.ExitGetByID,
      payload: { _id: exitId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      formmethod.methods.setValues({
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
        resignationDate: formatDateForInput(d.resignationDate),
        lastWorkingDate: formatDateForInput(d.lastWorkingDate),
      });
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
  }, []);

  useEffect(() => {
    if (open && mode === "edit" && exitId) {
      getDataById();
    }
  }, [open, mode, exitId]);

  return (
    <HpCommonModal
      open={open}
      title="Exit Management"
      size="lg"
      icon={<UserMinus size={20} />}
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

export default ExitManagementModal;
