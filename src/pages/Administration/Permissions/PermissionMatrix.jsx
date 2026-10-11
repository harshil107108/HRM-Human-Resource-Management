import { Fragment, useMemo, useState } from "react";
import {
    Shield,
    Save,
    RotateCcw,
    Search,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    Lock,
    Users,
    Briefcase,
    Clock,
    CalendarDays,
    Wallet,
    TrendingUp,
    Settings,
    KeyRound,
    X,
} from "lucide-react";
import useAlert from "@/hooks/useAlert";
import HpCheckbox from "@/components/common/HpCheckbox";

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

// ---------------------------------------------------------------------------
// Presentation only (data above is unchanged)
// ---------------------------------------------------------------------------

const LOCKED_ROLE = "Super Admin";

const MODULE_STYLE = {
    "Employee Management": { icon: Users, tile: "bg-sky-50 text-sky-600 ring-sky-100" },
    "Recruitment & Hiring": { icon: Briefcase, tile: "bg-violet-50 text-violet-600 ring-violet-100" },
    "Attendance & Shifts": { icon: Clock, tile: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    "Leave Management": { icon: CalendarDays, tile: "bg-amber-50 text-amber-600 ring-amber-100" },
    "Payroll & Compensation": { icon: Wallet, tile: "bg-teal-50 text-teal-600 ring-teal-100" },
    "Performance Management": { icon: TrendingUp, tile: "bg-rose-50 text-rose-600 ring-rose-100" },
    "System Administration": { icon: Settings, tile: "bg-slate-100 text-slate-600 ring-slate-200" },
};

const ROLE_STYLE = {
    "Super Admin": { bar: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-700" },
    "HR Admin": { bar: "bg-sky-500", chip: "bg-sky-50 text-sky-700" },
    "Manager": { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
    "Employee": { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700" },
};

const TOTAL_PERMISSIONS = MODULES.reduce((sum, m) => sum + m.permissions.length, 0);

// "all" | "some" | "none" for a role over a set of permission ids.
const coverage = (granted, ids) => {
    if (!ids.length) return "none";
    const count = ids.filter((id) => granted.has(id)).length;
    if (count === 0) return "none";
    return count === ids.length ? "all" : "some";
};

const sameMatrix = (a, b) =>
    ROLES.every((role) => {
        const x = new Set(a[role] || []);
        const y = b[role] || [];
        return x.size === y.length && y.every((id) => x.has(id));
    });

const PermissionMatrix = () => {
    const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
    const [savedMatrix, setSavedMatrix] = useState(DEFAULT_MATRIX);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(() => new Set(MODULES.map((m) => m.name)));
    const { showAlert } = useAlert();

    const grantedByRole = useMemo(
        () => Object.fromEntries(ROLES.map((role) => [role, new Set(matrix[role] || [])])),
        [matrix],
    );

    const isDirty = !sameMatrix(matrix, savedMatrix);

    // Search filters permissions (or whole modules by name).
    const query = search.trim().toLowerCase();
    const visibleModules = useMemo(() => {
        if (!query) return MODULES;
        return MODULES.map((module) => {
            if (module.name.toLowerCase().includes(query)) return module;
            const permissions = module.permissions.filter(
                (p) => p.label.toLowerCase().includes(query) || p.id.toLowerCase().includes(query),
            );
            return permissions.length ? { ...module, permissions } : null;
        }).filter(Boolean);
    }, [query]);

    const visibleIds = visibleModules.flatMap((m) => m.permissions.map((p) => p.id));

    // ---------------------------------------------------------------------
    // Mutations (Super Admin is fixed by design)
    // ---------------------------------------------------------------------
    const setRolePermissions = (role, ids, grant) => {
        if (role === LOCKED_ROLE) {
            showAlert("Super Admin retains all permissions by system design", "warning");
            return;
        }
        setMatrix((prev) => {
            const next = new Set(prev[role] || []);
            ids.forEach((id) => (grant ? next.add(id) : next.delete(id)));
            return { ...prev, [role]: [...next] };
        });
    };

    const togglePermission = (role, permId) => {
        setRolePermissions(role, [permId], !grantedByRole[role].has(permId));
    };

    // Module / column toggles: if everything is granted, clear; otherwise grant all.
    const toggleGroup = (role, ids) => {
        setRolePermissions(role, ids, coverage(grantedByRole[role], ids) !== "all");
    };

    const handleSaveMatrix = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSavedMatrix(matrix);
            showAlert("Permission Matrix updated successfully across all roles", "success");
        }, 600);
    };

    const handleReset = () => setMatrix(savedMatrix);

    const toggleModule = (name) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });

    const allExpanded = MODULES.every((m) => expanded.has(m.name));
    const setAllExpanded = (open) => setExpanded(open ? new Set(MODULES.map((m) => m.name)) : new Set());

    return (
        <div className="p-4 space-y-5">
            {/* ------------------------------------------------------------ */}
            {/* Header                                                       */}
            {/* ------------------------------------------------------------ */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-sky-500 via-indigo-500 to-violet-500" />
                <div className="flex flex-col gap-4 p-5 pl-7 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Role-Based Access Matrix</h1>
                            <p className="text-sm text-slate-500">
                                Fine-grained RBAC privilege configuration across standard roles
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 md:inline-flex">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                Unsaved changes
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={!isDirty || isSaving}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveMatrix}
                            disabled={!isDirty || isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />
                            {isSaving ? "Saving..." : "Save Matrix"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Role summary                                                 */}
            {/* ------------------------------------------------------------ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ROLES.map((role) => {
                    const count = grantedByRole[role].size;
                    const pct = Math.round((count / TOTAL_PERMISSIONS) * 100);
                    const style = ROLE_STYLE[role];
                    return (
                        <div key={role} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.chip}`}>
                                    {role === LOCKED_ROLE ? <Lock size={11} /> : <KeyRound size={11} />}
                                    {role}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">{pct}%</span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-800">
                                {count}
                                <span className="text-sm font-semibold text-slate-400"> / {TOTAL_PERMISSIONS}</span>
                            </p>
                            <p className="text-[11px] font-medium text-slate-500">permissions granted</p>
                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${style.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Permission tree                                              */}
            {/* ------------------------------------------------------------ */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-1 rounded-full bg-[#2999a8]" />
                        <h2 className="text-[13px] font-bold tracking-wide text-slate-700">Module Privileges</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            {MODULES.length} modules · {TOTAL_PERMISSIONS} permissions
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search permissions…"
                                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAllExpanded(!allExpanded)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            {allExpanded ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
                            {allExpanded ? "Collapse all" : "Expand all"}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="w-[38%] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Permission
                                </th>
                                {ROLES.map((role) => {
                                    const state = coverage(grantedByRole[role], visibleIds);
                                    const locked = role === LOCKED_ROLE;
                                    return (
                                        <th key={role} className="px-3 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                    {locked && <Lock size={11} className="text-indigo-500" />}
                                                    {role}
                                                </span>
                                                <HpCheckbox
                                                    size="sm"
                                                    checked={state === "all"}
                                                    indeterminate={state === "some"}
                                                    disabled={locked || visibleIds.length === 0}
                                                    onChange={() => toggleGroup(role, visibleIds)}
                                                    ariaLabel={`Toggle all ${query ? "matching " : ""}permissions for ${role}`}
                                                    title={locked ? "Super Admin always has every permission" : `Grant or revoke all${query ? " matching" : ""} permissions`}
                                                />
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {visibleModules.length === 0 && (
                                <tr>
                                    <td colSpan={ROLES.length + 1} className="px-4 py-12 text-center">
                                        <Search size={22} className="mx-auto text-slate-300" />
                                        <p className="mt-2 text-sm font-semibold text-slate-600">No permissions match “{search}”</p>
                                        <p className="text-xs text-slate-400">Try a different keyword.</p>
                                    </td>
                                </tr>
                            )}

                            {visibleModules.map((module) => {
                                const style = MODULE_STYLE[module.name] || { icon: Shield, tile: "bg-slate-100 text-slate-600 ring-slate-200" };
                                const ModuleIcon = style.icon;
                                const ids = module.permissions.map((p) => p.id);
                                // Searching always shows the matches.
                                const isOpen = Boolean(query) || expanded.has(module.name);

                                return (
                                    <Fragment key={module.name}>
                                        {/* Module (parent) row */}
                                        <tr className="border-b border-slate-100 bg-white transition-colors hover:bg-sky-50/40">
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModule(module.name)}
                                                    aria-expanded={isOpen}
                                                    className="flex w-full items-center gap-3 text-left"
                                                >
                                                    <ChevronRight
                                                        size={16}
                                                        className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                                                    />
                                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${style.tile}`}>
                                                        <ModuleIcon size={16} />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-[13px] font-bold text-slate-800">
                                                            {module.name}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            {module.permissions.length} permission{module.permissions.length > 1 ? "s" : ""}
                                                        </span>
                                                    </span>
                                                </button>
                                            </td>
                                            {ROLES.map((role) => {
                                                const granted = grantedByRole[role];
                                                const state = coverage(granted, ids);
                                                const count = ids.filter((id) => granted.has(id)).length;
                                                return (
                                                    <td key={role} className="px-3 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <HpCheckbox
                                                                checked={state === "all"}
                                                                indeterminate={state === "some"}
                                                                disabled={role === LOCKED_ROLE}
                                                                onChange={() => toggleGroup(role, ids)}
                                                                ariaLabel={`Toggle ${module.name} for ${role}`}
                                                            />
                                                            <span
                                                                className={`text-[10px] font-bold ${
                                                                    state === "all" ? "text-sky-600" : state === "some" ? "text-amber-600" : "text-slate-300"
                                                                }`}
                                                            >
                                                                {count}/{ids.length}
                                                            </span>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Permission (child) rows */}
                                        {isOpen &&
                                            module.permissions.map((perm, index) => {
                                                const isLast = index === module.permissions.length - 1;
                                                return (
                                                    <tr
                                                        key={perm.id}
                                                        className={`bg-slate-50/40 transition-colors hover:bg-sky-50/50 ${isLast ? "border-b border-slate-200" : "border-b border-slate-100/70"}`}
                                                    >
                                                        <td className="py-2.5 pl-4 pr-4">
                                                            <div className="relative flex items-center pl-[46px]">
                                                                {/* Tree guide lines */}
                                                                <span
                                                                    className={`absolute left-[27px] w-px bg-slate-200 ${isLast ? "-top-2.5 h-[calc(50%+10px)]" : "-top-2.5 -bottom-2.5"}`}
                                                                />
                                                                <span className="absolute left-[27px] top-1/2 h-px w-3.5 bg-slate-200" />
                                                                <span className="text-xs font-medium text-slate-700">{perm.label}</span>
                                                                <code className="ml-2 hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 lg:inline">
                                                                    {perm.id}
                                                                </code>
                                                            </div>
                                                        </td>
                                                        {ROLES.map((role) => (
                                                            <td key={role} className="px-3 py-2.5 text-center">
                                                                <HpCheckbox
                                                                    checked={grantedByRole[role].has(perm.id)}
                                                                    disabled={role === LOCKED_ROLE}
                                                                    onChange={() => togglePermission(role, perm.id)}
                                                                    ariaLabel={`${perm.label} for ${role}`}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-[11px] font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                        <HpCheckbox size="sm" checked decorative />
                        Granted
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <HpCheckbox size="sm" indeterminate decorative />
                        Partly granted (module)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <HpCheckbox size="sm" decorative />
                        Not granted
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Lock size={12} className="text-indigo-500" />
                        Super Admin is locked to full access
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PermissionMatrix;
