/**
 * fieldRegistry
 * -------------
 * Maps a schema field's `type` (e.g. "number", "selectWrapper") to the
 * React component that renders it. This is the extension point for new
 * field types - to add a new one elsewhere in the app:
 *
 *   import { registerFieldType } from './core/fieldRegistry';
 *   import DateField from './components/fields/DateField';
 *   registerFieldType('date', DateField);
 *
 * FormRenderer never needs to know about concrete field types - it only
 * asks this registry for whichever component matches `field.type`.
 */

const registry = new Map();

/**
 * @param {string} type - unique field type key used in schema.type
 * @param {React.ComponentType<{ field: object, form: import('./FormStore').FormStore }>} Component
 */
export function registerFieldType(type, Component) {
  registry.set(type, Component);
}

/**
 * @param {string} type
 * @returns {React.ComponentType|undefined}
 */
export function getFieldComponent(type) {
  const Component = registry.get(type);
  if (!Component) {
    // eslint-disable-next-line no-console
    console.warn(
      `[fieldRegistry] No field component registered for type "${type}".`,
    );
  }
  return Component;
}

export function hasFieldType(type) {
  return registry.has(type);
}

export function getRegisteredTypes() {
  return Array.from(registry.keys());
}
