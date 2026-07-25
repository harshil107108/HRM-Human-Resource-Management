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

    const jobAssignmentSchema = [
        {
            id: "company",
            type: "selectWrapper",
            label: "Company",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName',
            className: 'col-span-2'
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
            placeHolder: "",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        }, {
            id: "jobfamily",
            type: "selectWrapper",
            label: "Job Family",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName'
        },
        {
            id: "function",
            type: "selectWrapper",
            label: "Function",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "designationcatagory",
            type: "selectWrapper",
            label: "Designation Catagory",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
    ];
    const reportingStructreSchema = [
        {
            id: "reporting_to",
            type: "selectWrapper",
            label: "Reporting To(Manager)",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName',
            className: 'col-span-2'
        },
        {
            id: "skiplevelmanager",
            type: "selectWrapper",
            label: "Skip Level Manager",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",

        },
        {
            id: "department",
            type: "selectWrapper",
            label: "Department",
            placeHolder: "",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        }, {
            id: "jobfamily",
            type: "selectWrapper",
            label: "Job Family",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName'
        },
    ];
    const gradeSchema = [];
    const employmentSchema = [];
    const workSchema = [];
    const payrollSchema = [];

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

    const DesignationListingColDef = [];
    return {
        basicInfoSchema, basicInfoSchema2, DesignationListingColDef, jobAssignmentSchema,
        reportingStructreSchema,
        gradeSchema,
        employmentSchema,
        workSchema,
        payrollSchema,
    }
}

export default useDesignationConfig