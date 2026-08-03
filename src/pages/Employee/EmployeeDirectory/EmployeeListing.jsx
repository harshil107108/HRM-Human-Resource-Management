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
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Development",
            designationName: "React Developer",
            reportingManager: "Amit Shah",
            mobileNumber: "+91 9876543210",
            workEmail: "harshil@orvexa.com",
            joiningDate: "15 Jan 2026",
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
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Human Resource",
            designationName: "HR Executive",
            reportingManager: "Neha Patel",
            mobileNumber: "+91 9898989898",
            workEmail: "priya.patel@orvexa.com",
            joiningDate: "10 Nov 2025",
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
            companyName: "Orvexa Technologies",
            branchName: "Surat Branch",
            departmentName: "Finance",
            designationName: "Accountant",
            reportingManager: "Ketan Mehta",
            mobileNumber: "+91 9811111111",
            workEmail: "rahul.shah@orvexa.com",
            joiningDate: "01 Aug 2024",
            employmentType: "Permanent",
            status: "Active",
        },
        {
            employeeId: "EMP-0004",
            employeeCode: "EMP-0004",
            firstName: "Sneha",
            lastName: "Joshi",
            fullName: "Sneha Joshi",
            gender: "Female",
            companyName: "Orvexa Technologies",
            branchName: "Vadodara Branch",
            departmentName: "Sales",
            designationName: "Sales Executive",
            reportingManager: "Rohit Desai",
            mobileNumber: "+91 9822222222",
            workEmail: "sneha.joshi@orvexa.com",
            joiningDate: "20 Mar 2025",
            employmentType: "Full Time",
            status: "Probation",
        },
        {
            employeeId: "EMP-0005",
            employeeCode: "EMP-0005",
            firstName: "Vivek",
            lastName: "Trivedi",
            fullName: "Vivek Trivedi",
            gender: "Male",
            companyName: "Orvexa Technologies",
            branchName: "Rajkot Branch",
            departmentName: "IT Support",
            designationName: "System Administrator",
            reportingManager: "Amit Shah",
            mobileNumber: "+91 9833333333",
            workEmail: "vivek.trivedi@orvexa.com",
            joiningDate: "05 Jul 2023",
            employmentType: "Permanent",
            status: "Active",
        },
        {
            employeeId: "EMP-0006",
            employeeCode: "EMP-0006",
            firstName: "Riya",
            lastName: "Mehta",
            fullName: "Riya Mehta",
            gender: "Female",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Marketing",
            designationName: "Digital Marketing Executive",
            reportingManager: "Anjali Shah",
            mobileNumber: "+91 9844444444",
            workEmail: "riya.mehta@orvexa.com",
            joiningDate: "18 Feb 2026",
            employmentType: "Contract",
            status: "Active",
        },
        {
            employeeId: "EMP-0007",
            employeeCode: "EMP-0007",
            firstName: "Karan",
            lastName: "Patel",
            fullName: "Karan Patel",
            gender: "Male",
            companyName: "Orvexa Technologies",
            branchName: "Surat Branch",
            departmentName: "Development",
            designationName: "Backend Developer",
            reportingManager: "Amit Shah",
            mobileNumber: "+91 9855555555",
            workEmail: "karan.patel@orvexa.com",
            joiningDate: "09 Sep 2025",
            employmentType: "Full Time",
            status: "Notice Period",
        },
        {
            employeeId: "EMP-0008",
            employeeCode: "EMP-0008",
            firstName: "Nidhi",
            lastName: "Dave",
            fullName: "Nidhi Dave",
            gender: "Female",
            companyName: "Orvexa Technologies",
            branchName: "Ahmedabad Head Office",
            departmentName: "Quality Assurance",
            designationName: "QA Engineer",
            reportingManager: "Rakesh Patel",
            mobileNumber: "+91 9866666666",
            workEmail: "nidhi.dave@orvexa.com",
            joiningDate: "12 Dec 2024",
            employmentType: "Full Time",
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