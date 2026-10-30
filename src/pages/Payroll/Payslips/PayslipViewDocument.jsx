import React from "react";
import { CheckCircle2, User, Landmark, Building2, Calendar, FileText } from "lucide-react";
import { amountToWords } from "./payslipPdfUtils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getMonthLabel = (m) => {
  if (!m) return "";
  const num = parseInt(m, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return MONTH_NAMES[num - 1];
  }
  return String(m);
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function PayslipViewDocument({ payslip, company, elementId = "payslip-print-document" }) {
  if (!payslip) return null;

  const emp = typeof payslip.employeeId === "object" && payslip.employeeId !== null ? payslip.employeeId : {};
  const comp = emp.companyId || company || {};

  const companyName = comp.companyName || comp.legalName || "ORVEXA TECHNOLOGIES";
  let companyAddress = comp.addressLine1 || "DJ Chambers, Highway Road, Sabarkantha, Gujarat - 383235";
  if (companyAddress.toLowerCase().includes("demo address")) {
    companyAddress = "DJ Chambers, Highway Road, Sabarkantha, Gujarat - 383235";
  }

  const companyEmail = comp.businessEmail || "harshil9913435191@gmail.com";
  const companyPhone = comp.phone || "+91 9023989172";
  let gstNumber = comp.gstNumber || "29ABCDE1234F1Z5";
  if (gstNumber.includes("DEMO")) gstNumber = "29ABCDE1234F1Z5";
  let compPan = comp.panNumber || "HPQPP1139P";
  if (compPan.includes("DEMO")) compPan = "HPQPP1139P";

  const employeeName = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ") || payslip.employeeName || "Employee";
  const employeeCode = emp.employeeId || payslip.employeeCode || "150236";
  const departmentName = emp.departmentId?.departmentname || payslip.departmentName || "Information Technology";
  const designationName = emp.designationId?.designationname || payslip.designationName || "Software Engineer";
  const joiningDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "10 Nov 2026";

  const bankName = emp.bankName?.bankName || (typeof emp.bankName === "string" ? emp.bankName : null) || "Bank of Baroda";
  const accountNumber = emp.accountNumber ? `•••• •••• ${String(emp.accountNumber).slice(-4)}` : "•••• •••• 2121";
  const fullAccount = emp.accountNumber || "1655131561612121";
  let ifscCode = emp.ifscCode || "BARB0VADALI";
  if (ifscCode.toLowerCase().includes("fasf")) ifscCode = "BARB0VADALI";
  let panNumber = emp.panNumber || "ABCDE4448F";
  let uanNumber = emp.uanNumber || "100987654321";
  if (uanNumber.toLowerCase().includes("sfas")) uanNumber = "100987654321";

  const monthLabel = getMonthLabel(payslip.month) || "October";
  const yearLabel = payslip.year || new Date().getFullYear();
  const payslipNumber = payslip.payslipNumber || `PAY-${yearLabel}-${payslip.month || "10"}-5420`;

  const basic = Number(payslip.basicSalary || 0);
  const hra = Number(payslip.hra || 0);
  const da = Number(payslip.da || 0);
  const conveyance = Number(payslip.conveyance || 0);
  const special = Number(payslip.specialAllowance || 0);
  const otherAllowances = Number(payslip.otherAllowances || 0);
  const gross = Number(payslip.grossEarnings || (basic + hra + da + conveyance + special + otherAllowances));

  const epf = Number(payslip.providentFund || payslip.epf || 0);
  const pt = Number(payslip.professionalTax || 0);
  const tds = Number(payslip.tds || 0);
  const esi = Number(payslip.esi || 0);
  const leaveDeduction = Number(payslip.leaveDeduction || 0);
  const totalDeductions = Number(payslip.totalDeductions || (epf + pt + tds + esi + leaveDeduction));

  const netPay = Number(payslip.netSalary != null ? payslip.netSalary : (payslip.netPay != null ? payslip.netPay : (gross - totalDeductions)));
  const netWords = amountToWords(netPay);

  const status = payslip.status || payslip.paymentStatus || "Paid";
  const isPaid = String(status).toLowerCase() === "paid";
  const paymentMode = payslip.paymentMode || "Bank Transfer";
  const paymentDate = payslip.paymentDate
    ? new Date(payslip.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "25 Oct 2026";

  return (
    <div
      id={elementId}
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        padding: "24px 26px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        fontFamily: "'Nunito', 'Segoe UI', -apple-system, sans-serif",
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: "20px",
          borderBottom: "2px solid #0f766e",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              backgroundColor: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "22px",
            }}
          >
            {companyName.charAt(0) || "O"}
          </div>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              {companyName}
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#475569", fontWeight: 500 }}>
              {companyAddress}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
              <span>GSTIN: <strong style={{ color: "#1e293b" }}>{gstNumber}</strong></span>
              <span>•</span>
              <span>PAN: <strong style={{ color: "#1e293b" }}>{compPan}</strong></span>
              <span>•</span>
              <span>Email: <strong style={{ color: "#1e293b" }}>{companyEmail}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: "#f1f5f9",
              color: "#0f766e",
              border: "1px solid #cbd5e1",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Salary Statement
          </span>
          <h2 style={{ margin: "4px 0 0 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
            {monthLabel} {yearLabel}
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", fontFamily: "monospace", color: "#64748b" }}>
            {payslipNumber}
          </p>
          <div style={{ marginTop: "4px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: isPaid ? "#ecfdf5" : "#fffbeb",
                color: isPaid ? "#047857" : "#b45309",
                border: `1px solid ${isPaid ? "#a7f3d0" : "#fde68a"}`,
              }}
            >
              <CheckCircle2 size={12} style={{ color: isPaid ? "#059669" : "#d97706" }} />
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Employee & Bank Meta Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          padding: "18px 0",
          borderBottom: "1px solid #e2e8f0",
          fontSize: "12px",
        }}
      >
        {/* Left: Employee Info */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            padding: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
              color: "#0f766e",
              marginBottom: "10px",
              textTransform: "uppercase",
              fontSize: "11px",
              letterSpacing: "0.05em",
            }}
          >
            <User size={13} style={{ color: "#0f766e" }} />
            Employee Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "8px", columnGap: "10px" }}>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Employee Name</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{employeeName}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Employee ID</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{employeeCode}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Designation</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{designationName}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Department</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{departmentName}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Date of Joining</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{joiningDate}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>PAN Number</span>
              <span style={{ fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>{panNumber}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment & Banking Details */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            padding: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
              color: "#0f766e",
              marginBottom: "10px",
              textTransform: "uppercase",
              fontSize: "11px",
              letterSpacing: "0.05em",
            }}
          >
            <Landmark size={13} style={{ color: "#0f766e" }} />
            Banking & Disbursement
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "8px", columnGap: "10px" }}>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Bank Name</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{bankName}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Bank Account No.</span>
              <span style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{accountNumber}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>IFSC Code</span>
              <span style={{ fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>{ifscCode}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>UAN / PF Number</span>
              <span style={{ fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>{uanNumber}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Payment Mode</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{paymentMode}</span>
            </div>
            <div>
              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>Disbursement Date</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{paymentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Earnings & Deductions Table */}
      <div style={{ padding: "18px 0", borderBottom: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            overflow: "hidden",
            fontSize: "12px",
          }}
        >
          {/* Earnings Column */}
          <div style={{ borderRight: "1px solid #cbd5e1", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                backgroundColor: "#f1f5f9",
                padding: "10px 14px",
                borderBottom: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Basic Salary</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(basic)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>House Rent Allowance (HRA)</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(hra)}</span>
              </div>
              {da > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#334155" }}>Dearness Allowance (DA / DRA)</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(da)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Conveyance Allowance</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(conveyance)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Special Allowance</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(special)}</span>
              </div>
              {otherAllowances > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#334155" }}>Other Allowances</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(otherAllowances)}</span>
                </div>
              )}
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "10px 14px",
                borderTop: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
                color: "#0f172a",
                fontSize: "12px",
              }}
            >
              <span>Gross Earnings (A)</span>
              <span style={{ color: "#0f766e" }}>{formatCurrency(gross)}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                backgroundColor: "#f1f5f9",
                padding: "10px 14px",
                borderBottom: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Provident Fund (EPF)</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(epf)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Professional Tax (PT)</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(pt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Tax Deducted at Source (TDS)</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(tds)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#334155" }}>Employee State Insurance (ESI)</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(esi)}</span>
              </div>
              {leaveDeduction > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#fff1f2" }}>
                  <span style={{ color: "#b91c1c", fontWeight: 600 }}>Deduction of Leave (LWP / Absent)</span>
                  <span style={{ fontWeight: 800, color: "#b91c1c" }}>{formatCurrency(leaveDeduction)}</span>
                </div>
              )}
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "10px 14px",
                borderTop: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
                color: "#0f172a",
                fontSize: "12px",
              }}
            >
              <span>Total Deductions (B)</span>
              <span style={{ color: "#b91c1c" }}>{formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Net Salary Highlight Banner */}
      <div
        style={{
          margin: "18px 0",
          padding: "16px 20px",
          borderRadius: "10px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Net Salary Payable (Gross A − Deductions B)
          </span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#065f46", letterSpacing: "-0.02em", margin: "2px 0" }}>
            {formatCurrency(netPay)}
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#334155", fontStyle: "italic" }}>
            In Words: <strong style={{ color: "#0f172a" }}>{netWords}</strong>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Disbursed on</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{paymentDate}</span>
          <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "2px" }}>via {paymentMode}</span>
        </div>
      </div>

      {/* 5. Footer & Signatures */}
      <div
        style={{
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "12px",
          color: "#64748b",
          borderTop: "1px dashed #cbd5e1",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>
            Note: This document is a computer-generated official salary statement and does not require a physical signature.
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#94a3b8" }}>
            For queries or tax clarifications, please contact Accounts & Payroll at {companyEmail}.
          </p>
        </div>
        <div style={{ textAlign: "center", minWidth: "160px" }}>
          <div style={{ height: "36px", borderBottom: "1px solid #94a3b8", marginBottom: "4px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f766e" }}>
              Orvexa Payroll Dept
            </span>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
            Authorized Signatory
          </span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Human Resources & Finance</span>
        </div>
      </div>
    </div>
  );
}
