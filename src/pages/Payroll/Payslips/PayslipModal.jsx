import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import {
  FileText,
  Download,
  Printer,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  Save,
  Calculator,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import usePayslipConfig from "./usePayslipConfig";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import { formatDateForInput } from "@/utils/dateUtils";
import { useAuth } from "@/context/AuthContext";
import useAlert from "@/hooks/useAlert";
import PayslipViewDocument from "./PayslipViewDocument";
import { exportPayslipToPdf, printPayslipDirect } from "./payslipPdfUtils";

const monthOptions = [
  { label: "January (1)", value: 1 },
  { label: "February (2)", value: 2 },
  { label: "March (3)", value: 3 },
  { label: "April (4)", value: 4 },
  { label: "May (5)", value: 5 },
  { label: "June (6)", value: 6 },
  { label: "July (7)", value: 7 },
  { label: "August (8)", value: 8 },
  { label: "September (9)", value: 9 },
  { label: "October (10)", value: 10 },
  { label: "November (11)", value: 11 },
  { label: "December (12)", value: 12 },
];

const paymentStatusOptions = [
  { label: "Paid", value: "Paid" },
  { label: "Unpaid", value: "Unpaid" },
  { label: "On Hold", value: "On Hold" },
];

const paymentModeOptions = [
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Cheque", value: "Cheque" },
  { label: "Cash", value: "Cash" },
  { label: "UPI", value: "UPI" },
];

const addPayslipSchema = [
  {
    id: "payslipNumber",
    type: "text",
    label: "Payslip Number",
    required: true,
    className: "col-span-6",
  },
  {
    id: "employeeId",
    type: "selectWrapper",
    label: "Employee",
    required: true,
    placeHolder: "Select Employee",
    options: [],
    className: "col-span-6",
  },
  {
    id: "ctc",
    type: "number",
    label: "Annual CTC (₹)",
    required: true,
    placeHolder: "e.g. 600000",
    className: "col-span-6",
  },
  {
    id: "month",
    type: "selectWrapper",
    label: "Month",
    required: true,
    options: monthOptions,
    className: "col-span-3",
  },
  {
    id: "year",
    type: "number",
    label: "Year",
    required: true,
    placeHolder: "2026",
    className: "col-span-3",
  },
  {
    id: "paymentStatus",
    type: "selectWrapper",
    label: "Payment Status",
    options: paymentStatusOptions,
    className: "col-span-3",
  },
  {
    id: "paymentMode",
    type: "selectWrapper",
    label: "Payment Mode",
    options: paymentModeOptions,
    className: "col-span-3",
  },
  {
    id: "paymentDate",
    type: "date",
    label: "Disbursement Date",
    className: "col-span-3",
  },
  {
    id: "leaveDeduction",
    type: "number",
    label: "Deduction of Leave (₹)",
    disabled: true,
    placeHolder: "0",
    className: "col-span-3",
  },
];

const PayslipModal = ({ onModalClose, onSaved, open, extraParams }) => {
  const { user } = useAuth();
  const { errorAlert } = useAlert();
  const isPrivileged =
    user?.isSuperAdmin ||
    ["ADMIN", "SUPER_ADMIN", "HR"].includes(user?.roleCode);

  const payslipId = extraParams?.id;
  const mode = extraParams?.mode || (payslipId ? "edit" : "add");

  const { payslipSchema, initialValue } = usePayslipConfig();
  const { apiCall, isPending } = useApiCall();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // -------------------------------------------------------------
  // Add Mode FormStore (Streamlined schema with SelectWrapper)
  // -------------------------------------------------------------
  const addInitialValues = useMemo(
    () => ({
      payslipNumber: `PAY-${currentYear}-${currentMonth}-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: "",
      ctc: "",
      leaveDeduction: 0,
      month: currentMonth,
      year: currentYear,
      paymentStatus: "Paid",
      paymentMode: "Bank Transfer",
      paymentDate: formatDateForInput(now),
    }),
    [currentYear, currentMonth],
  );

  const addFormMethod = useMemo(() => {
    return formMethod.createForm({
      schema: addPayslipSchema,
      initialValue: addInitialValues,
    });
  }, [addInitialValues]);

  // -------------------------------------------------------------
  // Edit Mode FormStore (Full detailed schema)
  // -------------------------------------------------------------
  const initialEditSchema = useMemo(() => {
    if (!isPrivileged) {
      return payslipSchema.map((field) => ({ ...field, disabled: true }));
    }
    return payslipSchema;
  }, [payslipSchema, isPrivileged]);

  const editFormMethod = useMemo(() => {
    return formMethod.createForm({
      schema: initialEditSchema,
      initialValue,
    });
  }, [initialEditSchema, initialValue]);

  const [addSchemaWithOptions, setAddSchemaWithOptions] =
    useState(addPayslipSchema);
  const [editSchemaWithOptions, setEditSchemaWithOptions] =
    useState(initialEditSchema);

  const [employeesList, setEmployeesList] = useState([]);
  const [salaryRules, setSalaryRules] = useState({
    basicSalaryPercentage: 50,
    hraPercentage: 40,
    daPercentage: 10,
    conveyanceAmount: 2000,
    specialAllowancePercentage: 15,
    epfPercentage: 12,
    professionalTax: 200,
    tdsPercentage: 5,
    esiPercentage: 0,
  });

  const [activeTab, setActiveTab] = useState(
    mode === "add" ? "form" : "preview",
  );
  const [fullPayslipData, setFullPayslipData] = useState(
    extraParams?.rowData || null,
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Watch fields reactively from addFormMethod
  const watchedEmployeeId = addFormMethod.methods.watch("employeeId");
  const watchedCtc = addFormMethod.methods.watch("ctc");
  const watchedPaymentMode = addFormMethod.methods.watch("paymentMode");
  const watchedMonth = addFormMethod.methods.watch("month");
  const watchedYear = addFormMethod.methods.watch("year");
  const watchedLeaveDeduction = addFormMethod.methods.watch("leaveDeduction");

  // Load employee master list with CTC & salary details
  const loadEmployeeHelp = async () => {
    if (!isPrivileged) return;
    const res = await apiCall({
      id: "getEmployeeHelp",
      api: api + apiEndpoints.employee.employee.EmployeeGetData,
      payload: {},
    });
    if (res?.success) {
      const list = res.data?.data || [];
      setEmployeesList(list);

      const options = list.map((emp) => ({
        label: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeId || ""})${emp.ctc ? ` - ₹${Number(emp.ctc).toLocaleString("en-IN")}/yr` : ""}`,
        value: emp._id,
      }));

      const updatedAddSchema = addPayslipSchema.map((field) =>
        field.id === "employeeId" ? { ...field, options } : field,
      );
      setAddSchemaWithOptions(updatedAddSchema);
      addFormMethod.methods.setSchema(updatedAddSchema);

      const updatedEditSchema = initialEditSchema.map((field) =>
        field.id === "employeeId" ? { ...field, options } : field,
      );
      setEditSchemaWithOptions(updatedEditSchema);
      editFormMethod.methods.setSchema(updatedEditSchema);
    }
  };

  // Load salary rules directly from DB API
  const loadSalarySettings = async () => {
    const res = await apiCall({
      id: "getSalarySettings",
      api: api + apiEndpoints.payroll.payslip.SalarySettingsGet,
      payload: {},
    });

    if (res?.success && res.data?.data) {
      setSalaryRules(res.data.data);
    }
  };

  // Load existing payslip by ID for edit/view mode
  const getDataById = async () => {
    const res = await apiCall({
      id: "getPayslipById",
      api: api + apiEndpoints.payroll.payslip.PayslipGetByID,
      payload: { _id: payslipId },
    });

    if (res?.success && res.data?.data) {
      const d = res.data.data;
      setFullPayslipData(d);

      const formVals = {
        ...d,
        employeeId: d.employeeId?._id || d.employeeId || "",
        paymentDate: formatDateForInput(d.paymentDate || d.generatedDate),
      };

      editFormMethod.methods.setValues(formVals);
    }
  };

  useEffect(() => {
    loadEmployeeHelp();
    loadSalarySettings();
  }, []);

  useEffect(() => {
    if (open && payslipId) {
      getDataById();
    }
  }, [open, payslipId]);

  // When Employee is selected via SelectWrapper, auto-populate CTC
  useEffect(() => {
    if (mode !== "add" || !watchedEmployeeId) return;
    const found = employeesList.find(
      (e) => String(e._id) === String(watchedEmployeeId),
    );
    if (found && found.ctc) {
      addFormMethod.methods.setValue("ctc", Number(found.ctc));
    }
  }, [watchedEmployeeId, employeesList, mode, addFormMethod]);

  // When Employee, Month, Year, or CTC changes in add mode, fetch unexcused leaves and calculate leave deduction
  useEffect(() => {
    if (mode !== "add" || !watchedEmployeeId || !watchedMonth || !watchedYear) return;
    const fetchLeaveDeduction = async () => {
      try {
        const annualCtc = Number(watchedCtc) || 0;
        const res = await apiCall({
          id: "getLeaveDeduction",
          api: api + apiEndpoints.payroll.payslip.EmployeeLeaveDeduction,
          payload: {
            employeeId: watchedEmployeeId,
            month: watchedMonth,
            year: Number(watchedYear),
            ctc: annualCtc,
          },
        });
        if (res?.success && res.data) {
          const deduction = Number(res.data.leaveDeduction) || 0;
          addFormMethod.methods.setValue("leaveDeduction", deduction);
        }
      } catch (err) {
        console.error("Failed to fetch employee leave deduction", err);
      }
    };
    fetchLeaveDeduction();
  }, [watchedEmployeeId, watchedMonth, watchedYear, watchedCtc, mode, addFormMethod]);

  // Live calculation of all salary components based on watched CTC, DB salary rules, and leave deductions
  const calculations = useMemo(() => {
    const annualCtc = Number(watchedCtc) || 0;
    const monthlyCtc = annualCtc > 0 ? annualCtc / 12 : 0;
    const rules = salaryRules;

    const basic = Math.round(
      monthlyCtc * ((Number(rules.basicSalaryPercentage) || 50) / 100),
    );
    const hra = Math.round(basic * ((Number(rules.hraPercentage) || 40) / 100));
    const da = Math.round(basic * ((Number(rules.daPercentage) || 10) / 100));
    const conveyance = Number(rules.conveyanceAmount) || 2000;
    const special = Math.round(
      monthlyCtc * ((Number(rules.specialAllowancePercentage) || 15) / 100),
    );
    const other = 0;
    const gross = basic + hra + da + conveyance + special + other;

    const epf = Math.round(basic * ((Number(rules.epfPercentage) || 12) / 100));
    const pt = Number(rules.professionalTax) || 200;
    const tds = Math.round(gross * ((Number(rules.tdsPercentage) || 5) / 100));
    const esi = Math.round(gross * ((Number(rules.esiPercentage) || 0) / 100));
    const leaveDeduction = Number(watchedLeaveDeduction) || 0;

    const totalDeductions = epf + pt + tds + esi + leaveDeduction;
    const net = Math.max(0, gross - totalDeductions);

    return {
      monthlyCtc: Math.round(monthlyCtc),
      basic,
      hra,
      da,
      conveyance,
      special,
      other,
      gross,
      epf,
      pt,
      tds,
      esi,
      leaveDeduction,
      totalDeductions,
      net,
    };
  }, [watchedCtc, salaryRules, watchedLeaveDeduction]);

  // Save in Add Mode using addFormMethod validation
  const handleSaveAdd = async () => {
    if (!isPrivileged) return;

    await addFormMethod.methods.handleFormSave(
      async (values) => {
        if (!values.employeeId) {
          throw new Error("Please select an employee.");
        }
        if (!values.ctc || Number(values.ctc) <= 0) {
          throw new Error(
            "Please enter Annual CTC to calculate the salary slip.",
          );
        }

        const payload = {
          payslipNumber: values.payslipNumber,
          employeeId: values.employeeId,
          ctc: Number(values.ctc),
          month: values.month,
          year: Number(values.year),
          paymentStatus: values.paymentStatus || "Paid",
          paymentMode: values.paymentMode || "Bank Transfer",
          paymentDate: values.paymentDate,
          basicSalary: calculations.basic,
          hra: calculations.hra,
          da: calculations.da,
          conveyance: calculations.conveyance,
          specialAllowance: calculations.special,
          otherAllowances: calculations.other,
          grossEarnings: calculations.gross,
          epf: calculations.epf,
          providentFund: calculations.epf,
          professionalTax: calculations.pt,
          tds: calculations.tds,
          esi: calculations.esi,
          leaveDeduction: calculations.leaveDeduction,
          totalDeductions: calculations.totalDeductions,
          netSalary: calculations.net,
          netPay: calculations.net,
          status: values.paymentStatus || "Paid",
        };

        const res = await apiCall({
          id: "addEditPayslip",
          api: api + apiEndpoints.payroll.payslip.PayslipAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save payslip");
        }

        onModalClose();
        await onSaved?.();
        return res;
      },
      {
        successMessage: "Payslip generated successfully",
      },
    );
  };

  // Save in Edit Mode using editFormMethod validation
  const handleSaveEdit = async () => {
    if (!isPrivileged) return;

    await editFormMethod.methods.handleFormSave(
      async (data) => {
        const basic = Number(data.basicSalary) || 0;
        const hra = Number(data.hra) || 0;
        const da = Number(data.da) || 0;
        const conveyance = Number(data.conveyance) || 0;
        const spec = Number(data.specialAllowance) || 0;
        const other = Number(data.otherAllowances) || 0;
        const gross =
          Number(data.grossEarnings) ||
          basic + hra + da + conveyance + spec + other;

        const pf = Number(data.epf || data.providentFund) || 0;
        const pt = Number(data.professionalTax) || 0;
        const tds = Number(data.tds) || 0;
        const esi = Number(data.esi) || 0;
        const leaveDeduction = Number(data.leaveDeduction) || 0;
        const deductions =
          Number(data.totalDeductions) || pf + pt + tds + esi + leaveDeduction;

        const net = Number(data.netPay || data.netSalary) || gross - deductions;

        const payload = {
          ...data,
          basicSalary: basic,
          hra,
          da,
          conveyance,
          specialAllowance: spec,
          otherAllowances: other,
          providentFund: pf,
          epf: pf,
          esi,
          professionalTax: pt,
          tds,
          leaveDeduction,
          grossEarnings: gross,
          totalDeductions: deductions,
          netSalary: net,
          netPay: net,
          status: data.paymentStatus || data.status || "Paid",
          ...(payslipId ? { _id: payslipId } : {}),
        };

        const res = await apiCall({
          id: "addEditPayslip",
          api: api + apiEndpoints.payroll.payslip.PayslipAddEdit,
          payload,
          showSuccessAlert: true,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to save payslip");
        }

        onModalClose();
        await onSaved?.();
        return res;
      },
      {
        successMessage: "Payslip saved successfully",
      },
    );
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const empName = fullPayslipData?.employeeId?.firstName || "Employee";
      const month = fullPayslipData?.month || "Statement";
      const year = fullPayslipData?.year || new Date().getFullYear();
      const filename = `Payslip_${empName}_${month}_${year}.pdf`.replace(
        /\s+/g,
        "_",
      );

      await exportPayslipToPdf("payslip-modal-document", filename);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printPayslipDirect("payslip-modal-document");
  };

  const isFormMode = activeTab === "form" && isPrivileged;

  // Title rendering
  const renderTitle = () => {
    if (mode === "add") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Create Employee Salary Slip</span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.2)",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Auto-Calculated from CTC
          </span>
        </div>
      );
    }

    if (!isPrivileged || !payslipId) {
      return <span>Employee Salary Slip</span>;
    }

    return (
      <div className="flex items-center gap-3">
        <span>Employee Salary Slip</span>
        <div className="inline-flex items-center bg-teal-900/40 p-0.5 rounded-md text-xs border border-white/20">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Eye size={12} />
            Statement View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              activeTab === "form"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Edit3 size={12} />
            Edit Form
          </button>
        </div>
      </div>
    );
  };

  // Footer buttons
  const renderCustomFooter = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <div className="hp-modal-footer__left">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            backgroundColor: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
          }}
        >
          <CheckCircle2 size={13} style={{ color: "#059669" }} />
          Official Verified Salary Slip
        </span>
      </div>

      <div
        className="hp-modal-footer__right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: "auto",
        }}
      >
        {payslipId && (
          <>
            <button
              type="button"
              id="btn-print-payslip"
              onClick={handlePrint}
              className="hp-modal-btn hp-modal-btn--secondary"
              title="Print Salary Statement"
            >
              <span className="hp-modal-btn__icon" aria-hidden="true">
                <Printer size={16} />
              </span>
              Print
            </button>

            <button
              type="button"
              id="btn-download-payslip"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="hp-modal-btn"
              style={{
                backgroundColor: "#f0fdfa",
                borderColor: "#0f766e",
                color: "#0f766e",
                fontWeight: 700,
              }}
              title="Download Payslip PDF"
            >
              <span
                className="hp-modal-btn__icon"
                aria-hidden="true"
                style={{ borderColor: "rgba(15, 118, 110, 0.3)" }}
              >
                <Download size={16} />
              </span>
              {isDownloading ? "Generating PDF..." : "Download Payslip"}
            </button>
          </>
        )}

        <button
          type="button"
          className="hp-modal-btn hp-modal-btn--cancel"
          onClick={onModalClose}
        >
          <span className="hp-modal-btn__icon" aria-hidden="true">
            <X size={16} />
          </span>
          Cancel
        </button>

        {mode === "add" && isPrivileged && (
          <button
            type="button"
            className="hp-modal-btn hp-modal-btn--primary"
            onClick={handleSaveAdd}
            disabled={
              addFormMethod.methods.isSubmitting() ||
              isPending("addEditPayslip")
            }
          >
            <span className="hp-modal-btn__icon" aria-hidden="true">
              <Save size={16} />
            </span>
            {isPending("addEditPayslip") ? "Generating..." : "Save Payslip"}
          </button>
        )}

        {mode === "edit" && isFormMode && (
          <button
            type="button"
            className="hp-modal-btn hp-modal-btn--primary"
            onClick={handleSaveEdit}
            disabled={
              editFormMethod.methods.isSubmitting() ||
              isPending("addEditPayslip")
            }
          >
            <span className="hp-modal-btn__icon" aria-hidden="true">
              <Save size={16} />
            </span>
            Update Payslip
          </button>
        )}
      </div>
    </div>
  );

  return (
    <HpCommonModal
      open={open}
      title={renderTitle()}
      size="2xl"
      icon={<FileText size={20} />}
      onClose={onModalClose}
      footer={renderCustomFooter}
      confirmBeforeClose={isFormMode || mode === "add"}
    >
      {/* ADD MODE: Using FormRenderer with selectWrapper and FormMethod */}
      {mode === "add" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <FormRenderer
              formMethod={addFormMethod}
              formSchema={addSchemaWithOptions}
            />
            {watchedCtc > 0 && (
              <div
                style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}
              >
                Monthly Equivalent CTC:{" "}
                <strong style={{ color: "#0f172a" }}>
                  ₹{calculations.monthlyCtc.toLocaleString("en-IN")}/month
                </strong>
              </div>
            )}
          </div>

          {/* Auto-Calculated Salary Summary Showcase Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "18px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Calculator size={18} style={{ color: "#0d9488" }} />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "14px",
                    color: "#0f172a",
                  }}
                >
                  Auto-Computed Salary Overview
                </span>
                {watchedCtc > 0 && (
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    Active Calculation
                  </span>
                )}
              </div>

              {/* Toggle to inspect or customize individual components */}
              <button
                type="button"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                {showDetailedBreakdown ? (
                  <>
                    <ChevronUp size={14} />
                    <span>Hide Detailed Components</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>View / Customize Component Breakdown</span>
                  </>
                )}
              </button>
            </div>

            {/* 3 Core Highlight KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
              }}
            >
              {/* Gross Earnings */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Monthly Gross Earnings
                </span>
                <strong
                  style={{
                    fontSize: "18px",
                    color: "#047857",
                    fontWeight: 800,
                  }}
                >
                  ₹{calculations.gross.toLocaleString("en-IN")}
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    display: "block",
                    marginTop: "2px",
                  }}
                >
                  Basic + HRA + DA + Conveyance + Special
                </span>
              </div>

              {/* Total Deductions */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Total Deductions
                </span>
                <strong
                  style={{
                    fontSize: "18px",
                    color: "#b91c1c",
                    fontWeight: 800,
                  }}
                >
                  ₹{calculations.totalDeductions.toLocaleString("en-IN")}
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    display: "block",
                    marginTop: "2px",
                  }}
                >
                  PF + PT + TDS + ESI{calculations.leaveDeduction > 0 ? ` + Leave Ded (₹${calculations.leaveDeduction.toLocaleString("en-IN")})` : ""}
                </span>
              </div>

              {/* Net Pay (In-Hand) */}
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1.5px solid #10b981",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.12)",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#065f46",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  Net Take-Home Pay (In-Hand)
                </span>
                <strong
                  style={{
                    fontSize: "20px",
                    color: "#047857",
                    fontWeight: 900,
                  }}
                >
                  ₹{calculations.net.toLocaleString("en-IN")}
                </strong>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#047857",
                    display: "block",
                    marginTop: "2px",
                    fontWeight: 600,
                  }}
                >
                  Disbursed via {watchedPaymentMode || "Bank Transfer"}
                </span>
              </div>
            </div>

            {/* Expandable Breakdown: Only displayed if user clicks toggle */}
            {showDetailedBreakdown && (
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px dashed #cbd5e1",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* Earnings List */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#0f766e",
                      marginBottom: "8px",
                    }}
                  >
                    Earnings Components
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Basic Salary ({salaryRules.basicSalaryPercentage}%):
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{calculations.basic.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        HRA ({salaryRules.hraPercentage}% of Basic):
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{calculations.hra.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Dearness Allowance (DA / DRA {salaryRules.daPercentage}
                        %):
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{calculations.da.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Conveyance Allowance (Fixed):
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{calculations.conveyance.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Special Allowance (
                        {salaryRules.specialAllowancePercentage}%):
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{calculations.special.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Deductions List */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#b91c1c",
                      marginBottom: "8px",
                    }}
                  >
                    Deductions & Taxes
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Provident Fund / EPF ({salaryRules.epfPercentage}%):
                      </span>
                      <strong style={{ color: "#b91c1c" }}>
                        ₹{calculations.epf.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        Professional Tax (PT Fixed):
                      </span>
                      <strong style={{ color: "#b91c1c" }}>
                        ₹{calculations.pt.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        TDS / Income Tax ({salaryRules.tdsPercentage}%):
                      </span>
                      <strong style={{ color: "#b91c1c" }}>
                        ₹{calculations.tds.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#475569" }}>
                        ESI ({salaryRules.esiPercentage}%):
                      </span>
                      <strong style={{ color: "#b91c1c" }}>
                        ₹{calculations.esi.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    {calculations.leaveDeduction > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          background: "#fff1f2",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #fecdd3",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#9f1239", fontWeight: 700 }}>
                          Deduction of Leave (LWP / Absent):
                        </span>
                        <strong style={{ color: "#be123c", fontWeight: 800 }}>
                          - ₹{calculations.leaveDeduction.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT / VIEW MODE: Statement View or Form Edit Mode */
        <>
          {activeTab === "preview" ? (
            <div
              style={{ overflowY: "auto", maxHeight: "72vh", padding: "2px" }}
            >
              <PayslipViewDocument
                elementId="payslip-modal-document"
                payslip={fullPayslipData || editFormMethod.methods.getValues()}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <FormRenderer
                formMethod={editFormMethod}
                formSchema={editSchemaWithOptions}
              />
            </div>
          )}
        </>
      )}
    </HpCommonModal>
  );
};

export default PayslipModal;
