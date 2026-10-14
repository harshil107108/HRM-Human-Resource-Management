import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { HpCommonModal } from "@/hp-common-modal";
import { FormRenderer, formMethod } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const projectStatuses = ["Planning", "Active", "On Hold", "Completed", "Cancelled"];

const getInitialValues = (project) => ({
  projectName: project?.projectName || "",
  clientName: project?.clientName || "",
  startDate: project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "",
  deadline: project?.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
  budget: project?.budget ?? "",
  estimatedHours: project?.estimatedHours ?? "",
  developers: (project?.developers || []).map((developer) => developer._id || developer),
  status: project?.status || "Planning",
  requiredTask: project?.requiredTask || "",
  description: project?.description || "",
});

const getEmployeeLabel = (employee) =>
  `${[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ")} (${employee.employeeId || "Employee"})`;

const ProjectModal = ({ open, project, onClose, onSaved }) => {
  const { apiCall, isPending } = useApiCall();
  const [employees, setEmployees] = useState([]);
  const [employeeLoadFailed, setEmployeeLoadFailed] = useState(false);
  const isEditing = Boolean(project?._id);
  const loadingEmployees = isPending("getAssignableProjectEmployees");

  const schema = useMemo(
    () => [
      {
        id: "projectName",
        type: "text",
        label: "Project Name",
        placeHolder: "e.g. Customer portal redesign",
        required: true,
        maxLength: 160,
        className: "col-span-6",
      },
      {
        id: "clientName",
        type: "text",
        label: "Client Name",
        placeHolder: "Client or internal department",
        required: true,
        maxLength: 160,
        className: "col-span-6",
      },
      {
        id: "startDate",
        type: "date",
        label: "Start Date",
        className: "col-span-6",
      },
      {
        id: "deadline",
        type: "date",
        label: "Project Deadline",
        className: "col-span-6",
        validate: (value, values) =>
          value && values.startDate && value < values.startDate
            ? "Project deadline cannot be before the start date."
            : undefined,
      },
      {
        id: "budget",
        type: "number",
        label: "Project Budget (₹)",
        placeHolder: "Optional",
        min: 0,
        precision: 2,
        className: "col-span-4",
      },
      {
        id: "estimatedHours",
        type: "number",
        label: "Estimated Time (Hours)",
        placeHolder: "e.g. 8, 10, 20",
        min: 0,
        precision: 1,
        className: "col-span-4",
      },
      {
        id: "status",
        type: "selectWrapper",
        label: "Project Status",
        options: projectStatuses.map((status) => ({ label: status, value: status })),
        className: "col-span-4",
      },
      {
        id: "developers",
        type: "selectWrapper",
        label: "Assigned Developers",
        placeHolder: "Select project developers",
        options: employees.map((employee) => ({
          label: getEmployeeLabel(employee),
          value: employee._id,
        })),
        isMultiSelect: true,
        disabled: loadingEmployees || employees.length === 0,
        required: true,
        validate: (value) =>
          Array.isArray(value) && value.length > 0
            ? undefined
            : "Select at least one developer.",
        className: "col-span-full",
      },
      {
        id: "requiredTask",
        type: "textarea",
        label: "Project Requirements (Reference Only)",
        placeHolder: "Add project-level requirements. To assign an individual task, use Create & Assign Task.",
        maxLength: 4000,
        rows: 3,
        className: "col-span-full",
      },
      {
        id: "description",
        type: "textarea",
        label: "Project Scope / Notes",
        placeHolder: "Summarize objectives, deliverables, or key constraints.",
        maxLength: 4000,
        rows: 3,
        className: "col-span-full",
      },
    ],
    [employees, loadingEmployees],
  );

  const initialValues = useMemo(() => getInitialValues(project), [project]);
  const form = useMemo(
    () => formMethod.createForm({ schema: [], initialValue: initialValues }),
    [initialValues],
  );

  useEffect(() => {
    form.methods.setSchema(schema);
  }, [form, schema]);

  useEffect(() => {
    let active = true;
    apiCall({
      id: "getAssignableProjectEmployees",
      api: api + apiEndpoints.tasks.getAssignableEmployees,
      payload: {},
    }).then((res) => {
      if (!active) return;
      if (res?.success) setEmployees(res.data?.data || []);
      else setEmployeeLoadFailed(true);
    });
    return () => {
      active = false;
    };
  }, [apiCall]);

  const handleSave = async () => {
    const formValues = form.methods.getValues();
    const createsDeveloperTasks =
      Boolean(formValues.requiredTask?.trim()) &&
      !["Completed", "Cancelled"].includes(formValues.status);

    await form.methods.handleFormSave(
      async (values) => {
        const res = await apiCall({
          id: "saveEmployeeProject",
          api: api + apiEndpoints.tasks.addEditProject,
          payload: {
            ...values,
            budget: values.budget === "" ? null : Number(values.budget),
            estimatedHours:
              values.estimatedHours === "" ? null : Number(values.estimatedHours),
            ...(isEditing ? { _id: project._id } : {}),
          },
          showSuccessAlert: false,
        });
        if (!res?.success) {
          throw new Error(res?.message || "Failed to save project.");
        }
        return res;
      },
      {
        successMessage: createsDeveloperTasks
          ? "Project saved and task assigned to selected developers."
          : isEditing
            ? "Project updated successfully."
            : "Project added successfully.",
        onSuccess: async () => {
          onClose();
          await onSaved?.();
        },
      },
    );
  };

  const saving = isPending("saveEmployeeProject");

  return (
    <HpCommonModal
      open={open}
      title={isEditing ? "Edit Project" : "Add New Project"}
      subTitle="Set project details, required work, and assigned developers."
      size="xl"
      icon={<BriefcaseBusiness size={20} />}
      onSave={handleSave}
      onClose={onClose}
      loading={saving}
      disableSave={loadingEmployees || employeeLoadFailed || employees.length === 0}
      showClearButton={false}
      confirmBeforeClose
    >
      {employeeLoadFailed && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Developer options could not be loaded. Close and reopen this form to retry.
        </p>
      )}
      {!loadingEmployees && !employeeLoadFailed && employees.length === 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          There are no active employees available in your assignment scope.
        </p>
      )}
      <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
        This form saves project details only. Adding a developer here does not assign an individual task; use “Create &amp; Assign Task” from the Task Creation page.
      </p>
      <FormRenderer formMethod={form} formSchema={schema} />
    </HpCommonModal>
  );
};

export default ProjectModal;
