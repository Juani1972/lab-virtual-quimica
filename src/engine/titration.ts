import type { TitrationRegion, TitrationSetup } from "../types/chemistry";

const KW = 1e-14;

/** Resuelve x en x^2 + b*x + c = 0 tomando la raíz positiva (concentración en mol/L). */
function solvePositiveRoot(b: number, c: number): number {
  const discriminant = b * b - 4 * c;
  const safeDiscriminant = Math.max(discriminant, 0);
  return (-b + Math.sqrt(safeDiscriminant)) / 2;
}

/** pH de un ácido débil puro (antes de agregar base), resolviendo Ka = x^2 / (C0 - x). */
function pHWeakAcidOnly(ka: number, concentration: number): number {
  if (concentration <= 0) return 7;
  // x^2 + ka*x - ka*C0 = 0
  const hConcentration = solvePositiveRoot(ka, -ka * concentration);
  return -Math.log10(Math.max(hConcentration, 1e-14));
}

/** pH en la región tampón vía Henderson-Hasselbalch. */
function pHBuffer(ka: number, molesAcid: number, molesBase: number): number {
  const pKa = -Math.log10(ka);
  if (molesAcid <= 0) return pKa + 6; // borde numérico, casi en equivalencia
  return pKa + Math.log10(molesBase / molesAcid);
}

/** pH en el punto de equivalencia: hidrólisis de la base conjugada A-. */
function pHEquivalence(ka: number, conjugateBaseConcentration: number): number {
  const kb = KW / ka;
  const ohConcentration = solvePositiveRoot(kb, -kb * conjugateBaseConcentration);
  const pOH = -Math.log10(Math.max(ohConcentration, 1e-14));
  return 14 - pOH;
}

/** pH después de la equivalencia: dominado por el exceso de base fuerte. */
function pHExcessBase(excessOHConcentration: number): number {
  const pOH = -Math.log10(Math.max(excessOHConcentration, 1e-14));
  return 14 - pOH;
}

export function equivalenceVolume(setup: TitrationSetup): number {
  const { acidConcentration, acidVolume, baseConcentration } = setup;
  if (baseConcentration <= 0) return 0;
  return (acidConcentration * acidVolume) / baseConcentration;
}

/**
 * Calcula el pH para un volumen dado de base agregada, junto con la región
 * de la curva en la que cae ese punto (para colorear el gráfico y el indicador).
 */
export function calculatePH(
  setup: TitrationSetup,
  volumeAdded: number
): { pH: number; region: TitrationRegion } {
  const { acidConcentration, acidVolume, ka, baseConcentration } = setup;
  const veq = equivalenceVolume(setup);

  const molesAcidInitial = acidConcentration * acidVolume; // mmol
  const molesBaseAdded = baseConcentration * volumeAdded; // mmol
  const totalVolume = acidVolume + volumeAdded;

  // Tolerancia relativa para considerar que estamos "en" la equivalencia.
  const equivalenceTolerance = Math.max(veq * 0.002, 0.01);

  if (volumeAdded <= 0) {
    return { pH: pHWeakAcidOnly(ka, acidConcentration), region: "acido-debil" };
  }

  if (Math.abs(volumeAdded - veq) <= equivalenceTolerance) {
    const conjugateBaseConcentration = molesAcidInitial / totalVolume;
    return { pH: pHEquivalence(ka, conjugateBaseConcentration), region: "equivalencia" };
  }

  if (volumeAdded < veq) {
    const molesAcidRemaining = molesAcidInitial - molesBaseAdded;
    const molesConjugateBase = molesBaseAdded;
    return {
      pH: pHBuffer(ka, molesAcidRemaining, molesConjugateBase),
      region: "tampon",
    };
  }

  const excessMolesBase = molesBaseAdded - molesAcidInitial;
  const excessOHConcentration = excessMolesBase / totalVolume;
  return { pH: pHExcessBase(excessOHConcentration), region: "exceso-base" };
}

/** Genera la curva completa de titulación muestreando de 0 hasta 2x el volumen de equivalencia. */
export function generateTitrationCurve(
  setup: TitrationSetup,
  steps = 200
) {
  const veq = equivalenceVolume(setup);
  const maxVolume = veq > 0 ? veq * 2 : setup.acidVolume;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const volumeAdded = (maxVolume * i) / steps;
    const { pH, region } = calculatePH(setup, volumeAdded);
    points.push({ volumeAdded, pH, region });
  }
  return points;
}
