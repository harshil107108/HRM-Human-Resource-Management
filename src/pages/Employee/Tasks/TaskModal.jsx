import { useEffect, useMemo, useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { HpCommonModal } from "@/hp-common-modal";
import { FormRenderer, formMethod } from "@/form-engine";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const initialTaskSchema = [];
const getInitialTaskValues = (defaultProjectId = "") => ({
  title: "",
  description: "",
  projectId: defaultProjectId || "",
  assignedTo: [],
  dueDate: "",
  estimatedHours: "",
  priority: "Medium",
});

const toDateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const getEmployeeLabel = (employee) =>
  `${[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ")} (${employee.employeeId || "Employee"})`;

const TaskModal = ({ open, project, defaultProjectId, onClose, onSaved }) => {
  const { apiCall, isPending } = useApiCall();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [optionsFailed, setOptionsFailed] = useState(false);

  const initialProjectId = project?._id || defaultProjectId || "";

  const form = useMemo(
    () =>
      formMethod.createForm({
        schema: initialTaskSchema,
        initialValue: getInitialTaskValues(initialProjectId),
      }),
    [initialProjectId],
  );

  const watchedProjectId = form.methods.watch("projectId");

  // Reset/populate form when modal opens
  useEffect(() => {
    if (open) {
      form.methods.setValues({
        title: "",
        description: "",
        projectId: initialProjectId,
        assignedTo: [],
        dueDate: "",
        estimatedHours: "",
        priority: "Medium",
      });
    }
  }, [open, initialProjectId, form]);

  const availableProjects = useMemo(
    () => projects.filter((p) => !["Completed", "Cancelled"].includes(p.status)),
    [projects],
  );

  const selectedProject = useMemo(
    () => availableProjects.find((p) => String(p._id) === String(watchedProjectId)),
    [availableProjects, watchedProjectId],
  );

  const projectOptions = useMemo(
    () => [
      { label: "-- No Project (General Task) --", value: "" },
      ...availableProjects.map((p) => ({
        label: `${p.projectName} — ${p.clientName}`,
        value: p._id,
      })),
    ],
    [availableProjects],
  );

  const employeeOptions = useMemo(() => {
    return employees.map((employee) => {
      const isProjectDev = selectedProject?.developers?.some(
        (dev) => String(dev._id || dev) === String(employee._id),
      );
      const tag = isProjectDev ? " ★" : "";
      return {
        label: `${getEmployeeLabel(employee)}${tag}`,
        value: employee._id,
      };
    });
  }, [employees, selectedProject]);

  const schema = useMemo(
    () => [
      {
        id: "title",
        type: "text",
        label: "Task Title",
        placeHolder: "Enter a descriptive task title",
        required: true,
        maxLength: 160,
        className: "col-span-full",
      },
      {
        id: "projectId",
        type: "selectWrapper",
        label: "Project (Optional)",
        placeHolder: "Select a project or leave as General Task",
        options: projectOptions,
        className: "col-span-6",
      },
      {
        id: "assignedTo",
        type: "selectWrapper",
        label: "Assign To",
        placeHolder: "Select one or more employees",
        options: employeeOptions,
        isMultiSelect: true,
        required: true,
        validate: (value) =>
          Array.isArray(value) && value.length > 0
            ? undefined
            : "Select at least one employee.",
        disabled: employees.length === 0,
        className: "col-span-6",
      },
      {
        id: "estimatedHours",
        type: "number",
        label: "Assign Time (Hours)",
        placeHolder: "e.g. 10 hr",
        required: true,
        min: 0.1,
        precision: 1,
        className: "col-span-4",
      },
      {
        id: "dueDate",
        type: "date",
        label: "Due Date (Optional)",
        min: selectedProject?.startDate ? toDateInput(selectedProject.startDate) : undefined,
        max: selectedProject?.deadline ? toDateInput(selectedProject.deadline) : undefined,
        validate: (value) => {
          if (!value || !selectedProject) return undefined;
          const startDate = toDateInput(selectedProject?.startDate);
          const deadline = toDateInput(selectedProject?.deadline);
          if (startDate && value < startDate) {
            return "Task due date cannot be before the project start date.";
          }
          if (deadline && value > deadline) {
            return "Task due date cannot be after the project deadline.";
          }
          return undefined;
        },
        className: "col-span-4",
      },
      {
        id: "priority",
        type: "selectWrapper",
        label: "Priority",
        options: ["Low", "Medium", "High"].map((priority) => ({
          label: priority,
          value: priority,
        })),
        className: "col-span-4",
      },
      {
        id: "description",
        type: "textarea",
        label: "Task Description / Acceptance Criteria",
        placeHolder: "Describe what needs to be done, requirements, or deliverables.",
        maxLength: 4000,
        rows: 4,
        className: "col-span-full",
      },
    ],
    [projectOptions, employeeOptions, employees.length, selectedProject],
  );

  useEffect(() => {
    form.methods.setSchema(schema);
  }, [form, schema]);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiCall({
        id: "getTaskProjects",
        api: api + apiEndpoints.tasks.getProjects,
        payload: {},
      }),
      apiCall({
        id: "getTaskDevelopers",
        api: api + apiEndpoints.tasks.getAssignableEmployees,
        payload: {},
      }),
    ]).then(([projectResponse, employeeResponse]) => {
      if (!active) return;
      if (projectResponse?.success && employeeResponse?.success) {
        setProjects(projectResponse.data?.data || []);
        setEmployees(employeeResponse.data?.data || []);
      } else {
        setOptionsFailed(true);
      }
    });
    return () => {
      active = false;
    };
  }, [apiCall]);

  const handleSave = async () => {
    const values = form.methods.getValues();
    const assigneeCount = Array.isArray(values.assignedTo) ? values.assignedTo.length : 0;

    await form.methods.handleFormSave(
      async (formData) => {
        const res = await apiCall({
          id: "createEmployeeTask",
          api: api + apiEndpoints.tasks.createTask,
          payload: {
            ...formData,
            projectId: formData.projectId || null,
          },
          showSuccessAlert: false,
        });
        if (!res?.success) {
          throw new Error(res?.message || "Failed to create task.");
        }
        return res;
      },
      {
        successMessage:
          assigneeCount === 1
            ? "Task assigned to the employee successfully."
            : `Task assigned to ${assigneeCount} employees successfully.`,
        onSuccess: async () => {
          onClose();
          await onSaved?.();
        },
      },
    );
  };

  const loadingOptions =
    isPending("getTaskProjects") || isPending("getTaskDevelopers");
  const saving = isPending("createEmployeeTask") || form.methods.isSubmitting();

  return (
    <HpCommonModal
      open={open}
      title="Create & Assign Task"
      subTitle="Assign this task to one or more employees. They will immediately see it in Task Management."
      size="lg"
      icon={<ClipboardPlus size={20} />}
      onSave={handleSave}
      onClose={onClose}
      loading={saving}
      disableSave={loadingOptions || optionsFailed || employees.length === 0}
      showClearButton={false}
      confirmBeforeClose
    >
      {optionsFailed && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Employee options could not be loaded. Close and reopen this form to retry.
        </p>
      )}
      {!loadingOptions && !optionsFailed && employees.length === 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          There are no active employees available in your assignment scope.
        </p>
      )}
      <FormRenderer formMethod={form} formSchema={schema} />
    </HpCommonModal>
  );
};

export default TaskModal;
