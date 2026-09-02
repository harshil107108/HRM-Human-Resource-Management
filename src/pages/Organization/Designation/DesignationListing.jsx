import { HpGrid } from "@/hp-grid/src";
import { useLocation, useNavigate } from "react-router-dom";
import useDesignationConfig from "./useDesignationConfig";
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";


const DesignationListing = () => {

    const { deleteAlert, successAlert } = useAlert()
    const { apiCall } = useApiCall();

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete Designation?",
            text: "Are you sure you want to delete this designation? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.organization.designation.DesignationDeleteByID,
                    payload: { _id: id }
                });


                if (res.success) {
                    successAlert({
                        title: "Designation deleted",
                        text: "Designation has been deleted successfully.",
                    });

                    getDesignationListing();
                }
            },
        });
    }
    const { DesignationListingColDef } = useDesignationConfig({ handleDelete });
    const [DesignationListingData, setDesignationListingData] = useState([])
    const navigate = useNavigate();
    const location = useLocation()

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`, {
            state: {
                designationid: null,
            },
        });
    };

    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                designationid: data?._id,
            },
        });
    }

    const getDesignationListing = async () => {
        const res = await apiCall({
            id: "getDesignationListing",
            api: api + apiEndpoints.organization.designation.DesignationGetData,
            payload: {},
        });

        if (res?.success) {
            const data = res?.data?.data || [];


            const formattedData = data.map((item) => ({
                ...item,
                companyName: item.company?.companyName || "",
                branchname: item.branch?.branchname || "",
                departmentname: item.department?.departmentname || "",
                employeeCount: item.employeeCount || 0,
            }));

            setDesignationListingData(formattedData);
        }
    };


    useEffect(() => {
        getDesignationListing();
    }, [])

    useDocumentTitle("orvexa | Designation")

    return (
        <HpGrid
            id="designationListing"
            rowData={DesignationListingData}
            colDef={DesignationListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            title="Designation"
            onDoubleClick={handleDoubleClick}
        />
    );
};


export default DesignationListing