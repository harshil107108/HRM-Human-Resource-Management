import React from 'react'

const useDepatmentConfig = () => {
    const DepartmentListingColDef = [];
    const basicInfoSchema = [
        {
            id: "departmentname",
            type: "text",
            label: "Department Name",
            placeHolder: "e.g. Acme Corporation",
            required: true,
            nextFocusField: "legalName",
            prevFocusField: 'companyName'
        },
        {
            id: "departmentcode",
            type: "text",
            label: "Department Code",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "company",
            type: "selectWrapper",
            label: "Company",
            placeHolder: "e.g. ACM-01",
            required: true,
            prevFocusField: "legalName",
            nextFocusField: "businessEmail",
        },
        {
            id: "branch",
            type: "selectWrapper",
            label: "Branch",
            placeHolder: "admin@company.com",
            required: true,
            prevFocusField: "companyCode",
            nextFocusField: "phone",
        },
        {
            id: "parentdepartment",
            type: "selectWrapper",
            label: "Parent Department",
            placeHolder: "admin@company.com",
            required: true,
            prevFocusField: "companyCode",
            nextFocusField: "phone",
        },
        {
            id: "shortname",
            type: "text",
            label: "Short Name",
            placeHolder: "https://www.company.com",
            required: true,
            prevFocusField: "phone",
        },
    ];

    const managementSchema = [
        {
            id: "departmenthead",
            type: "selectWrapper",
            label: "Department Head",
            placeHolder: "admin@company.com",
            required: true,
            prevFocusField: "companyCode",
            nextFocusField: "phone",
        },
        {
            id: "reportingdepartment",
            type: "selectWrapper",
            label: "Reporting Department",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "businessunit",
            type: "selectWrapper",
            label: "Business Unit",
            placeHolder: "e.g. ACM-01",
            required: true,
            prevFocusField: "legalName",
            nextFocusField: "businessEmail",
        },
        {
            id: "costcentercode",
            type: "selectWrapper",
            label: "Cost Center Code",
            placeHolder: "admin@company.com",
            required: true,
            prevFocusField: "companyCode",
            nextFocusField: "phone",
        },

    ];

    const employeeSchema = [
        {
            id: "employeecapacity",
            type: "number",
            label: "Employee Capacity",
            placeHolder: "e.g. Acme Corp LLC",
            required: true,
            prevFocusField: "companyName",
            nextFocusField: "companyCode",
        },
        {
            id: "curremployeecount",
            type: "number",
            label: "Current Employee Count",
            placeHolder: "e.g. ACM-01",
            required: true,
            prevFocusField: "legalName",
            nextFocusField: "businessEmail",
        },
    ];


    return {
        DepartmentListingColDef,
        basicInfoSchema,
        managementSchema,
        employeeSchema
    }
}

export default useDepatmentConfig