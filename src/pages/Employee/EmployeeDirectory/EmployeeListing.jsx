import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useEmployeeConfig from "./useEmployeeConfig";
import useAlert from "@/hooks/useAlert";
import { useState, useEffect } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";
import { formatDateForInput } from "@/utils/dateUtils";

const EmployeeListing = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { deleteAlert, successAlert } = useAlert()
    const { apiCall } = useApiCall();

    const handleDelete = async (id) => {
        deleteAlert({
            title: "Delete Employee?",
            text: "Are you sure you want to delete this Employee? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.employee.employee.EmployeeDeleteByID,
                    payload: { _id: id }
                });

                if (res.success) {
                    successAlert({
                        title: "Employee deleted",
                        text: "Employee has been deleted successfully.",
                    });
                    getCityListing();
                }
            },
        });
    }

    const { employeeListingColDef } = useEmployeeConfig({ handleDelete });
    const [EmployeeListingData, setEmployeeListingData] = useState([])

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`, {
            state: {
                employeeid: null,
            },
        });
    };

    const handleDoubleClick = (params) => {
        const { data } = params;

        navigate(`${location.pathname}/addedit`, {
            state: {
                employeeid: data?._id,
            },
        });
    };

    const getEmployeeListing = async () => {
        const res = await apiCall({
            id: "getEmployeeListing",
            api: api + apiEndpoints.employee.employee.EmployeeGetData,
            payload: {},
        });

        if (res?.success) {
            const data = res?.data?.data || [];

            const formattedData = data.map((item) => ({
                ...item,

                employeeId: item.employeeId || "",
                employeeName: [
                    item.firstName,
                    item.middleName,
                    item.lastName,
                ]
                    .filter(Boolean)
                    .join(" "),

                companyName: item.companyId?.companyName || "",
                branchName: item.branchId?.branchname || "",
                departmentname: item.departmentId?.departmentname || "",
                designationName: item.designationId?.designationname || "",
                countryName: item.countryId.countryName || "",
                stateName: item.stateId.stateName || "",
                cityName: item.cityId.cityName || "",
                reportingManagerName:
                    item.reportingManager?.name || "",

                employmentType: item.employmentType || "",
                employeeStatus: item.employeeStatus || "",

                joiningDate: formatDateForInput(item.joiningDate) || "",
                confirmationDate: formatDateForInput(item.confirmationDate) || "",

                officialEmail: item.officialEmail || "",
                mobileNumber: item.mobileNumber || "",

                profileImage: item.profileImage || "",
            }));

            setEmployeeListingData(formattedData);
        }
    };

    useEffect(() => {
        getEmployeeListing();
    }, [])

    return (
        <HpGrid
            id="employeeListing"
            title="Employee"
            rowData={EmployeeListingData}
            colDef={employeeListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            onDoubleClick={handleDoubleClick}
        />
    );
};

export default EmployeeListing;