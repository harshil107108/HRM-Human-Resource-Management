import { useCallback, useSyncExternalStore } from "react";

/**
 * useFormStore
 * ------------
 * Subscribes the calling component to a FormStore instance so it
 * re-renders only when the selected state changes.
 *
 * Passing a selector keeps field components from re-rendering on every
 * unrelated form update, which is important for large forms.
 */
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

export default useFormStore;
