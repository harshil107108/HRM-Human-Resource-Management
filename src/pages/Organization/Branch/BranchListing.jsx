import { HpGrid } from '@/hp-grid/src';
import { useLocation, useNavigate } from 'react-router-dom';
import useBranchConfig from './useBranchConfig';
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from '@/utils/dateUtils';

const BranchListing = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const { deleteAlert, successAlert } = useAlert()

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete Branch?",
            text: "Are you sure you want to delete this branch? This action cannot be undone.",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.organization.branch.BranchDeleteByID,
                    payload: { _id: id }
                });


                if (res.success) {
                    successAlert({
                        title: "Branch deleted",
                        text: "Branch has been deleted successfully.",
                    });

                    getBranchListing();
                }
            },
        });
    }
    const { branchListingColDef } = useBranchConfig({ handleDelete })
    const [BranchListingData, setBranchListingData] = useState([])
    const { apiCall } = useApiCall();

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`, {
            state: {
                branchid: null,
            },
        });
    }

    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                branchid: data?._id,
            },
        });
    }

    const getBranchListing = async () => {
        const res = await apiCall({
            id: "getBranchListing",
            api: api + apiEndpoints.organization.branch.BranchGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;

            const formattedData = data.map((item) => {
                const {
                    country,
                    state,
                    city,
                    parentcompany,
                    ...branchData
                } = item;

                return {
                    ...branchData,
                    countryName: country?.countryName || "",
                    stateName: state?.stateName || "",
                    cityName: city?.cityName || "",
                    companyName: parentcompany?.companyName || "",
                    companyCode: parentcompany?.companyCode || "",
                };
            });

            setBranchListingData(formattedData);
        }
    };

    useEffect(() => {
        getBranchListing();
    }, [])

    useDocumentTitle("orvexa | Branch")


    return (
        <>
            <HpGrid
                id='branchListing'
                title="Branch"
                rowData={BranchListingData}
                colDef={branchListingColDef}
                style={{ height: '100%' }}
                onAddClick={handleAdd}
                onDoubleClick={handleDoubleClick}
            />
        </>
    )
}

export default BranchListing