/**
 * formMethod
 * ----------
 * Public factory namespace used like:
 *
 *   const form = formMethod.createForm({
 *     schema: userSchema,
 *     initialValue,
 *   });
 *
 * It is intentionally a plain object (not a class instance) so that new
 * top-level methods can be bolted on later without touching this file's
 * callers, e.g.:
 *
 *   formMethod.createFormFromApi = async (url) => { ... }
 *
 * Prefer using `extendFormMethod` below rather than mutating the object
 * directly - it warns if you accidentally overwrite a built-in method.
 */

import { FormStore } from "./FormStore";

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
