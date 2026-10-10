import { useState } from "react";
import HpCard from "@/components/common/HpCard";
import { Activity, Clock, User, CheckCircle2, ShieldAlert, Sparkles, Filter } from "lucide-react";

const INITIAL_ACTIVITIES = [
    {
        id: 1,
        user: "Admin (Super)",
        action: "Executed Monthly Payroll Batch for October 2026",
        module: "Payroll",
        time: "10 minutes ago",
        type: "success",
        details: "Disbursed 25 records totaling ₹1,130,000 net compensation."
    },
    {
        id: 2,
        user: "Sarah Connor (HR Admin)",
        action: "Approved Leave Request for John Smith",
        module: "Leave Management",
        time: "42 minutes ago",
        type: "info",
        details: "Casual Leave approved: 2 days (Oct 14 - Oct 15)."
    },
    {
        id: 3,
        user: "David Miller",
        action: "Logged Attendance In at 08:58 AM",
        module: "Attendance",
        time: "2 hours ago",
        type: "info",
        details: "On-time arrival registered at HQ Office Gate 2."
    },
    {
        id: 4,
        user: "System Security Monitor",
        action: "Failed Login Attempt from IP 192.168.1.105",
        module: "Security",
        time: "3 hours ago",
        type: "warning",
        details: "Invalid password attempt for account 'alex.turner'."
    },
    {
        id: 5,
        user: "Sarah Connor (HR Admin)",
        action: "Published New Job Opening: Principal Full Stack Engineer",
        module: "Recruitment",
        time: "5 hours ago",
        type: "success",
        details: "Job Code JOB-2026-ENG-04 posted with 2 vacancies."
    },
    {
        id: 6,
        user: "Elena Rostova (Manager)",
        action: "Completed Performance Review for Mark Davis",
        module: "Performance",
        time: "1 day ago",
        type: "success",
        details: "Finalized rating: 4.8 / 5.0 (Exceeds Expectations)."
    }
];

const ActivityLogFeed = () => {
    const [filterModule, setFilterModule] = useState("All");
    const [activities] = useState(INITIAL_ACTIVITIES);

    const filtered = filterModule === "All" 
        ? activities 
        : activities.filter(a => a.module === filterModule);

    const modules = ["All", "Payroll", "Leave Management", "Attendance", "Recruitment", "Performance", "Security"];

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Live Activity Feed</h1>
                        <p className="text-sm text-gray-500">Real-time operational stream of actions performed across the HRM portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {modules.map(m => (
                            <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <HpCard title="Recent Activity Timeline">
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-6 py-2">
                    {filtered.map(item => {
                        let icon = <CheckCircle2 size={16} className="text-blue-500" />;
                        let dotBg = "bg-blue-100";
                        if (item.type === "warning") {
                            icon = <ShieldAlert size={16} className="text-amber-500" />;
                            dotBg = "bg-amber-100";
                        } else if (item.type === "success") {
                            icon = <Sparkles size={16} className="text-emerald-500" />;
                            dotBg = "bg-emerald-100";
                        }

                        return (
                            <div key={item.id} className="relative pl-6 group">
                                <div className={`absolute -left-[17px] top-1 p-1 rounded-full ${dotBg} border-2 border-white shadow-xs`}>
                                    {icon}
                                </div>
                                <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3.5 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                                <User size={13} className="text-gray-400" />
                                                {item.user}
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                                {item.module}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {item.time}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mt-1">{item.action}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </HpCard>
        </div>
    );
};

export default ActivityLogFeed;
