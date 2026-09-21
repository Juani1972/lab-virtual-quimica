import { useState } from "react";

type Guess = "acido" | "neutro" | "basico";

const GUESS_LABELS: Record<Guess, string> = {
  acido: "Ácido (pH < 7)",
  neutro: "Neutro (pH = 7)",
  basico: "Básico (pH > 7)",
};

function classifyPH(pH: number): Guess {
  if (pH < 6.5) return "acido";
  if (pH > 7.5) return "basico";
  return "neutro";
}

interface ChallengeModeProps {
  equivalencePH: number;
  onResolved: (correct: boolean) => void;
}

/**
 * Antes de mostrar la curva, le pide a quien titula que prediga si el pH en
 * el punto de equivalencia va a ser ácido, neutro o básico. Se remonta
 * (vía `key` en el padre) cada vez que cambia la configuración de la
 * titulación, para no arrastrar una predicción vieja a un escenario nuevo.
 */
export function ChallengeMode({ equivalencePH, onResolved }: ChallengeModeProps) {
  const [guess, setGuess] = useState<Guess | null>(null);
  const [revealed, setRevealed] = useState(false);

  const actual = classifyPH(equivalencePH);
  const correct = guess !== null && guess === actual;

  function reveal() {
    if (!guess) return;
    setRevealed(true);
    onResolved(guess === actual);
  }

  function playAgain() {
    setGuess(null);
    setRevealed(false);
  }

  if (revealed) {
    return (
      <div className="challenge-card" role="status">
        <p className="challenge-result">
          {correct ? "✅ ¡Acertaste!" : "❌ No esta vez."} El pH en la equivalencia es{" "}
          <strong>{GUESS_LABELS[actual].toLowerCase()}</strong> (pH {equivalencePH.toFixed(2)}).
        </p>
        <button type="button" onClick={playAgain}>
          Predecir de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="challenge-card">
      <p>
        <strong>Modo desafío:</strong> antes de ver la curva, ¿qué esperás que pase con el pH en
        el punto de equivalencia?
      </p>
      <div className="challenge-options" role="radiogroup" aria-label="Predicción de pH en la equivalencia">
        {(Object.keys(GUESS_LABELS) as Guess[]).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={guess === option}
            className={guess === option ? "challenge-option selected" : "challenge-option"}
            onClick={() => setGuess(option)}
          >
            {GUESS_LABELS[option]}
          </button>
        ))}
      </div>
      <button type="button" onClick={reveal} disabled={!guess} className="challenge-reveal">
        Revelar resultado
      </button>
    </div>
  );
}
