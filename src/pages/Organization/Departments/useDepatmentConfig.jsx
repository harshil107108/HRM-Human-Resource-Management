import React from 'react'
import { api, apiEndpoints } from "@/api/api";


const useDepatmentConfig = () => {
    const DepartmentListingColDef = [
        {
            id: "departmentName",
            field: "departmentName",
            headerName: "Department Name",
            width: 220,
        },
        {
            id: "departmentCode",
            field: "departmentCode",
            headerName: "Department Code",
            width: 140,
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
            width: 200,
        },
        {
            id: "branchName",
            field: "branchName",
            headerName: "Branch",
            width: 180,
        },
        {
            id: "parentDepartment",
            field: "parentDepartment",
            headerName: "Parent Department",
            width: 200,
        },
        {
            id: "departmentHead",
            field: "departmentHead",
            headerName: "Department Head",
            width: 180,
        },
        {
            id: "reportingDepartment",
            field: "reportingDepartment",
            headerName: "Reporting Department",
            width: 200,
        },
        {
            id: "businessUnit",
            field: "businessUnit",
            headerName: "Business Unit",
            width: 180,
        },
        {
            id: "costCenterCode",
            field: "costCenterCode",
            headerName: "Cost Center",
            width: 150,
        },
        {
            id: "employeeCapacity",
            field: "employeeCapacity",
            headerName: "Capacity",
            width: 120,
        },
        {
            id: "currentEmployeeCount",
            field: "currentEmployeeCount",
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
    const basicInfoSchema = [
        {
            id: "departmentname",
            type: "text",
            label: "Department Name",
            placeHolder: "e.g. Human Resources",
            required: true,
            prevFocusField: null,
            nextFocusField: "departmentcode",
            className: "col-span-3",
        },
        {
            id: "departmentcode",
            type: "text",
            label: "Department Code",
            placeHolder: "e.g. HR001",
            required: true,
            prevFocusField: "departmentname",
            nextFocusField: "company",
            className: "col-span-3",
        },
        {
            id: "company",
            type: "selectWrapper",
            label: "Company",
            required: true,
            prevFocusField: "departmentcode",
            nextFocusField: "branch",
            api: api + apiEndpoints.organization.company.CompanyHelp,
            labelKey: "companyName",
            valueKey: "_id",
            className: "col-span-3",
        },
        {
            id: "branch",
            type: "selectWrapper",
            label: "Branch",
            required: true,
            prevFocusField: "company",
            nextFocusField: "parentdepartment",
            className: "col-span-3",
        },
        {
            id: "parentdepartment",
            type: "selectWrapper",
            label: "Parent Department",
            required: false,
            prevFocusField: "branch",
            nextFocusField: "shortname",
            className: "col-span-3",
        },
        {
            id: "shortname",
            type: "text",
            label: "Short Name",
            placeHolder: "e.g. HR",
            required: false,
            prevFocusField: "parentdepartment",
            nextFocusField: null,
            className: "col-span-3",
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
            nextFocusField: "departmenthead",
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