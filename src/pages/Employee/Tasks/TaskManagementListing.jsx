import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Code2, CircleCheck, Files, Play, Clock3, ClipboardPlus } from "lucide-react";
import { HpGrid } from "@/hp-grid/src";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import useApiCall from "@/hooks/useApiCall";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api, apiEndpoints } from "@/api/api";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useRouteAccess } from "@/context/RouteAccessContext";
import { useAuth } from "@/context/AuthContext";
import { getTaskDeadlineInfo } from "@/utils/taskDeadline";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskModal from "./TaskModal";
import TaskDeadlineTimer from "./TaskDeadlineTimer";

const TASK_STATUSES = ["Assigned", "Running", "Code Review", "Completed"];
const DRAG_TYPE = "EMPLOYEE_TASK";

const formatEmployeeName = (employee) =>
  employee
    ? `${[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ")} (${employee.employeeId || "Employee"})`
    : "N/A";

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
      deadlineBadge: info.timerText,
      dueDateDisplay: info.formattedDeadline,
      dueDateFormatted: task.dueDate
        ? new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: "UTC" })
        : "No due date",
    };
  });

const TaskManagementListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { canAdd } = useRouteAccess();
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

  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const updateInProgress = useRef(false);

  // Tick clock every 30 seconds so timers & color thresholds update dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getTasks = useCallback(async () => {
    const res = await apiCall({
      id: "getTasks",
      api: api + apiEndpoints.tasks.getTasks,
      payload: {},
    });
    if (res?.success) {
      const formatted = formatTasks(res.data?.data || []);
      setTasks(formatted);
      setSelectedTask((prev) =>
        prev ? formatted.find((t) => t._id === prev._id) || null : null,
      );
    }
  }, [apiCall]);

  useEffect(() => {
    let active = true;
    apiCall({
      id: "getTasks",
      api: api + apiEndpoints.tasks.getTasks,
      payload: {},
    }).then((res) => {
      if (active && res?.success) {
        setTasks(formatTasks(res.data?.data || []));
      }
    });
    return () => {
      active = false;
    };
  }, [apiCall]);

  const updateTaskStatus = useCallback(
    async (task, nextStatus, nextTitle) => {
      if (isAdminUser) return; // Admins can only view tasks
      if (!task?._id || !TASK_STATUSES.includes(nextStatus)) return;
      if (task.status === nextStatus) return;
      if (updateInProgress.current) return;

      const confirmed = await confirmStatusChange({
        fieldName: "Task Status",
        currentValue: task.status,
        nextValue: nextStatus,
        currentLabel: task.status,
        nextLabel: nextTitle || nextStatus,
      });
      if (!confirmed || updateInProgress.current) return;

      updateInProgress.current = true;
      try {
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
      } finally {
        updateInProgress.current = false;
      }
    },
    [apiCall, getTasks, isAdminUser],
  );

  const {
    draggedItem,
    isDragging,
    isDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop({ defaultType: DRAG_TYPE });

  const statusCards = useMemo(() => {
    const countStatus = (status) =>
      tasks.filter((task) => task.status === status).length.toLocaleString();

    return [
      {
        id: "all",
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
        id: "completed",
        title: "Completed",
        value: countStatus("Completed"),
        icon: <CircleCheck size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Completed",
      },
    ];
  }, [tasks]);

  const displayedTasks = useMemo(
    () => (selectedStatus ? tasks.filter((task) => task.status === selectedStatus) : tasks),
    [tasks, selectedStatus],
  );

  const openTaskDetails = useCallback((params) => {
    const task = params?.data || params?.row || params;
    if (task?._id) setSelectedTask(task);
  }, []);

  const contextData = useMemo(
    () =>
      createRowContextMenu({
        onEdit: openTaskDetails,
        editLabel: "View Details",
        ...(isAdminUser
          ? {}
          : {
              statusCards,
              statusField: "status",
              onStatusChange: (task, nextStatus) => updateTaskStatus(task, nextStatus),
              statusLabel: "Change status to",
            }),
      }),
    [openTaskDetails, statusCards, updateTaskStatus, isAdminUser],
  );

  const columns = useMemo(
    () => [
      { id: "title", field: "title", headerName: "Task", width: 230 },
      { id: "projectName", field: "projectName", headerName: "Project", width: 190 },
      { id: "assignedToName", field: "assignedToName", headerName: "Assigned To", width: 210 },
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
    ],
    [],
  );

  const handleGridDragStart = ({ event, row }) => {
    if (isAdminUser) return;
    handleDragStart(event, row, { type: DRAG_TYPE });
  };

  const handleStatusCardClick = (status) => {
    setSelectedStatus((current) => (status && current !== status ? status : ""));
  };

  // Card class based on drag and deadline threshold
  const getCardClassName = ({ row }) => {
    const dragging = draggedItem?._id === row._id ? "hp-grid-card--dragging " : "";
    const deadlineInfo = getTaskDeadlineInfo(row, now);
    return `${dragging}${deadlineInfo.cardClass}`.trim();
  };

  // Row class based on drag and deadline threshold (turns RED if overdue, YELLOW if near deadline)
  const getRowClassName = (row) => {
    const dragging = draggedItem?._id === row._id ? "hp-grid-row--dragging " : "";
    const deadlineInfo = getTaskDeadlineInfo(row, now);
    return `${dragging}${deadlineInfo.rowClass}`.trim();
  };

  useDocumentTitle("orvexa | Task Management");

  return (
    <>
      {selectedTask && (
        <TaskDetailsModal
          open={Boolean(selectedTask)}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={isAdminUser ? undefined : updateTaskStatus}
          updatingStatus={isPending("updateTaskStatus")}
          canChangeStatus={!isAdminUser}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          open={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSaved={getTasks}
        />
      )}

      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3 mr-2 mt-1">
          <div className="flex-1 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {statusCards.map((item) => (
              <StatusCard
                key={item.id}
                {...item}
                isSelectedFilter={
                  item.status ? selectedStatus === item.status : selectedStatus === ""
                }
                isDraggingAny={!isAdminUser && isDragging}
                isDropTarget={!isAdminUser && !item.isDisabled && isDropTarget(item.status)}
                onDragOver={(event) =>
                  handleDragOver(event, item.status, {
                    disabled: isAdminUser || item.isDisabled || isPending("updateTaskStatus"),
                    acceptTypes: [DRAG_TYPE],
                    meta: item,
                  })
                }
                onDragLeave={(event) => handleDragLeave(event, item.status)}
                onDrop={(event) =>
                  handleDrop(event, item.status, {
                    disabled: isAdminUser || item.isDisabled || isPending("updateTaskStatus"),
                    acceptTypes: [DRAG_TYPE],
                    meta: item,
                    onDrop: (task) => updateTaskStatus(task, item.status, item.title),
                  })
                }
                onClick={() => handleStatusCardClick(item.status)}
              />
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <HpGrid
            id="employeeTaskManagement"
            title="Task Management"
            rowData={displayedTasks}
            colDef={columns}
            style={{ height: "100%" }}
            toggle
            defaultView="card"
            cardTitleField="title"
            cardSubtitleField="projectName"
            cardStatusField="status"
            renderCardProgress={({ row }) => <TaskDeadlineTimer task={row} />}
            cardFields={[
              "assignedToName",
              "dueDateDisplay",
              "estimatedHoursLabel",
              "priority",
              "description",
            ]}
            cardDraggable={!isAdminUser}
            onCardDragStart={handleGridDragStart}
            onCardDragEnd={handleDragEnd}
            getCardClassName={getCardClassName}
            rowDraggable={!isAdminUser}
            onRowDragStart={handleGridDragStart}
            onRowDragEnd={handleDragEnd}
            rowClassName={getRowClassName}
            contextData={contextData}
            onDoubleClick={openTaskDetails}
            onCardClick={openTaskDetails}
            onAddClick={canAdd ? () => setIsTaskModalOpen(true) : undefined}
            addButtonLabel="Assign Task"
            columnFilterable
            panding={isPending("getTasks") || isPending("updateTaskStatus")}
          />
        </div>
      </div>
    </>
  );
};

export default TaskManagementListing;
