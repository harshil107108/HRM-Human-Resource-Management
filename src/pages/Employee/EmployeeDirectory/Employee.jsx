import React, { useState } from "react";

import SetupWizard from "./SetupWizard";
import { formMethod } from "@/form-engine";
import useEmployeeConfig from "./useEmployeeConfig";

import PersonalInformation from "./PersonalInformation";
import OrganizationInformation from "./OrganizationInformation";
import ContactInformation from "./ContactInformation";
import DocumentsInformation from "./DocumentsInformation";
import PayrollInformation from "./PayrollInformation";
import AccessInformation from "./AccessInformation";
import ReviewInformation from "./ReviewInformation";

const steps = [
    {
        key: "personal",
        label: "Personal",
        component: PersonalInformation,
    },
    {
        key: "organization",
        label: "Organization",
        component: OrganizationInformation,
    },
    {
        key: "contact",
        label: "Contact",
        component: ContactInformation,
    },
    {
        key: "documents",
        label: "Documents",
        component: DocumentsInformation,
    },
    {
        key: "payroll",
        label: "Payroll",
        component: PayrollInformation,
    },
    {
        key: "access",
        label: "Access",
        component: AccessInformation,
    },
    {
        key: "review",
        label: "Review",
        component: ReviewInformation,
    },
];

const Employee = () => {
    const [activeStep, setActiveStep] = useState(0);

    const {
        personalInformationSchema,
        organizationInformationSchema,
        contactInformationSchema,
        documentInformationSchema,
        payrollInformationSchema,
        accessInformationSchema,
        reviewInformationSchema,
    } = useEmployeeConfig();

    const initialValue = {
        // Personal
        employeeId: "EMP-0001",
        profilePhoto: null,
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        maritalStatus: "",
        bloodGroup: "",

        // Organization
        company: "",
        branch: "",
        department: "",
        designation: "",
        reportingManager: "",
        employmentType: "",
        joiningDate: "",

        // Contact
        mobileNumber: "",
        alternateNumber: "",
        personalEmail: "",
        officeEmail: "",
        addressLine1: "",
        addressLine2: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",

        // Documents
        aadhaarNumber: "",
        panNumber: "",
        passportNumber: "",
        uanNumber: "",
        esicNumber: "",

        // Payroll
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        salaryStructure: "",
        paymentMode: "",

        // Access
        username: "",
        password: "",
        confirmPassword: "",
        role: "",
        allowLogin: true,

        // Review
        remarks: "",
    };

    const formmethod = formMethod.createForm({
        schema: [
            ...personalInformationSchema,
            ...organizationInformationSchema,
            ...contactInformationSchema,
            ...documentInformationSchema,
            ...payrollInformationSchema,
            ...accessInformationSchema,
            ...reviewInformationSchema,
        ],
        initialValue,
    });

    const handleNext = () => {
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleStepSelect = (index) => {
        setActiveStep(index);
    };

    const CurrentStepComponent = steps[activeStep].component;

    return (
        <div className="min-h-screen rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_4px_10px_rgba(0,0,0,0.03),0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex max-w-7xl gap-8">
                <main className="flex-1">
                    <CurrentStepComponent
                        formmethod={formmethod}
                        currentStep={activeStep}
                        totalSteps={steps.length}
                        onNext={handleNext}
                        onBack={handleBack}
                        onStepSelect={handleStepSelect}
                    />
                </main>

                <aside className="mt-28">
                    <SetupWizard
                        steps={steps}
                        activeStep={activeStep}
                        onStepSelect={handleStepSelect}
                    />
                </aside>
            </div>
        </div>
    );
};

export default Employee;