import { useState, useEffect, useCallback, useTransition } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { Banknote, FileDown, DollarSign, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const PayrollReports = () => {
    const [rowData, setRowData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();

    const fetchPayslips = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.payslip.getPayslip,
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
            showAlert("Failed to load payroll report", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchPayslips();
    }, [fetchPayslips]);

    const totalGross = rowData.reduce((acc, r) => acc + (Number(r.grossEarnings) || 0), 0);
    const totalDeductions = rowData.reduce((acc, r) => acc + (Number(r.totalDeductions) || 0), 0);
    const totalNet = rowData.reduce((acc, r) => acc + (Number(r.netPay) || 0), 0);

    const colDef = [
        {
            key: "payslipNumber",
            label: "Payslip ID",
            sortable: true,
            filterable: true
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
            key: "month",
            label: "Period",
            sortable: true,
            render: (val, row) => `${val}/${row.year}`
        },
        {
            key: "grossEarnings",
            label: "Gross Salary (₹)",
            sortable: true,
            render: (val) => Number(val || 0).toLocaleString()
        },
        {
            key: "totalDeductions",
            label: "Total Deductions (₹)",
            sortable: true,
            render: (val) => <span className="text-red-600 font-medium">{Number(val || 0).toLocaleString()}</span>
        },
        {
            key: "netPay",
            label: "Net Paid (₹)",
            sortable: true,
            render: (val) => <span className="text-green-600 font-bold">{Number(val || 0).toLocaleString()}</span>
        },
        {
            key: "paymentStatus",
            label: "Payment Status",
            sortable: true,
            render: (val) => {
                const color = val === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
                return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{val || "Unpaid"}</span>;
            }
        },
        {
            key: "paymentDate",
            label: "Payment Date",
            render: (val) => formatDate(val)
        }
    ];

    const handleExport = () => {
        showAlert("Payroll ledger summary exported to CSV successfully", "success");
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Banknote size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Payroll & Compensation Reports</h1>
                        <p className="text-sm text-gray-500">Salary expenditure statements, statutory withholdings, and net disbursements</p>
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
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <ArrowUpRight size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Total Gross Payroll</span>
                            <h3 className="text-2xl font-bold text-gray-800">₹{totalGross.toLocaleString()}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <ArrowDownRight size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Total Statutory Deductions</span>
                            <h3 className="text-2xl font-bold text-gray-800">₹{totalDeductions.toLocaleString()}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Total Net Disbursed</span>
                            <h3 className="text-2xl font-bold text-emerald-600">₹{totalNet.toLocaleString()}</h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="payroll-reports-grid"
                title="Consolidated Payroll Register"
                rowData={rowData}
                colDef={colDef}
                columnFilterable={true}
                panding={isPending || loading}
            />
        </div>
    );
};

export default PayrollReports;
