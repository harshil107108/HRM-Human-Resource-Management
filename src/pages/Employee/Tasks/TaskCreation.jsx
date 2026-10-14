import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleCheck,
  Clock3,
  Files,
  PauseCircle,
  Play,
  ShieldAlert,
  ClipboardPlus,
  Plus,
  FolderKanban,
  ListTodo,
  Code2,
} from "lucide-react";
import { HpGrid } from "@/hp-grid/src";
import StatusCard from "@/components/common/StatusCard";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import useApiCall from "@/hooks/useApiCall";
import useModal from "@/hooks/useModal";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api, apiEndpoints } from "@/api/api";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import ProjectModal from "./ProjectModal";
import TaskModal from "./TaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskDeadlineTimer from "./TaskDeadlineTimer";
import { useRouteAccess } from "@/context/RouteAccessContext";
import { useAuth } from "@/context/AuthContext";
import { getTaskDeadlineInfo } from "@/utils/taskDeadline";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { timeZone: "UTC" })
    : "Not set";

const PROJECT_STATUSES = ["Planning", "Active", "On Hold", "Completed", "Cancelled"];

const formatEmployeeName = (employee) =>
  employee
    ? `${[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ")} (${employee.employeeId || "Employee"})`
    : "N/A";

const formatProjects = (projects) =>
  projects.map((project) => ({
    ...project,
    deadlineLabel: formatDate(project.deadline),
    startDateLabel: formatDate(project.startDate),
    budgetLabel:
      project.budget === null || project.budget === undefined
        ? "Not set"
        : `₹${Number(project.budget).toLocaleString("en-IN")}`,
    estimatedHoursLabel:
      project.estimatedHours === null || project.estimatedHours === undefined
        ? "Not set"
        : `${Number(project.estimatedHours)} ${Number(project.estimatedHours) === 1 ? "hour" : "hours"}`,
    developersLabel:
      project.developers?.map((person) =>
        [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" "),
      ).join(", ") || "No developers",
    taskCount: Number(project.taskCounts?.total || 0),
  }));

const formatTasks = (data) =>
  data.map((task) => {
    const info = getTaskDeadlineInfo(task);
    return {
      ...task,
      assignedToName: formatEmployeeName(task.assignedTo),
      createdByName: formatEmployeeName(task.createdBy),
      projectName: task.projectId?.projectName || "General Task",
      estimatedHoursLabel:
        task.estimatedHours === null || task.estimatedHours === undefined
          ? "Not set"
          : `${Number(task.estimatedHours)} ${Number(task.estimatedHours) === 1 ? "hour" : "hours"}`,
      dueDateDisplay: info.formattedDeadline,
      dueDateLabel: task.dueDate
        ? new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: "UTC" })
        : "No due date",
    };
  });

