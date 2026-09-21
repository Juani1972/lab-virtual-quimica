import { describe, expect, it } from "vitest";
import { calculatePH, equivalenceVolume, generateTitrationCurve } from "./titration";
import type { TitrationSetup } from "../types/chemistry";

describe("equivalenceVolume", () => {
  it("calcula el volumen de equivalencia a partir de la estequiometría 1:1", () => {
    const setup: TitrationSetup = {
      type: "acido-debil-base-fuerte",
      analyteConcentration: 0.1,
      analyteVolume: 25,
      titrantConcentration: 0.1,
      ka: 1.8e-5,
    };
    expect(equivalenceVolume(setup)).toBeCloseTo(25, 5);
  });

  it("es proporcional a la concentración del analito e inversa a la del titulante", () => {
    const setup: TitrationSetup = {
      type: "acido-fuerte-base-fuerte",
      analyteConcentration: 0.2,
      analyteVolume: 50,
      titrantConcentration: 0.5,
    };
    // 0.2 mol/L * 50 mL / 0.5 mol/L = 20 mL
    expect(equivalenceVolume(setup)).toBeCloseTo(20, 5);
  });

  it("devuelve 0 si la concentración del titulante es 0 (evita división por cero)", () => {
    const setup: TitrationSetup = {
      type: "acido-fuerte-base-fuerte",
      analyteConcentration: 0.1,
      analyteVolume: 25,
      titrantConcentration: 0,
    };
    expect(equivalenceVolume(setup)).toBe(0);
  });
});

describe("calculatePH — ácido débil / base fuerte (ácido acético)", () => {
  const setup: TitrationSetup = {
    type: "acido-debil-base-fuerte",
    analyteConcentration: 0.1,
    analyteVolume: 25,
    titrantConcentration: 0.1,
    ka: 1.8e-5, // pKa ≈ 4.74
  };

  it("da el pH del ácido débil puro antes de agregar base (≈ 2.87 para 0.1 M, Ka 1.8e-5)", () => {
    const { pH, region } = calculatePH(setup, 0);
    expect(region).toBe("antes");
    expect(pH).toBeCloseTo(2.87, 1);
  });

  it("en la semi-equivalencia, pH = pKa (Henderson-Hasselbalch)", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq / 2);
    const pKa = -Math.log10(setup.ka!);
    expect(region).toBe("tampon");
    expect(pH).toBeCloseTo(pKa, 2);
  });

  it("en la equivalencia, el pH es básico por la hidrólisis del acetato (> 7)", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq);
    expect(region).toBe("equivalencia");
    expect(pH).toBeGreaterThan(7);
    expect(pH).toBeCloseTo(8.72, 1);
  });

  it("después de la equivalencia, el pH queda dominado por el exceso de base fuerte", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq * 1.5);
    expect(region).toBe("despues");
    expect(pH).toBeGreaterThan(11);
  });
});

describe("calculatePH — ácido fuerte / base fuerte", () => {
  const setup: TitrationSetup = {
    type: "acido-fuerte-base-fuerte",
    analyteConcentration: 0.1,
    analyteVolume: 25,
    titrantConcentration: 0.1,
  };

  it("da pH = -log10(C) antes de la equivalencia (sin agregar base)", () => {
    const { pH } = calculatePH(setup, 0);
    expect(pH).toBeCloseTo(1, 5);
  });

  it("el punto de equivalencia es neutro (pH = 7)", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq);
    expect(region).toBe("equivalencia");
    expect(pH).toBeCloseTo(7, 5);
  });

  it("no pasa nunca por una región tampón (no hay especie conjugada débil)", () => {
    const veq = equivalenceVolume(setup);
    const midPoint = calculatePH(setup, veq / 2);
    expect(midPoint.region).not.toBe("tampon");
  });
});

describe("calculatePH — base débil / ácido fuerte (amoníaco)", () => {
  const setup: TitrationSetup = {
    type: "base-debil-acido-fuerte",
    analyteConcentration: 0.1,
    analyteVolume: 25,
    titrantConcentration: 0.1,
    kb: 1.8e-5,
  };

  it("da un pH básico para la base débil pura antes de agregar ácido", () => {
    const { pH, region } = calculatePH(setup, 0);
    expect(region).toBe("antes");
    expect(pH).toBeGreaterThan(7);
    expect(pH).toBeCloseTo(11.13, 1);
  });

  it("en la equivalencia, el pH es ácido por la hidrólisis del catión amonio (< 7)", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq);
    expect(region).toBe("equivalencia");
    expect(pH).toBeLessThan(7);
  });

  it("después de la equivalencia, el pH queda dominado por el exceso de ácido fuerte", () => {
    const veq = equivalenceVolume(setup);
    const { pH, region } = calculatePH(setup, veq * 1.5);
    expect(region).toBe("despues");
    expect(pH).toBeLessThan(3);
  });
});

describe("casos límite", () => {
  it("no devuelve NaN ni Infinity con una Ka extremadamente pequeña", () => {
    const setup: TitrationSetup = {
      type: "acido-debil-base-fuerte",
      analyteConcentration: 0.1,
      analyteVolume: 25,
      titrantConcentration: 0.1,
      ka: 1e-14,
    };
    for (const volumeAdded of [0, 5, 12.5, 25, 40]) {
      const { pH } = calculatePH(setup, volumeAdded);
      expect(Number.isFinite(pH)).toBe(true);
    }
  });

  it("no devuelve NaN ni Infinity con concentraciones muy bajas", () => {
    const setup: TitrationSetup = {
      type: "acido-fuerte-base-fuerte",
      analyteConcentration: 1e-5,
      analyteVolume: 25,
      titrantConcentration: 1e-5,
    };
    for (const volumeAdded of [0, 12.5, 25, 50]) {
      const { pH } = calculatePH(setup, volumeAdded);
      expect(Number.isFinite(pH)).toBe(true);
    }
  });

  it("genera una curva monótonamente creciente en pH a medida que se agrega más titulante", () => {
    const setup: TitrationSetup = {
      type: "acido-debil-base-fuerte",
      analyteConcentration: 0.1,
      analyteVolume: 25,
      titrantConcentration: 0.1,
      ka: 1.8e-5,
    };
    const curve = generateTitrationCurve(setup, 50);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].pH).toBeGreaterThanOrEqual(curve[i - 1].pH - 1e-9);
    }
  });
});
