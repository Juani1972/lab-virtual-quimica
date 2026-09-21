import { useMemo, useState } from "react";
import { INDICATORS } from "../engine/indicators";
import { calculatePH, equivalenceVolume, generateTitrationCurve } from "../engine/titration";
import { useUndoableState } from "./useUndoableState";
import type { IndicatorDef, TitrationSetup, TitrationState } from "../types/chemistry";

const DEFAULT_SETUP: TitrationSetup = {
  type: "acido-debil-base-fuerte",
  analyteConcentration: 0.1,
  analyteVolume: 25,
  ka: 1.8e-5, // ácido acético
  titrantConcentration: 0.1,
};

export function useTitration(initialSetup: TitrationSetup = DEFAULT_SETUP) {
  const [setup, setSetup] = useState<TitrationSetup>(initialSetup);
  const {
    value: volumeAdded,
    setLive: setVolumeAdded,
    commit: commitVolume,
    resetHistory: resetVolumeHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoableState(0);
  const [indicator, setIndicator] = useState<IndicatorDef>(INDICATORS[0]);

  const veq = useMemo(() => equivalenceVolume(setup), [setup]);
  const fullCurve = useMemo(() => generateTitrationCurve(setup), [setup]);
  const { pH, region } = useMemo(() => calculatePH(setup, volumeAdded), [setup, volumeAdded]);
  const equivalencePH = useMemo(() => calculatePH(setup, veq).pH, [setup, veq]);

  const curveSoFar = useMemo(
    () => fullCurve.filter((point) => point.volumeAdded <= volumeAdded),
    [fullCurve, volumeAdded]
  );

  const maxVolume = fullCurve.length > 0 ? fullCurve[fullCurve.length - 1].volumeAdded : 0;

  function updateSetup(partial: Partial<TitrationSetup>) {
    setSetup((prev) => ({ ...prev, ...partial }));
    resetVolumeHistory(0);
  }

  function reset() {
    resetVolumeHistory(0);
  }

  const state: TitrationState = {
    ...setup,
    volumeAdded,
    equivalenceVolume: veq,
    pH,
    region,
    curve: curveSoFar,
  };

  return {
    state,
    fullCurve,
    maxVolume,
    equivalencePH,
    indicator,
    setIndicator,
    setVolumeAdded,
    commitVolume,
    undo,
    redo,
    canUndo,
    canRedo,
    updateSetup,
    reset,
  };
}
