import { describe, expect, it } from "vitest";
import { INDICATORS } from "./indicators";
import {
  BADGES,
  initialProgress,
  recordCorrectPrediction,
  recordIndicatorSeen,
  recordRegionReached,
  recordTypeSeen,
  XP_REWARDS,
} from "./gamification";
import { TITRATION_TYPE_OPTIONS } from "../types/chemistry";

describe("recordRegionReached", () => {
  it("no otorga nada por 'antes' o 'despues'", () => {
    const progress = initialProgress();
    expect(recordRegionReached(progress, "antes").xpGained).toBe(0);
    expect(recordRegionReached(progress, "despues").xpGained).toBe(0);
  });

  it("desbloquea 'primera-titulación' y suma XP al llegar a la equivalencia", () => {
    const progress = initialProgress();
    const result = recordRegionReached(progress, "equivalencia");

    expect(result.xpGained).toBe(XP_REWARDS.reachEquivalence);
    expect(result.progress.unlockedBadges).toContain("primera-titulacion");
    expect(result.newlyUnlocked.map((b) => b.id)).toEqual(["primera-titulacion"]);
  });

  it("no vuelve a otorgar XP ni a desbloquear la insignia una segunda vez", () => {
    const first = recordRegionReached(initialProgress(), "equivalencia");
    const second = recordRegionReached(first.progress, "equivalencia");

    expect(second.xpGained).toBe(0);
    expect(second.newlyUnlocked).toEqual([]);
    expect(second.progress.xp).toBe(first.progress.xp);
  });

  it("desbloquea 'maestro-del-tampón' al pasar por la región tampón", () => {
    const result = recordRegionReached(initialProgress(), "tampon");
    expect(result.progress.unlockedBadges).toContain("maestro-del-tampon");
    expect(result.xpGained).toBe(XP_REWARDS.reachBuffer);
  });
});

describe("recordTypeSeen", () => {
  it("suma XP la primera vez que se ve un tipo de titulación", () => {
    const result = recordTypeSeen(initialProgress(), "acido-debil-base-fuerte");
    expect(result.xpGained).toBe(XP_REWARDS.newType);
    expect(result.progress.typesSeen).toEqual(["acido-debil-base-fuerte"]);
    expect(result.newlyUnlocked).toEqual([]);
  });

  it("no suma XP de nuevo por un tipo ya visto", () => {
    const first = recordTypeSeen(initialProgress(), "acido-debil-base-fuerte");
    const second = recordTypeSeen(first.progress, "acido-debil-base-fuerte");
    expect(second.xpGained).toBe(0);
  });

  it("desbloquea 'explorador-de-reacciones' al ver todos los tipos", () => {
    let progress = initialProgress();
    let result;
    for (const option of TITRATION_TYPE_OPTIONS) {
      result = recordTypeSeen(progress, option.value);
      progress = result.progress;
    }
    expect(progress.unlockedBadges).toContain("explorador-de-reacciones");
    expect(result!.newlyUnlocked.map((b) => b.id)).toContain("explorador-de-reacciones");
  });
});

describe("recordIndicatorSeen", () => {
  it("desbloquea 'coleccionista-de-indicadores' al probar todos los indicadores", () => {
    let progress = initialProgress();
    let result;
    for (const indicator of INDICATORS) {
      result = recordIndicatorSeen(progress, indicator.id);
      progress = result.progress;
    }
    expect(progress.unlockedBadges).toContain("coleccionista-de-indicadores");
    expect(result!.newlyUnlocked.map((b) => b.id)).toContain("coleccionista-de-indicadores");
  });
});

describe("recordCorrectPrediction", () => {
  it("desbloquea 'buen-ojo-químico' y no se repite", () => {
    const first = recordCorrectPrediction(initialProgress());
    expect(first.progress.unlockedBadges).toContain("buen-ojo-quimico");
    expect(first.xpGained).toBe(XP_REWARDS.correctPrediction);

    const second = recordCorrectPrediction(first.progress);
    expect(second.xpGained).toBe(0);
  });
});

describe("catálogo de insignias", () => {
  it("todas las insignias tienen id, nombre y descripción no vacíos", () => {
    for (const badge of BADGES) {
      expect(badge.id.length).toBeGreaterThan(0);
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.description.length).toBeGreaterThan(0);
    }
  });

  it("no hay ids de insignia duplicados", () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
