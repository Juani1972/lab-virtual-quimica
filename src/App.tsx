import { useEffect, useState } from "react";
import { Burette } from "./components/Burette";
import { ChallengeMode } from "./components/ChallengeMode";
import { Controls } from "./components/Controls";
import { DataTable } from "./components/DataTable";
import { Flask } from "./components/Flask";
import { InfoTip } from "./components/InfoTip";
import { ProgressPanel } from "./components/ProgressPanel";
import { TitrationChart } from "./components/TitrationChart";
import { Tutorial } from "./components/Tutorial";
import { useProgress } from "./hooks/useProgress";
import { useTitration } from "./hooks/useTitration";
import { regionExplanation, regionLabel } from "./types/chemistry";
import "./App.css";

const TUTORIAL_SEEN_KEY = "lab-quimica:tutorial-seen";

function App() {
  const {
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
  } = useTitration();

  const { progress, lastUnlocked, dismissUnlocked, notifyRegion, notifyType, notifyIndicator, notifyCorrectPrediction } =
    useProgress();

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeResolved, setChallengeResolved] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) setTutorialOpen(true);
    } catch {
      // localStorage puede no estar disponible; el tutorial simplemente no se auto-abre.
    }
  }, []);

  useEffect(() => {
    notifyRegion(state.region);
  }, [state.region, notifyRegion]);

  useEffect(() => {
    notifyType(state.type);
  }, [state.type, notifyType]);

  useEffect(() => {
    notifyIndicator(indicator.id);
  }, [indicator.id, notifyIndicator]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [undo, redo]);

  function closeTutorial() {
    setTutorialOpen(false);
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      // no es crítico si no se puede persistir
    }
  }

  const remainingFraction = maxVolume > 0 ? 1 - state.volumeAdded / maxVolume : 1;
  const fillLevel = 0.35 + Math.min(0.4, (state.volumeAdded / (maxVolume || 1)) * 0.4);
  const currentRegionLabel = regionLabel(state.type, state.region);
  const challengeKey = `${state.type}-${state.ka ?? ""}-${state.kb ?? ""}-${state.analyteConcentration}-${state.analyteVolume}-${state.titrantConcentration}`;
  const showChart = !challengeEnabled || challengeResolved;

  return (
    <div className="app">
      <Tutorial open={tutorialOpen} onClose={closeTutorial} />

      <header>
        <div className="header-top">
          <h1>🧪 Laboratorio Virtual de Química</h1>
          <button type="button" onClick={() => setTutorialOpen(true)}>
            ¿Cómo funciona?
          </button>
        </div>
        <p>Titulaciones ácido-base con pH en tiempo real.</p>
        <ProgressPanel progress={progress} />
        {lastUnlocked.length > 0 && (
          <div className="badge-toast" role="status" aria-live="polite">
            {lastUnlocked.map((badge) => (
              <span key={badge.id}>🏅 ¡Insignia desbloqueada! {badge.name}</span>
            ))}
            <button type="button" onClick={dismissUnlocked} aria-label="Cerrar aviso de insignia">
              ✕
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="bench">
          <div className="bench-item">
            <Burette remainingFraction={remainingFraction} />
            <InfoTip label="Bureta" text="Contiene el titulante y se va vaciando a medida que lo agregás al matraz." />
          </div>
          <div className="bench-item">
            <Flask pH={state.pH} fillLevel={fillLevel} indicator={indicator} />
            <InfoTip
              label="Matraz"
              text="Contiene el analito. Su color depende del indicador elegido y del pH actual de la mezcla."
            />
          </div>
          <div className="readout" aria-live="polite">
            <span className="ph-value">pH {state.pH.toFixed(2)}</span>
            <span className="region-label">
              {currentRegionLabel}{" "}
              <InfoTip label={currentRegionLabel} text={regionExplanation(state.region)} />
            </span>
            <span className="veq-label">
              V. equivalencia: {state.equivalenceVolume.toFixed(2)} mL
            </span>
          </div>
        </section>

        <section>
          <label className="challenge-toggle">
            <input
              type="checkbox"
              checked={challengeEnabled}
              onChange={(event) => {
                setChallengeEnabled(event.target.checked);
                setChallengeResolved(false);
              }}
            />
            Modo desafío: predecir el pH de la equivalencia antes de ver la curva
          </label>
        </section>

        {challengeEnabled && (
          <section className="chart">
            <ChallengeMode
              key={challengeKey}
              equivalencePH={equivalencePH}
              onResolved={(correct) => {
                setChallengeResolved(true);
                if (correct) notifyCorrectPrediction();
              }}
            />
          </section>
        )}

        {showChart && (
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
        )}

        {showChart && (
          <section>
            <DataTable points={state.curve} type={state.type} />
          </section>
        )}

        <section>
          <Controls
            setup={state}
            volumeAdded={state.volumeAdded}
            maxVolume={maxVolume}
            region={state.region}
            indicator={indicator}
            canUndo={canUndo}
            canRedo={canRedo}
            onSetupChange={(partial) => {
              updateSetup(partial);
              setChallengeResolved(false);
            }}
            onVolumeChange={setVolumeAdded}
            onVolumeCommit={commitVolume}
            onIndicatorChange={setIndicator}
            onUndo={undo}
            onRedo={redo}
            onReset={() => {
              reset();
              setChallengeResolved(false);
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
