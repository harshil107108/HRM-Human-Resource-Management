import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useEmployeeConfig from "./useEmployeeConfig";
import useAlert from "@/hooks/useAlert";
import { useState, useEffect } from "react";
import { api, apiEndpoints } from "@/api/api";
import useApiCall from "@/hooks/useApiCall";

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

    const handleAdd = () => { navigate(`${location.pathname}/addedit`); };

    const handleDoubleClick = (params) => {
        const { data } = params;

        navigate(`${location.pathname}/addedit`, {
            state: {
                employeeId: data?.employeeId,
            },
        });
    };

    const getEmployeeListing = async () => {
        const res = await apiCall({
            id: "getCityListing",
            api: api + apiEndpoints.employee.employee.EmployeeGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;
            setEmployeeListingData(data);
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