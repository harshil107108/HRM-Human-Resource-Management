import React from 'react'
import { api, apiEndpoints } from "@/api/api";

// { "departmentname": "Human Resources", "departmentcode": "HR001", "company": "COMPANY_MONGODB_ID", "branch": "BRANCH_MONGODB_ID", "parentdepartment": null, "shortname": "HR", "departmenthead": "EMPLOYEE_MONGODB_ID", "reportingdepartment": null, "businessunit": "Corporate", "costcentercode": "CC-HR-001", "employeecapacity": 500, "curremployeecount": 245, "isActive": true }

const useDepatmentConfig = ({ handleDelete } = {}) => {
    const DepartmentListingColDef = [
        {
            id: "departmentname",
            field: "departmentname",
            headerName: "Department Name",
            width: 180,
        },
        {
            id: "departmentcode",
            field: "departmentcode",
            headerName: "Department Code",
            width: 140,
        },
        {
            id: "shortname",
            field: "shortname",
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
            id: "branchname",
            field: "branchname",
            headerName: "Branch",
            width: 180,
        },
        {
            id: "parentdepartment",
            field: "parentdepartment",
            headerName: "Parent Department",
            width: 160,
        },
        {
            id: "departmenthead",
            field: "departmenthead",
            headerName: "Department Head",
            width: 160,
        },
        {
            id: "reportingdepartment",
            field: "reportingdepartment",
            headerName: "Reporting Department",
            width: 200,
        },
        {
            id: "businessunit",
            field: "businessunit",
            headerName: "Business Unit",
            width: 120,
        },
        {
            id: "costcentercode",
            field: "costcentercode",
            headerName: "Cost Center",
            width: 120,
        },
        {
            id: "employeecapacity",
            field: "employeecapacity",
            headerName: "Employee Capacity",
            width: 150,
        },
        {
            id: "curremployeecount",
            field: "curremployeecount",
            headerName: "Current Employees",
            width: 150,
        },
        {
            id: "action",
            field: "action",
            headerName: "Action",
            width: 80,
            type: "actions",
            onClick: (data) => {
                handleDelete(data._id);
            }
        }
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
            api: api + apiEndpoints.organization.branch.BranchHelp,
            labelKey: "branchname",
            valueKey: "_id",
            prevFocusField: "company",
            nextFocusField: "parentdepartment",
            className: "col-span-3",
        },
        {
            id: "parentdepartment",
            type: "selectWrapper",
            label: "Parent Department",
            required: false,
            api: api + apiEndpoints.organization.department.DepartmentHelp,
            labelKey: "departmentname",
            valueKey: "_id",
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
            api: api + apiEndpoints.employee.employee.EmployeeHelp,
            labelKey: "employeeName",
            valueKey: "_id",
            // required: true,
            prevFocusField: null,
            nextFocusField: "reportingdepartment",
        },
        {
            id: "reportingdepartment",
            type: "selectWrapper",
            label: "Reporting Department",
            api: api + apiEndpoints.organization.department.DepartmentHelp,
            labelKey: "departmentname",
            valueKey: "_id",
            prevFocusField: "departmenthead",
            nextFocusField: "businessunit",
        },
        {
            id: "businessunit",
            type: "selectWrapper",
            label: "Business Unit",
            // required: true,
            prevFocusField: "reportingdepartment",
            nextFocusField: "costcentercode",
            options: [
                { label: "Corporate", value: "CORP" },
                { label: "Information Technology", value: "IT" },
                { label: "Human Resources", value: "HR" },
                { label: "Finance", value: "FIN" },
                { label: "Sales & Marketing", value: "SM" },
                { label: "Operations", value: "OPS" },
            ],
        },
        {
            id: "costcentercode",
            type: "selectWrapper",
            label: "Cost Center Code",
            // required: true,
            prevFocusField: "businessunit",
            nextFocusField: null,
            options: [
                { label: "Corporate - CC001", value: "CC001" },
                { label: "IT Department - CC002", value: "CC002" },
                { label: "HR Department - CC003", value: "CC003" },
                { label: "Finance - CC004", value: "CC004" },
                { label: "Sales - CC005", value: "CC005" },
                { label: "Operations - CC006", value: "CC006" },
            ],
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