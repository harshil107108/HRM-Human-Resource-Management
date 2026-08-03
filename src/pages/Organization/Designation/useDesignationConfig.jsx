import React from 'react'

const useDesignationConfig = () => {
    const basicInfoSchema = [
        {
            id: "designationname",
            type: "text",
            label: "Designation Name",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName'
        },
        {
            id: "designationcode",
            type: "text",
            label: "Designation Code",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "shortname",
            type: "text",
            label: "Short Name",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
    ];
    const basicInfoSchema2 = [
        {
            id: "company",
            type: "selectWrapper",
            label: "Company",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName'
        },
        {
            id: "branch",
            type: "selectWrapper",
            label: "Branch",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "department",
            type: "selectWrapper",
            label: "Department",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
    ];
    const DesignationListingColDef = [
        {
            id: "designationId",
            field: "designationId",
            headerName: "Id",
            width: 80,
        },
        {
            id: "designationName",
            field: "designationName",
            headerName: "Designation Name",
            width: 220,
        },
        {
            id: "designationCode",
            field: "designationCode",
            headerName: "Designation Code",
            width: 150,
        },
        {
            id: "shortName",
            field: "shortName",
            headerName: "Short Name",
            width: 120,
        },
        {
            id: "companyName",
            field: "companyName",
            headerName: "Company",
            width: 220,
        },
        {
            id: "branchName",
            field: "branchName",
            headerName: "Branch",
            width: 180,
        },
        {
            id: "departmentName",
            field: "departmentName",
            headerName: "Department",
            width: 180,
        },
        {
            id: "employeeCount",
            field: "employeeCount",
            headerName: "Employees",
            width: 120,
        },
        {
            id: "status",
            field: "status",
            headerName: "Status",
            width: 120,
        },
    ];

    const jobAssignmentSchema = [
        {
            id: "companyId",
            type: "selectWrapper",
            label: "Company",
            placeHolder: "Select Company",
            required: true,
            className: "col-span-6",
        },
        {
            id: "branchId",
            type: "selectWrapper",
            label: "Branch",
            placeHolder: "Select Branch",
            required: true,
            className: "col-span-6",
        },
        {
            id: "departmentId",
            type: "selectWrapper",
            label: "Department",
            placeHolder: "Select Department",
            required: true,
            className: "col-span-6",
        },
        {
            id: "designationId",
            type: "selectWrapper",
            label: "Designation",
            placeHolder: "Select Designation",
            required: true,
            className: "col-span-6",
        },
        {
            id: "businessUnitId",
            type: "selectWrapper",
            label: "Business Unit",
            placeHolder: "Select Business Unit",
            className: "col-span-6",
        },
        {
            id: "costCenterId",
            type: "selectWrapper",
            label: "Cost Center",
            placeHolder: "Select Cost Center",
            className: "col-span-6",
        },
        {
            id: "locationId",
            type: "selectWrapper",
            label: "Location",
            placeHolder: "Select Location",
            className: "col-span-6",
        },
    ];
    const employmentSchema = [
        {
            id: "employmentType",
            type: "selectWrapper",
            label: "Employment Type",
            placeHolder: "Select Employment Type",
            required: true,
            className: "col-span-6",
        },
        {
            id: "employmentStatus",
            type: "selectWrapper",
            label: "Employment Status",
            placeHolder: "Select Status",
            required: true,
            className: "col-span-6",
        },
        {
            id: "joiningDate",
            type: "date",
            label: "Date of Joining",
            required: true,
            className: "col-span-6",
        },
        {
            id: "confirmationDate",
            type: "date",
            label: "Confirmation Date",
            className: "col-span-6",
        },
        {
            id: "probationPeriod",
            type: "selectWrapper",
            label: "Probation Period",
            className: "col-span-6",
        },
        {
            id: "noticePeriod",
            type: "selectWrapper",
            label: "Notice Period",
            className: "col-span-6",
        },
    ];
    const reportingStructreSchema = [
        {
            id: "reportingManagerId",
            type: "selectWrapper",
            label: "Reporting Manager",
            required: true,
            className: "col-span-6",
        },
        {
            id: "skipLevelManagerId",
            type: "selectWrapper",
            label: "Skip Level Manager",
            className: "col-span-6",
        },
        {
            id: "departmentHeadId",
            type: "selectWrapper",
            label: "Department Head",
            className: "col-span-6",
        },
        {
            id: "mentorId",
            type: "selectWrapper",
            label: "Mentor",
            className: "col-span-6",
        },
    ];
    const gradeSchema = [
        {
            id: "jobGrade",
            type: "selectWrapper",
            label: "Job Grade",
            className: "col-span-6",
        },
        {
            id: "jobLevel",
            type: "selectWrapper",
            label: "Job Level",
            className: "col-span-6",
        },
        {
            id: "band",
            type: "selectWrapper",
            label: "Band",
            className: "col-span-6",
        },
        {
            id: "salaryGrade",
            type: "selectWrapper",
            label: "Salary Grade",
            className: "col-span-6",
        },
    ];
    const workSchema = [
        {
            id: "workingShift",
            type: "selectWrapper",
            label: "Working Shift",
            className: "col-span-6",
        },
        {
            id: "holidayCalendar",
            type: "selectWrapper",
            label: "Holiday Calendar",
            className: "col-span-6",
        },
        {
            id: "weeklyOff",
            type: "selectWrapper",
            label: "Weekly Off",
            className: "col-span-6",
        },
        {
            id: "attendancePolicy",
            type: "selectWrapper",
            label: "Attendance Policy",
            className: "col-span-6",
        },
        {
            id: "officialEmail",
            type: "text",
            label: "Official Email",
            placeHolder: "Enter Official Email",
            className: "col-span-6",
        },
        {
            id: "officialPhone",
            type: "number",
            label: "Official Phone",
            className: "col-span-6",
        },
        {
            id: "extensionNumber",
            type: "text",
            label: "Extension Number",
            className: "col-span-6",
        },
        {
            id: "workMode",
            type: "selectWrapper",
            label: "Work Mode",
            className: "col-span-6",
        },
    ];
    const payrollSchema = [
        {
            id: "payrollGroup",
            type: "selectWrapper",
            label: "Payroll Group",
            className: "col-span-6",
        },
        {
            id: "defaultRole",
            type: "selectWrapper",
            label: "Default Role",
            className: "col-span-6",
        },
        {
            id: "accessLevel",
            type: "selectWrapper",
            label: "Access Level",
            className: "col-span-6",
        },
        {
            id: "userAccount",
            type: "selectWrapper",
            label: "User Account",
            className: "col-span-6",
        },
    ];
    const payrollToggleConfig = [
        {
            id: "overtimeEligible",
            title: "Overtime Eligible",
            defaultValue: true,
        },
        {
            id: "bonusEligible",
            title: "Bonus Eligible",
            defaultValue: true,
        },
        {
            id: "pfApplicable",
            title: "PF Applicable",
            defaultValue: true,
        },
        {
            id: "esiApplicable",
            title: "ESI Applicable",
            defaultValue: false,
        },
        {
            id: "professionalTaxApplicable",
            title: "Professional Tax",
            defaultValue: true,
        },
    ];

    return {
        basicInfoSchema, basicInfoSchema2, DesignationListingColDef, jobAssignmentSchema,
        reportingStructreSchema,
        gradeSchema,
        employmentSchema,
        workSchema,
        payrollSchema,
        payrollToggleConfig
    }
}

export default useDesignationConfig