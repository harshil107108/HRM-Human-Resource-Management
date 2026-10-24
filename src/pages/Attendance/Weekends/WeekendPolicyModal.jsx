import PropTypes from "prop-types";
import { HpCommonModal } from "@/hp-common-modal";
import { formMethod, FormRenderer } from "@/form-engine";
import SelectWrapper from "@/form-engine/components/fields/SelectWrapper";
import { useWeekendPolicyConfig } from "./useWeekendPolicyConfig";
import {
  CalendarDays,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import useApiCall from "@/hooks/useApiCall";
import { api, apiEndpoints } from "@/api/api";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PATTERN_OPTIONS = [
  { value: "2nd & 4th", label: "2nd & 4th of Month" },
  { value: "1st & 3rd", label: "1st & 3rd of Month" },
  { value: "1st, 3rd & 5th", label: "1st, 3rd & 5th of Month" },
  { value: "All", label: "All Weeks of Month" },
];

// Single Alternate Rule Row using formMethod SelectWrapper
const AlternateRuleRow = ({ index, rule, selectedDays, onUpdate, onRemove }) => {
  const dayOptions = useMemo(() => {
    return DAYS_OF_WEEK.map((d) => ({
      label: d + (selectedDays.includes(d) ? " (Full Off)" : ""),
      value: d,
    }));
  }, [selectedDays]);

  const rowForm = useMemo(() => {
    return formMethod.createForm({
      schema: [
        {
          id: `rule_day_${index}`,
          label: "Day of Week",
          type: "selectWrapper",
          options: dayOptions,
          menuPlacement: "top",
          onChange: (form) => {
            const val = form.methods.getValues()[`rule_day_${index}`];
            if (val && val !== rule.day) {
              onUpdate(index, { ...rule, day: val });
            }
          },
        },
        {
          id: `rule_pattern_${index}`,
          label: "Which Weeks Off",
          type: "selectWrapper",
          options: PATTERN_OPTIONS,
          menuPlacement: "top",
          onChange: (form) => {
            const val = form.methods.getValues()[`rule_pattern_${index}`];
            if (val && val !== rule.pattern) {
              onUpdate(index, { ...rule, pattern: val });
            }
          },
        },
      ],
      initialValue: {
        [`rule_day_${index}`]: rule.day,
        [`rule_pattern_${index}`]: rule.pattern,
      },
    });
  }, [index, dayOptions]);

  // Sync external changes into rowForm
  useEffect(() => {
    const currentValues = rowForm.methods.getValues();
    if (currentValues[`rule_day_${index}`] !== rule.day) {
      rowForm.methods.setValue(`rule_day_${index}`, rule.day, { triggerHooks: false });
    }
    if (currentValues[`rule_pattern_${index}`] !== rule.pattern) {
      rowForm.methods.setValue(`rule_pattern_${index}`, rule.pattern, { triggerHooks: false });
    }
  }, [rule.day, rule.pattern, index, rowForm]);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 transition-all hover:border-slate-300">
      <span className="w-6 h-6 rounded bg-slate-200/80 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-5">
        {index + 1}
      </span>

      {/* Day of Week using SelectWrapper */}
      <div className="flex-1 min-w-[140px]">
        <SelectWrapper
          field={{
            id: `rule_day_${index}`,
            label: "Day of Week",
            options: dayOptions,
            placeHolder: "Select Day",
            menuPlacement: "top",
          }}
          form={rowForm}
        />
      </div>

      {/* Which Weeks Off using SelectWrapper */}
      <div className="flex-1 min-w-[160px]">
        <SelectWrapper
          field={{
            id: `rule_pattern_${index}`,
            label: "Which Weeks Off",
            options: PATTERN_OPTIONS,
            placeHolder: "Select Pattern",
            menuPlacement: "top",
          }}
          form={rowForm}
        />
      </div>

      {/* Delete Button */}
      <div className="pt-5 shrink-0">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-md border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          title="Delete rule"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

AlternateRuleRow.propTypes = {
  index: PropTypes.number.isRequired,
  rule: PropTypes.object.isRequired,
  selectedDays: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const WeekendPolicyModal = ({
  open,
  onClose,
  onModalClose,
  onSaved,
  onSave,
  data,
  extraParams,
  loading,
}) => {
  const { initialValue, schema } = useWeekendPolicyConfig();
  const { apiCall } = useApiCall();

  const closeModal = onClose || onModalClose;
  const policyId = extraParams?.id || data?._id;

  // Full weekly off days (e.g. all Sundays, all Fridays)
  const [selectedDays, setSelectedDays] = useState(data?.days || ["Sunday"]);

  // Flexible alternate rules (e.g. [{ day: "Tuesday", pattern: "2nd & 4th" }])
  const [alternateRules, setAlternateRules] = useState([]);

  const schemaArray = useMemo(() => {
    return Array.isArray(schema)
      ? schema
      : Object.entries(schema).map(([key, val]) => ({ id: key, ...val }));
  }, [schema]);

  const formInstance = useMemo(() => {
    return formMethod.createForm({
      schema: schemaArray,
      initialValue: data || initialValue,
    });
  }, [schemaArray]);

  // Load existing policy data on edit
  const getPolicyById = async () => {
    if (!policyId) return;
    const res = await apiCall({
      id: "getWeekendPolicyById",
      api: api + apiEndpoints.attendance.weekend.WeekendGetByID,
      payload: { _id: policyId },
    });
    if (res?.success && res.data?.data) {
      const policy = res.data.data;
      formInstance.methods.setValues(policy);
      setSelectedDays(Array.isArray(policy.days) ? policy.days : ["Sunday"]);

      if (Array.isArray(policy.alternateRules) && policy.alternateRules.length > 0) {
        setAlternateRules(policy.alternateRules);
      } else if (policy.alternateDay && policy.alternateDay !== "None") {
        setAlternateRules([
          {
            day: policy.alternateDay,
            pattern: policy.alternatePattern || "2nd & 4th",
          },
        ]);
      } else if (policy.alternateSaturdayRule && policy.alternateSaturdayRule !== "None") {
        const pattern = policy.alternateSaturdayRule.includes("1st & 3rd")
          ? "1st & 3rd"
          : "2nd & 4th";
        setAlternateRules([{ day: "Saturday", pattern }]);
      } else {
        setAlternateRules([]);
      }
    }
  };

  useEffect(() => {
    if (open) {
      if (policyId) {
        if (data) {
          formInstance.methods.setValues(data);
          setSelectedDays(data?.days || ["Sunday"]);
          if (Array.isArray(data.alternateRules) && data.alternateRules.length > 0) {
            setAlternateRules(data.alternateRules);
          } else {
            setAlternateRules([]);
          }
        } else {
          getPolicyById();
        }
      } else {
        formInstance.methods.setValues(initialValue);
        setSelectedDays(["Sunday"]);
        setAlternateRules([]);
      }
    }
  }, [open, policyId, data]);

  // Toggle full weekly off day
  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Add a new alternate day rule
  const handleAddAlternateRule = () => {
    const availableDay =
      DAYS_OF_WEEK.find(
        (d) => !alternateRules.some((r) => r.day === d) && !selectedDays.includes(d)
      ) || "Tuesday";

    setAlternateRules((prev) => [
      ...prev,
      { day: availableDay, pattern: "2nd & 4th" },
    ]);
  };

  // Update existing alternate rule
  const handleUpdateAlternateRule = (index, updatedVals) => {
    setAlternateRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updatedVals } : r))
    );
  };

  // Remove alternate rule
  const handleRemoveAlternateRule = (index) => {
    setAlternateRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const isValid = formInstance.methods.validate();
    if (!isValid) return;
    const formData = formInstance.methods.getValues();

    // Prepare alternateSaturdayRule for backward compatibility if Saturday is configured
    const satRule = alternateRules.find((r) => r.day === "Saturday");
    const alternateSaturdayRule = satRule
      ? `${satRule.pattern} Saturday Off`
      : "None";

    const payload = {
      ...formData,
      days: selectedDays,
      weeklyOffDays: selectedDays,
      alternateRules: alternateRules.filter((r) => r.day && r.pattern),
      alternateSaturdayRule,
      ...(policyId ? { _id: policyId } : {}),
    };

    if (onSave && typeof onSave === "function" && onSave.length > 0) {
      onSave(payload);
      return;
    }

    const res = await apiCall({
      id: "addEditWeekendPolicy",
      api: api + apiEndpoints.attendance.weekend.WeekendAddEdit,
      payload,
      showSuccessAlert: true,
    });

    if (res?.success) {
      closeModal?.();
      await onSaved?.();
    }
  };

  const handleClear = () => {
    formInstance.methods.setValues(initialValue);
    setSelectedDays(["Sunday"]);
    setAlternateRules([]);
  };

  return (
    <HpCommonModal
      open={open}
      title={policyId ? "Edit Weekend Policy" : "Add Weekend Policy"}
      size="lg"
      icon={<CalendarDays size={18} />}
      onSave={handleSave}
      onClose={closeModal}
      onClear={handleClear}
      loading={loading || formInstance.methods.isSubmitting()}
      showClearButton={!policyId}
      confirmBeforeClose
      scrollable={true}
      bodyClassName="p-4 sm:p-5"
    >
      <div className="space-y-4">
        {/* Core Policy Fields */}
        <FormRenderer formMethod={formInstance} formSchema={schemaArray} />

        {/* 1. Full Weekly Off Days Section */}
        <div className="border-t border-slate-200/80 pt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 font-['Nunito',sans-serif]">
                Full Weekly Off Days
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Days of the week that are recurring non-working days for every week.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded">
              {selectedDays.length} {selectedDays.length === 1 ? "day" : "days"} selected
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day);
              const shortDay = day.slice(0, 3).toUpperCase();
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`group flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-center transition-all duration-150 select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs ring-1 ring-blue-500/30"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                  }`}
                  title={`Click to mark ${day} as ${isSelected ? "Working" : "Weekly Off"}`}
                >
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase leading-none ${
                      isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  >
                    {shortDay}
                  </span>
                  <span
                    className={`text-xs font-bold mt-1 leading-tight font-['Nunito',sans-serif] ${
                      isSelected ? "text-blue-950" : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>
                  <span
                    className={`mt-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    {isSelected ? "OFF" : "WORK"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Alternate Off Days Section */}
        <div className="border-t border-slate-200/80 pt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 font-['Nunito',sans-serif]">
                Alternate Week Off Rules
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Specify weekdays that are observed as off on specific weeks (e.g. 2nd & 4th Saturday).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddAlternateRule}
              className="hp-grid-add-btn cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              title="Add an alternate week off rule"
            >
              <Plus size={13} />
              <span>Add Alternate Rule</span>
            </button>
          </div>

          {/* Alternate Rules List */}
          {alternateRules.length === 0 ? (
            <div className="p-3 rounded-lg bg-slate-50/80 border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>No alternate week off rules configured. (Only weekly off days will apply).</span>
              <button
                type="button"
                onClick={handleAddAlternateRule}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                + Add Rule
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-0.5">
              {alternateRules.map((rule, idx) => (
                <AlternateRuleRow
                  key={`alt-rule-${idx}`}
                  index={idx}
                  rule={rule}
                  selectedDays={selectedDays}
                  onUpdate={handleUpdateAlternateRule}
                  onRemove={handleRemoveAlternateRule}
                />
              ))}
            </div>
          )}

          {/* Policy Guideline Note */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-[11px] text-slate-600 leading-normal">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>
              <strong>Note:</strong> Alternate rules define weeks when a weekday is observed as off. Only one weekend policy can be active at a time.
            </span>
          </div>
        </div>
      </div>
    </HpCommonModal>
  );
};

WeekendPolicyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onModalClose: PropTypes.func,
  onSave: PropTypes.func,
  onSaved: PropTypes.func,
  data: PropTypes.object,
  extraParams: PropTypes.object,
  loading: PropTypes.bool,
};

export default WeekendPolicyModal;
