import { useState, useMemo, useEffect } from "react";
import { formMethod, FormRenderer } from "@/form-engine";
import HpFooter from "@/hooks/HpFooter";
import HpHeader from "@/hooks/HpHeader";
import { User, X } from "lucide-react";
import PermissionCard from "./PermissionCard";
import UploadCard from "./UploadCard";
import useEmployeeConfig from "./useEmployeeConfig";
import { useLocation, useNavigate } from "react-router-dom";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";


const Employee = () => {

    const locationData = useLocation();
    const EmployeeId = locationData.state.employeeid;

    const [permissions, setPermissions] = useState({
        financialView: false,
        leaveApproval: true,
        orgChartAdmin: false,
        directoryAccess: true,
    });


    const navigate = useNavigate();
    const { apiCall } = useApiCall();

    const togglePermission = (key, value) => {
        setPermissions((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const [preview, setPreview] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [documents, setDocuments] = useState({
        resume: {
            file: null,
            url: null,
            name: null,
        },
        offerLetter: {
            file: null,
            url: null,
            name: null,
        },
        appointmentLetter: {
            file: null,
            url: null,
            name: null,
        },
        otherDocuments: {
            file: null,
            url: null,
            name: null,
        },
    });


    const handleDocumentChange = (name, file) => {
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, DOC and DOCX files are allowed.");
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert("File size must be less than 5 MB.");
            return;
        }

        setDocuments((prev) => ({
            ...prev,
            [name]: {
                file: file,
                url: URL.createObjectURL(file),
                name: file.name,
            },
        }));
    };


    const handleDocumentRemove = (name) => {
        setDocuments((prev) => ({
            ...prev,
            [name]: null,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a JPG, PNG, GIF or WEBP image.");
            e.target.value = "";
            return;
        }

        const maxSize = 2 * 1024 * 1024;

        if (file.size > maxSize) {
            alert("Image size must be less than 2 MB.");
            e.target.value = "";
            return;
        }

        setProfilePhoto(file);

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        formmethod.methods.setValue("profilePhoto", file);
    };

    const handleRemove = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);
        setProfilePhoto(null);

        formmethod.methods.setValue("profilePhoto", null);
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

    const generateEmployeeId = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const initialValue = {
        employeeId: generateEmployeeId(),
        profilePhoto: null,
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        maritalStatus: "",
        bloodGroup: "",
        company: "",
        branch: "",
        department: "",
        designation: "",
        reportingManager: "",
        employmentType: "",
        joiningDate: "",
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
        aadhaarNumber: "",
        panNumber: "",
        passportNumber: "",
        uanNumber: "",
        esicNumber: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        salaryStructure: "",
        paymentMode: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "",
        allowLogin: true,
        remarks: "",
    };

    const formmethod = useMemo(() => {
        return formMethod.createForm({
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
    }, []);

    const handleSave = async () => {
        try {
            const values = formmethod.methods.getValues();

            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    // Don't append File here if we handle it separately
                    if (key !== "profilePhoto") {
                        formData.append(key, value);
                    }
                }
            });

            // Profile image
            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }

            // Employee documents
            if (documents.resume) {
                formData.append("resume", documents.resume);
            }

            if (documents.offerLetter) {
                formData.append("offerLetter", documents.offerLetter);
            }

            if (documents.appointmentLetter) {
                formData.append("appointmentLetter", documents.appointmentLetter);
            }

            if (documents.otherDocuments) {
                formData.append("otherDocuments", documents.otherDocuments);
            }

            // Profile image
            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }

            // Permissions
            formData.append(
                "permissions",
                JSON.stringify(permissions)
            );

            const res = await apiCall({
                id: "employeeAddEdit",
                api: api + apiEndpoints.employee.employee.EmployeeAddEdit,
                payload: formData,
            });

            if (res?.success) {
                console.log("Employee saved successfully");
            }
        } catch (error) {
            console.error("Employee save error:", error);
        }
    };

    const getDataById = async () => {
        if (!EmployeeId) return;

        const res = await apiCall({
            id: "getEmployeeById",
            api: api + apiEndpoints.employee.employee.EmployeeGetByID,
            payload: {
                _id: EmployeeId,
            },
        });

        if (res?.success) {
            const data = res?.data?.data;
            console.log(data)

            if (!data) return;

            const finalData = {
                ...data,
                companyId: data.companyId?._id || "",
                branchId: data.branchId?._id || "",
                departmentId: data.departmentId?._id || "",
                designationId: data.designationId?._id || "",

                reportingManager: data.reportingManager?._id || "",

                countryId: data.countryId?._id || "",
                stateId: data.stateId?._id || "",
                cityId: data.cityId?._id || "",

                bankName: data.bankName?._id || "",

                // =========================
                // DATE FIELDS
                // =========================

                dateOfBirth: formatDateForInput(data.dateOfBirth),
                joiningDate: formatDateForInput(data.joiningDate),
                confirmationDate: formatDateForInput(data.confirmationDate),

                // =========================
                // SAFE DEFAULTS
                // =========================

                employeeId: data.employeeId || "",
                profileImage: data.profileImage || "",

                firstName: data.firstName || "",
                middleName: data.middleName || "",
                lastName: data.lastName || "",

                gender: data.gender || "",
                maritalStatus: data.maritalStatus || "",
                bloodGroup: data.bloodGroup || "",

                employmentType: data.employmentType || "",
                employeeStatus: data.employeeStatus || "",

                probationPeriod: data.probationPeriod ?? 0,

                officialEmail: data.officialEmail || "",
                personalEmail: data.personalEmail || "",
                mobileNumber: data.mobileNumber || "",
                alternateMobile: data.alternateMobile || "",

                emergencyContactName:
                    data.emergencyContactName || "",

                emergencyContactNumber:
                    data.emergencyContactNumber || "",

                postalCode: data.postalCode || "",
                currentAddress: data.currentAddress || "",

                aadhaarNumber: data.aadhaarNumber || "",
                panNumber: data.panNumber || "",
                passportNumber: data.passportNumber || "",
                drivingLicenseNumber:
                    data.drivingLicenseNumber || "",

                accountNumber: data.accountNumber || "",
                ifscCode: data.ifscCode || "",

                uanNumber: data.uanNumber || "",
                pfNumber: data.pfNumber || "",
                esiNumber: data.esiNumber || "",

                salaryStructure: data.salaryStructure || "",

                ctc: data.ctc ?? "",
                basicSalary: data.basicSalary ?? "",

                username: data.username || "",
                primaryRole: data.primaryRole || "",
                userGroup: data.userGroup || "",

                isActive: data.isActive ?? true,
            };

            setPermissions(data.permissions)

            formmethod.methods.setValues(finalData);
        }
    };

    useEffect(() => {
        if (EmployeeId) {
            getDataById();
        }
    }, [EmployeeId]);

    const handleClear = () => {
        formmethod.methods.reset();
    }

    const handleBack = () => {
        navigate(-1);
    }


    return (
        <>
            <div className="hp-company-page">
                <HpHeader
                    title="Employee"
                    className="hp-company-page__header"
                />

                <div className="hp-company-content mx-auto w-full max-w-7xl pt-6">

                    <div className="mb-4 overflow-hidden rounded-lg border border-[#dce3e7] bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.10),0_8px_16px_rgba(0,0,0,0.06)]">

                        <div className="flex h-10 items-center border-b border-[#e2e8eb] bg-gradient-to-r from-[#f8fcfd] to-[#eef8fa] px-4">
                            <span className="mr-2 h-4 w-1 rounded-full bg-[#2999a8]" />
                            <h2 className="text-[12px] font-bold tracking-wide text-[#334155]">
                                Personal Information
                            </h2>
                        </div>

                        <div className="p-4">

                            <div className="mb-8 flex items-start gap-5">

                                <div className="relative">
                                    <div
                                        className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 ${preview ? "cursor-pointer hover:opacity-90" : ""
                                            }`}
                                        onClick={() => {
                                            if (preview) {
                                                setShowImageModal(true);
                                            }
                                        }}
                                    >
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
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                        />

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
                                                onChange={handleImageChange}
                                            />

                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleRemove}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                <UploadCard
                                    title="Resume Upload"
                                    name="resume"
                                    file={documents.resume}
                                    onChange={(file) =>
                                        handleDocumentChange("resume", file)
                                    }
                                    onRemove={() =>
                                        handleDocumentRemove("resume")
                                    }
                                />

                                <UploadCard
                                    title="Offer Letter Upload"
                                    name="offerLetter"
                                    file={documents.offerLetter}
                                    onChange={(file) =>
                                        handleDocumentChange("offerLetter", file)
                                    }
                                    onRemove={() =>
                                        handleDocumentRemove("offerLetter")
                                    }
                                />

                                <UploadCard
                                    title="Appointment Letter Upload"
                                    name="appointmentLetter"
                                    file={documents.appointmentLetter}
                                    onChange={(file) =>
                                        handleDocumentChange("appointmentLetter", file)
                                    }
                                    onRemove={() =>
                                        handleDocumentRemove("appointmentLetter")
                                    }
                                />

                                <UploadCard
                                    title="Other Documents Upload"
                                    name="otherDocuments"
                                    file={documents.otherDocuments}
                                    onChange={(file) =>
                                        handleDocumentChange("otherDocuments", file)
                                    }
                                    onRemove={() =>
                                        handleDocumentRemove("otherDocuments")
                                    }
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
                                Extended Permissions
                            </h2>
                        </div>

                        <div className="p-6 shadow-sm">

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



                    <HpFooter
                        onBack={handleBack}
                        onClear={handleClear}
                        onSave={handleSave}
                    />

                </div>
            </div >

            {showImageModal && preview && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6"
                    onClick={() => setShowImageModal(false)}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={() => setShowImageModal(false)}
                        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Large Round Image */}
                    <div
                        className="flex h-[min(70vw,500px)] w-[min(70vw,500px)] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={preview}
                            alt="Employee Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Employee;