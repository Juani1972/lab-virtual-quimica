import type { IndicatorDef } from "../types/chemistry";

export const INDICATORS: IndicatorDef[] = [
  {
    id: "fenolftaleina",
    name: "Fenolftaleína",
    transitionLow: 8.2,
    transitionHigh: 10,
    colorLow: { r: 235, g: 240, b: 250 },
    colorHigh: { r: 214, g: 51, b: 132 },
    labelLow: "incolora",
    labelHigh: "rosa/magenta",
  },
  {
    id: "azul-bromotimol",
    name: "Azul de bromotimol",
    transitionLow: 6.0,
    transitionHigh: 7.6,
    colorLow: { r: 238, g: 210, b: 60 },
    colorHigh: { r: 37, g: 99, b: 235 },
    labelLow: "amarilla",
    labelHigh: "azul",
  },
  {
    id: "rojo-metilo",
    name: "Rojo de metilo",
    transitionLow: 4.4,
    transitionHigh: 6.2,
    colorLow: { r: 214, g: 40, b: 40 },
    colorHigh: { r: 238, g: 200, b: 40 },
    labelLow: "roja",
    labelHigh: "amarilla",
  },
  {
    id: "naranja-metilo",
    name: "Naranja de metilo",
    transitionLow: 3.1,
    transitionHigh: 4.4,
    colorLow: { r: 214, g: 40, b: 40 },
    colorHigh: { r: 245, g: 158, b: 11 },
    labelLow: "roja",
    labelHigh: "naranja",
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Fracción de viraje 0..1: 0 = color bajo puro, 1 = color alto puro. */
export function indicatorTransitionFraction(pH: number, indicator: IndicatorDef): number {
  const { transitionLow, transitionHigh } = indicator;
  return Math.min(1, Math.max(0, (pH - transitionLow) / (transitionHigh - transitionLow)));
}

export function indicatorColor(pH: number, indicator: IndicatorDef): string {
  const t = indicatorTransitionFraction(pH, indicator);
  const r = Math.round(lerp(indicator.colorLow.r, indicator.colorHigh.r, t));
  const g = Math.round(lerp(indicator.colorLow.g, indicator.colorHigh.g, t));
  const b = Math.round(lerp(indicator.colorLow.b, indicator.colorHigh.b, t));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Descripción textual del estado del indicador, independiente del color,
 * para que el cambio sea perceptible sin depender de la percepción del color.
 */
export function indicatorStateLabel(pH: number, indicator: IndicatorDef): string {
  const t = indicatorTransitionFraction(pH, indicator);
  if (t <= 0.1) return indicator.labelLow;
  if (t >= 0.9) return indicator.labelHigh;
  return "en viraje";
}
