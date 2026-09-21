import type { TitrationRegion, TitrationSetup } from "../types/chemistry";

const KW = 1e-14;
const DEFAULT_KA = 1.8e-5;
const DEFAULT_KB = 1.8e-5;

/** Resuelve x en x^2 + b*x + c = 0 tomando la raíz positiva (concentración en mol/L). */
function solvePositiveRoot(b: number, c: number): number {
  const discriminant = b * b - 4 * c;
  const safeDiscriminant = Math.max(discriminant, 0);
  return (-b + Math.sqrt(safeDiscriminant)) / 2;
}

function pHFromH(hConcentration: number): number {
  return -Math.log10(Math.max(hConcentration, 1e-14));
}

function pHFromOH(ohConcentration: number): number {
  return 14 - pHFromH(ohConcentration);
}

/** pH de un ácido débil puro, resolviendo Ka = x^2 / (C0 - x). */
function pHWeakAcidOnly(ka: number, concentration: number): number {
  if (concentration <= 0) return 7;
  const hConcentration = solvePositiveRoot(ka, -ka * concentration);
  return pHFromH(hConcentration);
}

/** pH de una base débil pura, resolviendo Kb = x^2 / (C0 - x) para [OH-]. */
function pHWeakBaseOnly(kb: number, concentration: number): number {
  if (concentration <= 0) return 7;
  const ohConcentration = solvePositiveRoot(kb, -kb * concentration);
  return pHFromOH(ohConcentration);
}

/** Henderson-Hasselbalch: pH = pKa + log([base]/[ácido]). */
function henryHasselbalch(ka: number, molesBaseForm: number, molesAcidForm: number): number {
  const pKa = -Math.log10(ka);
  if (molesAcidForm <= 0) return pKa + 6;
  if (molesBaseForm <= 0) return pKa - 6;
  return pKa + Math.log10(molesBaseForm / molesAcidForm);
}

export function equivalenceVolume(setup: TitrationSetup): number {
  const { analyteConcentration, analyteVolume, titrantConcentration } = setup;
  if (titrantConcentration <= 0) return 0;
  return (analyteConcentration * analyteVolume) / titrantConcentration;
}

function calculateWeakAcidStrongBase(
  setup: TitrationSetup,
  volumeAdded: number
): { pH: number; region: TitrationRegion } {
  const { analyteConcentration, analyteVolume, titrantConcentration } = setup;
  const ka = setup.ka ?? DEFAULT_KA;
  const veq = equivalenceVolume(setup);
  const molesAnalyteInitial = analyteConcentration * analyteVolume;
  const molesTitrantAdded = titrantConcentration * volumeAdded;
  const totalVolume = analyteVolume + volumeAdded;
  const equivalenceTolerance = Math.max(veq * 0.002, 0.01);

  if (volumeAdded <= 0) {
    return { pH: pHWeakAcidOnly(ka, analyteConcentration), region: "antes" };
  }

  if (Math.abs(volumeAdded - veq) <= equivalenceTolerance) {
    const conjugateBaseConcentration = molesAnalyteInitial / totalVolume;
    const kb = KW / ka;
    const ohConcentration = solvePositiveRoot(kb, -kb * conjugateBaseConcentration);
    return { pH: pHFromOH(ohConcentration), region: "equivalencia" };
  }

  if (volumeAdded < veq) {
    const molesAcidRemaining = molesAnalyteInitial - molesTitrantAdded;
    const molesConjugateBase = molesTitrantAdded;
    return { pH: henryHasselbalch(ka, molesConjugateBase, molesAcidRemaining), region: "tampon" };
  }

  const excessMolesBase = molesTitrantAdded - molesAnalyteInitial;
  return { pH: pHFromOH(excessMolesBase / totalVolume), region: "despues" };
}

function calculateStrongAcidStrongBase(
  setup: TitrationSetup,
  volumeAdded: number
): { pH: number; region: TitrationRegion } {
  const { analyteConcentration, analyteVolume, titrantConcentration } = setup;
  const veq = equivalenceVolume(setup);
  const molesAnalyteInitial = analyteConcentration * analyteVolume;
  const molesTitrantAdded = titrantConcentration * volumeAdded;
  const totalVolume = analyteVolume + volumeAdded;
  const equivalenceTolerance = Math.max(veq * 0.002, 0.01);

  if (Math.abs(volumeAdded - veq) <= equivalenceTolerance) {
    return { pH: 7, region: "equivalencia" };
  }

  if (volumeAdded < veq) {
    const excessH = (molesAnalyteInitial - molesTitrantAdded) / totalVolume;
    return { pH: pHFromH(excessH), region: "antes" };
  }

  const excessOH = (molesTitrantAdded - molesAnalyteInitial) / totalVolume;
  return { pH: pHFromOH(excessOH), region: "despues" };
}

function calculateWeakBaseStrongAcid(
  setup: TitrationSetup,
  volumeAdded: number
): { pH: number; region: TitrationRegion } {
  const { analyteConcentration, analyteVolume, titrantConcentration } = setup;
  const kb = setup.kb ?? DEFAULT_KB;
  const ka = KW / kb; // Ka del ácido conjugado
  const veq = equivalenceVolume(setup);
  const molesAnalyteInitial = analyteConcentration * analyteVolume;
  const molesTitrantAdded = titrantConcentration * volumeAdded;
  const totalVolume = analyteVolume + volumeAdded;
  const equivalenceTolerance = Math.max(veq * 0.002, 0.01);

  if (volumeAdded <= 0) {
    return { pH: pHWeakBaseOnly(kb, analyteConcentration), region: "antes" };
  }

  if (Math.abs(volumeAdded - veq) <= equivalenceTolerance) {
    const conjugateAcidConcentration = molesAnalyteInitial / totalVolume;
    const hConcentration = solvePositiveRoot(ka, -ka * conjugateAcidConcentration);
    return { pH: pHFromH(hConcentration), region: "equivalencia" };
  }

  if (volumeAdded < veq) {
    const molesBaseRemaining = molesAnalyteInitial - molesTitrantAdded;
    const molesConjugateAcid = molesTitrantAdded;
    return { pH: henryHasselbalch(ka, molesBaseRemaining, molesConjugateAcid), region: "tampon" };
  }

  const excessH = (molesTitrantAdded - molesAnalyteInitial) / totalVolume;
  return { pH: pHFromH(excessH), region: "despues" };
}

/**
 * Calcula el pH para un volumen dado de titulante agregado, junto con la
 * región de la curva en la que cae ese punto (para colorear el gráfico y el indicador).
 */
export function calculatePH(
  setup: TitrationSetup,
  volumeAdded: number
): { pH: number; region: TitrationRegion } {
  switch (setup.type) {
    case "acido-fuerte-base-fuerte":
      return calculateStrongAcidStrongBase(setup, volumeAdded);
    case "base-debil-acido-fuerte":
      return calculateWeakBaseStrongAcid(setup, volumeAdded);
    case "acido-debil-base-fuerte":
    default:
      return calculateWeakAcidStrongBase(setup, volumeAdded);
  }
}

/** Genera la curva completa de titulación muestreando de 0 hasta 2x el volumen de equivalencia. */
export function generateTitrationCurve(setup: TitrationSetup, steps = 200) {
  const veq = equivalenceVolume(setup);
  const maxVolume = veq > 0 ? veq * 2 : setup.analyteVolume;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const volumeAdded = (maxVolume * i) / steps;
    const { pH, region } = calculatePH(setup, volumeAdded);
    points.push({ volumeAdded, pH, region });
  }
  return points;
}
