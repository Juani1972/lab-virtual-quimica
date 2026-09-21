import { Burette } from "./components/Burette";
import { Controls } from "./components/Controls";
import { DataTable } from "./components/DataTable";
import { Flask } from "./components/Flask";
import { TitrationChart } from "./components/TitrationChart";
import { useTitration } from "./hooks/useTitration";
import { regionLabel } from "./types/chemistry";
import "./App.css";

function App() {
  const {
    state,
    fullCurve,
    maxVolume,
    indicator,
    setIndicator,
    setVolumeAdded,
    updateSetup,
    reset,
  } = useTitration();

  const remainingFraction = maxVolume > 0 ? 1 - state.volumeAdded / maxVolume : 1;
  const fillLevel = 0.35 + Math.min(0.4, (state.volumeAdded / (maxVolume || 1)) * 0.4);
  const currentRegionLabel = regionLabel(state.type, state.region);

  return (
    <div className="app">
      <header>
        <h1>🧪 Laboratorio Virtual de Química</h1>
        <p>Titulaciones ácido-base con pH en tiempo real.</p>
      </header>

      <main>
        <section className="bench">
          <Burette remainingFraction={remainingFraction} />
          <Flask pH={state.pH} fillLevel={fillLevel} indicator={indicator} />
          <div className="readout" aria-live="polite">
            <span className="ph-value">pH {state.pH.toFixed(2)}</span>
            <span className="region-label">{currentRegionLabel}</span>
            <span className="veq-label">
              V. equivalencia: {state.equivalenceVolume.toFixed(2)} mL
            </span>
          </div>
        </section>

        <section className="chart">
          <TitrationChart
            fullCurve={fullCurve}
            curveSoFar={state.curve}
            maxVolume={maxVolume}
            equivalenceVolume={state.equivalenceVolume}
            currentVolume={state.volumeAdded}
            currentPH={state.pH}
          />
        </section>

        <section>
          <DataTable points={state.curve} type={state.type} />
        </section>

        <section>
          <Controls
            setup={state}
            volumeAdded={state.volumeAdded}
            maxVolume={maxVolume}
            region={state.region}
            indicator={indicator}
            onSetupChange={updateSetup}
            onVolumeChange={setVolumeAdded}
            onIndicatorChange={setIndicator}
            onReset={reset}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
