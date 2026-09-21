import { Burette } from "./components/Burette";
import { Controls } from "./components/Controls";
import { Flask } from "./components/Flask";
import { TitrationChart } from "./components/TitrationChart";
import { useTitration } from "./hooks/useTitration";
import "./App.css";

const REGION_LABELS: Record<string, string> = {
  "acido-debil": "Ácido débil puro",
  tampon: "Región tampón",
  equivalencia: "Punto de equivalencia",
  "exceso-base": "Exceso de base",
};

function App() {
  const { state, fullCurve, maxVolume, setVolumeAdded, updateSetup, reset } = useTitration();
  const remainingFraction = maxVolume > 0 ? 1 - state.volumeAdded / maxVolume : 1;
  const fillLevel = 0.35 + Math.min(0.4, state.volumeAdded / (maxVolume || 1) * 0.4);

  return (
    <div className="app">
      <header>
        <h1>🧪 Laboratorio Virtual de Química</h1>
        <p>Titulación ácido débil — base fuerte, con pH en tiempo real.</p>
      </header>

      <main>
        <section className="bench">
          <Burette remainingFraction={remainingFraction} />
          <Flask pH={state.pH} fillLevel={fillLevel} />
          <div className="readout">
            <span className="ph-value">pH {state.pH.toFixed(2)}</span>
            <span className="region-label">{REGION_LABELS[state.region]}</span>
            <span className="veq-label">V. equivalencia: {state.equivalenceVolume.toFixed(2)} mL</span>
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
          <Controls
            setup={state}
            volumeAdded={state.volumeAdded}
            maxVolume={maxVolume}
            onSetupChange={updateSetup}
            onVolumeChange={setVolumeAdded}
            onReset={reset}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
