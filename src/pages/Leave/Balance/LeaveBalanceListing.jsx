import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useMemo } from "react";
import useLeaveBalanceConfig from "./useLeaveBalanceConfig";
import useModal from "@/hooks/useModal";
import LeaveBalanceModal from "./LeaveBalanceModal";
import useApiCall from "@/hooks/useApiCall";
import useServerPagedRows from "@/hooks/useServerPagedRows";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useAuth } from "@/context/AuthContext";
import { Users, PieChart } from "lucide-react";
import { formMethod, FormRenderer, useWatch } from "@/form-engine";

// Normalises one balance record for the grid (names + numeric day counts).
const formatBalanceRow = (item) => {
    const empName =
      item.employeeName ||
      (item.employeeId
        ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""} (${item.employeeId.employeeId || ""})`
        : "N/A");
    const ltName =
      item.leaveTypeName ||
      item.leaveType?.typeName ||
      item.leaveTypeId?.typeName ||
      item.leaveType?.typeCode ||
      "N/A";
    const credited = Number(
      item.credited !== undefined
        ? item.credited
        : item.totalAllocated !== undefined
        ? item.totalAllocated
        : 0
    );
    const used = Number(
      item.used !== undefined
        ? item.used
        : item.usedDays !== undefined
        ? item.usedDays
        : 0
    );
    const pending = Number(
      item.pending !== undefined
        ? item.pending
        : item.pendingDays !== undefined
        ? item.pendingDays
        : 0
    );
    const remaining = Number(
      item.remaining !== undefined
        ? item.remaining
        : item.balanceDays !== undefined
        ? item.balanceDays
        : Math.max(0, credited - used)
    );

    return {
      ...item,
      employeeName: empName,
      leaveTypeName: ltName,
      credited,
      used,
      pending,
      remaining,
    };
};

const LeaveBalanceListing = () => {
  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();
  const { user, isSuperAdmin, can } = useAuth();

  const userRole = String(user?.roleCode || user?.primaryRole || "").toUpperCase();
  const isAdmin =
    isSuperAdmin ||
    ["SUPER_ADMIN", "ADMIN", "HR"].includes(userRole);

  const [employeeList, setEmployeeList] = useState([]);

  // Form instance for employee filter using formMethod selectWrapper
  const employeeFilterForm = useMemo(() => {
    return formMethod.createForm({
      schema: [
        {
          id: "employeeId",
          type: "selectWrapper",
          placeholder: "All Employees",
          options: [{ label: "All Employees", value: "" }],
          className: "col-span-12 !mb-0",
        },
      ],
      initialValue: { employeeId: "" },
    });
  }, []);

  const employeeFilterSchema = useMemo(
    () => [
      {
        id: "employeeId",
        type: "selectWrapper",
        placeholder: "All Employees",
        options: [
          { label: "All Employees", value: "" },
          ...employeeList.map((emp) => ({
            label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || "EMP"})`,
            value: emp._id,
          })),
        ],
        className: "col-span-12 !mb-0",
      },
    ],
    [employeeList]
  );

  useEffect(() => {
    employeeFilterForm.methods.setSchema(employeeFilterSchema);
  }, [employeeFilterSchema, employeeFilterForm]);

  const selectedEmployeeId = useWatch(employeeFilterForm, "employeeId") || "";

  // Balances arrive a page at a time; search, column filters and the
  // employee dropdown are applied on the server so they cover every record.
  const balances = useServerPagedRows({
    api: api + apiEndpoints.leave.balance.BalanceGetData,
    params: isAdmin && selectedEmployeeId ? { employeeId: selectedEmployeeId } : {},
    mapRow: formatBalanceRow,
  });
  const balanceData = balances.rows;

  const handleDelete = (id) => {
    deleteAlert({
      title: "Delete Leave Balance?",
      text: "Are you sure you want to delete this leave balance record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deleteLeaveBalance",
          api: api + apiEndpoints.leave.balance.BalanceDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Balance Deleted",
            text: "Leave balance record deleted successfully.",
          });
          balances.reload();
        }
      },
    });
  };

  const { leaveBalanceListingColDef } = useLeaveBalanceConfig({
    handleDelete,
    isAdmin,
  });
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();

  // Load employee list for Admin dropdown filter
  useEffect(() => {
    if (isAdmin) {
      apiCall({
        id: "getEmployeesHelp",
        api: api + apiEndpoints.employee.employee.EmployeeGetData,
        payload: {},
        silent: true,
      }).then((res) => {
        if (res?.success) {
          setEmployeeList(res.data?.data || []);
        }
      });
    }
  }, [isAdmin]);

  const handleAdd = () => {
    onModalOpen({ mode: "add" });
  };

  const handleDoubleClick = (data) => {
    if (!isAdmin) return;
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id });
    }
  };

  useDocumentTitle(
    isAdmin ? "orvexa | Employee Leave Balances" : "orvexa | My Leave Balances"
  );

  // Right-click menu for Admin: Edit and Delete.
  const contextData = useMemo(() => {
    if (!isAdmin) return null;
    return createRowContextMenu({
      onEdit: (row) => handleDoubleClick({ data: row }),
      onDelete: (row) => handleDelete(row._id),
    });
  }, [isAdmin]);

  // Overall totals across displayed rows
  const summary = useMemo(() => {
    let totalCredited = 0;
    let totalUsed = 0;
    let totalPending = 0;
    let totalRemaining = 0;

    balanceData.forEach((b) => {
      totalCredited += Number(b.credited) || 0;
      totalUsed += Number(b.used) || 0;
      totalPending += Number(b.pending) || 0;
      totalRemaining += Number(b.remaining) || 0;
    });

    return { totalCredited, totalUsed, totalPending, totalRemaining };
  }, [balanceData]);

  // Custom Toolbar Controls using FormRenderer selectWrapper
  const toolbarRightControls = isAdmin ? (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-0.5">
        <Users size={14} className="text-slate-500 shrink-0" />
        <span className="font-semibold text-slate-600 shrink-0">Employee:</span>
        <div className="w-64">
          <FormRenderer
            formMethod={employeeFilterForm}
            formSchema={employeeFilterSchema}
            className="!grid-cols-1 !gap-0"
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-xs">
      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
        Credited: {summary.totalCredited}d
      </span>
      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
        Used: {summary.totalUsed}d
      </span>
      <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-200">
        Pending: {summary.totalPending}d
      </span>
      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
        Remaining: {summary.totalRemaining}d
      </span>
    </div>
  );

  const selectedEmployeeObj = employeeList.find(
    (e) => String(e._id) === String(selectedEmployeeId)
  );
  const employeeDisplayName = user?.name || user?.firstName || "My";
  const gridTitle = isAdmin
    ? selectedEmployeeId && selectedEmployeeObj
      ? `Leave Balances (${selectedEmployeeObj.firstName} ${selectedEmployeeObj.lastName})`
      : "Employee Leave Balances (All Employees)"
    : `My Leave Balances (${employeeDisplayName} - ${new Date().getFullYear()})`;

  return (
    <>
      {isModalOpen && isAdmin && (
        <LeaveBalanceModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={balances.reload}
          extraParams={extraParams}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="leaveBalanceListing"
        rowData={balanceData}
        colDef={leaveBalanceListingColDef}
        style={{ height: "100%" }}
        icon={<PieChart size={15} />}
        onDoubleClick={isAdmin ? handleDoubleClick : undefined}
        onAddClick={isAdmin ? handleAdd : undefined}
        addButtonLabel="Allocate / Adjust Balance"
        title={gridTitle}
        toolbarRight={toolbarRightControls}
        searchable={true}
        columnFilterable={true}
        serverSide
        onSearchChange={balances.setSearch}
        onColumnFiltersChange={balances.setFilters}
        onLoadMore={balances.loadMore}
        hasMore={balances.hasMore}
        loadingMore={balances.loadingMore}
        loadMoreError={balances.loadMoreError}
        onRetryLoadMore={balances.retryLoadMore}
        totalCount={balances.total}
        rowClassName={(row) => {
          const remaining = Number(
            row?.remaining !== undefined ? row.remaining : row?.balanceDays
          );
          if (remaining <= 0) return "hp-grid-row--leave-exhausted";
          if (remaining === 1) return "hp-grid-row--leave-warning";
          return "";
        }}
        panding={isPending("deleteLeaveBalance") || balances.loading}
      />
    </>
  );
};

export default LeaveBalanceListing;
