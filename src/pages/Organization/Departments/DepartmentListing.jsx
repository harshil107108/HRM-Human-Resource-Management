import React, { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { Building2 } from "lucide-react";

import useDepatmentConfig from "./useDepatmentConfig";
import { HpGrid } from "@/hp-grid/src";
import { HpCommonModal } from "@/hp-common-modal";


const DepartmentListing = () => {
    const { DepartmentListingColDef } = useDepatmentConfig();

    const [show, setShow] = useState(false);

    const handleAdd = () => {
        setShow(true);
    };

    const handleSave = async (data) => {
        console.log("Department Data :", data);

        // API Call Here

        setShow(false);
        formMethod.reset();
    };

    const handleClear = () => {
        formMethod.reset();
    };

    return (
        <>
            <HpCommonModal
                open={show}
                title="Add Department"
                subTitle="Create a new department"
                size="md"
                icon={<Building2 size={20} />}
                onSave={handleSave}
                onClose={() => setShow(false)}
                onClear={handleClear}
                loading={false}
                showClearButton
                confirmBeforeClose
            >
            </HpCommonModal>

            <HpGrid
                id="departmentListing"
                rowData={[]}
                colDef={DepartmentListingColDef}
                style={{ height: "100%" }}
                onAddClick={handleAdd}
                title="Department"
            />
        </>
    );
};

export default DepartmentListing;