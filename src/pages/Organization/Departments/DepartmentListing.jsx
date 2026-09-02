import { HpGrid } from "@/hp-grid/src";
import useDepatmentConfig from "./useDepatmentConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";


const DepartmentListing = () => {

    const { deleteAlert, successAlert } = useAlert()
    const { apiCall } = useApiCall();

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete Department?",
            text: "Are you sure you want to delete this department? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.organization.department.DepartmentDeleteByID,
                    payload: { _id: id }
                });


                if (res.success) {
                    successAlert({
                        title: "Department deleted",
                        text: "Department has been deleted successfully.",
                    });

                    getCompanyListing();
                }
            },
        });
    }

    const { DepartmentListingColDef } = useDepatmentConfig({ handleDelete });
    const [DepartmentListingData, setDepartmentListingData] = useState([])
    const navigate = useNavigate();
    const location = useLocation()

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`, {
            state: {
                departmentid: null,
            },
        });
    };

    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                departmentid: data?._id,
            },
        });
    }

    const getCompanyListing = async () => {
        const res = await apiCall({
            id: "getCompanyListing",
            api: api + apiEndpoints.organization.department.DepartmentGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;

            const formattedData = data.map((item) => {
                const {
                    company,
                    branch,
                    parentdepartment,
                    reportingdepartment,
                    ...departmentData
                } = item;

                return {
                    ...departmentData,
                    companyName: company?.companyName || "",
                    branchname: branch?.branchname || "",
                    parentdepartment: parentdepartment?.departmentname || "",
                    reportingdepartment: reportingdepartment?.departmentname || "",
                };
            });

            setDepartmentListingData(formattedData);
        }
    };


    useEffect(() => {
        getCompanyListing();
    }, [])

    useDocumentTitle("orvexa | Department")

    return (
        <HpGrid
            id="departmentListing"
            rowData={DepartmentListingData}
            colDef={DepartmentListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            title="Department"
            onDoubleClick={handleDoubleClick}
        />
    );
};

export default DepartmentListing;