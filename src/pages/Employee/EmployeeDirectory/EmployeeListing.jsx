import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useEmployeeConfig from "./useEmployeeConfig";

const EmployeeListing = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { employeeListingColDef } = useEmployeeConfig();

    const employeeRowData = [
        {
            employeeId: "EMP-0001",
            employeeCode: "EMP-0001",
            firstName: "Harshil",
            lastName: "Prajapati",
            fullName: "Harshil Prajapati",
            gender: "Male",
            department: "Development",
            designation: "React Developer",
            company: "Orvexa Technologies",
            branch: "Ahmedabad Head Office",
            mobileNumber: "+91 9876543210",
            email: "harshil@orvexa.com",
            joiningDate: "2026-01-15",
            employmentType: "Full Time",
            status: "Active",
        },
        {
            employeeId: "EMP-0002",
            employeeCode: "EMP-0002",
            firstName: "Priya",
            lastName: "Patel",
            fullName: "Priya Patel",
            gender: "Female",
            department: "Human Resource",
            designation: "HR Executive",
            company: "Orvexa Technologies",
            branch: "Ahmedabad Head Office",
            mobileNumber: "+91 9898989898",
            email: "priya@orvexa.com",
            joiningDate: "2025-11-10",
            employmentType: "Full Time",
            status: "Active",
        },
        {
            employeeId: "EMP-0003",
            employeeCode: "EMP-0003",
            firstName: "Rahul",
            lastName: "Shah",
            fullName: "Rahul Shah",
            gender: "Male",
            department: "Accounts",
            designation: "Accountant",
            company: "Orvexa Technologies",
            branch: "Surat Branch",
            mobileNumber: "+91 9811111111",
            email: "rahul@orvexa.com",
            joiningDate: "2024-08-01",
            employmentType: "Permanent",
            status: "Active",
        },
    ];

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`);
    };

    const handleDoubleClick = (params) => {
        const { data } = params;

        navigate(`${location.pathname}/addedit`, {
            state: {
                employeeId: data?.employeeId,
            },
        });
    };

    return (
        <HpGrid
            id="employeeListing"
            title="Employee"
            rowData={employeeRowData}
            colDef={employeeListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            onDoubleClick={handleDoubleClick}
        />
    );
};

export default EmployeeListing;