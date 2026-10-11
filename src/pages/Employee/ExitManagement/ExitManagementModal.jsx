import { HpCommonModal } from "@/hp-common-modal";
import { UserMinus, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useExitManagementConfig from "./useExitManagementConfig";
import { formMethod, FormRenderer } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import ExitAssetReturn from "./ExitAssetReturn";
import useAlert from "@/hooks/useAlert";

const ExitManagementModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { exitSchema, initialValue } = useExitManagementConfig();
  const { apiCall } = useApiCall();
  const { deleteAlert, warningAlert } = useAlert();
  const [schemaWithOptions, setSchemaWithOptions] = useState(exitSchema);
  // Assets ticked as returned in this save, and those returned in earlier saves.
  const [returnedAssetIds, setReturnedAssetIds] = useState([]);
  const [returnedHistory, setReturnedHistory] = useState([]);
  // Assets currently assigned to the selected employee (from ExitAssetReturn).
  const [assignedAssets, setAssignedAssets] = useState([]);
  // The record as last saved: status and the snapshot kept after completion.
  const [savedRecord, setSavedRecord] = useState(null);

  // A Completed exit has already deleted the employee, so it is read-only.
  const isLocked = savedRecord?.overallStatus === "Completed";

  const exitId = extraParams?.id;
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

  const employeeId = formmethod.methods.watch("employeeId");

  // A different employee means a different asset list: clear the selection.
  useEffect(
    () => formmethod.methods.onFieldChange("employeeId", () => setReturnedAssetIds([])),
    [formmethod]
  );

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
    if (isLocked) return;

    const values = formmethod.methods.getValues();
    const isCompleting = values.overallStatus === "Completed";

    if (isCompleting) {
      // Run field validation first so the confirm only appears for a valid form.
      if (!formmethod.methods.validate()) {
        return formmethod.methods.handleFormSave(async () => {});
      }

      const pending = assignedAssets.filter((a) => !returnedAssetIds.includes(a._id));
      if (pending.length > 0) {
        warningAlert({
          title: "Assets still assigned",
          text: `Mark all ${assignedAssets.length} assigned asset${assignedAssets.length > 1 ? "s" : ""} as returned before completing the exit (${pending.length} pending).`,
        });
        return;
      }

      const confirmed = await deleteAlert({
        title: "Complete exit and remove employee?",
        text: "The employee will be permanently deleted from the Employee module. This can't be undone.",
        confirmButtonText: "Complete & Remove",
        cancelButtonText: "Cancel",
      });
      if (!confirmed) return;
    }

    const result = await formmethod.methods.handleFormSave(
      async (data) => {
        // History and the employee snapshot are kept by the server; send only the new returns.
        const {
          returnedAssets: _history,
          employeeName: _name,
          employeeCode: _code,
          ...exitData
        } = data;
        const payload = {
          ...exitData,
          ...(exitId ? { _id: exitId } : {}),
          returnedAssetIds,
        };

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
      setReturnedHistory(Array.isArray(d.returnedAssets) ? d.returnedAssets : []);
      setSavedRecord({
        overallStatus: d.overallStatus,
        employeeName: d.employeeName,
        employeeCode: d.employeeCode,
      });
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
      onClear={() => {
        formmethod.methods.reset();
        setReturnedAssetIds([]);
      }}
      loading={formmethod.methods.isSubmitting()}
      showClearButton={!isLocked}
      showSaveButton={!isLocked}
      confirmBeforeClose={!isLocked}
    >
      {isLocked && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Exit completed.</span>{" "}
            {savedRecord?.employeeName
              ? `${savedRecord.employeeName}${savedRecord.employeeCode ? ` (${savedRecord.employeeCode})` : ""}`
              : "The employee"}{" "}
            has been removed from the Employee module, so this record is read-only.
          </p>
        </div>
      )}
      <FormRenderer
        formMethod={formmethod}
        formSchema={
          isLocked
            ? schemaWithOptions.map((field) => ({ ...field, disabled: true }))
            : schemaWithOptions
        }
      />
      <ExitAssetReturn
        employeeId={isLocked ? "" : employeeId}
        readOnly={isLocked}
        selectedIds={returnedAssetIds}
        onChange={setReturnedAssetIds}
        onAssetsLoaded={setAssignedAssets}
        returnedHistory={returnedHistory}
      />
    </HpCommonModal>
  );
};

export default ExitManagementModal;
