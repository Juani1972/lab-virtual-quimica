import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUndoableState } from "./useUndoableState";

describe("useUndoableState", () => {
  it("arranca con el valor inicial y sin nada para deshacer/rehacer", () => {
    const { result } = renderHook(() => useUndoableState(0));
    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("setLive actualiza el valor visible pero no crea puntos de historial", () => {
    const { result } = renderHook(() => useUndoableState(0));

    act(() => result.current.setLive(10));
    act(() => result.current.setLive(20));

    expect(result.current.value).toBe(20);
    expect(result.current.canUndo).toBe(false);
  });

  it("commit registra un punto de historial que undo/redo pueden recorrer", () => {
    const { result } = renderHook(() => useUndoableState(0));

    act(() => result.current.commit(10));
    act(() => result.current.commit(25));

    expect(result.current.value).toBe(25);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.value).toBe(10);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.value).toBe(25);
    expect(result.current.canRedo).toBe(false);
  });

  it("commit después de un undo descarta el futuro anterior (como cualquier editor)", () => {
    const { result } = renderHook(() => useUndoableState(0));

    act(() => result.current.commit(10));
    act(() => result.current.commit(20));
    act(() => result.current.undo()); // volvemos a 10
    act(() => result.current.commit(99)); // nueva rama

    expect(result.current.value).toBe(99);
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    expect(result.current.value).toBe(10);
  });

  it("commit con el mismo valor que el punto actual no duplica el historial", () => {
    const { result } = renderHook(() => useUndoableState(0));

    act(() => result.current.commit(10));
    act(() => result.current.commit(10)); // mismo valor, no debería crear un paso nuevo
    act(() => result.current.commit(20));

    // Si el commit duplicado hubiera creado un paso extra, este segundo
    // undo todavía mostraría 10 en vez de volver al valor inicial.
    act(() => result.current.undo());
    expect(result.current.value).toBe(10);
    act(() => result.current.undo());
    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });

  it("resetHistory borra el pasado y el futuro", () => {
    const { result } = renderHook(() => useUndoableState(0));

    act(() => result.current.commit(10));
    act(() => result.current.commit(20));
    act(() => result.current.resetHistory(0));

    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo/redo no hacen nada en los extremos del historial", () => {
    const { result } = renderHook(() => useUndoableState(5));

    act(() => result.current.undo());
    expect(result.current.value).toBe(5);

    act(() => result.current.redo());
    expect(result.current.value).toBe(5);
  });
});
