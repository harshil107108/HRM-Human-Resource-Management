import React from "react";
import {
    ArrowLeft,
    ArrowRight,
    ChevronRight,
    Building2,
    BriefcaseBusiness,
    UsersRound,
    Layers,
    Clock,
    ShieldCheck,
    ToggleLeft,
} from "lucide-react";

import { FormRenderer } from "@/form-engine";
import Toggle from "@hooks/Toogle";
import useDesignationConfig from "./useDesignationConfig";

const Card = ({ title, description, icon, children, className = "" }) => {
    return (
        <div
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
        >
            <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    {icon}
                </div>

                <div>
                    <h3 className="text-base font-semibold text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="p-6">{children}</div>
        </div>
    );
};

const OrganizationInformation = ({
    onNext,
    onBack,
    currentStep = 1,
    totalSteps = 7,
    formmethod,
}) => {
    const {
        jobAssignmentSchema,
        reportingStructreSchema,
        gradeSchema,
        employmentSchema,
        workSchema,
        payrollSchema,
        payrollToggleConfig,
    } = useDesignationConfig();

    const progressPercent = Math.min(
        100,
        Math.round(((currentStep + 1) / totalSteps) * 100)
    );

    return (
        <div className="w-full">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Employee Management</span>
                    <ChevronRight size={14} />
                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Organization Information
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            Configure the employee's organizational hierarchy,
                            reporting structure, employment settings and
                            payroll mapping.
                        </p>
                    </div>


                </div>
            </header>

            {/* Card grid — two columns on larger screens */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ======================= */}
                {/* Job Assignment */}
                {/* ======================= */}
                <Card
                    title="Job Assignment"
                    description="Assign the employee to the correct organizational structure."
                    icon={<Building2 className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={jobAssignmentSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Employment Details */}
                {/* ======================= */}
                <Card
                    title="Employment Details"
                    description="Configure employment lifecycle and joining information."
                    icon={<BriefcaseBusiness className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={employmentSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Reporting Structure */}
                {/* ======================= */}
                <Card
                    title="Reporting Structure"
                    description="Define reporting hierarchy and organizational relationships."
                    icon={<UsersRound className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={reportingStructreSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Grade & Level */}
                {/* ======================= */}
                <Card
                    title="Grade & Level"
                    description="Assign organizational grade, level and salary band."
                    icon={<Layers className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={gradeSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Work Information */}
                {/* ======================= */}
                <Card
                    title="Work Information"
                    description="Configure work schedule, attendance policy and office details."
                    icon={<Clock className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={workSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Payroll Mapping */}
                {/* ======================= */}
                <Card
                    title="Payroll & System Mapping"
                    description="Configure payroll group, access role and system account."
                    icon={<ShieldCheck className="h-5 w-5" />}
                >
                    <FormRenderer
                        formMethod={formmethod}
                        formSchema={payrollSchema}
                    />
                </Card>

                {/* ======================= */}
                {/* Payroll Eligibility — spans full width */}
                {/* ======================= */}
                <Card
                    title="Payroll Eligibility"
                    description="Enable or disable statutory and payroll related settings."
                    icon={<ToggleLeft className="h-5 w-5" />}
                    className="lg:col-span-2"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {payrollToggleConfig.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition-colors duration-150 hover:bg-slate-100/70"
                            >
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        {item.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Enable or disable this option for the
                                        employee.
                                    </p>
                                </div>

                                <Toggle
                                    name={item.id}
                                    formMethod={formmethod}
                                    defaultValue={item.defaultValue}
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    Next
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default OrganizationInformation;