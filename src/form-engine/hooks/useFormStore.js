import { useCallback, useSyncExternalStore } from "react";

/**
 * useFormStore
 * ------------
 * Subscribes the calling component to a FormStore instance so it
 * re-renders whenever values / errors / touched change.
 *
 * Because FormStore is a plain JS class (not React state), any component
 * that needs to react to form changes (FormRenderer itself, or an
 * individual field component) should call this hook.
 *
 * @param {import('../core/FormStore').FormStore} store
 * @returns {{ values: object, errors: object, touched: object }}
 */
export function useFormStore(store) {
  const subscribe = useCallback(
    (onChange) => store.methods.subscribe(onChange),
    [store],
  );
  const getSnapshot = useCallback(() => store.methods.getSnapshot(), [store]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

export default useFormStore;