const TaskCreation = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();
  const { user, isSuperAdmin } = useAuth();

  const isAdminUser = useMemo(() => {
    if (isSuperAdmin) return true;
    if (!user) return false;
    const roleCode = user.roleCode || user.role?.code;
    const roleName = user.roleName || user.role?.name || user.role?.roleName;
    const roleString = typeof user.role === "string" ? user.role : "";
    return Boolean(
      user.isSuperAdmin ||
        user.isAdmin ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN" ||
        roleName === "Admin" ||
        roleName === "Super Admin" ||
        roleString === "Admin" ||
        roleString === "Super Admin",
    );
  }, [user, isSuperAdmin]);

  // Tabs: "projects" or "tasks"
  const [activeTab, setActiveTab] = useState("projects");

  // Projects state
  const [projects, setProjects] = useState([]);
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState("");

  // Modals state
  const { isModalOpen: isProjectModalOpen, extraParams: projectModalParams, onModalOpen: onProjectModalOpen, onModalClose: onProjectModalClose } = useModal();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTargetProject, setTaskTargetProject] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Tick clock every 30 seconds for live deadline updates
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Projects
  const getProjects = useCallback(async () => {
    const res = await apiCall({
      id: "getEmployeeProjects",
      api: api + apiEndpoints.tasks.getProjects,
      payload: {},
    });
    if (res?.success) setProjects(formatProjects(res.data?.data || []));
  }, [apiCall]);

  // Fetch Tasks
  const getTasks = useCallback(async () => {
    const res = await apiCall({
      id: "getEmployeeTasks",
      api: api + apiEndpoints.tasks.getTasks,
      payload: {},
    });
    if (res?.success) setTasks(formatTasks(res.data?.data || []));
  }, [apiCall]);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiCall({
        id: "getEmployeeProjects",
        api: api + apiEndpoints.tasks.getProjects,
        payload: {},
      }),
      apiCall({
        id: "getEmployeeTasks",
        api: api + apiEndpoints.tasks.getTasks,
        payload: {},
      }),
    ]).then(([projRes, taskRes]) => {
      if (!active) return;
      if (projRes?.success) setProjects(formatProjects(projRes.data?.data || []));
      if (taskRes?.success) setTasks(formatTasks(taskRes.data?.data || []));
    });
    return () => {
      active = false;
    };
  }, [apiCall]);

  // Delete Project
  const handleDeleteProject = useCallback((project) => {
    deleteAlert({
      title: "Delete Project?",
      text: "Projects with linked tasks cannot be deleted. You can mark those projects as Completed or Cancelled instead.",
      confirmButtonText: "Delete Project",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteEmployeeProject",
          api: api + apiEndpoints.tasks.deleteProject,
          payload: { _id: project._id },
        });
        if (res?.success) {
          successAlert({
            title: "Project deleted",
            text: "The project was deleted successfully.",
          });
          await getProjects();
        }
      },
    });
  }, [apiCall, deleteAlert, getProjects, successAlert]);

  // Delete Task
  const handleDeleteTask = useCallback((task) => {
    deleteAlert({
      title: "Delete Task?",
      text: `Are you sure you want to delete task "${task.title}"?`,
      confirmButtonText: "Delete Task",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteEmployeeTask",
          api: api + apiEndpoints.tasks.deleteTask,
          payload: { _id: task._id },
        });
        if (res?.success) {
          successAlert({
            title: "Task deleted",
            text: "The task was deleted successfully.",
          });
          await Promise.all([getTasks(), getProjects()]);
        }
      },
    });
  }, [apiCall, deleteAlert, getProjects, getTasks, successAlert]);

  // Update Project Status
  const updateProjectStatus = useCallback(
    async (project, nextStatus) => {
      if (!project?._id || !PROJECT_STATUSES.includes(nextStatus)) return;
      if (project.status === nextStatus) return;

      const confirmed = await confirmStatusChange({
        fieldName: "Project Status",
        currentValue: project.status,
        nextValue: nextStatus,
        currentLabel: project.status,
        nextLabel: nextStatus,
      });

      if (!confirmed) return;

      const payload = {
        ...project,
        _id: project._id,
        status: nextStatus,
        developers: Array.isArray(project.developers)
          ? project.developers.map((developer) => developer?._id || developer)
          : [],
        budget:
          project.budget === null || project.budget === undefined
            ? null
            : Number(project.budget),
        estimatedHours:
          project.estimatedHours === null || project.estimatedHours === undefined
            ? null
            : Number(project.estimatedHours),
        startDate: project.startDate || "",
        deadline: project.deadline || "",
        requiredTask: project.requiredTask || "",
        description: project.description || "",
      };

      const res = await apiCall({
        id: "saveEmployeeProject",
        api: api + apiEndpoints.tasks.addEditProject,
        payload,
        showSuccessAlert: false,
      });

      if (!res?.aborted && res?.success) await getProjects();
    },
    [apiCall, getProjects],
  );

  // Update Task Status
  const updateTaskStatus = useCallback(
    async (task, nextStatus) => {
      if (!task?._id || task.status === nextStatus) return;

      const confirmed = await confirmStatusChange({
        fieldName: "Task Status",
        currentValue: task.status,
        nextValue: nextStatus,
        currentLabel: task.status,
        nextLabel: nextStatus,
      });
      if (!confirmed) return;

      const res = await apiCall({
        id: "updateTaskStatus",
        api: api + apiEndpoints.tasks.updateTaskStatus,
        payload: {
          _id: task._id,
          currentStatus: task.status,
          status: nextStatus,
        },
      });
      if (!res?.aborted && res?.success) {
        await getTasks();
      }
    },
    [apiCall, getTasks],
  );

  const openEditProject = useCallback((params) => {
    const project = params?.data || params?.row || params;
    if (project?._id) onProjectModalOpen({ mode: "edit", project });
  }, [onProjectModalOpen]);

  const handleAssignTaskForProject = useCallback((project) => {
    setTaskTargetProject(project);
    setIsTaskModalOpen(true);
  }, []);

  // Status Cards for Projects
  const projectStatusCards = useMemo(() => {
    const countStatus = (status) =>
      projects.filter((project) => project.status === status).length.toLocaleString();

    return [
      {
        id: "all-proj",
        title: "All Projects",
        value: projects.length.toLocaleString(),
        icon: <Files size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "planning",
        title: "Planning",
        value: countStatus("Planning"),
        icon: <Clock3 size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "Planning",
      },
      {
        id: "active",
        title: "Active",
        value: countStatus("Active"),
        icon: <Play size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Active",
      },
      {
        id: "on-hold",
        title: "On Hold",
        value: countStatus("On Hold"),
        icon: <PauseCircle size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "On Hold",
      },
      {
        id: "completed",
        title: "Completed",
        value: countStatus("Completed"),
        icon: <CircleCheck size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Completed",
      },
      {
        id: "cancelled",
        title: "Cancelled",
        value: countStatus("Cancelled"),
        icon: <ShieldAlert size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Cancelled",
      },
    ];
  }, [projects]);

  // Status Cards for Tasks
  const taskStatusCards = useMemo(() => {
    const countStatus = (status) =>
      tasks.filter((t) => t.status === status).length.toLocaleString();

    return [
      {
        id: "all-tasks",
        title: "All Tasks",
        value: tasks.length.toLocaleString(),
        icon: <Files size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "assigned",
        title: "Assigned",
        value: countStatus("Assigned"),
        icon: <Clock3 size={18} className="stroke-[2.2]" />,
        type: "cyan",
        status: "Assigned",
      },
      {
        id: "running",
        title: "Running",
        value: countStatus("Running"),
        icon: <Play size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Running",
      },
      {
        id: "code-review",
        title: "Code Review",
        value: countStatus("Code Review"),
        icon: <Code2 size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Code Review",
      },
      {
        id: "completed-tasks",
        title: "Completed",
        value: countStatus("Completed"),
        icon: <CircleCheck size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Completed",
      },
    ];
  }, [tasks]);

  // Project context menu
  const projectContextMenu = useCallback(
    (params) => {
      const row = params?.row;
      return [
        {
          text: "Assign Task to Project",
          icon: <ClipboardPlus size={14} />,
          onClick: () => handleAssignTaskForProject(row),
        },
        { divider: true },
        ...createRowContextMenu({
          onEdit: openEditProject,
          editLabel: "Edit Project",
          onDelete: handleDeleteProject,
          statusCards: projectStatusCards,
          statusField: "status",
          onStatusChange: updateProjectStatus,
          statusLabel: "Change status to",
        })(params),
      ];
    },
    [
      handleDeleteProject,
      handleAssignTaskForProject,
      openEditProject,
      projectStatusCards,
      updateProjectStatus,
    ],
  );

  // Task context menu
  const taskContextMenu = useMemo(
    () =>
      createRowContextMenu({
        onEdit: (task) => setSelectedTaskForDetails(task),
        editLabel: "View Details",
        onDelete: handleDeleteTask,
        ...(isAdminUser
          ? {}
          : {
              statusCards: taskStatusCards,
              statusField: "status",
              onStatusChange: updateTaskStatus,
              statusLabel: "Change status to",
            }),
      }),
    [handleDeleteTask, taskStatusCards, updateTaskStatus, isAdminUser],
  );

  const displayedProjects = useMemo(
    () =>
      selectedProjectStatus
        ? projects.filter((project) => project.status === selectedProjectStatus)
        : projects,
    [projects, selectedProjectStatus],
  );

  const displayedTasks = useMemo(
    () =>
      selectedTaskStatus
        ? tasks.filter((t) => t.status === selectedTaskStatus)
        : tasks,
    [tasks, selectedTaskStatus],
  );

  const projectColumns = [
    { id: "projectName", field: "projectName", headerName: "Project", width: 220 },
    { id: "clientName", field: "clientName", headerName: "Client", width: 180 },
    { id: "startDateLabel", field: "startDateLabel", headerName: "Start Date", width: 130 },
    { id: "deadlineLabel", field: "deadlineLabel", headerName: "Deadline", width: 130 },
    { id: "budgetLabel", field: "budgetLabel", headerName: "Budget", width: 150 },
    { id: "estimatedHoursLabel", field: "estimatedHoursLabel", headerName: "Estimated Time", width: 150 },
    { id: "developersLabel", field: "developersLabel", headerName: "Developers", width: 250 },
    { id: "taskCount", field: "taskCount", headerName: "Tasks", width: 90, type: "number" },
    {
      id: "status",
      field: "status",
      headerName: "Project Status",
      width: 140,
      type: "custom",
      render: (status) => {
        const styles = {
          Planning: "border-slate-200 bg-slate-50 text-slate-600",
          Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
          "On Hold": "border-amber-200 bg-amber-50 text-amber-700",
          Completed: "border-sky-200 bg-sky-50 text-sky-700",
          Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
        };
        return (
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Planning}`}>
            {status || "Planning"}
          </span>
        );
      },
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 80,
      type: "actions",
      onEdit: (row) => openEditProject(row),
      onDelete: (row) => handleDeleteProject(row),
    },
  ];

  const taskColumns = [
    { id: "title", field: "title", headerName: "Task", width: 240 },
    { id: "projectName", field: "projectName", headerName: "Project", width: 200 },
    { id: "assignedToName", field: "assignedToName", headerName: "Assigned To", width: 220 },
    { id: "dueDateDisplay", field: "dueDateDisplay", headerName: "Due Date", width: 155 },
    {
      id: "deadlineProgress",
      field: "deadlineProgress",
      headerName: "Deadline Progress",
      width: 150,
      type: "custom",
      render: (_, row) => <TaskDeadlineTimer task={row} />,
    },
    { id: "estimatedHoursLabel", field: "estimatedHoursLabel", headerName: "Estimated Time", width: 140 },
    {
      id: "priority",
      field: "priority",
      headerName: "Priority",
      width: 110,
      type: "custom",
      render: (priority) => {
        const styles = {
          High: "border-rose-200 bg-rose-50 text-rose-700",
          Medium: "border-amber-200 bg-amber-50 text-amber-700",
          Low: "border-slate-200 bg-slate-50 text-slate-600",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none ${styles[priority] || styles.Medium}`}
          >
            {priority || "Medium"}
          </span>
        );
      },
    },
    {
      id: "status",
      field: "status",
      headerName: "Status",
      width: 140,
      type: "custom",
      render: (status) => {
        const styles = {
          Assigned: "border-sky-200 bg-sky-50 text-sky-700",
          Running: "border-amber-200 bg-amber-50 text-amber-700",
          "Code Review": "border-violet-200 bg-violet-50 text-violet-700",
          Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
        };
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Assigned}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status || "Assigned"}
          </span>
        );
      },
    },
    {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 70,
      type: "actions",
      onDelete: (row) => handleDeleteTask(row),
    },
  ];

  useDocumentTitle("orvexa | Projects & Task Creation");

  const refreshAll = useCallback(async () => {
    await Promise.all([getProjects(), getTasks()]);
  }, [getProjects, getTasks]);

  return (
    <>
      {isProjectModalOpen && (
        <ProjectModal
          open={isProjectModalOpen}
          project={projectModalParams?.project}
          onClose={onProjectModalClose}
          onSaved={refreshAll}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          open={isTaskModalOpen}
          project={taskTargetProject}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskTargetProject(null);
          }}
          onSaved={refreshAll}
        />
      )}

      {selectedTaskForDetails && (
        <TaskDetailsModal
          open={Boolean(selectedTaskForDetails)}
          task={selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          onStatusChange={isAdminUser ? undefined : updateTaskStatus}
          updatingStatus={isPending("updateTaskStatus")}
          canChangeStatus={!isAdminUser}
        />
      )}

      <div className="flex h-full min-h-0 flex-col gap-3">
        {/* Top Header with Switcher Tabs & Quick Actions */}
        <div className="mr-2 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/90 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "projects"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderKanban size={15} />
              <span>Projects</span>
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-700">
                {projects.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "tasks"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListTodo size={15} />
              <span>Assigned Tasks</span>
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-700">
                {tasks.length}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTaskTargetProject(null);
                setIsTaskModalOpen(true);
              }}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3.5 py-2 text-xs font-semibold text-sky-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <ClipboardPlus
                size={15}
                className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transition-none"
              />
              <span>Create &amp; Assign Task</span>
            </button>
            <button
              type="button"
              onClick={() => onProjectModalOpen({ mode: "add" })}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <Plus
                size={15}
                className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110 motion-reduce:transition-none"
              />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        {activeTab === "projects" ? (
          <div className="mr-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {projectStatusCards.map((item) => (
              <StatusCard
                key={item.id}
                {...item}
                isSelectedFilter={
                  item.status
                    ? selectedProjectStatus === item.status
                    : selectedProjectStatus === ""
                }
                onClick={() =>
                  setSelectedProjectStatus((cur) =>
                    item.status && cur !== item.status ? item.status : "",
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="mr-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {taskStatusCards.map((item) => (
              <StatusCard
                key={item.id}
                {...item}
                isSelectedFilter={
                  item.status
                    ? selectedTaskStatus === item.status
                    : selectedTaskStatus === ""
                }
                onClick={() =>
                  setSelectedTaskStatus((cur) =>
                    item.status && cur !== item.status ? item.status : "",
                  )
                }
              />
            ))}
          </div>
        )}

        {/* Data Grid */}
        <div className="min-h-0 flex-1">
          {activeTab === "projects" ? (
            <HpGrid
              key="projectsGrid"
              contextData={projectContextMenu}
              id="employeeProjects"
              title="Projects"
              rowData={displayedProjects}
              colDef={projectColumns}
              style={{ height: "100%" }}
              onAddClick={() => onProjectModalOpen({ mode: "add" })}
              addButtonLabel="New Project"
              onDoubleClick={openEditProject}
              columnFilterable
              panding={
                isPending("getEmployeeProjects") ||
                isPending("deleteEmployeeProject") ||
                isPending("saveEmployeeProject")
              }
            />
          ) : (
            <HpGrid
              key="assignedTasksGrid"
              contextData={taskContextMenu}
              id="employeeAssignedTasks"
              title="Assigned Tasks"
              rowData={displayedTasks}
              colDef={taskColumns}
              style={{ height: "100%" }}
              toggle
              defaultView="list"
              cardTitleField="title"
              cardSubtitleField="projectName"
              cardStatusField="status"
              renderCardProgress={({ row }) => <TaskDeadlineTimer task={row} />}
              cardFields={[
                "assignedToName",
                "dueDateDisplay",
                "estimatedHoursLabel",
                "priority",
              ]}
              rowClassName={(row) => getTaskDeadlineInfo(row, now).rowClass}
              getCardClassName={({ row }) => getTaskDeadlineInfo(row, now).cardClass}
              onCardClick={(params) => {
                const task = params?.data || params?.row || params;
                if (task?._id) setSelectedTaskForDetails(task);
              }}
              onAddClick={() => {
                setTaskTargetProject(null);
                setIsTaskModalOpen(true);
              }}
              addButtonLabel="Assign Task"
              onDoubleClick={(params) => {
                const task = params?.data || params?.row || params;
                if (task?._id) setSelectedTaskForDetails(task);
              }}
              columnFilterable
              panding={
                isPending("getEmployeeTasks") ||
                isPending("deleteEmployeeTask") ||
                isPending("updateTaskStatus")
              }
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TaskCreation;
