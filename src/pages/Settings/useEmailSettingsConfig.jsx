import { useMemo } from "react";

export const DEFAULT_TEMPLATES = {
    welcome_employee: {
        id: "welcome_employee",
        name: "New Employee Onboarding Welcome",
        subject: "Welcome to {{companyName}}, {{employeeName}}! 🚀",
        body: `Dear {{employeeName}},

We are thrilled to welcome you to the team as our new {{designation}} in the {{department}} team!

Your employee portal credentials:
Username: {{username}}
Temporary Password: {{temporaryPassword}}
Portal URL: https://hrm.orvexa.io

Please log in on your first day ({{joiningDate}}) to complete your profile and submit compliance documents.

Warm regards,
HR Operations Team
{{companyName}}`,
    },
    offer_letter: {
        id: "offer_letter",
        name: "Job Offer Letter Delivery",
        subject: "Formal Offer of Employment: {{jobTitle}} at {{companyName}}",
        body: `Dear {{candidateName}},

Following your recent interviews, we are delighted to offer you the position of {{jobTitle}} at {{companyName}}.

Attached to this email, please find your formal Offer Letter outlining compensation of ₹{{annualCTC}} CTC, benefits, and employment terms.

Please sign and return the acceptance copy by {{acceptanceDeadline}}.

Sincerely,
Talent Acquisition Team`,
    },
    payslip_ready: {
        id: "payslip_ready",
        name: "Monthly Payslip Release Notification",
        subject: "Your Payslip for {{month}} {{year}} is now available",
        body: `Dear {{employeeName}},

Your payslip for {{month}} {{year}} has been generated and disbursed into your registered bank account.

Net Compensation: ₹{{netSalary}}
Disbursement Reference: {{transactionRef}}

You can download your detailed PDF salary statement directly from your HRM Employee Self-Service Portal.

Best regards,
Finance & Payroll Team`,
    },
    leave_approved: {
        id: "leave_approved",
        name: "Leave Request Approval Notice",
        subject: "Leave Request Approved: {{startDate}} to {{endDate}}",
        body: `Hello {{employeeName}},

Your request for {{leaveType}} from {{startDate}} to {{endDate}} ({{days}} day(s)) has been approved by your reporting manager {{managerName}}.

Your updated remaining balance for {{leaveType}}: {{remainingBalance}} days.

Have a great time off!

HR Department`,
    },
};

const useEmailSettingsConfig = ({ onTemplateChange } = {}) => {
    const initialValue = useMemo(() => ({
        smtpHost: "smtp.office365.com",
        smtpPort: 587,
        senderEmail: "hrm@orvexa.io",
        senderName: "Orvexa HRM System",
        enableSsl: true,
        templateKey: "welcome_employee",
        subject: DEFAULT_TEMPLATES.welcome_employee.subject,
        body: DEFAULT_TEMPLATES.welcome_employee.body,
    }), []);

    const smtpSchema = useMemo(() => [
        {
            id: "smtpHost",
            name: "smtpHost",
            label: "SMTP Relay Host / Server",
            type: "text",
            placeHolder: "smtp.sendgrid.net or smtp.gmail.com",
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "smtpPort",
            name: "smtpPort",
            label: "SMTP Port (TLS / SSL)",
            type: "number",
            placeHolder: "587",
            min: 25,
            max: 65535,
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "senderEmail",
            name: "senderEmail",
            label: "Default Sender Email Address",
            type: "text",
            placeHolder: "no-reply@company.com",
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "senderName",
            name: "senderName",
            label: "Sender Display Name",
            type: "text",
            placeHolder: "HexaCorp HRM System",
            className: "col-span-12 md:col-span-6",
            required: true,
        },
        {
            id: "enableSsl",
            name: "enableSsl",
            label: "Enforce Secure SSL / TLS Protocol",
            description: "Encrypt all outgoing SMTP relay packets over TLS socket",
            type: "checkbox",
            className: "col-span-12",
        },
    ], []);

    const templateSchema = useMemo(() => [
        {
            id: "templateKey",
            name: "templateKey",
            label: "Select Email Template to Customize",
            type: "selectWrapper",
            placeHolder: "Choose template...",
            className: "col-span-12",
            options: [
                { label: "New Employee Onboarding Welcome", value: "welcome_employee" },
                { label: "Job Offer Letter Delivery", value: "offer_letter" },
                { label: "Monthly Payslip Release Notification", value: "payslip_ready" },
                { label: "Leave Request Approval Notice", value: "leave_approved" },
            ],
            onChange: (val) => {
                onTemplateChange?.(val);
            },
        },
        {
            id: "subject",
            name: "subject",
            label: "Email Subject Line",
            type: "text",
            placeHolder: "Enter email subject line",
            className: "col-span-12",
            required: true,
        },
        {
            id: "body",
            name: "body",
            label: "Email Body Template (Supports {{placeholders}})",
            type: "textarea",
            placeHolder: "Type the body template...",
            rows: 10,
            className: "col-span-12",
            required: true,
        },
    ], [onTemplateChange]);

    const emailConfigSchema = useMemo(() => [
        ...smtpSchema,
        ...templateSchema,
    ], [smtpSchema, templateSchema]);

    return {
        initialValue,
        smtpSchema,
        templateSchema,
        emailConfigSchema,
    };
};

export default useEmailSettingsConfig;
