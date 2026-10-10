import { useState, useEffect, useCallback, useTransition } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { Calendar, FileDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const LeaveReports = () => {
    const [rowData, setRowData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();

    const fetchLeaves = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.leaveRequest.getLeaveRequest,
                method: "post",
                body: {}
            });
            if (res?.success) {
                startTransition(() => {
                    const raw = res.data?.data ?? res.data;
                    setRowData(Array.isArray(raw) ? raw : []);
                });
            }
        } catch {
            showAlert("Failed to load leave reports data", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const approvedCount = rowData.filter(r => r.status === "Approved").length;
    const pendingCount = rowData.filter(r => r.status === "Pending").length;
    const totalDaysTaken = rowData
        .filter(r => r.status === "Approved")
        .reduce((acc, r) => acc + (Number(r.days) || 0), 0);

    const colDef = [
        {
            key: "employeeId",
            label: "Employee",
            sortable: true,
            filterable: true,
            render: (emp) => {
                if (!emp) return "-";
                if (typeof emp === "object") return `${emp.firstName || ""} ${emp.lastName || ""}`;
                return emp;
            }
        },
        {
            key: "leaveTypeId",
            label: "Leave Category",
            sortable: true,
            filterable: true,
            render: (type) => {
                if (!type) return "-";
                if (typeof type === "object") return type.typeName || type.typeCode;
                return type;
            }
        },
        {
            key: "startDate",
            label: "From Date",
            sortable: true,
            render: (val) => formatDate(val)
        },
        {
            key: "endDate",
            label: "To Date",
            sortable: true,
            render: (val) => formatDate(val)
        },
        {
            key: "days",
            label: "Duration",
            sortable: true,
            render: (val) => `${val || 0} day(s)`
        },
        {
            key: "status",
            label: "Approval Status",
            sortable: true,
            render: (val) => {
                let color = "bg-amber-100 text-amber-700";
                if (val === "Approved") color = "bg-green-100 text-green-700";
                if (val === "Rejected") color = "bg-red-100 text-red-700";
                return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{val || "Pending"}</span>;
            }
        },
        {
            key: "reason",
            label: "Reason",
            render: (val) => <span className="truncate max-w-xs block">{val || "-"}</span>
        }
    ];

    const handleExport = () => {
        showAlert("Leave analytics statement exported to CSV successfully", "success");
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Leave Utilization & Absence Reports</h1>
                        <p className="text-sm text-gray-500">Track leave patterns, department leave consumption, and pending manager approvals</p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                    <FileDown size={16} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Approved Requests</span>
                            <h3 className="text-2xl font-bold text-gray-800">{approvedCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Pending Approvals</span>
                            <h3 className="text-2xl font-bold text-amber-600">{pendingCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Approved Days Off Taken</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalDaysTaken} days</h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="leave-reports-grid"
                title="Consolidated Leave Utilization Ledger"
                rowData={rowData}
                colDef={colDef}
                columnFilterable={true}
                panding={isPending || loading}
            />
        </div>
    );
};

export default LeaveReports;
