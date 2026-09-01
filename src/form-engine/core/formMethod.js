
import { FormStore } from "./FormStore.js";

const formMethod = {
  /**
   * Creates a new form instance.
   * @param {Object} config
   * @param {Array}  config.schema - array of field definitions
   * @param {Object} [config.initialValue] - initial values keyed by field id
   * @returns {FormStore}
   */
  createForm({ schema = [], initialValue = {} } = {}) {
    return new FormStore({ schema, initialValue });
  },
};

/**
 * Registers a new method on `formMethod` (e.g. createFormFromSchemaAsync,
 * createFormWithDefaults, etc.) so the API can grow without breaking
 * existing imports.
 *
 * @param {string} name
 * @param {(...args: any[]) => any} implementation
 */
export function extendFormMethod(name, implementation) {
  if (formMethod[name]) {
    // eslint-disable-next-line no-console
    console.warn(
      `[formMethod] "${name}" already exists and is being overwritten.`,
    );
  }
  formMethod[name] = implementation;
}

export default formMethod;
