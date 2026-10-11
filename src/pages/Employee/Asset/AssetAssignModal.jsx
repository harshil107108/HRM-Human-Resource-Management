import { useMemo, useEffect } from "react";
import { HpCommonModal } from "@/hp-common-modal";
import { UserCheck, Laptop, Tag, ShieldCheck } from "lucide-react";
import { formMethod, FormRenderer } from "@/form-engine";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";

const AssetAssignModal = ({
  open,
  asset,
  onClose,
  onAssign,
  loading = false,
}) => {
  const todayStr = useMemo(() => {
    return formatDateForInput(new Date().toISOString()) || "";
  }, []);

  const schema = useMemo(
    () => [
      {
        id: "assignedEmployee",
        type: "selectWrapper",
        label: "Assign to Employee",
        placeHolder: "Search and select an employee...",
        required: true,
        className: "col-span-12",
        api: api + apiEndpoints.employee.employee.EmployeeHelp,
        labelKey: "employeeName",
        valueKey: "_id",
      },
      {
        id: "assignedDate",
        type: "date",
        label: "Assignment Date",
        placeHolder: "Select assigned date",
        required: true,
        className: "col-span-6",
      },
      {
        id: "expectedReturnDate",
        type: "date",
        label: "Expected Return Date",
        placeHolder: "Optional return date",
        required: false,
        className: "col-span-6",
        // ISO "YYYY-MM-DD" strings compare correctly as text.
        validate: (value, all) =>
          value && all.assignedDate && value < all.assignedDate
            ? "Expected Return Date can't be before Assignment Date"
            : undefined,
      },
      {
        id: "description",
        type: "text",
        label: "Handover Notes / Remarks",
        placeHolder: "e.g. Device handed over with original charger and mouse",
        required: false,
        className: "col-span-12",
      },
    ],
    [],
  );

  const initialValue = useMemo(
    () => ({
      assignedEmployee: "",
      assignedDate: todayStr,
      expectedReturnDate: "",
      description: "",
    }),
    [todayStr],
  );

  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema,
      initialValue,
    });
  }, [schema, initialValue]);

  useEffect(() => {
    if (open) {
      formmethod.methods.reset();
      formmethod.methods.setValue("assignedDate", todayStr);
    }
  }, [open, todayStr, formmethod]);

  const handleSave = async () => {
    const result = await formmethod.methods.handleFormSave(
      async (values) => {
        if (!values?.assignedEmployee) {
          formmethod.methods.setError?.(
            "assignedEmployee",
            "Please select an employee",
          );
          throw new Error("Please select an employee to assign this asset.");
        }
        await onAssign(values);
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );

    return result;
  };

  return (
    <HpCommonModal
      open={open}
      title="Assign Asset to Employee"
      size="md"
      icon={<UserCheck size={20} className="text-violet-600" />}
      onSave={handleSave}
      onClose={onClose}
      onClear={() => formmethod.methods.reset()}
      loading={loading || formmethod.methods.isSubmitting()}
      showClearButton={false}
      confirmBeforeClose
    >
      <div className="flex flex-col gap-3.5 py-1">
        {/* Asset summary banner */}
        {asset && (
          <div className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/80 to-purple-50/50 p-3 text-slate-800 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
                  <Laptop size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {asset.assetName || "Selected Asset"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-600">
                    <span className="font-semibold text-violet-700">
                      {asset.assetCode}
                    </span>
                    {asset.assetTag && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <Tag size={11} /> {asset.assetTag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {asset.categoryName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-100/80 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
                  <ShieldCheck size={12} />
                  {asset.categoryName}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs">
          <FormRenderer formMethod={formmethod} formSchema={schema} />
        </div>
      </div>
    </HpCommonModal>
  );
};

export default AssetAssignModal;
