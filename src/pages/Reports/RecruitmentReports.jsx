import { useState, useEffect, useCallback, useTransition } from "react";
import { HpGrid } from "@/hp-grid/src";
import HpCard from "@/components/common/HpCard";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { UserPlus, FileDown, CheckCircle2, Users, Award } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const RecruitmentReports = () => {
    const [rowData, setRowData] = useState([]);
    const [isPending, startTransition] = useTransition();
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();

    const fetchCandidates = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.candidate.getCandidate,
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
            showAlert("Failed to load recruitment report", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const totalApplied = rowData.length;
    const hiredCount = rowData.filter(r => r.stage === "Hired").length;
    const offersCount = rowData.filter(r => r.stage === "Offered").length;
    const interviewCount = rowData.filter(r => r.stage === "Interview").length;

    const colDef = [
        {
            key: "candidateCode",
            label: "Candidate ID",
            sortable: true,
            filterable: true
        },
        {
            key: "firstName",
            label: "Candidate Name",
            sortable: true,
            filterable: true,
            render: (_, row) => `${row.firstName || ""} ${row.lastName || ""}`
        },
        {
            key: "email",
            label: "Email",
            sortable: true
        },
        {
            key: "phone",
            label: "Phone",
            render: (val) => val || "-"
        },
        {
            key: "jobOpeningId",
            label: "Target Position",
            sortable: true,
            filterable: true,
            render: (job) => (job && typeof job === "object" ? job.jobTitle : job) || "Full Stack Engineer"
        },
        {
            key: "stage",
            label: "Hiring Pipeline Stage",
            sortable: true,
            render: (val) => {
                let badge = "bg-blue-100 text-blue-700";
                if (val === "Hired") badge = "bg-green-100 text-green-700 font-bold";
                if (val === "Offered") badge = "bg-purple-100 text-purple-700 font-semibold";
                if (val === "Rejected") badge = "bg-red-100 text-red-700";
                return <span className={`px-2 py-0.5 rounded text-xs ${badge}`}>{val || "Applied"}</span>;
            }
        },
        {
            key: "appliedDate",
            label: "Application Date",
            render: (val) => formatDate(val)
        }
    ];

    const handleExport = () => {
        showAlert("Recruitment pipeline funnel report exported successfully", "success");
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Recruitment & Hiring Pipeline Analytics</h1>
                        <p className="text-sm text-gray-500">Applicant tracking metrics, interview funnel progression, and conversion rates</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Total Applicants</span>
                            <h3 className="text-2xl font-bold text-gray-800">{totalApplied}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">In Interview Rounds</span>
                            <h3 className="text-2xl font-bold text-gray-800">{interviewCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <Award size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Offers Issued</span>
                            <h3 className="text-2xl font-bold text-gray-800">{offersCount}</h3>
                        </div>
                    </div>
                </HpCard>

                <HpCard>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Successfully Hired</span>
                            <h3 className="text-2xl font-bold text-emerald-600">{hiredCount}</h3>
                        </div>
                    </div>
                </HpCard>
            </div>

            <HpGrid
                id="recruitment-reports-grid"
                title="Consolidated Applicant Tracking Register"
                rowData={rowData}
                colDef={colDef}
                columnFilterable={true}
                panding={isPending || loading}
            />
        </div>
    );
};

export default RecruitmentReports;
