import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HpGrid } from "@/hp-grid/src";
import StatusCard from "@/components/common/StatusCard";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import { confirmStatusChange } from "@/utils/confirmStatusChange";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import LeaveApprovalDetailsModal from "./LeaveApprovalDetailsModal";
import { CalendarDays, CheckCircle2, Clock3, Files, XCircle } from "lucide-react";

const DRAG_TYPE = "LEAVE_REQUEST";
const REVIEWABLE_STATUSES = new Set(["Approved", "Rejected"]);

const formatLeaveRequests = (data) =>
  data.map((item) => ({
    ...item,
    employeeName: item.employeeId
      ? [
          item.employeeId.firstName,
          item.employeeId.middleName,
          item.employeeId.lastName,
        ]
          .filter(Boolean)
          .join(" ") + ` (${item.employeeId.employeeId || "Employee"})`
      : "N/A",
    leaveTypeName: item.leaveType?.typeName || item.leaveType?.typeCode || "N/A",
    startDate: formatDateForInput(item.startDate),
    endDate: formatDateForInput(item.endDate),
    days: Number(item.totalDays ?? item.days ?? 0),
    status: item.status || "Pending",
  }));

const LeaveApprovalListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { successAlert } = useAlert();
  const [requestData, setRequestData] = useState([]);
  const [selectedFilterStatus, setSelectedFilterStatus] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const updateInProgress = useRef(false);

  const getLeaveRequests = useCallback(async () => {
    const res = await apiCall({
      id: "getLeaveApprovalRequests",
      api: api + apiEndpoints.leave.request.RequestGetData,
      payload: {},
    });

    if (res?.success) {
      setRequestData(formatLeaveRequests(res.data?.data || []));
    }
  }, [apiCall]);

  useEffect(() => {
    let active = true;
    apiCall({
      id: "getLeaveApprovalRequests",
      api: api + apiEndpoints.leave.request.RequestGetData,
      payload: {},
    }).then((res) => {
      if (active && res?.success) {
        setRequestData(formatLeaveRequests(res.data?.data || []));
      }
    });

    return () => {
      active = false;
    };
  }, [apiCall]);

  const updateRequestStatus = useCallback(
    async (request, nextStatus, statusTitle) => {
      if (!request?._id || !REVIEWABLE_STATUSES.has(nextStatus)) return;

      if (request.status !== "Pending") {
        await getLeaveRequests();
        return;
      }

      if (updateInProgress.current) return;
      const confirmed = await confirmStatusChange({
        fieldName: "Leave Request Status",
        currentValue: request.status,
        nextValue: nextStatus,
        currentLabel: request.status,
        nextLabel: statusTitle || nextStatus,
      });
      if (!confirmed || updateInProgress.current) return;

      updateInProgress.current = true;
      try {
        const res = await apiCall({
          id: "updateLeaveRequestStatus",
          api: api + apiEndpoints.leave.approval.UpdateRequestStatus,
          payload: { _id: request._id, status: nextStatus },
        });

        if (res?.success && res.data?.success) {
          successAlert({
            title: `Leave ${nextStatus}`,
            text: `Leave request for ${request.employeeName} was ${nextStatus.toLowerCase()}.`,
          });
        }
        if (!res?.aborted) await getLeaveRequests();
      } finally {
        updateInProgress.current = false;
      }
    },
    [apiCall, getLeaveRequests, successAlert],
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
  } = useDragAndDrop({
    defaultType: DRAG_TYPE,
    onDrop: (request, targetStatus, meta) =>
      updateRequestStatus(request, targetStatus, meta?.title),
  });

  const statusSummary = useMemo(() => {
    const countStatus = (status) =>
      requestData.filter((request) => request.status === status).length;

    return [
      {
        id: "allRequests",
        title: "All Requests",
        value: requestData.length.toLocaleString(),
        icon: <Files size={18} className="stroke-[2.2]" />,
        type: "blue",
        status: "",
        isDisabled: true,
      },
      {
        id: "pending",
        title: "Pending",
        value: countStatus("Pending").toLocaleString(),
        icon: <Clock3 size={18} className="stroke-[2.2]" />,
        type: "orange",
        status: "Pending",
      },
      {
        id: "approved",
        title: "Approved",
        value: countStatus("Approved").toLocaleString(),
        icon: <CheckCircle2 size={18} className="stroke-[2.2]" />,
        type: "green",
        status: "Approved",
      },
      {
        id: "rejected",
        title: "Rejected",
        value: countStatus("Rejected").toLocaleString(),
        icon: <XCircle size={18} className="stroke-[2.2]" />,
        type: "red",
        status: "Rejected",
      },
      {
        id: "cancelled",
        title: "Cancelled",
        value: countStatus("Cancelled").toLocaleString(),
        icon: <CalendarDays size={18} className="stroke-[2.2]" />,
        type: "purple",
        status: "Cancelled",
      },
    ];
  }, [requestData]);

  const displayedRequests = useMemo(
    () =>
      selectedFilterStatus
        ? requestData.filter((request) => request.status === selectedFilterStatus)
        : requestData,
    [requestData, selectedFilterStatus],
  );

  const columns = useMemo(
    () => [
      { id: "employeeName", field: "employeeName", headerName: "Employee", width: 230 },
      { id: "leaveTypeName", field: "leaveTypeName", headerName: "Leave Type", width: 170 },
      { id: "startDate", field: "startDate", headerName: "Start Date", width: 130 },
      { id: "endDate", field: "endDate", headerName: "End Date", width: 130 },
      { id: "days", field: "days", headerName: "Days", width: 90, type: "number" },
      {
        id: "status",
        field: "status",
        headerName: "Status",
        width: 120,
        type: "custom",
        render: (status) => {
          const styles = {
            Pending: "border-amber-200 bg-amber-50 text-amber-700",
            Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
            Rejected: "border-rose-200 bg-rose-50 text-rose-700",
            Cancelled: "border-slate-200 bg-slate-50 text-slate-600",
          };
          const currentStatus = status || "Pending";
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                styles[currentStatus] || styles.Cancelled
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {currentStatus}
            </span>
          );
        },
      },
      { id: "reason", field: "reason", headerName: "Reason", width: 280 },
    ],
    [],
  );

  const handleStatusCardClick = (status) => {
    setSelectedFilterStatus((current) =>
      status && current !== status ? status : "",
    );
  };

  const handleViewDetails = (params) => {
    const request = params?.data || params?.row || params;
    if (request?._id) setSelectedRequest(request);
  };

  const statusActions = statusSummary
    .filter((item) => REVIEWABLE_STATUSES.has(item.status))
    .map((item) => ({
      ...item,
      title: item.status === "Approved" ? "Approve" : "Reject",
    }));

  const contextData = (params) =>
    createRowContextMenu({
      onEdit: handleViewDetails,
      editLabel: "View Details",
      isReadOnly: () => true,
      canEdit: () => true,
      isStatusLocked: (request) => request.status !== "Pending",
      statusCards: statusActions,
      statusField: "status",
      statusLabel: "Action:",
      onStatusChange: updateRequestStatus,
    })(params);

  const handleGridDragStart = ({ event, row }) => {
    handleDragStart(event, row, {
      type: DRAG_TYPE,
      canDrag: (request) => request.status === "Pending",
    });
  };

  const getCardClassName = ({ row }) =>
    draggedItem?._id === row._id ? "hp-grid-card--dragging" : "";

  const getRowClassName = (row) =>
    draggedItem?._id === row._id ? "hp-grid-row--dragging" : "";

  useDocumentTitle("orvexa | Leave Approvals");

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="mr-2 mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {statusSummary.map((item) => {
          const canDrop = REVIEWABLE_STATUSES.has(item.status);
          return (
            <StatusCard
              key={item.id}
              {...item}
              isSelectedFilter={
                item.status
                  ? selectedFilterStatus === item.status
                  : selectedFilterStatus === ""
              }
              isDraggingAny={isDragging}
              isDropTarget={canDrop && isDropTarget(item.status)}
              onDragOver={(event) =>
                handleDragOver(event, item.status, {
                  disabled: !canDrop || isPending("updateLeaveRequestStatus"),
                  acceptTypes: [DRAG_TYPE],
                  meta: item,
                })
              }
              onDragLeave={(event) => handleDragLeave(event, item.status)}
              onDrop={(event) =>
                handleDrop(event, item.status, {
                  disabled: !canDrop || isPending("updateLeaveRequestStatus"),
                  acceptTypes: [DRAG_TYPE],
                  meta: item,
                  onDrop: (request) =>
                    updateRequestStatus(request, item.status, item.title),
                })
              }
              onClick={() => handleStatusCardClick(item.status)}
            />
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        <HpGrid
          contextData={contextData}
          id="leaveApprovalListing"
          title="Leave Approvals"
          rowData={displayedRequests}
          colDef={columns}
          style={{ height: "100%" }}
          toggle
          defaultView="card"
          cardTitleField="employeeName"
          cardSubtitleField="leaveTypeName"
          cardStatusField="status"
          cardFields={["startDate", "endDate", "days", "reason"]}
          onDoubleClick={handleViewDetails}
          onCardClick={handleViewDetails}
          cardDraggable
          onCardDragStart={handleGridDragStart}
          onCardDragEnd={handleDragEnd}
          getCardClassName={getCardClassName}
          rowDraggable
          onRowDragStart={handleGridDragStart}
          onRowDragEnd={handleDragEnd}
          rowClassName={getRowClassName}
          columnFilterable
          panding={
            isPending("getLeaveApprovalRequests") ||
            isPending("updateLeaveRequestStatus")
          }
        />
      </div>
      <LeaveApprovalDetailsModal
        open={Boolean(selectedRequest)}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};

export default LeaveApprovalListing;
