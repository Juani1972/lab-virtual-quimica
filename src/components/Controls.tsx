import { INDICATORS } from "../engine/indicators";
import {
  TITRATION_TYPE_META,
  TITRATION_TYPE_OPTIONS,
  regionLabel,
} from "../types/chemistry";
import type { IndicatorDef, TitrationRegion, TitrationSetup, TitrationType } from "../types/chemistry";

interface ControlsProps {
  setup: TitrationSetup;
  volumeAdded: number;
  maxVolume: number;
  region: TitrationRegion;
  indicator: IndicatorDef;
  onSetupChange: (partial: Partial<TitrationSetup>) => void;
  onVolumeChange: (volume: number) => void;
  onIndicatorChange: (indicator: IndicatorDef) => void;
  onReset: () => void;
}

const WEAK_ACID_PRESETS: { label: string; ka: number }[] = [
  { label: "Ácido acético (vinagre)", ka: 1.8e-5 },
  { label: "Ácido fórmico", ka: 1.8e-4 },
  { label: "Ácido cianhídrico", ka: 6.2e-10 },
  { label: "Ácido hipocloroso", ka: 3.0e-8 },
];

const WEAK_BASE_PRESETS: { label: string; kb: number }[] = [
  { label: "Amoníaco", kb: 1.8e-5 },
  { label: "Metilamina", kb: 4.4e-4 },
  { label: "Piridina", kb: 1.7e-9 },
];

export function Controls({
  setup,
  volumeAdded,
  maxVolume,
  region,
  indicator,
  onSetupChange,
  onVolumeChange,
  onIndicatorChange,
  onReset,
}: ControlsProps) {
  const meta = TITRATION_TYPE_META[setup.type];

  function handleTypeChange(type: TitrationType) {
    const nextMeta = TITRATION_TYPE_META[type];
    onSetupChange({
      type,
      ka: nextMeta.usesKa ? setup.ka ?? WEAK_ACID_PRESETS[0].ka : undefined,
      kb: nextMeta.usesKb ? setup.kb ?? WEAK_BASE_PRESETS[0].kb : undefined,
    });
  }

  return (
    <div className="controls">
      <fieldset>
        <legend>Tipo de titulación</legend>
        <label>
          Reacción
          <select
            value={setup.type}
            onChange={(event) => handleTypeChange(event.target.value as TitrationType)}
          >
            {TITRATION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Indicador
          <select
            value={indicator.id}
            onChange={(event) => {
              const next = INDICATORS.find((item) => item.id === event.target.value);
              if (next) onIndicatorChange(next);
            }}
          >
            {INDICATORS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} (viraje {item.transitionLow}–{item.transitionHigh})
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>{meta.analyteLabel} (matraz)</legend>

        {meta.usesKa && (
          <label>
            Especie
            <select
              value={setup.ka}
              onChange={(event) => onSetupChange({ ka: Number(event.target.value) })}
            >
              {WEAK_ACID_PRESETS.map((acid) => (
                <option key={acid.label} value={acid.ka}>
                  {acid.label} (Ka = {acid.ka.toExponential(1)})
                </option>
              ))}
            </select>
          </label>
        )}

        {meta.usesKb && (
          <label>
            Especie
            <select
              value={setup.kb}
              onChange={(event) => onSetupChange({ kb: Number(event.target.value) })}
            >
              {WEAK_BASE_PRESETS.map((base) => (
                <option key={base.label} value={base.kb}>
                  {base.label} (Kb = {base.kb.toExponential(1)})
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Concentración (mol/L)
          <input
            type="number"
            min={0.001}
            max={1}
            step={0.01}
            value={setup.analyteConcentration}
            onChange={(event) => onSetupChange({ analyteConcentration: Number(event.target.value) })}
          />
        </label>

        <label>
          Volumen inicial (mL)
          <input
            type="number"
            min={1}
            max={200}
            step={1}
            value={setup.analyteVolume}
            onChange={(event) => onSetupChange({ analyteVolume: Number(event.target.value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>{meta.titrantLabel} (bureta)</legend>
        <label>
          Concentración (mol/L)
          <input
            type="number"
            min={0.001}
            max={1}
            step={0.01}
            value={setup.titrantConcentration}
            onChange={(event) => onSetupChange({ titrantConcentration: Number(event.target.value) })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Titulación</legend>
        <label htmlFor="volume-slider">Volumen agregado: {volumeAdded.toFixed(2)} mL</label>
        <input
          id="volume-slider"
          type="range"
          min={0}
          max={maxVolume}
          step={maxVolume / 500 || 0.01}
          value={volumeAdded}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          aria-valuetext={`${volumeAdded.toFixed(2)} mililitros, ${regionLabel(setup.type, region)}`}
        />
        <button type="button" onClick={onReset}>
          Reiniciar bureta
        </button>
      </fieldset>
    </div>
  );
}
