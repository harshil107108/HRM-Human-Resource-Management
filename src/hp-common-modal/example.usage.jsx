/**
 * example.usage.jsx
 * ---------------------------------------------------------------------------
 * Reference implementation — NOT part of the package's public API.
 * Shows how a module (here: "Add Company") wires HpCommonModal up with
 * React Hook Form with zero extra glue code.
 * ---------------------------------------------------------------------------
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2 } from 'lucide-react';
import HpCommonModal from './HpCommonModal';

function CompanyForm() {
    // In a real form, use `useFormContext()` here to `register` each field —
    // HpCommonModal wraps children in <FormProvider>, so context is available.
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
                <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. Alpha Omni Pvt Ltd"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
        </div>
    );
}

export default function AddCompanyExample() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const formMethod = useForm({ defaultValues: { name: '', registrationNo: '', gstNumber: '' } });

    const handleSave = async (values) => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200)); // simulate API call
            console.log('Saving company:', values);
            setOpen(false);
            formMethod.reset();
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className="hp-modal-btn hp-modal-btn--primary"
                onClick={() => setOpen(true)}
            >
                Add Company
            </button>

            <HpCommonModal
                open={open}
                title="Add Company"
                subTitle="Create a new company"
                size="md"
                icon={<Building2 size={20} />}
                formMethod={formMethod}
                loading={loading}
                onSave={handleSave}
                onClose={() => setOpen(false)}
                onClear={() => formMethod.reset()}
                showClearButton
                confirmBeforeClose
            >
                <CompanyForm />
            </HpCommonModal>
        </>
    );
}