import { useCallback, useSyncExternalStore } from "react";

export function useFormStore(store, selector = (snapshot) => snapshot) {
  const subscribe = useCallback(
    (onChange) => store.methods.subscribe(onChange),
    [store],
  );

  const getSnapshot = useCallback(
    () => selector(store.methods.getSnapshot()),
    [store, selector],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * useWatch(form, id)
 * ------------------
 * Standalone, ESLint-recognized equivalent of `form.methods.watch(id)`.
 * Same behavior, same underlying subscription - use this if you want the
 * react-hooks lint plugin to verify your hook usage (its name starts with
 * "use", which `form.methods.watch` intentionally doesn't).
 *
 *   const age = useWatch(form, "age");   // one field, re-renders on change
 *   const all = useWatch(form);           // whole values object
 */
export function useWatch(store, id) {
  return useFormStore(store, (snapshot) =>
    id === undefined ? snapshot.values : snapshot.values[id],
  );
}

export default useFormStore;