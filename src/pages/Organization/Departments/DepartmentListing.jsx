import { HpGrid } from "@/hp-grid/src";
import useDepatmentConfig from "./useDepatmentConfig";
import { useLocation, useNavigate } from "react-router-dom";


const DepartmentListing = () => {
    const { DepartmentListingColDef } = useDepatmentConfig();
    const navigate = useNavigate();
    const location = useLocation()

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`);
    };

    const handleSave = async (data) => {
        formMethod.reset();
    };

    const handleClear = () => {
        formMethod.reset();
    };

    const handleDoubleClick = () => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                departmentid: data?.departmentid,
            },
        });
    }

    const departmentRowData = [
        {
            departmentId: 1,
            departmentName: "Human Resources",
            departmentCode: "HR001",
            shortName: "HR",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            parentDepartment: "-",
            departmentHead: "Priya Patel",
            reportingDepartment: "Corporate",
            businessUnit: "Administration",
            costCenterCode: "CC1001",
            employeeCapacity: 50,
            currentEmployeeCount: 32,
            status: "Active",
        },
        {
            departmentId: 2,
            departmentName: "Software Development",
            departmentCode: "DEV001",
            shortName: "DEV",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            parentDepartment: "Technology",
            departmentHead: "Amit Shah",
            reportingDepartment: "Technology",
            businessUnit: "Engineering",
            costCenterCode: "CC1002",
            employeeCapacity: 120,
            currentEmployeeCount: 98,
            status: "Active",
        },
    ];

    return (
        <HpGrid
            id="departmentListing"
            rowData={departmentRowData}
            colDef={DepartmentListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            title="Department"
            onDoubleClick={handleDoubleClick}
        />
    );
};

export default DepartmentListing;