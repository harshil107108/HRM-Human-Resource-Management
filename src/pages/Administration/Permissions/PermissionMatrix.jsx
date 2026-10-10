import { useState } from "react";
import HpCard from "@/components/common/HpCard";
import { Shield, Check, Save } from "lucide-react";
import useAlert from "@/hooks/useAlert";

const MODULES = [
    {
        name: "Employee Management",
        permissions: [
            { id: "emp_view", label: "View Employees & Profiles" },
            { id: "emp_create", label: "Add New Employee" },
            { id: "emp_edit", label: "Edit Employee Details" },
            { id: "emp_delete", label: "Delete Employee Record" },
            { id: "emp_exit", label: "Process Resignation & Exit" }
        ]
    },
    {
        name: "Recruitment & Hiring",
        permissions: [
            { id: "rec_jobs", label: "Manage Job Openings" },
            { id: "rec_candidates", label: "View & Track Candidates" },
            { id: "rec_interviews", label: "Schedule Interviews" },
            { id: "rec_offers", label: "Generate Offer Letters" },
            { id: "rec_onboard", label: "Process Candidate Onboarding" }
        ]
    },
    {
        name: "Attendance & Shifts",
        permissions: [
            { id: "att_view", label: "View Attendance Logs" },
            { id: "att_punch", label: "Self Clock In / Out" },
            { id: "att_shifts", label: "Configure Shifts & Schedules" },
            { id: "att_regularize", label: "Approve Regularization Requests" }
        ]
    },
    {
        name: "Leave Management",
        permissions: [
            { id: "leave_apply", label: "Apply for Leave" },
            { id: "leave_approve", label: "Approve / Reject Leaves" },
            { id: "leave_policy", label: "Configure Leave Policies" },
            { id: "leave_balance", label: "Adjust Employee Leave Balances" }
        ]
    },
    {
        name: "Payroll & Compensation",
        permissions: [
            { id: "pay_view", label: "View Own Payslips" },
            { id: "pay_structures", label: "Configure Salary Structures" },
            { id: "pay_run", label: "Execute Monthly Payroll Run" },
            { id: "pay_disburse", label: "Authorize Bank Disbursements" },
            { id: "pay_loans", label: "Manage Employee Loans & Advances" },
            { id: "pay_claims", label: "Approve Reimbursement Claims" }
        ]
    },
    {
        name: "Performance Management",
        permissions: [
            { id: "perf_okr", label: "Set OKRs & Goals" },
            { id: "perf_review", label: "Conduct Performance Reviews" },
            { id: "perf_appraise", label: "Submit Salary Appraisals" },
            { id: "perf_feedback", label: "Give Continuous Feedback" }
        ]
    },
    {
        name: "System Administration",
        permissions: [
            { id: "admin_users", label: "Manage User Accounts" },
            { id: "admin_roles", label: "Configure Roles & Permissions" },
            { id: "admin_audit", label: "View Audit & Security Logs" },
            { id: "admin_settings", label: "Modify System Settings" }
        ]
    }
];

const ROLES = ["Super Admin", "HR Admin", "Manager", "Employee"];

const DEFAULT_MATRIX = {
    "Super Admin": MODULES.flatMap(m => m.permissions.map(p => p.id)),
    "HR Admin": [
        "emp_view", "emp_create", "emp_edit", "emp_exit",
        "rec_jobs", "rec_candidates", "rec_interviews", "rec_offers", "rec_onboard",
        "att_view", "att_punch", "att_shifts", "att_regularize",
        "leave_apply", "leave_approve", "leave_policy", "leave_balance",
        "pay_view", "pay_structures", "pay_run", "pay_claims",
        "perf_okr", "perf_review", "perf_feedback"
    ],
    "Manager": [
        "emp_view",
        "rec_candidates", "rec_interviews",
        "att_view", "att_punch", "att_regularize",
        "leave_apply", "leave_approve",
        "pay_view", "pay_claims",
        "perf_okr", "perf_review", "perf_appraise", "perf_feedback"
    ],
    "Employee": [
        "att_punch", "leave_apply", "pay_view", "perf_okr", "perf_feedback"
    ]
};

const PermissionMatrix = () => {
    const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
    const [isSaving, setIsSaving] = useState(false);
    const { showAlert } = useAlert();

    const togglePermission = (role, permId) => {
        if (role === "Super Admin") {
            showAlert("Super Admin retains all permissions by system design", "warning");
            return;
        }

        setMatrix(prev => {
            const rolePerms = prev[role] || [];
            const hasPerm = rolePerms.includes(permId);
            return {
                ...prev,
                [role]: hasPerm ? rolePerms.filter(id => id !== permId) : [...rolePerms, permId]
            };
        });
    };

    const handleSaveMatrix = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showAlert("Permission Matrix updated successfully across all roles", "success");
        }, 600);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Role-Based Access Matrix</h1>
                        <p className="text-sm text-gray-500">Fine-grained RBAC privilege configuration across standard roles</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveMatrix}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Matrix"}
                </button>
            </div>

            <HpCard title="Module Privileges Matrix">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                <th className="p-3 text-xs font-bold text-gray-600 uppercase tracking-wider w-1/3">Permission Name</th>
                                {ROLES.map(role => (
                                    <th key={role} className="p-3 text-xs font-bold text-center text-gray-600 uppercase tracking-wider">
                                        {role}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {MODULES.map(module => (
                                <tr key={`group-${module.name}`} className="bg-slate-50/60 font-semibold text-xs text-slate-700">
                                    <td colSpan={ROLES.length + 1} className="py-2.5 px-3 bg-gray-100/70 text-gray-800 font-bold uppercase tracking-wider">
                                        {module.name}
                                    </td>
                                </tr>
                            )).flatMap((groupHeader, idx) => {
                                const module = MODULES[idx];
                                return [
                                    groupHeader,
                                    ...module.permissions.map(perm => (
                                        <tr key={perm.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-2.5 px-3 text-xs font-medium text-gray-700">
                                                {perm.label}
                                            </td>
                                            {ROLES.map(role => {
                                                const checked = (matrix[role] || []).includes(perm.id);
                                                return (
                                                    <td key={role} className="py-2.5 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePermission(role, perm.id)}
                                                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer ${
                                                                checked
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-gray-100 text-transparent hover:bg-gray-200"
                                                            }`}
                                                        >
                                                            <Check size={14} className={checked ? "stroke-[3]" : "opacity-0"} />
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ];
                            })}
                        </tbody>
                    </table>
                </div>
            </HpCard>
        </div>
    );
};

export default PermissionMatrix;
