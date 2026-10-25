import React, { useState, useEffect, useMemo } from "react";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import { Settings, Save, X, RotateCcw, Calculator, Percent, ShieldCheck, Sparkles } from "lucide-react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";
import useAlert from "@/hooks/useAlert";

const defaultRules = {
  basicSalaryPercentage: 50,
  hraPercentage: 40,
  daPercentage: 10,
  conveyanceAmount: 2000,
  specialAllowancePercentage: 15,
  epfPercentage: 12,
  professionalTax: 200,
  tdsPercentage: 5,
  esiPercentage: 0,
};

const earningsSchema = [
  {
    id: "basicSalaryPercentage",
    type: "number",
    label: "Basic Salary (% of Monthly CTC)",
    required: true,
    placeHolder: "50",
    className: "col-span-12",
  },
  {
    id: "hraPercentage",
    type: "number",
    label: "HRA - House Rent Allowance (% of Basic)",
    required: true,
    placeHolder: "40",
    className: "col-span-12",
  },
  {
    id: "daPercentage",
    type: "number",
    label: "DRA / DA - Dearness Allowance (% of Basic)",
    required: true,
    placeHolder: "10",
    className: "col-span-12",
  },
  {
    id: "conveyanceAmount",
    type: "number",
    label: "Conveyance Allowance (Fixed ₹ / Month)",
    required: true,
    placeHolder: "2000",
    className: "col-span-12",
  },
  {
    id: "specialAllowancePercentage",
    type: "number",
    label: "Special Allowance (% of Monthly CTC)",
    required: true,
    placeHolder: "15",
    className: "col-span-12",
  },
];

const deductionsSchema = [
  {
    id: "epfPercentage",
    type: "number",
    label: "Provident Fund / EPF (% of Basic)",
    required: true,
    placeHolder: "12",
    className: "col-span-12",
  },
  {
    id: "professionalTax",
    type: "number",
    label: "Professional Tax - PT (Fixed ₹ / Month)",
    required: true,
    placeHolder: "200",
    className: "col-span-12",
  },
  {
    id: "tdsPercentage",
    type: "number",
    label: "TDS / Income Tax Estimate (% of Gross)",
    required: true,
    placeHolder: "5",
    className: "col-span-12",
  },
  {
    id: "esiPercentage",
    type: "number",
    label: "ESI (% of Gross Earnings)",
    placeHolder: "0",
    className: "col-span-12",
  },
];

const fullSalaryRulesSchema = [...earningsSchema, ...deductionsSchema];

