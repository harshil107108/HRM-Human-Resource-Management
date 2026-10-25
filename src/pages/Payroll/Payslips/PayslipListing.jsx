import { HpGrid } from "@/hp-grid/src";
import { createRowContextMenu } from "@/utils/gridContextMenu";
import { useEffect, useState, useCallback } from "react";
import usePayslipConfig from "./usePayslipConfig";
import useModal from "@/hooks/useModal";
import PayslipModal from "./PayslipModal";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useAuth } from "@/context/AuthContext";
import { Settings } from "lucide-react";
import SalarySettingsModal from "./SalarySettingsModal";

const PayslipListing = () => {
  const { user } = useAuth();
  const isPrivileged = user?.isSuperAdmin || ["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.roleCode);

  const { apiCall, isPending } = useApiCall();
  const { deleteAlert, successAlert } = useAlert();
  const { isModalOpen, extraParams, onModalOpen, onModalClose } = useModal();
  const [payslipData, setPayslipData] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleDelete = (id) => {
    if (!isPrivileged) return;

    deleteAlert({
      title: "Delete Payslip?",
      text: "Are you sure you want to delete this payslip record? This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      onClick: async () => {
        const res = await apiCall({
          id: "deletePayslip",
          api: api + apiEndpoints.payroll.payslip.PayslipDeleteByID,
          payload: { _id: id },
        });

        if (res.success) {
          successAlert({
            title: "Payslip Deleted",
            text: "Payslip record has been deleted successfully.",
          });
          getPayslipListing();
        }
      },
    });
  };

  const handleDownload = (row) => {
    onModalOpen({ mode: "edit", id: row._id, rowData: row, autoDownload: true });
  };

  const handleView = (row) => {
    onModalOpen({ mode: "edit", id: row._id, rowData: row });
  };

  const { payslipListingColDef } = usePayslipConfig({
    handleDelete: isPrivileged ? handleDelete : undefined,
    handleDownload,
    handleView,
    isPrivileged,
  });

  const getPayslipListing = useCallback(async () => {
    const res = await apiCall({
      id: "getPayslipListing",
      api: api + apiEndpoints.payroll.payslip.PayslipGetData,
      payload: {},
    });

    if (res?.success) {
      const data = res.data?.data || [];
      const formatted = data.map((item) => {
        const emp = item.employeeId || {};
        const empName = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
        const empCode = emp.employeeId ? ` (${emp.employeeId})` : "";
        const net = item.netSalary != null ? item.netSalary : (item.netPay ?? 0);
        const status = item.status || item.paymentStatus || "Paid";

        return {
          ...item,
          employeeName: empName ? `${empName}${empCode}` : (item.employeeName || "N/A"),
          period: `${item.month || "-"}/${item.year || "-"}`,
          leaveDeduction: Number(item.leaveDeduction || 0),
          netPay: net,
          netSalary: net,
          status,
          paymentStatus: status,
        };
      });
      setPayslipData(formatted);
    }
  }, [apiCall]);

  useEffect(() => {
    getPayslipListing();
  }, [getPayslipListing]);

  const handleAdd = () => {
    if (!isPrivileged) return;
    onModalOpen({ mode: "add" });
  };

  const handleDoubleClick = (data) => {
    const id = data?.data?._id;
    if (id) {
      onModalOpen({ mode: "edit", id, rowData: data?.data });
    }
  };

  useDocumentTitle(isPrivileged ? "orvexa | Employee Payslips Management" : "orvexa | My Payslips");

  // Right-click context menu tailored to role
  const contextData = createRowContextMenu(
    isPrivileged
      ? {
          onEdit: (row) => handleDoubleClick({ data: row }),
          onDelete: (row) => handleDelete(row._id),
        }
      : {
          onEdit: (row) => handleDoubleClick({ data: row }),
        }
  );

  return (
    <>
      {isModalOpen && (
        <PayslipModal
          open={isModalOpen}
          onModalClose={onModalClose}
          onSaved={getPayslipListing}
          extraParams={extraParams}
        />
      )}
      {isSettingsOpen && (
        <SalarySettingsModal
          open={isSettingsOpen}
          onModalClose={() => setIsSettingsOpen(false)}
        />
      )}
      <HpGrid
        contextData={contextData}
        id="payslipListing"
        rowData={payslipData}
        colDef={payslipListingColDef}
        style={{ height: "100%" }}
        onDoubleClick={handleDoubleClick}
        beforeAddButton={
          isPrivileged ? (
            <button
              type="button"
              className="hp-grid-setting-btn"
              onClick={() => setIsSettingsOpen(true)}
              title="Configure Salary Calculation Rules (HRA, DRA/DA, PF, PT, etc.)"
            >
              <Settings size={14} style={{ color: "#0d9488" }} />
              <span>Salary Rules</span>
            </button>
          ) : null
        }
        onAddClick={isPrivileged ? handleAdd : undefined}
        title={isPrivileged ? "Employee Payslips Management" : "My Monthly Payslips"}
        columnFilterable={true}
        panding={isPending("deletePayslip") || isPending("getPayslipListing")}
      />
    </>
  );
};

export default PayslipListing;
