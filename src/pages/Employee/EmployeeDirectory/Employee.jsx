import { useState } from "react";

import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import {
    User
} from "lucide-react";
import PermissionCard from "./PermissionCard";
import UploadCard from "./UploadCard";
import useEmployeeConfig from "./useEmployeeConfig";


const Employee = () => {


    const [permissions, setPermissions] = useState({
        financialView: false,
        leaveApproval: true,
        orgChartAdmin: false,
        directoryAccess: true,
    });

    const togglePermission = (key, value) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPreview(URL.createObjectURL(file));
    };

    const handleRemove = () => {
        setPreview(null);
    };

    const {
        personalInformationSchema,
        organizationInformationSchema,
        contactInformationSchema,
        documentInformationSchema,
        payrollInformationSchema,
        accessInformationSchema,
        reviewInformationSchema,
    } = useEmployeeConfig();

    const initialValue = {
        // Personal
        employeeId: "EMP-0001",
        profilePhoto: null,
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        maritalStatus: "",
        bloodGroup: "",

        // Organization
        company: "",
        branch: "",
        department: "",
        designation: "",
        reportingManager: "",
        employmentType: "",
        joiningDate: "",

        // Contact
        mobileNumber: "",
        alternateNumber: "",
        personalEmail: "",
        officeEmail: "",
        addressLine1: "",
        addressLine2: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",

        // Documents
        aadhaarNumber: "",
        panNumber: "",
        passportNumber: "",
        uanNumber: "",
        esicNumber: "",

        // Payroll
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        salaryStructure: "",
        paymentMode: "",

        // Access
        username: "",
        password: "",
        confirmPassword: "",
        role: "",
        allowLogin: true,

        // Review
        remarks: "",
    };

    const formmethod = formMethod.createForm({
        schema: [
            ...personalInformationSchema,
            ...organizationInformationSchema,
            ...contactInformationSchema,
            ...documentInformationSchema,
            ...payrollInformationSchema,
            ...accessInformationSchema,
            ...reviewInformationSchema,
        ],
        initialValue,
    });



    return (
        <>
            <div className="hp-company-page">
                <HpHeader
                    title="Employee"
                    className="hp-company-page__header"
                />

                <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">

                    <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                        {/* Card Header */}
                        <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
                            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                Personal Information
                            </h2>
                        </div>

                        <div className="p-4">

                            <div className="mb-8 flex items-start gap-5">

                                <div className="relative">

                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">

                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Employee"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-slate-400" />
                                        )}

                                    </div>

                                    <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        // onChange={handleImageChange}
                                        />

                                        {/* <Camera size={15} /> */}

                                    </label>

                                </div>

                                <div>

                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Employee Profile Picture
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        JPG, PNG or GIF. Max size 2 MB.
                                    </p>

                                    <div className="mt-4 flex items-center gap-3">

                                        <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">

                                            Upload New

                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                            // onChange={handleImageChange}
                                            />

                                        </label>

                                        <button
                                            type="button"
                                            // onClick={handleRemove}
                                            className="text-xs font-semibold text-red-500 hover:text-red-600"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>


                            <FormRenderer formMethod={formmethod} formSchema={personalInformationSchema} />

                        </div>
                    </div>



                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">


                        <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                            {/* Card Header */}
                            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                    Organization Information
                                </h2>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <FormRenderer formMethod={formmethod} formSchema={organizationInformationSchema} />
                            </div>

                        </div>

                        <div className="flex flex-col gap-4">

                            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                                {/* Card Header */}
                                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                                    <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                                    <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                        Contact Information
                                    </h2>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    <FormRenderer
                                        formMethod={formmethod}
                                        formSchema={contactInformationSchema}
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="mt-4 mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">


                        <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                Document Information
                            </h2>
                        </div>

                        <div className="p-4">

                            <FormRenderer formMethod={formmethod} formSchema={documentInformationSchema} />

                            <div className="my-8 border-t border-slate-100" />

                            {/* Upload Section */}

                            <div className="grid grid-cols-4 gap-6">
                                <UploadCard
                                    title="Resume Upload"
                                />

                                <UploadCard
                                    title="Offer Letter Upload"
                                />

                                <UploadCard
                                    title="Appointment Letter Upload"
                                />

                                <UploadCard
                                    title="Other Documents Upload"
                                />
                            </div>

                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">


                        <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                            {/* Card Header */}
                            <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                                <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                                <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                    Payroll Information
                                </h2>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <FormRenderer formMethod={formmethod} formSchema={payrollInformationSchema} />
                            </div>

                        </div>

                        <div className="flex flex-col gap-4">

                            <div className="overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                                {/* Card Header */}
                                <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                                    <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />

                                    <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                        Access Information
                                    </h2>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    <FormRenderer
                                        formMethod={formmethod}
                                        formSchema={accessInformationSchema}
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="mt-4 mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                        {/* Card Header */}
                        <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
                            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                Personal Information
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="mb-5 text-base font-semibold text-slate-900">
                                Extended Permissions
                            </h2>

                            <div className="grid grid-cols-4 gap-4">

                                <PermissionCard
                                    title="Financial View"
                                    description="Access payroll and salary information."
                                    checked={permissions.financialView}
                                    onChange={(value) =>
                                        togglePermission("financialView", value)
                                    }
                                />

                                <PermissionCard
                                    title="Leave Approval"
                                    description="Approve employee leave requests."
                                    checked={permissions.leaveApproval}
                                    onChange={(value) =>
                                        togglePermission("leaveApproval", value)
                                    }
                                />

                                <PermissionCard
                                    title="Org Chart Admin"
                                    description="Manage reporting hierarchy."
                                    checked={permissions.orgChartAdmin}
                                    onChange={(value) =>
                                        togglePermission("orgChartAdmin", value)
                                    }
                                />

                                <PermissionCard
                                    title="Directory Access"
                                    description="View employee contact details."
                                    checked={permissions.directoryAccess}
                                    onChange={(value) =>
                                        togglePermission("directoryAccess", value)
                                    }
                                />

                            </div>

                        </div>
                    </div>



                    <HpFooter />

                </div>
            </div >
        </>
    );
};

export default Employee;