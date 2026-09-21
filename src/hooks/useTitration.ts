import { useMemo, useState } from "react";
import { calculatePH, equivalenceVolume, generateTitrationCurve } from "../engine/titration";
import type { TitrationSetup, TitrationState } from "../types/chemistry";

const DEFAULT_SETUP: TitrationSetup = {
  acidConcentration: 0.1,
  acidVolume: 25,
  ka: 1.8e-5, // ácido acético
  baseConcentration: 0.1,
};

export function useTitration(initialSetup: TitrationSetup = DEFAULT_SETUP) {
  const [setup, setSetup] = useState<TitrationSetup>(initialSetup);
  const [volumeAdded, setVolumeAdded] = useState(0);

  const veq = useMemo(() => equivalenceVolume(setup), [setup]);
  const fullCurve = useMemo(() => generateTitrationCurve(setup), [setup]);
  const { pH, region } = useMemo(
    () => calculatePH(setup, volumeAdded),
    [setup, volumeAdded]
  );

  const curveSoFar = useMemo(
    () => fullCurve.filter((point) => point.volumeAdded <= volumeAdded),
    [fullCurve, volumeAdded]
  );

  const maxVolume = fullCurve.length > 0 ? fullCurve[fullCurve.length - 1].volumeAdded : 0;

  function updateSetup(partial: Partial<TitrationSetup>) {
    setSetup((prev) => ({ ...prev, ...partial }));
    setVolumeAdded(0);
  }

  function reset() {
    setVolumeAdded(0);
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
    setVolumeAdded,
    updateSetup,
    reset,
  };
}
