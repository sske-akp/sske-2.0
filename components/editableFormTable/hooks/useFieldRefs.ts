import { useCallback, useRef } from "react";

export function useFieldRefs() {
  const gridRef = useRef<Map<string, HTMLElement>>(new Map());

  const getKey = (row: number, col: number) => `${row}-${col}`;

  const setRef = useCallback(
    (rowIndex: number, colIndex: number) => (el: HTMLElement | null) => {
      const key = getKey(rowIndex, colIndex);
      if (el) {
        gridRef.current.set(key, el);
      } else {
        gridRef.current.delete(key);
      }
    },
    []
  );

  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    const key = getKey(rowIndex, colIndex);
    const el = gridRef.current.get(key);
    if (!el) return;

    // For combobox cells, find the focusable trigger inside
    const combobox = el.querySelector('[role="combobox"]') as HTMLElement;
    const input = el.querySelector("input") as HTMLElement;
    const target = combobox || input || el;

    target.focus();
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const removeRow = useCallback((rowIndex: number) => {
    const newGrid = new Map<string, HTMLElement>();
    gridRef.current.forEach((el, key) => {
      const [r, c] = key.split("-").map(Number);
      if (r < rowIndex) {
        newGrid.set(key, el);
      } else if (r > rowIndex) {
        newGrid.set(getKey(r - 1, c), el);
      }
      // r === rowIndex: skip (deleted)
    });
    gridRef.current = newGrid;
  }, []);

  return { setRef, focusCell, removeRow };
}
