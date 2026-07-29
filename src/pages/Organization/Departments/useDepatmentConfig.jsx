import React from 'react'

const useDepatmentConfig = () => {
    const DepartmentListingColDef = [];
    const basicInfoSchema = [
        {
            id: "departmentname",
            type: "text",
            label: "Department Name",
            placeHolder: "e.g. Human Resources",
            required: true,
            prevFocusField: null,
            nextFocusField: "departmentcode",
        },
        {
            id: "departmentcode",
            type: "text",
            label: "Department Code",
            placeHolder: "e.g. HR001",
            required: true,
            prevFocusField: "departmentname",
            nextFocusField: "company",
        },
        {
            id: "company",
            type: "selectWrapper",
            label: "Company",
            required: true,
            prevFocusField: "departmentcode",
            nextFocusField: "branch",
        },
        {
            id: "branch",
            type: "selectWrapper",
            label: "Branch",
            required: true,
            prevFocusField: "company",
            nextFocusField: "parentdepartment",
        },
        {
            id: "parentdepartment",
            type: "selectWrapper",
            label: "Parent Department",
            required: false,
            prevFocusField: "branch",
            nextFocusField: "shortname",
        },
        {
            id: "shortname",
            type: "text",
            label: "Short Name",
            placeHolder: "e.g. HR",
            required: false,
            prevFocusField: "parentdepartment",
            nextFocusField: null,
        },
    ];

    const managementSchema = [
        {
            id: "departmenthead",
            type: "selectWrapper",
            label: "Department Head",
            required: true,
            prevFocusField: null,
            nextFocusField: "reportingdepartment",
        },
        {
            id: "reportingdepartment",
            type: "selectWrapper",
            label: "Reporting Department",
            required: true,
            prevFocusField: "departmenthead",
            nextFocusField: "businessunit",
        },
        {
            id: "businessunit",
            type: "selectWrapper",
            label: "Business Unit",
            required: true,
            prevFocusField: "reportingdepartment",
            nextFocusField: "costcentercode",
        },
        {
            id: "costcentercode",
            type: "selectWrapper",
            label: "Cost Center Code",
            required: true,
            prevFocusField: "businessunit",
            nextFocusField: null,
        },
    ];

    const employeeSchema = [
        {
            id: "employeecapacity",
            type: "number",
            label: "Employee Capacity",
            placeHolder: "e.g. 500",
            required: true,
            prevFocusField: null,
            nextFocusField: "curremployeecount",
        },
        {
            id: "curremployeecount",
            type: "number",
            label: "Current Employee Count",
            placeHolder: "e.g. 245",
            required: true,
            prevFocusField: "employeecapacity",
            nextFocusField: null,
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