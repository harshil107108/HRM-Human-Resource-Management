import {
  Mail,
  Phone,
  MapPin,
  Building2,
  BriefcaseBusiness,
  Calendar,
  DollarSign,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export const personalInfo = [
  {
    icon: <Mail size={15} />,
    label: "Email Address",
    value: "alex@corporate-elite.com",
  },
  {
    icon: <Phone size={15} />,
    label: "Phone",
    value: "+1 (555) 012-3456",
  },
  {
    icon: <MapPin size={15} />,
    label: "Address",
    value: "722 West Blvd, San Francisco, CA",
  },
];

export const organizationInfo = [
  {
    icon: <Building2 size={15} />,
    label: "Department",
    value: "Global Analytics & Operations",
  },
  {
    icon: <BriefcaseBusiness size={15} />,
    label: "Designation",
    value: "Senior Product Analyst",
  },
  {
    icon: <Calendar size={15} />,
    label: "Joining Date",
    value: "October 24, 2023",
  },
  {
    icon: <ShieldCheck size={15} />,
    label: "Reporting Manager",
    value: "Sarah Mitchell",
  },
];

export const payrollInfo = [
  {
    icon: <DollarSign size={15} />,
    label: "Annual CTC",
    value: "$142,500",
  },
  {
    icon: <Calendar size={15} />,
    label: "Payment Cycle",
    value: "Semi-Monthly",
  },
  {
    icon: <CreditCard size={15} />,
    label: "Bank",
    value: "JP Morgan Chase",
  },
];

export const documents = [
  {
    name: "resume.pdf",
    status: "Verified",
  },
  {
    name: "passport_scan.pdf",
    status: "Verified",
  },
  {
    name: "offer_letter.pdf",
    status: "Verified",
  },
];

export const systemAccess = {
  role: "Department Manager",
  department: "Operations",
  modules: [
    "HR",
    "Payroll",
    "Attendance",
    "Recruitment",
  ],
};