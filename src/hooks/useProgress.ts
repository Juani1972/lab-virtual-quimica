import { useCallback, useEffect, useState } from "react";
import {
  initialProgress,
  recordCorrectPrediction,
  recordIndicatorSeen,
  recordRegionReached,
  recordTypeSeen,
} from "../engine/gamification";
import type { BadgeDef, ProgressState } from "../engine/gamification";
import type { TitrationRegion, TitrationType } from "../types/chemistry";

const STORAGE_KEY = "lab-quimica:progress";

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress();
    const parsed = JSON.parse(raw);
    return { ...initialProgress(), ...parsed };
  } catch {
    return initialProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [lastUnlocked, setLastUnlocked] = useState<BadgeDef[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage puede no estar disponible (modo privado, etc.); no es crítico.
    }
  }, [progress]);

  const notifyRegion = useCallback((region: TitrationRegion) => {
    setProgress((prev) => {
      const result = recordRegionReached(prev, region);
      if (result.newlyUnlocked.length > 0) setLastUnlocked(result.newlyUnlocked);
      return result.progress;
    });
  }, []);

  const notifyType = useCallback((type: TitrationType) => {
    setProgress((prev) => {
      const result = recordTypeSeen(prev, type);
      if (result.newlyUnlocked.length > 0) setLastUnlocked(result.newlyUnlocked);
      return result.progress;
    });
  }, []);

  const notifyIndicator = useCallback((indicatorId: string) => {
    setProgress((prev) => {
      const result = recordIndicatorSeen(prev, indicatorId);
      if (result.newlyUnlocked.length > 0) setLastUnlocked(result.newlyUnlocked);
      return result.progress;
    });
  }, []);

  const notifyCorrectPrediction = useCallback(() => {
    setProgress((prev) => {
      const result = recordCorrectPrediction(prev);
      if (result.newlyUnlocked.length > 0) setLastUnlocked(result.newlyUnlocked);
      return result.progress;
    });
  }, []);

  const dismissUnlocked = useCallback(() => setLastUnlocked([]), []);

  return {
    progress,
    lastUnlocked,
    dismissUnlocked,
    notifyRegion,
    notifyType,
    notifyIndicator,
    notifyCorrectPrediction,
  };
}
