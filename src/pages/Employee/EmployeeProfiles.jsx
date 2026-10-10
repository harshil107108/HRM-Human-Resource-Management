import { useState, useEffect, useCallback, useMemo } from "react";
import useApiCall from "@/hooks/useApiCall";
import { apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";
import { Search, Mail, Phone, MapPin, Building, Briefcase, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeProfiles = () => {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const { execute, loading } = useApiCall();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await execute({
                endpoint: apiEndpoints.employee.getEmployee,
                method: "post",
                body: {}
            });
            if (res?.success) {
                const raw = res.data?.data ?? res.data;
                setEmployees(Array.isArray(raw) ? raw : []);
            }
        } catch {
            showAlert("Failed to load employee profiles", "error");
        }
    }, [execute, showAlert]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const departments = useMemo(() => {
        const set = new Set();
        employees.forEach(e => {
            const dName = e.departmentId && typeof e.departmentId === "object" ? e.departmentId.departmentName : e.departmentId;
            if (dName) set.add(dName);
        });
        return ["All", ...Array.from(set)];
    }, [employees]);

    const filtered = useMemo(() => {
        return employees.filter(e => {
            const name = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
            const code = (e.employeeCode || e.empCode || "").toLowerCase();
            const email = (e.email || "").toLowerCase();
            const q = searchQuery.toLowerCase();
            const matchesQuery = name.includes(q) || code.includes(q) || email.includes(q);

            const dName = e.departmentId && typeof e.departmentId === "object" ? e.departmentId.departmentName : e.departmentId;
            const matchesDept = selectedDepartment === "All" || dName === selectedDepartment;

            return matchesQuery && matchesDept;
        });
    }, [employees, searchQuery, selectedDepartment]);

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <User size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Employee Profiles Directory</h1>
                        <p className="text-sm text-gray-500">Searchable visual cards and digital contact badges</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                    </div>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {departments.map(d => (
                            <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-sm text-gray-500">Loading employee profiles...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">No employee profiles matched your filter</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(emp => {
                        const deptName = emp.departmentId && typeof emp.departmentId === "object" ? emp.departmentId.departmentName : emp.departmentId;
                        const desigName = emp.designationId && typeof emp.designationId === "object" ? emp.designationId.designationName : emp.designationId;
                        const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`;

                        return (
                            <div
                                key={emp._id}
                                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {emp.firstName ? emp.firstName[0].toUpperCase() : "E"}
                                        </div>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            emp.status === "Inactive" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                            {emp.status || "Active"}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-base">{fullName}</h3>
                                    <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                                        <Briefcase size={12} /> {desigName || "Employee"}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                        <Building size={12} /> {deptName || "General"}
                                    </p>

                                    <div className="space-y-1.5 text-xs text-gray-600 border-t pt-3">
                                        <div className="flex items-center gap-2 truncate">
                                            <Mail size={13} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{emp.email || "No email"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={13} className="text-gray-400 shrink-0" />
                                            <span>{emp.phone || emp.mobile || "+91 90000 00000"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={13} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{emp.city || "Headquarters"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t flex gap-2">
                                    <button
                                        onClick={() => navigate(`/employees/directory/addedit?_id=${emp._id}`)}
                                        className="w-full py-1.5 text-xs text-center font-semibold bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EmployeeProfiles;
