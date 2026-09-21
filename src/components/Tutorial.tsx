import { useState } from "react";

interface TutorialStep {
  title: string;
  body: string;
}

const STEPS: TutorialStep[] = [
  {
    title: "Bienvenido/a al laboratorio",
    body: "Simulás una titulación ácido-base. Elegí una reacción y un indicador, y agregá titulante con el control deslizante de abajo.",
  },
  {
    title: "La bureta",
    body: "Representa el titulante disponible. Se va vaciando a medida que la agregás al matraz.",
  },
  {
    title: "El matraz",
    body: "Cambia de color según el indicador elegido y el pH actual. El nombre del color también se muestra como texto, para que no dependas solo de verlo.",
  },
  {
    title: "La curva de titulación",
    body: "Muestra el pH medido contra el volumen agregado. La línea punteada marca el punto de equivalencia. Los mismos datos están disponibles como tabla, más abajo.",
  },
  {
    title: "Deshacer, rehacer y modo desafío",
    body: "Podés deshacer/rehacer pasos de titulación con los botones (o Ctrl+Z / Ctrl+Shift+Z), y activar el Modo desafío para predecir el resultado antes de verlo.",
  },
];

interface TutorialProps {
  open: boolean;
  onClose: () => void;
}

export function Tutorial({ open, onClose }: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  if (!open) return null;

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  function handleClose() {
    setStepIndex(0);
    onClose();
  }

  return (
    <div
      className="tutorial-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape") handleClose();
      }}
    >
      <div className="tutorial-card">
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <p className="tutorial-progress">
          Paso {stepIndex + 1} de {STEPS.length}
        </p>
        <div className="tutorial-actions">
          <button type="button" onClick={handleClose}>
            Cerrar
          </button>
          <div className="tutorial-nav">
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={isFirst}
            >
              Anterior
            </button>
            {isLast ? (
              <button type="button" onClick={handleClose} className="tutorial-primary">
                Empezar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))}
                className="tutorial-primary"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
