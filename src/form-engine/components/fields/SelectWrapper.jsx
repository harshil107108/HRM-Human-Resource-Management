import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useFormStore } from "../../hooks/useFormStore";
import {
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

export function shouldHandleSelectKeyDown(event, { form, id, prevFocusField }) {
  if (event.key === "Tab" && event.shiftKey && prevFocusField) {
    event.preventDefault();
    form.methods.focusPrev(id);
    return true;
  }

  return false;
}

export default function SelectWrapper({ field, form }) {
  useFormStore(form);

  const {
    id,
    label,
    placeHolder,
    options = [],
    disabled,
    required,
  } = field;

  const value = form.methods.getValue(id);
  const error = form.methods.getErrors()[id];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftValues, setDraftValues] = useState([]);
  const isMultiSelect = Boolean(field.isMultiSelect || field.multiSelect);

  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === "") return [];
    return [value];
  }, [value]);

  useEffect(() => {
    setDraftValues(selectedValues);
  }, [selectedValues]);

  const selectedValue = useMemo(() => {
    if (isMultiSelect) {
      return options.filter((item) => draftValues.includes(item.value));
    }

    return options.find((item) => item.value === value) || null;
  }, [draftValues, isMultiSelect, options, value]);

  const handleChange = useCallback(
    (selected) => {
      if (isMultiSelect) {
        const nextValues = selected ? selected.map((item) => item.value) : [];
        setDraftValues(nextValues);
        return;
      }

      form.methods.setValue(id, selected?.value || "");
      setIsMenuOpen(false);
    },
    [form, id, isMultiSelect]
  );

  const handleMenuOpen = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(true);
  }, [selectedValues]);

  const handleMenuClose = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(false);
  }, [selectedValues]);

  const handleOptionToggle = useCallback((optionValue) => {
    setDraftValues((prev) =>
      prev.includes(optionValue)
        ? prev.filter((item) => item !== optionValue)
        : [...prev, optionValue]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setDraftValues((prev) => {
      if (prev.length === options.length) {
        return [];
      }

      return options.map((item) => item.value);
    });
  }, [options]);

  const handleApply = useCallback(() => {
    form.methods.setValue(id, draftValues);
    setIsMenuOpen(false);
  }, [draftValues, form, id]);

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsMenuOpen(true);
    }
  }, [disabled]);

  const handleBlur = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(false);
    form.methods.blurField(id);
  }, [form, id, selectedValues]);

  const handleKeyDown = useCallback(
    (event) => {
      if (shouldHandleSelectKeyDown(event, {
        form,
        id,
        prevFocusField: field.prevFocusField,
      })) {
        return;
      }
    },
    [field.prevFocusField, form, id]
  );

  const renderOption = useCallback(
    (optionProps) => {
      const { data, innerRef, innerProps } = optionProps;
      const { onClick, ...restInnerProps } = innerProps;
      const isSelected = draftValues.includes(data.value);

      return (
        <div
          ref={innerRef}
          {...restInnerProps}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleOptionToggle(data.value);
          }}
          className={`flex cursor-pointer items-center gap-2 rounded px-3 py-3 text-sm ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"
            }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100"
          />
          <span className="text-slate-700">{data.label}</span>
        </div>
      );
    },
    [draftValues, handleOptionToggle]
  );

  const renderMenuList = useCallback(
    ({ children }) => (
      <div>
        {isMultiSelect && (
          <div className="flex items-center gap-2 border-b border-slate-200 px-2 py-2">
            <input
              type="checkbox"
              checked={draftValues.length > 0 && draftValues.length === options.length}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100"
            />
            <span className="text-sm font-medium text-slate-700">Select All</span>
          </div>
        )}
        <div className="max-h-56 overflow-y-auto py-1">{children}</div>
        {isMultiSelect && (
          <div className="border-t border-slate-200 px-2 py-2">
            <div className="flex justify-end">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleApply}
                className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    [draftValues.length, handleApply, handleSelectAll, isMultiSelect, options.length]
  );

  return (
    <div className={wrapperClass}>
      {label && (
        <label className={labelClass}>
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <Select
        inputId={id}
        ref={(node) => form.methods.registerRef(id, node)}
        options={options}
        value={selectedValue}
        placeholder={placeHolder || "Select"}
        onChange={handleChange}
        onFocus={isMultiSelect ? handleFocus : undefined}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        isDisabled={disabled}
        isMulti={isMultiSelect}
        isClearable={false}
        isSearchable
        closeMenuOnSelect={isMultiSelect ? false : true}
        hideSelectedOptions={false}
        menuPlacement="auto"
        menuPortalTarget={document.body}
        menuIsOpen={isMultiSelect ? isMenuOpen : undefined}
        onMenuOpen={isMultiSelect ? handleMenuOpen : undefined}
        onMenuClose={isMultiSelect ? handleMenuClose : undefined}
        classNamePrefix="form-select"
        className="w-full"
        components={
          isMultiSelect
            ? {
              Option: renderOption,
              MenuList: renderMenuList,
            }
            : undefined
        }
        styles={customStyles(error)}
      />

      {error && (
        <p className={errorClass}>{error}</p>
      )}
    </div>
  );
}

const customStyles = (error) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    height: 32,
    borderRadius: 5,
    border: `1px solid ${error ? "#ef4444" : state.isFocused ? "#0ea5e9" : "#dbe1ea"}`,
    boxShadow: state.isFocused ? "0 0 0 2px rgba(14, 165, 233, 0.10)" : "0 1px 2px rgba(15, 23, 42, 0.04)",
    outline: "none",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      borderColor: state.isFocused ? "#0ea5e9" : "#bfdbfe",
    },
    fontSize: 11,
    backgroundColor: "#f8fafc",
    transition: "all .2s ease",
    padding: "0 4px",
  }),

  valueContainer: (base) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    padding: "0 5px",
    height: "100%",
    overflow: "hidden",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    margin: 3,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
  }),

  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#cbd5e1",
    width: 1,
    margin: "3px 0",
    alignSelf: "stretch",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    color: "#64748b",
    padding: "0 5px 0 7px",
    transform: state.selectProps.menuIsOpen
      ? "rotate(180deg)"
      : "rotate(0deg)",
    transition: "all .2s",
  }),

  clearIndicator: (base) => ({
    ...base,
    color: "#64748b",
    padding: "0 2px",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
  }),

  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 220,
    scrollbarWidth: "thin",
    scrollbarColor: "#cbd5e1 transparent",
    overflowY: "auto",
  }),

  option: (base, state) => ({
    ...base,
    padding: "6px 8px",
    borderRadius: 5,
    marginBottom: 2,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#e0f2fe"
      : state.isFocused
        ? "#f8fafc"
        : "#fff",
    color: state.isSelected ? "#0f172a" : "#0f172a",
    fontSize: 11,
    fontWeight: 700,
    transition: "all .15s ease",
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
});