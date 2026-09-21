import { useCallback, useRef, useState } from "react";

/**
 * Estado con historial de deshacer/rehacer.
 *
 * `setLive` actualiza el valor visible en cada evento (por ejemplo, mientras
 * se arrastra un slider) sin tocar el historial. `commit` registra un punto
 * de retorno (por ejemplo, al soltar el slider), que es lo que `undo`/`redo`
 * recorren.
 */
export function useUndoableState<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const historyRef = useRef<T[]>([initial]);
  const indexRef = useRef(0);

  const setLive = useCallback((next: T) => {
    setValue(next);
  }, []);

  const commit = useCallback((next: T) => {
    if (historyRef.current[indexRef.current] === next) {
      setValue(next);
      return;
    }
    historyRef.current = [...historyRef.current.slice(0, indexRef.current + 1), next];
    indexRef.current = historyRef.current.length - 1;
    setValue(next);
  }, []);

  const resetHistory = useCallback((next: T) => {
    historyRef.current = [next];
    indexRef.current = 0;
    setValue(next);
  }, []);

  const undo = useCallback(() => {
    setValue((current) => {
      if (indexRef.current <= 0) return current;
      indexRef.current -= 1;
      return historyRef.current[indexRef.current];
    });
  }, []);

  const redo = useCallback(() => {
    setValue((current) => {
      if (indexRef.current >= historyRef.current.length - 1) return current;
      indexRef.current += 1;
      return historyRef.current[indexRef.current];
    });
  }, []);

  return {
    value,
    setLive,
    commit,
    resetHistory,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
  };
}
