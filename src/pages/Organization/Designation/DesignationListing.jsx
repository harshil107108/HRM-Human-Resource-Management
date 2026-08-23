import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useDesignationConfig from "./useDesignationConfig";


const DesignationListing = () => {
    const { DesignationListingColDef } = useDesignationConfig();
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

    const designationRowData = [
        {
            designationId: 1,
            designationName: "React Developer",
            designationCode: "DEV001",
            shortName: "React Dev",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Development",
            employeeCount: 8,
            status: "Active",
        },
        {
            designationId: 2,
            designationName: "Senior React Developer",
            designationCode: "DEV002",
            shortName: "Sr. React",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Development",
            employeeCount: 4,
            status: "Active",
        },
        {
            designationId: 3,
            designationName: "HR Executive",
            designationCode: "HR001",
            shortName: "HR Exec",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Human Resource",
            employeeCount: 5,
            status: "Active",
        },
        {
            designationId: 4,
            designationName: "HR Manager",
            designationCode: "HR002",
            shortName: "HR Mgr",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Human Resource",
            employeeCount: 1,
            status: "Active",
        },
        {
            designationId: 5,
            designationName: "Accountant",
            designationCode: "ACC001",
            shortName: "Accounts",
            companyName: "Orvexa Technologies",
            branchName: "Surat Branch",
            departmentName: "Finance",
            employeeCount: 3,
            status: "Active",
        },
        {
            designationId: 6,
            designationName: "Sales Executive",
            designationCode: "SAL001",
            shortName: "Sales",
            companyName: "Orvexa Technologies",
            branchName: "Vadodara Branch",
            departmentName: "Sales",
            employeeCount: 10,
            status: "Active",
        },
        {
            designationId: 7,
            designationName: "QA Engineer",
            designationCode: "QA001",
            shortName: "QA",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Quality Assurance",
            employeeCount: 6,
            status: "Active",
        },
        {
            designationId: 8,
            designationName: "System Administrator",
            designationCode: "IT001",
            shortName: "Sys Admin",
            companyName: "Orvexa Technologies",
            branchName: "Rajkot Branch",
            departmentName: "IT Support",
            employeeCount: 2,
            status: "Inactive",
        },
    ];

    return (
        <HpGrid
            id="designationListing"
            rowData={designationRowData}
            colDef={DesignationListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            title="Designation"
            onDoubleClick={handleDoubleClick}
        />
    );
};


export default DesignationListing