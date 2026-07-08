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

    return (
        <HpGrid
            id="departmentListing"
            rowData={[]}
            colDef={DepartmentListingColDef}
            style={{ height: "100%" }}
            onAddClick={handleAdd}
            title="Department"
            onDoubleClick={handleDoubleClick}
        />
    );
};

export default DepartmentListing;