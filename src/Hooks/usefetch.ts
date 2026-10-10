/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
import { useCallback, useEffect, useRef, useState } from "react";

export function useFetch<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean }>({ data: null, error: "", loading: true });
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    loadRef.current()
      .then((data) => { if (!cancelled) setState({ data, error: "", loading: false }); })
      .catch((e: unknown) => { if (!cancelled) setState({ data: null, error: e instanceof Error ? e.message : "Something went wrong.", loading: false }); });
    return () => { cancelled = true; };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}