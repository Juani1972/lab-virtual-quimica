import { INDICATORS } from "./indicators";
import { TITRATION_TYPE_OPTIONS } from "../types/chemistry";
import type { TitrationRegion, TitrationType } from "../types/chemistry";

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: "primera-titulacion",
    name: "Primera titulación",
    description: "Llegaste al punto de equivalencia por primera vez.",
  },
  {
    id: "maestro-del-tampon",
    name: "Maestro del tampón",
    description: "Pasaste por una región tampón durante una titulación.",
  },
  {
    id: "explorador-de-reacciones",
    name: "Explorador de reacciones",
    description: `Probaste los ${TITRATION_TYPE_OPTIONS.length} tipos de titulación disponibles.`,
  },
  {
    id: "coleccionista-de-indicadores",
    name: "Coleccionista de indicadores",
    description: `Probaste los ${INDICATORS.length} indicadores disponibles.`,
  },
  {
    id: "buen-ojo-quimico",
    name: "Buen ojo químico",
    description: "Acertaste una predicción en el modo desafío.",
  },
];

export const XP_REWARDS = {
  reachEquivalence: 15,
  reachBuffer: 5,
  newType: 10,
  newIndicator: 5,
  correctPrediction: 20,
};

export interface ProgressState {
  xp: number;
  unlockedBadges: string[];
  typesSeen: TitrationType[];
  indicatorsSeen: string[];
}

export function initialProgress(): ProgressState {
  return { xp: 0, unlockedBadges: [], typesSeen: [], indicatorsSeen: [] };
}

export interface ProgressEventResult {
  progress: ProgressState;
  xpGained: number;
  newlyUnlocked: BadgeDef[];
}

function unlock(progress: ProgressState, badgeId: string): { progress: ProgressState; badge: BadgeDef | null } {
  if (progress.unlockedBadges.includes(badgeId)) {
    return { progress, badge: null };
  }
  const badge = BADGES.find((item) => item.id === badgeId) ?? null;
  if (!badge) return { progress, badge: null };
  return {
    progress: { ...progress, unlockedBadges: [...progress.unlockedBadges, badgeId] },
    badge,
  };
}

function noEvent(progress: ProgressState): ProgressEventResult {
  return { progress, xpGained: 0, newlyUnlocked: [] };
}

export function recordRegionReached(progress: ProgressState, region: TitrationRegion): ProgressEventResult {
  if (region !== "equivalencia" && region !== "tampon") return noEvent(progress);

  const badgeId = region === "equivalencia" ? "primera-titulacion" : "maestro-del-tampon";
  const reward = region === "equivalencia" ? XP_REWARDS.reachEquivalence : XP_REWARDS.reachBuffer;
  const { progress: next, badge } = unlock(progress, badgeId);
  if (!badge) return noEvent(progress);

  return { progress: { ...next, xp: next.xp + reward }, xpGained: reward, newlyUnlocked: [badge] };
}

export function recordTypeSeen(progress: ProgressState, type: TitrationType): ProgressEventResult {
  if (progress.typesSeen.includes(type)) return noEvent(progress);

  const typesSeen = [...progress.typesSeen, type];
  let next: ProgressState = { ...progress, typesSeen, xp: progress.xp + XP_REWARDS.newType };
  const newlyUnlocked: BadgeDef[] = [];

  if (typesSeen.length >= TITRATION_TYPE_OPTIONS.length) {
    const result = unlock(next, "explorador-de-reacciones");
    next = result.progress;
    if (result.badge) newlyUnlocked.push(result.badge);
  }

  return { progress: next, xpGained: XP_REWARDS.newType, newlyUnlocked };
}

export function recordIndicatorSeen(progress: ProgressState, indicatorId: string): ProgressEventResult {
  if (progress.indicatorsSeen.includes(indicatorId)) return noEvent(progress);

  const indicatorsSeen = [...progress.indicatorsSeen, indicatorId];
  let next: ProgressState = { ...progress, indicatorsSeen, xp: progress.xp + XP_REWARDS.newIndicator };
  const newlyUnlocked: BadgeDef[] = [];

  if (indicatorsSeen.length >= INDICATORS.length) {
    const result = unlock(next, "coleccionista-de-indicadores");
    next = result.progress;
    if (result.badge) newlyUnlocked.push(result.badge);
  }

  return { progress: next, xpGained: XP_REWARDS.newIndicator, newlyUnlocked };
}

export function recordCorrectPrediction(progress: ProgressState): ProgressEventResult {
  const { progress: next, badge } = unlock(progress, "buen-ojo-quimico");
  if (!badge) return noEvent(progress);
  return {
    progress: { ...next, xp: next.xp + XP_REWARDS.correctPrediction },
    xpGained: XP_REWARDS.correctPrediction,
    newlyUnlocked: [badge],
  };
}
