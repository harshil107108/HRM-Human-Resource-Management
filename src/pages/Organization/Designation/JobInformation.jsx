import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { FormRenderer } from "@/form-engine";
import useDesignationConfig from "./useDesignationConfig";

const Card = ({ title, children }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    {title}
                </h3>
            </div>

            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

const Organization = ({
    onNext,
    onBack,
    currentStep = 0,
    totalSteps = 4,
    formmethod,
}) => {
    const {
        jobAssignmentSchema,
        reportingStructreSchema,
        gradeSchema,
        employmentSchema,
        workSchema,
        payrollSchema,
    } = useDesignationConfig();

    return (
        <div className="w-full">

            {/* Header */}

            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    <span>Organization Setup</span>
                    <ChevronRight size={14} />
                    <span>
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Job Information
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    define job related details,reporting structure,grade and employeement setting .
                </p>
            </div>

            {/* Body */}

            <div className="space-y-6">

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <Card title="Job Assignment">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={jobAssignmentSchema}
                        />
                    </Card>

                    <Card title="Reporting Structure">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={reportingStructreSchema}
                        />
                    </Card>

                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <Card title="Grade & Level">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={gradeSchema}
                        />
                    </Card>

                    <Card title="Employment Details">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={employmentSchema}
                        />
                    </Card>

                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <Card title="Work Information">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={workSchema}
                        />
                    </Card>

                    <Card title="Payroll Mapping">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={payrollSchema}
                        />
                    </Card>

                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card title="Additional Information">
                        <FormRenderer
                            formMethod={formmethod}
                            formSchema={workSchema}
                        />
                    </Card>
                </div>

            </div>

            {/* Footer */}

            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">

                <button
                    type="button"
                    onClick={onBack}
                    disabled={currentStep === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    Next
                    <ArrowRight size={16} />
                </button>

            </div>

        </div>
    );
};

export default Organization;