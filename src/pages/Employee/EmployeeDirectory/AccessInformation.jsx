import React, { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    Save,
    Shield,
    UserCog,
    KeyRound,
    Mail,
    CheckCircle2,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";
import Toggle from "@hooks/Toogle"; // Update according to your project

const PermissionCard = ({
    title,
    description,
    checked,
    onChange,
}) => {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50">

            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <div>

                <h4 className="text-sm font-semibold text-slate-800">
                    {title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>

            </div>

        </label>
    );
};

const AccessInformation = ({
    onNext,
    onBack,
    currentStep = 0,
    totalSteps = 7,
    formmethod,
}) => {


    const { accessInformationSchema } = useEmployeeConfig();
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

    const [accountActive, setAccountActive] = useState(true);

    const [permissions, setPermissions] = useState({
        financialView: false,
        leaveApproval: true,
        orgChartAdmin: false,
        directoryAccess: true,
    });

    const togglePermission = (key, value) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

        let password = "";

        for (let i = 0; i < 12; i++) {
            password += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }

        formmethod?.setValue("password", password);
    };

    return (
        <div className="w-full">

            {/* Header */}

            <header className="mb-7">

                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">

                    <span>Employee Management</span>

                    <ChevronRight className="h-3 w-3" />

                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>

                </div>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Access Information
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Configure employee login credentials, roles and permissions.
                </p>

            </header>

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT */}

                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* User Credentials */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        {/* Header */}

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <KeyRound className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    User Credentials
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Primary authentication details
                                </p>
                            </div>

                        </div>

                        {/* Username + Generate Password */}

                        <div className="grid grid-cols-12 gap-4 items-end">

                            <div className="col-span-8">
                                <FormRenderer
                                    formMethod={formmethod}
                                    formSchema={accessInformationSchema.slice(0, 1)}
                                />
                            </div>

                            <div className="col-span-4">

                                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-transparent">
                                    Action
                                </label>

                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="
                    flex
                    h-[42px]
                    w-full
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    text-sm
                    font-semibold
                    text-slate-700
                    transition-all
                    hover:border-indigo-300
                    hover:bg-indigo-50
                    hover:text-indigo-600
                "
                                >
                                    Generate Password
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* Access Control */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                                <UserCog size={18} />

                            </div>

                            <div>

                                <h2 className="text-base font-semibold text-slate-900">
                                    Access Control
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Roles and permissions architecture
                                </p>

                            </div>

                        </div>

                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={accessInformationSchema.slice(2)}
                        />

                    </div>

                    {/* Extended Permissions */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-5 text-base font-semibold text-slate-900">
                            Extended Permissions
                        </h2>

                        <div className="grid grid-cols-2 gap-4">

                            <PermissionCard
                                title="Financial View"
                                description="Access payroll and salary information."
                                checked={permissions.financialView}
                                onChange={(value) =>
                                    togglePermission("financialView", value)
                                }
                            />

                            <PermissionCard
                                title="Leave Approval"
                                description="Approve employee leave requests."
                                checked={permissions.leaveApproval}
                                onChange={(value) =>
                                    togglePermission("leaveApproval", value)
                                }
                            />

                            <PermissionCard
                                title="Org Chart Admin"
                                description="Manage reporting hierarchy."
                                checked={permissions.orgChartAdmin}
                                onChange={(value) =>
                                    togglePermission("orgChartAdmin", value)
                                }
                            />

                            <PermissionCard
                                title="Directory Access"
                                description="View employee contact details."
                                checked={permissions.directoryAccess}
                                onChange={(value) =>
                                    togglePermission("directoryAccess", value)
                                }
                            />

                        </div>

                    </div>

                </div>

                {/* RIGHT SIDEBAR */}

                <div className="col-span-12 lg:col-span-4 space-y-6">

                    <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 p-6 text-white shadow-lg">

                        <div className="mb-5 flex items-center gap-2">

                            <Shield size={18} />

                            <h2 className="font-semibold">
                                Account Configuration
                            </h2>

                        </div>

                        <Toggle
                            title="Send Welcome Email"
                            description="Trigger onboarding instructions."
                            value={sendWelcomeEmail}
                            onChange={setSendWelcomeEmail}
                        />

                        <Toggle
                            title="Account Active"
                            description="Enable login immediately."
                            value={accountActive}
                            onChange={setAccountActive}
                        />

                        <div className="mt-6 rounded-xl bg-white/10 p-4">

                            <div className="flex gap-3">

                                <CheckCircle2
                                    size={18}
                                    className="mt-1 shrink-0"
                                />

                                <p className="text-xs leading-5 text-white/90">
                                    Activating this account will generate secure
                                    credentials and allow employee login after
                                    onboarding.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Security Card */}

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">

                            <Shield
                                size={70}
                                className="text-indigo-600"
                            />

                        </div>

                        <div className="p-5">

                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                Security Protocol
                            </h3>

                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                All system access is monitored under the
                                Corporate Compliance Policy.
                                Multi-factor authentication can be enabled
                                after employee onboarding for additional
                                security.
                            </p>

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div className="flex items-start gap-3">

                                    <Mail
                                        size={18}
                                        className="mt-1 text-indigo-600 shrink-0"
                                    />

                                    <div>

                                        <h4 className="text-sm font-semibold text-slate-800">
                                            Welcome Email
                                        </h4>

                                        <p className="mt-1 text-xs text-slate-500 leading-5">
                                            Login credentials and onboarding
                                            instructions will be emailed to the
                                            employee automatically.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Footer */}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
                >
                    <ArrowLeft size={16} />
                    Previous
                </button>

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        <Save size={16} />
                        Save Draft
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Next
                        <ArrowRight size={16} />
                    </button>

                </div>

            </div>

        </div>
    );
};

export default AccessInformation;