const SalarySettingsModal = ({ open, onModalClose, onSaved }) => {
  const { apiCall, isPending } = useApiCall();
  const { successAlert, errorAlert } = useAlert();

  const [testCtc, setTestCtc] = useState(600000); // 6 LPA for instant live simulator

  // Initialize formMethod FormStore
  const formmethod = useMemo(() => {
    return formMethod.createForm({
      schema: fullSalaryRulesSchema,
      initialValue: defaultRules,
    });
  }, []);

  // Watch form values reactively for the live test simulator
  const watchedValues = formmethod.methods.watch();

  // Fetch current rules from Database API
  useEffect(() => {
    if (!open) return;

    const fetchSettings = async () => {
      const res = await apiCall({
        id: "getSalarySettings",
        api: api + apiEndpoints.payroll.payslip.SalarySettingsGet,
        payload: {},
      });

      if (res?.success && res.data?.data) {
        const d = res.data.data;
        const vals = {
          basicSalaryPercentage: d.basicSalaryPercentage ?? 50,
          hraPercentage: d.hraPercentage ?? 40,
          daPercentage: d.daPercentage ?? 10,
          conveyanceAmount: d.conveyanceAmount ?? 2000,
          specialAllowancePercentage: d.specialAllowancePercentage ?? 15,
          epfPercentage: d.epfPercentage ?? 12,
          professionalTax: d.professionalTax ?? 200,
          tdsPercentage: d.tdsPercentage ?? 5,
          esiPercentage: d.esiPercentage ?? 0,
        };
        formmethod.methods.setValues(vals);
      }
    };

    fetchSettings();
  }, [open, formmethod]);

  const handleResetDefaults = () => {
    formmethod.methods.setValues(defaultRules);
  };

  const handleSave = async () => {
    await formmethod.methods.handleFormSave(
      async (data) => {
        const payload = {
          basicSalaryPercentage: Number(data.basicSalaryPercentage) >= 0 ? Number(data.basicSalaryPercentage) : 50,
          hraPercentage: Number(data.hraPercentage) >= 0 ? Number(data.hraPercentage) : 40,
          daPercentage: Number(data.daPercentage) >= 0 ? Number(data.daPercentage) : 10,
          conveyanceAmount: Number(data.conveyanceAmount) >= 0 ? Number(data.conveyanceAmount) : 2000,
          specialAllowancePercentage: Number(data.specialAllowancePercentage) >= 0 ? Number(data.specialAllowancePercentage) : 15,
          epfPercentage: Number(data.epfPercentage) >= 0 ? Number(data.epfPercentage) : 12,
          professionalTax: Number(data.professionalTax) >= 0 ? Number(data.professionalTax) : 200,
          tdsPercentage: Number(data.tdsPercentage) >= 0 ? Number(data.tdsPercentage) : 5,
          esiPercentage: Number(data.esiPercentage) >= 0 ? Number(data.esiPercentage) : 0,
        };

        const res = await apiCall({
          id: "saveSalarySettings",
          api: api + apiEndpoints.payroll.payslip.SalarySettingsSave,
          payload,
        });

        if (!res?.success) {
          throw new Error(res?.message || "Failed to update salary configuration rules.");
        }

        successAlert({
          title: "Salary Rules Saved",
          text: "Salary breakdown & calculation rules updated successfully in the database.",
        });
        onSaved?.(res.data?.data || payload);
        onModalClose();
        return res;
      },
      {
        successMessage: "Salary configuration rules updated successfully",
      }
    );
  };

  // Instant simulator calculations based on watched formmethod values
  const currentRules = { ...defaultRules, ...watchedValues };
  const monthlyCtc = (Number(testCtc) || 0) / 12;
  const simBasic = Math.round(monthlyCtc * ((Number(currentRules.basicSalaryPercentage) || 0) / 100));
  const simHra = Math.round(simBasic * ((Number(currentRules.hraPercentage) || 0) / 100));
  const simDa = Math.round(simBasic * ((Number(currentRules.daPercentage) || 0) / 100));
  const simConveyance = Number(currentRules.conveyanceAmount) || 0;
  const simSpecial = Math.round(monthlyCtc * ((Number(currentRules.specialAllowancePercentage) || 0) / 100));
  const simGross = simBasic + simHra + simDa + simConveyance + simSpecial;

  const simEpf = Math.round(simBasic * ((Number(currentRules.epfPercentage) || 0) / 100));
  const simPt = Number(currentRules.professionalTax) || 0;
  const simTds = Math.round(simGross * ((Number(currentRules.tdsPercentage) || 0) / 100));
  const simEsi = Math.round(simGross * ((Number(currentRules.esiPercentage) || 0) / 100));
  const simDeductions = simEpf + simPt + simTds + simEsi;
  const simNetPay = simGross - simDeductions;

  const renderFooter = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 4px",
      }}
    >
      <button
        type="button"
        onClick={handleResetDefaults}
        className="hp-modal-btn"
        style={{
          border: "1px solid #cbd5e1",
          background: "#f8fafc",
          color: "#475569",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <RotateCcw size={15} style={{ marginRight: "6px" }} />
        Reset to Standard Defaults
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          className="hp-modal-btn hp-modal-btn--cancel"
          onClick={onModalClose}
        >
          <span className="hp-modal-btn__icon" aria-hidden="true"><X size={16} /></span>
          Cancel
        </button>

        <button
          type="button"
          className="hp-modal-btn hp-modal-btn--primary"
          onClick={handleSave}
          disabled={formmethod.methods.isSubmitting() || isPending("saveSalarySettings")}
        >
          <span className="hp-modal-btn__icon" aria-hidden="true"><Save size={16} /></span>
          {isPending("saveSalarySettings") ? "Saving..." : "Save Salary Rules"}
        </button>
      </div>
    </div>
  );

  return (
    <HpCommonModal
      open={open}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={20} className="text-teal-200" />
          <span>Salary Calculation & Allowance Rules</span>
        </div>
      }
      size="xl"
      icon={<Settings size={20} />}
      onClose={onModalClose}
      footer={renderFooter}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#0f172a" }}>
        {/* Intro notice banner */}
        <div
          style={{
            background: "#f0fdfa",
            border: "1px solid #99f6e4",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <Sparkles size={18} style={{ color: "#0d9488", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "13px", color: "#134e4a", lineHeight: 1.5 }}>
            <strong>Automatic Salary Computation Rules:</strong> Configure standard allowance and deduction formulas using standard FormMethod inputs. When generating a payslip, the system applies these rules to calculate Basic, HRA, DRA/DA, EPF, PT, and Net Pay directly from the employee's CTC.
          </div>
        </div>

        {/* Two-Column Form using FormRenderer: Earnings Rules & Deductions Rules */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          {/* Earnings / Allowances Section */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#0f766e",
                marginBottom: "14px",
                paddingBottom: "8px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Percent size={16} />
              Earnings & Allowance Formulas
            </div>

            <FormRenderer formMethod={formmethod} formSchema={earningsSchema} />
          </div>

          {/* Deductions Rules Section */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#b91c1c",
                marginBottom: "14px",
                paddingBottom: "8px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <ShieldCheck size={16} />
              Statutory & Tax Deductions
            </div>

            <FormRenderer formMethod={formmethod} formSchema={deductionsSchema} />
          </div>
        </div>

        {/* Live Simulator Preview Card */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
              <Calculator size={17} style={{ color: "#0d9488" }} />
              <span>Real-Time Calculation Test Simulator</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Test Annual CTC:</span>
              <div style={{ position: "relative", width: "160px" }}>
                <span style={{ position: "absolute", left: "8px", top: "5px", color: "#64748b", fontSize: "12px" }}>₹</span>
                <input
                  type="number"
                  value={testCtc}
                  onChange={(e) => setTestCtc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "4px 8px 4px 22px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "10px",
              background: "#ffffff",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Monthly CTC</span>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>₹{Math.round(monthlyCtc).toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Basic Salary</span>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>₹{simBasic.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>HRA + DRA/DA</span>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>₹{(simHra + simDa).toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#047857", display: "block" }}>Gross Earnings</span>
              <strong style={{ fontSize: "13px", color: "#047857" }}>₹{simGross.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#b91c1c", display: "block" }}>Total Deductions</span>
              <strong style={{ fontSize: "13px", color: "#b91c1c" }}>₹{simDeductions.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ background: "#ecfdf5", padding: "6px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
              <span style={{ fontSize: "11px", color: "#065f46", display: "block", fontWeight: 700 }}>Est. Net Pay</span>
              <strong style={{ fontSize: "14px", color: "#047857", fontWeight: 800 }}>₹{simNetPay.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
      </div>
    </HpCommonModal>
  );
};

export default SalarySettingsModal;
