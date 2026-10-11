import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { useFormStore } from "../../hooks/useFormStore";
import { labelClass, wrapperClass } from "../../styles/formtheme";
import { beginActivity } from "../../../utils/networkActivity";
import { confirmStatusChange } from "../../../utils/confirmStatusChange";
import FieldErrorTooltip from "./FieldErrorTooltip";

export function shouldHandleSelectKeyDown(event, { form, id }) {
  if (event.key === "Tab" && event.shiftKey) {
    event.preventDefault();
    form.methods.focusPrev(id);
    return true;
  }

  return false;
}

export function shouldOpenSelectMenuOnSpace(event, isMenuOpen) {
  if (event.key !== " " || isMenuOpen || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }

  event.preventDefault();
  return true;
}

export function shouldAdvanceSelectOnEnter(event, isMenuOpen) {
  if (event.key !== "Enter" || isMenuOpen) {
    return false;
  }

  event.preventDefault();
  return true;
}

export default function SelectWrapper({ field, form }) {
  const {
    id,
    label,
    placeHolder,
    options: staticOptions = [],
    disabled,
    required,

    // API configuration
    api,
    labelKey,
    valueKey,
  } = field;

  const value = useFormStore(form, (state) => state.values[id]);
  const error = useFormStore(form, (state) => state.errors[id]);

  const [options, setOptions] = useState(staticOptions);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftValues, setDraftValues] = useState([]);
  const enterSelectionRef = useRef(false);

  const isMultiSelect = Boolean(field.isMultiSelect || field.multiSelect);

  //chnage when static option change
  useEffect(() => {
    if (!api) {
      setOptions(staticOptions);
    }
  }, [api, staticOptions]);

  // ============================================================
  // LOAD OPTIONS FROM API
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      // No API → use static options
      if (!api) {
        setOptions(staticOptions);
        return;
      }

      if (!labelKey || !valueKey) {
        console.warn(
          `[SelectWrapper] "${id}" requires labelKey and valueKey when api is provided.`,
        );
        setOptions([]);
        return;
      }

      // Lets page loaders wait until dropdown options have arrived.
      const endActivity = beginActivity();

      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || "Failed to load options");
        }

        const apiData = Array.isArray(result?.data) ? result.data : [];

        const formattedOptions = apiData.map((item) => ({
          label: item[labelKey],
          value: item[valueKey],
          originalData: item,
        }));

        if (isMounted) {
          setOptions(formattedOptions);
        }
      } catch (error) {
        console.error(
          `[SelectWrapper] Failed to load options for "${id}": `,
          error,
        );

        if (isMounted) {
          setOptions([]);
          setApiError(error?.message || "Failed to load options");
        }
      } finally {
        endActivity();
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [api, id, labelKey, valueKey]);

  // ============================================================
  // SELECTED VALUES
  // ============================================================

  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === undefined || value === null || value === "") {
      return [];
    }

    return [value];
  }, [value]);

  useEffect(() => {
    if (isMultiSelect) {
      setDraftValues(selectedValues);
    }
  }, [isMultiSelect, selectedValues]);

  // ============================================================
  // SELECTED OPTION
  // ============================================================

  const selectedValue = useMemo(() => {
    if (isMultiSelect) {
      return options.filter((item) =>
        draftValues.some((selected) => String(selected) === String(item.value)),
      );
    }

    return options.find((item) => String(item.value) === String(value)) || null;
  }, [draftValues, isMultiSelect, options, value]);

  // ============================================================
  // CHANGE
  // ============================================================

  const handleChange = useCallback(
    async (selected) => {
      if (isMultiSelect) {
        const nextValues = selected ? selected.map((item) => item.value) : [];

        setDraftValues(nextValues);
        return;
      }

      const shouldAdvanceAfterSelection = enterSelectionRef.current;
      if (/(status|stage|round)/i.test(`${id} ${label || ""}`)) {
        const nextValue = selected?.value ?? "";
        const currentOption = options.find(
          (option) => String(option.value) === String(value),
        );
        const confirmed = await confirmStatusChange({
          fieldName: label || "Status",
          currentValue: value,
          nextValue,
          currentLabel: currentOption?.label,
          nextLabel: selected?.label,
        });

        if (!confirmed) {
          setDraftValues(selectedValues);
          setIsMenuOpen(false);
          enterSelectionRef.current = false;
          return;
        }
      }

      form.methods.setValue(id, selected?.value ?? "");

      setIsMenuOpen(false);

      if (shouldAdvanceAfterSelection) {
        enterSelectionRef.current = false;
        requestAnimationFrame(() => form.methods.focusNext(id));
      }
    },
    [form, id, isMultiSelect, label, options, selectedValues, value],
  );

  // ============================================================
  // MENU
  // ============================================================

  const handleMenuOpen = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(true);
  }, [selectedValues]);

  const handleMenuClose = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(false);
  }, [selectedValues]);

  const shouldCloseMenuOnScroll = useCallback((event) => {
    const menu = document.querySelector(".form-select__menu");
    return !menu?.contains(event.target);
  }, []);

  // ============================================================
  // MULTI SELECT
  // ============================================================

  const handleOptionToggle = useCallback((optionValue) => {
    setDraftValues((prev) =>
      prev.includes(optionValue)
        ? prev.filter((item) => item !== optionValue)
        : [...prev, optionValue],
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

  // ============================================================
  // FOCUS
  // ============================================================

  const handleBlur = useCallback(() => {
    setDraftValues(selectedValues);
    setIsMenuOpen(false);

    form.methods.blurField(id);
  }, [form, id, selectedValues]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        shouldHandleSelectKeyDown(event, {
          form,
          id,
        })
      ) {
        return;
      }

      if (event.key === "Enter") {
        if (shouldAdvanceSelectOnEnter(event, isMenuOpen)) {
          form.methods.focusNext(id);
        } else if (isMenuOpen && !isMultiSelect) {
          enterSelectionRef.current = true;
          window.setTimeout(() => {
            enterSelectionRef.current = false;
          }, 0);
        }
        return;
      }

      if (shouldOpenSelectMenuOnSpace(event, isMenuOpen)) {
        setIsMenuOpen(true);
      }
    },
    [form, id, isMenuOpen, isMultiSelect],
  );

  // ============================================================
  // CUSTOM MULTI SELECT OPTION
  // ============================================================

  const renderOption = useCallback(
    (optionProps) => {
      const { data, innerRef, innerProps } = optionProps;

      const isSelected = draftValues.some(
        (item) => String(item) === String(data.value),
      );

      return (
        <div
          ref={innerRef}
          {...innerProps}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            handleOptionToggle(data.value);
          }}
          className={`flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-1.5 text-sm transition-colors duration-100 last:border-b-0 ${
            isSelected ? "bg-sky-50" : "hover:bg-slate-50"
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-200 focus:ring-offset-0"
          />

          <span className="truncate text-slate-700">{data.label}</span>
        </div>
      );
    },
    [draftValues, handleOptionToggle],
  );

  const renderSingleOption = useCallback(
    (optionProps) => {
      const { data, innerRef, innerProps, isSelected, isFocused } = optionProps;

      const optionIndex = options.findIndex(
        (item) =>
          String(item.value) === String(data.value) &&
          String(item.label) === String(data.label),
      );

      const zebraBackground = optionIndex % 2 === 0 ? "#f8fafc" : "#ffffff";

      return (
        <div
          ref={innerRef}
          {...innerProps}
          className="cursor-pointer"
          style={{
            backgroundColor: isSelected
              ? "#e0f2fe"
              : isFocused
                ? "#f1f5f9"
                : zebraBackground,
            padding: "6px 10px",
            borderBottom: "1px solid #e5e7eb",
            color: "#0f172a",
            fontSize: 12,
            fontWeight: isSelected ? 600 : 500,
            lineHeight: 1.4,
            transition: "background-color 0.12s ease",
          }}
        >
          {data.label}
        </div>
      );
    },
    [options],
  );

  // ============================================================
  // CUSTOM MENU
  // ============================================================

  const renderMenuList = useCallback(
    ({ children }) => (
      <div>
        {isMultiSelect && (
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-3 py-2.5">
            <input
              type="checkbox"
              checked={
                options.length > 0 && draftValues.length === options.length
              }
              onChange={handleSelectAll}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-200 focus:ring-offset-0"
            />

            <span className="text-sm font-medium text-slate-600">
              Select all
            </span>

            {draftValues.length > 0 && (
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {draftValues.length} selected
              </span>
            )}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto py-1.5">{children}</div>

        {isMultiSelect && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-2.5">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleApply}
              className="rounded-md bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-sky-700 active:bg-sky-800"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    ),
    [
      draftValues.length,
      handleApply,
      handleSelectAll,
      isMultiSelect,
      options.length,
    ],
  );

  // ============================================================
  // RENDER
  // ============================================================

  const displayError = error || apiError;

  return (
    <div className={`${wrapperClass} relative`}>
      {displayError && isFocused && (
        <FieldErrorTooltip message={displayError} />
      )}

      {label && (
        <label className={`${labelClass} min-h-5`}>
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <Select
        inputId={id}
        ref={(node) => form.methods.registerRef(id, node)}
        options={options}
        value={selectedValue}
        placeholder={loading ? "Loading..." : placeHolder || "Select"}
        autoComplete="new-password"
        openMenuOnFocus={false}
        onChange={handleChange}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          handleBlur(event);
        }}
        onKeyDown={handleKeyDown}
        isDisabled={disabled || loading}
        isLoading={loading}
        isMulti={isMultiSelect}
        isClearable={false}
        isSearchable
        closeMenuOnSelect={isMultiSelect ? false : true}
        hideSelectedOptions={false}
        menuPlacement="auto"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuShouldScrollIntoView={false}
        closeMenuOnScroll={shouldCloseMenuOnScroll}
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
            : {
                Option: renderSingleOption,
              }
        }
        styles={customStyles(displayError)}
      />
    </div>
  );
}

// ============================================================
// SELECT STYLES
// ============================================================

const customStyles = (error) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    height: 32,
    borderRadius: 5,

    border: `1px solid ${
      error ? "#ef4444" : state.isFocused ? "#0ea5e9" : "#dbe1ea"
    } `,

    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(14, 165, 233, 0.10)"
      : "0 1px 2px rgba(15, 23, 42, 0.04)",

    outline: "none",
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
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
    minWidth: 0,
    width: 0,
    flex: "1 1 auto",
    flexWrap: "nowrap",
    overflow: "hidden",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    margin: 3,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
  }),

  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    margin: 0,
    right: 12,
    maxWidth: "calc(100% - 28px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingRight: 8,
    boxSizing: "border-box",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
  }),

  indicatorSeparator: (base) => ({
    ...base,
    flexShrink: 0,
    backgroundColor: "#cbd5e1",
    width: 1,
    margin: "3px 0",
    alignSelf: "stretch",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    flexShrink: 0,
    color: "#64748b",
    padding: "0 5px 0 7px",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "all .2s",
  }),

  indicatorsContainer: (base) => ({
    ...base,
    flexShrink: 0,
    height: "100%",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
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
    marginTop: 6,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow:
      "0 16px 32px -8px rgba(15, 23, 42, 0.16), 0 4px 8px -2px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
  }),

  menuList: (base) => ({
    ...base,
    padding: 0,
    maxHeight: 240,
    scrollbarWidth: "thin",
    scrollbarColor: "#cbd5e1 transparent",
    overflowY: "auto",
  }),

  option: (base, state) => ({
    ...base,
    padding: "6px 10px",
    borderRadius: 0,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 0,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#e0f2fe"
      : state.isFocused
        ? "#f1f5f9"
        : "#fff",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: state.isSelected ? 700 : 600,
    lineHeight: 1.4,
    transition: "background-color .12s ease",
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: 13.5,
    padding: "12px 8px",
  }),

  loadingMessage: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: 13.5,
  }),
});
