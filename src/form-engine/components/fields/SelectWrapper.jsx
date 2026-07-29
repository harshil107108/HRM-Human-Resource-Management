import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useFormStore } from "../../hooks/useFormStore";
import {
  labelClass,
  errorClass,
  wrapperClass,
} from "../../styles/formtheme";

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
      if (event.key === " ") {
        event.preventDefault();
        setIsMenuOpen((prev) => !prev);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setIsMenuOpen(true);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        form.methods.focusNext(id);
        return;
      }

      if (event.key === "Tab" && event.shiftKey && field.prevFocusField) {
        event.preventDefault();
        form.methods.focusPrev(id);
      }
    },
    [form, id, field.prevFocusField]
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
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleApply}
              className="w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        isDisabled={disabled}
        isMulti={isMultiSelect}
        isClearable={false}
        isSearchable
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPlacement="auto"
        menuPortalTarget={document.body}
        menuIsOpen={isMenuOpen}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
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
    borderRadius: 4,
    border: `1px solid ${error ? "#ef4444" : state.isFocused ? "#2563eb" : "#cbd5e1"}`,
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    outline: "none",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      borderColor: state.isFocused ? "#2563eb" : "#94a3b8",
    },
    fontSize: 14,
    backgroundColor: "#fff",
    transition: "all .2s",
    padding: "0 2px",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    height: "100%",
    overflow: "hidden",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    margin: 4,
    fontSize: 14,
    lineHeight: 1.2,
  }),

  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    margin: 0,
    fontSize: 14,
    lineHeight: 1.2,
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    color: "#64748b",
    padding: "0 6px",
    transform: state.selectProps.menuIsOpen
      ? "rotate(180deg)"
      : "rotate(0deg)",
    transition: "all .2s",
  }),

  clearIndicator: (base) => ({
    ...base,
    color: "#64748b",
    padding: "0 4px",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menu: (base) => ({
    ...base,
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
  }),

  menuList: (base) => ({
    ...base,
    padding: 4,
    maxHeight: 220,
  }),

  option: (base, state) => ({
    ...base,
    padding: "8px 10px",
    borderRadius: 6,
    marginBottom: 2,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#0f172a",
    fontSize: 14,
    fontWeight: 500,
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
});