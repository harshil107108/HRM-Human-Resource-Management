import React from "react";
import { ShieldCheck } from "lucide-react";

const SystemAccessCard = ({ access }) => {
    return (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">

            <div className="border-b border-white/10 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white/20 p-2">
                        <ShieldCheck size={18} />
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            System Access
                        </h3>

                        <p className="text-xs text-blue-100">
                            Assigned Role
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-5 p-5">

                <div>

                    <p className="text-xs uppercase tracking-wide text-blue-200">
                        Role
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                        {access.role}
                    </h2>

                </div>

                <div>

                    <p className="text-xs uppercase tracking-wide text-blue-200">
                        Department
                    </p>

                    <p className="mt-1 text-sm">
                        {access.department}
                    </p>

                </div>

                <div>

                    <p className="mb-2 text-xs uppercase tracking-wide text-blue-200">
                        Modules
                    </p>

                    <div className="flex flex-wrap gap-2">

                        {access.modules.map((module) => (

                            <span
                                key={module}
                                className="rounded-lg bg-white/20 px-3 py-1 text-xs font-medium"
                            >
                                {module}
                            </span>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SystemAccessCard;