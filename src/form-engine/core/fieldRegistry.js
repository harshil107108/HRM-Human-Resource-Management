
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
