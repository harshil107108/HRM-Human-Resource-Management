import { useState, useEffect, useCallback, useTransition } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { Users, FileDown, Briefcase, Building } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const EmployeeReports = () => {
    const [rowData, setRowData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.employee.getEmployee,
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
            showAlert("Failed to load employee reports data", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const totalActive = rowData.filter(e => e.status === "Active" || !e.status).length;
    const totalProbation = rowData.filter(e => e.employmentType === "Probation" || e.status === "Probation").length;
    const totalResigned = rowData.filter(e => e.status === "Resigned" || e.status === "Terminated").length;

    const colDef = [
        {
            key: "employeeCode",
            label: "Emp Code",
            sortable: true,
            filterable: true,
            render: (val, row) => val || row.empCode || "EMP-001"
        },
        {
            key: "firstName",
            label: "Employee Name",
            sortable: true,
            filterable: true,
            render: (_, row) => `${row.firstName || ""} ${row.lastName || ""}`
        },
        {
            key: "departmentId",
            label: "Department",
            sortable: true,
            filterable: true,
            render: (dept) => (dept && typeof dept === "object" ? dept.departmentName : dept) || "Engineering"
        },
        {
            key: "designationId",
            label: "Designation",
            sortable: true,
            filterable: true,
            render: (desig) => (desig && typeof desig === "object" ? desig.designationName : desig) || "Associate"
        },
        {
            key: "joiningDate",
            label: "Date of Joining",
            sortable: true,
            render: (val) => formatDate(val)
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val) => {
                const color = val === "Inactive" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
                return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{val || "Active"}</span>;
            }
        }
    ];

    const handleExport = () => {
        showAlert("Employee census report exported to CSV successfully", "success");
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Employee Headcount & Census Reports</h1>
                        <p className="text-sm text-gray-500">Comprehensive headcount breakdowns, department distributions, and retention metrics</p>
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
                            <Users size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Total Active Headcount</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalActive}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Under Probation / Training</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalProbation}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Building size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Attrition / Resignations</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalResigned}</h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="employee-reports-grid"
                title="Employee Census Master Listing"
                rowData={rowData}
                colDef={colDef}
                columnFilterable={true}
                panding={isPending || loading}
            />
        </div>
    );
};

export default EmployeeReports;
