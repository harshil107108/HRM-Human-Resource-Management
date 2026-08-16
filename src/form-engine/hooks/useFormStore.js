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

export default useFormStore;
