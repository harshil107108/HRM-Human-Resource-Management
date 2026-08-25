import { useCallback, useSyncExternalStore } from "react";

export class FormStore {
  constructor({ schema = [], initialValue = {} } = {}) {
    this.schema = schema;

    this.initialValue = { ...initialValue };
    this.values = { ...initialValue };
    this.errors = {};
    this.touched = {};

    this._private = {
      schemaMap: new Map(schema.map((field) => [field.id, field])),
      refs: {},
      listeners: new Set(),
      fieldListeners: new Map(),
      _snapshot: null,
    };

    this._private._snapshot = this._buildSnapshot();

    this.methods = {
      subscribe: (listener) => {
        this._private.listeners.add(listener);
        return () => this._private.listeners.delete(listener);
      },
      getSnapshot: () => this._private._snapshot,
      getSchema: () => this.schema,
      getFieldConfig: (id) => this._private.schemaMap.get(id),
      setSchema: (nextSchema) => {
        this.schema = nextSchema;
        this._private.schemaMap = new Map(
          nextSchema.map((field) => [field.id, field]),
        );
        this.emit();
      },
      getValues: () => this.values,
      getValue: (id) => this.values[id],
      /**
       * React-hook-style reactive getter, e.g. react-hook-form's `watch`.
       * Call it during a component's render:
       *
       *   const age = form.methods.watch("age");     // one field
       *   const all = form.methods.watch();           // whole values object
       *
       * The component re-renders only when the watched value actually
       * changes (not on every unrelated form update), because the
       * underlying subscription is deduped by useSyncExternalStore.
       *
       * NOTE: this is a real React hook under the hood (it calls
       * useSyncExternalStore), so it must be called unconditionally at
       * the top level of a function component/hook, every render - same
       * rule as useState/useEffect. Because the name doesn't start with
       * "use", ESLint's react-hooks plugin won't lint-check that for
       * you; if you want that safety net, use the standalone `useWatch`
       * hook exported from `hooks/useFormStore.js` instead - it's the
       * same implementation, just named for the linter.
       */
      watch: (id) => {
        const subscribe = useCallback(
          (onStoreChange) => this.methods.subscribe(onStoreChange),
          [],
        );
        const getSnapshot = useCallback(
          () => (id === undefined ? this.values : this.values[id]),
          [id],
        );
        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      },
      setValue: (id, value, { triggerHooks = true } = {}) => {
        this.values = { ...this.values, [id]: value };
        this.touched = { ...this.touched, [id]: true };

        if (this.errors[id]) {
          const { [id]: _removed, ...rest } = this.errors;
          this.errors = rest;
        }

        this.emit();

        if (triggerHooks) {
          const field = this.methods.getFieldConfig(id);
          if (typeof field?.onChange === "function") {
            field.onChange(this);
          }
          this._notifyFieldListeners(id);
        }
      },
      setValues: (partialValues, { triggerHooks = true } = {}) => {
        this.values = { ...this.values, ...partialValues };
        this.emit();

        if (triggerHooks) {
          Object.keys(partialValues).forEach((id) => {
            const field = this.methods.getFieldConfig(id);
            if (typeof field?.onChange === "function") field.onChange(this);
            this._notifyFieldListeners(id);
          });
        }
      },
      blurField: (id) => {
        this.touched = { ...this.touched, [id]: true };
        this.emit();

        const field = this.methods.getFieldConfig(id);
        if (typeof field?.onBlur === "function") {
          field.onBlur(this);
        }
      },
      onFieldChange: (id, callback) => {
        if (!this._private.fieldListeners.has(id)) {
          this._private.fieldListeners.set(id, new Set());
        }
        this._private.fieldListeners.get(id).add(callback);
        return () => this.methods.offFieldChange(id, callback);
      },
      offFieldChange: (id, callback) => {
        this._private.fieldListeners.get(id)?.delete(callback);
      },
      reset: (nextInitialValue) => {
        this.initialValue = nextInitialValue
          ? { ...nextInitialValue }
          : this.initialValue;
        this.values = { ...this.initialValue };
        this.errors = {};
        this.touched = {};
        this.emit();
      },
      resetField: (id) => {
        this.values = { ...this.values, [id]: this.initialValue[id] };

        if (this.touched[id]) {
          const { [id]: _t, ...restTouched } = this.touched;
          this.touched = restTouched;
        }
        if (this.errors[id]) {
          const { [id]: _e, ...restErrors } = this.errors;
          this.errors = restErrors;
        }

        this.emit();
      },
      isDirty: (id) => {
        if (id) return this.values[id] !== this.initialValue[id];
        return Object.keys({ ...this.initialValue, ...this.values }).some(
          (key) => this.values[key] !== this.initialValue[key],
        );
      },
      isTouched: (id) => {
        if (id) return Boolean(this.touched[id]);
        return Object.keys(this.touched).length > 0;
      },
      getErrors: () => this.errors,
      setError: (id, message) => {
        this.errors = { ...this.errors, [id]: message };
        this.emit();
      },
      setErrors: (errorsObject) => {
        this.errors = { ...errorsObject };
        this.emit();
      },
      clearError: (id) => {
        if (!this.errors[id]) return;
        const { [id]: _removed, ...rest } = this.errors;
        this.errors = rest;
        this.emit();
      },
      clearErrors: () => {
        this.errors = {};
        this.emit();
      },
      validate: () => {
        const errors = {};

        this.schema.forEach((field) => {
          const value = this.values[field.id];
          const isEmpty = value === undefined || value === null || value === "";

          if (field.required && isEmpty) {
            errors[field.id] =
              field.requiredMessage || `${field.label || field.id} is required`;
            return;
          }

          if (typeof field.validate === "function") {
            const message = field.validate(value, this.values);
            if (message) errors[field.id] = message;
          }
        });

        this.errors = errors;
        this.emit();
        return Object.keys(errors).length === 0;
      },
      isValid: () => Object.keys(this.errors).length === 0,
      registerRef: (id, node) => {
        if (node) {
          this._private.refs[id] = node;
        } else {
          delete this._private.refs[id];
        }
      },
      focusField: (id) => {
        const node = this._private.refs[id];
        if (node && typeof node.focus === "function") {
          node.focus();
          if (typeof node.select === "function") node.select();
        }
      },
      focusNext: (id) => {
        const field = this.methods.getFieldConfig(id);
        if (field?.nextFocusField)
          this.methods.focusField(field.nextFocusField);
      },
      focusPrev: (id) => {
        const field = this.methods.getFieldConfig(id);
        if (field?.prevFocusField)
          this.methods.focusField(field.prevFocusField);
      },
      focusOnField: (id) => {
        this.methods.focusField(id);
      },
      setFieldConfig: (id, updates) => {
        const field = this._private.schemaMap.get(id);
        if (!field) {
          // eslint-disable-next-line no-console
          console.warn(
            `[FormStore] setFieldConfig: no field found with id "${id}".`,
          );
          return;
        }
        const updatedField = { ...field, ...updates };
        this._private.schemaMap.set(id, updatedField);
        this.schema = this.schema.map((item) =>
          item.id === id ? updatedField : item,
        );
        this.emit();
      },
    };
  }

  _buildSnapshot() {
    return {
      schema: this.schema,
      values: this.values,
      errors: this.errors,
      touched: this.touched,
    };
  }

  emit() {
    this._private._snapshot = this._buildSnapshot();
    this._private.listeners.forEach((listener) => listener());
  }

  _notifyFieldListeners(id) {
    this._private.fieldListeners
      .get(id)
      ?.forEach((callback) => callback(this.values[id], this));
  }
}

export default FormStore;