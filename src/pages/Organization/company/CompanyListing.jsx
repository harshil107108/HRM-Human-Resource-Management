import { HpGrid } from '@/hp-grid/src';
import { useNavigate } from 'react-router-dom';
import useCompanyConfig from './useCompanyConfig';
import { api, apiEndpoints } from "@/api/api";
import { useState, useEffect } from "react";
import useApiCall from "@/hooks/useApiCall";
import useAlert from "@/hooks/useAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { formatDateForInput } from '@/utils/dateUtils';


const CompanyListing = () => {

    const { deleteAlert, successAlert } = useAlert()

    const handleDelete = async (id) => {

        deleteAlert({
            title: "Delete Company?",
            text: "Are you sure you want to delete this company? This action cannot be undone.",

            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",

            onClick: async () => {
                const res = await apiCall({
                    id: 'deleteListing',
                    api: api + apiEndpoints.organization.company.CompanyDeleteByID,
                    payload: { _id: id }
                });


                if (res.success) {
                    successAlert({
                        title: "Company deleted",
                        text: "Company has been deleted successfully.",
                    });

                    getCompanyListing();
                }
            },
        });
    }
    const { companyListingColDef } = useCompanyConfig({ handleDelete });
    const navigate = useNavigate();

    const [CompanyListingData, setCompanyListingData] = useState([])

    const { apiCall } = useApiCall();

    const handleDoubleClick = (params) => {
        const { data } = params;
        navigate(`${location.pathname}/addedit`, {
            state: {
                companyid: data?._id,
            },
        });
    }

    const handleAdd = () => {
        navigate(`${location.pathname}/addedit`, {
            state: {
                companyid: null,
            },
        });
    }

    const getCompanyListing = async () => {
        const res = await apiCall({
            id: "getCompanyListing",
            api: api + apiEndpoints.organization.company.CompanyGetData,
            payload: {}
        });

        if (res?.success) {
            const data = res.data.data;

            const formattedData = data.map((item) => {
                const {
                    country,
                    state,
                    city,
                    establishDate,
                    ...companyData
                } = item;

                return {
                    ...companyData,
                    establishDate: formatDateForInput(establishDate),
                    countryName: country?.countryName || "",
                    stateName: state?.stateName || "",
                    cityName: city?.cityName || "",
                };
            });

            setCompanyListingData(formattedData);
        }
    };


    useEffect(() => {
        getCompanyListing();
    }, [])

    useDocumentTitle("orvexa | Company")

    return (
        <>
            <HpGrid
                id='companyListing'
                rowData={CompanyListingData}
                colDef={companyListingColDef}
                style={{ height: '100%' }}
                onDoubleClick={handleDoubleClick}
                onAddClick={handleAdd}
                title="Company"
            />
        </>
    )
}

export default CompanyListing