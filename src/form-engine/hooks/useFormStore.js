import { useCallback, useSyncExternalStore, useMemo } from "react";
import formMethod from "../core/formMethod";

export function useFormStore(store, selector = (snapshot) => snapshot) {
  const safeStore = useMemo(() => {
    if (store && store.methods && typeof store.methods.getSnapshot === "function") {
      return store;
    }
    return formMethod.createForm({
      schema: [],
      initialValue: typeof store === "object" && store !== null ? store : {},
    });
  }, [store]);

  const subscribe = useCallback(
    (onChange) => safeStore.methods.subscribe(onChange),
    [safeStore],
  );

  const getSnapshot = useCallback(
    () => selector(safeStore.methods.getSnapshot()),
    [safeStore, selector],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // If the caller passed a plain object expecting a formMethod store back
  if (!store || !store.methods) {
    return safeStore;
  }

  return snapshot;
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