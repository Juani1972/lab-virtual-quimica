import type { TitrationSetup } from "../types/chemistry";

interface ControlsProps {
  setup: TitrationSetup;
  volumeAdded: number;
  maxVolume: number;
  onSetupChange: (partial: Partial<TitrationSetup>) => void;
  onVolumeChange: (volume: number) => void;
  onReset: () => void;
}

const COMMON_ACIDS: { label: string; ka: number }[] = [
  { label: "Ácido acético (vinagre)", ka: 1.8e-5 },
  { label: "Ácido fórmico", ka: 1.8e-4 },
  { label: "Ácido cianhídrico", ka: 6.2e-10 },
  { label: "Ácido hipocloroso", ka: 3.0e-8 },
];

export function Controls({
  setup,
  volumeAdded,
  maxVolume,
  onSetupChange,
  onVolumeChange,
  onReset,
}: ControlsProps) {
  return (
    <div className="controls">
      <fieldset>
        <legend>Ácido débil (matraz)</legend>

        <label>
          Ácido
          <select
            value={setup.ka}
            onChange={(event) => onSetupChange({ ka: Number(event.target.value) })}
          >
            {COMMON_ACIDS.map((acid) => (
              <option key={acid.label} value={acid.ka}>
                {acid.label} (Ka = {acid.ka.toExponential(1)})
              </option>
            ))}
          </select>
        </label>

        <label>
          Concentración (mol/L)
          <input
            type="number"
            min={0.001}
            max={1}
            step={0.01}
            value={setup.acidConcentration}
            onChange={(event) => onSetupChange({ acidConcentration: Number(event.target.value) })}
          />
        </label>

        <label>
          Volumen inicial (mL)
          <input
            type="number"
            min={1}
            max={200}
            step={1}
            value={setup.acidVolume}
            onChange={(event) => onSetupChange({ acidVolume: Number(event.target.value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Base fuerte (bureta)</legend>
        <label>
          Concentración (mol/L)
          <input
            type="number"
            min={0.001}
            max={1}
            step={0.01}
            value={setup.baseConcentration}
            onChange={(event) => onSetupChange({ baseConcentration: Number(event.target.value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Titulación</legend>
        <label>
          Volumen agregado: {volumeAdded.toFixed(2)} mL
          <input
            type="range"
            min={0}
            max={maxVolume}
            step={maxVolume / 500 || 0.01}
            value={volumeAdded}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>
        <button type="button" onClick={onReset}>
          Reiniciar bureta
        </button>
      </fieldset>
    </div>
  );
}
