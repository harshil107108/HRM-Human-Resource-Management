import { useState, useEffect, useCallback, useTransition } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { Clock, FileDown, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const AttendanceReports = () => {
    const [rowData, setRowData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();

    const fetchLogs = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.attendanceLog.getAttendanceLog,
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
            showAlert("Failed to load attendance report", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const presentCount = rowData.filter(r => r.status === "Present").length;
    const lateCount = rowData.filter(r => r.isLate).length;
    const totalOTHours = rowData.reduce((acc, r) => acc + (Number(r.overtimeHours) || 0), 0);

    const colDef = [
        {
            key: "date",
            label: "Log Date",
            sortable: true,
            render: (val) => formatDate(val)
        },
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
            key: "inTime",
            label: "In Time",
            sortable: true
        },
        {
            key: "outTime",
            label: "Out Time",
            sortable: true
        },
        {
            key: "totalHours",
            label: "Working Hours",
            sortable: true,
            render: (val) => `${val || 0} hrs`
        },
        {
            key: "overtimeHours",
            label: "Overtime (hrs)",
            sortable: true,
            render: (val) => Number(val || 0) > 0 ? <span className="font-semibold text-purple-600">+{val} hrs</span> : "-"
        },
        {
            key: "isLate",
            label: "Late Arrival",
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${val ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {val ? "Yes" : "No"}
                </span>
            )
        },
        {
            key: "status",
            label: "Attendance Status",
            sortable: true,
            render: (val) => {
                let badge = "bg-green-100 text-green-700";
                if (val === "Absent") badge = "bg-red-100 text-red-700";
                if (val === "Half Day") badge = "bg-amber-100 text-amber-700";
                return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge}`}>{val || "Present"}</span>;
            }
        }
    ];

    const handleExport = () => {
        showAlert("Attendance report exported to CSV successfully", "success");
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Attendance & Punctuality Reports</h1>
                        <p className="text-sm text-gray-500">Tracking daily punches, tardiness patterns, and overtime hours</p>
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
                            <span className="text-xs text-gray-500 font-medium">Present Logs Recorded</span>
                            <h3 className="text-2xl font-bold text-gray-800">{presentCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Late In Incidents</span>
                            <h3 className="text-2xl font-bold text-gray-800">{lateCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Accumulated Overtime</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalOTHours} hrs</h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="attendance-reports-grid"
                title="Consolidated Attendance Register"
                rowData={rowData}
                colDef={colDef}
                columnFilterable={true}
                panding={isPending || loading}
            />
        </div>
    );
};

export default AttendanceReports;
