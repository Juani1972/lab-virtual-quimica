import { useState } from "react";
import { BADGES } from "../engine/gamification";
import type { ProgressState } from "../engine/gamification";

interface ProgressPanelProps {
  progress: ProgressState;
}

export function ProgressPanel({ progress }: ProgressPanelProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="progress-panel">
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-expanded={visible}
        aria-controls="progress-panel-body"
      >
        ⭐ {progress.xp} XP — {visible ? "Ocultar progreso" : "Ver progreso"}
      </button>

      {visible && (
        <div id="progress-panel-body" className="badge-grid">
          {BADGES.map((badge) => {
            const unlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={unlocked ? "badge unlocked" : "badge locked"}
                title={badge.description}
              >
                <span className="badge-icon" aria-hidden="true">
                  {unlocked ? "🏅" : "🔒"}
                </span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-status">{unlocked ? "Desbloqueada" : badge.description}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
