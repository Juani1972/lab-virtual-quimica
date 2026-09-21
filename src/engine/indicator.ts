/**
 * Fenolftaleína: incolora por debajo de pH 8.2, rosa/magenta por encima de pH 10.
 * Interpolamos linealmente el color en la zona de viraje.
 */
const TRANSITION_LOW = 8.2;
const TRANSITION_HIGH = 10;

const COLORLESS = { r: 235, g: 240, b: 250 };
const PINK = { r: 214, g: 51, b: 132 };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function indicatorColor(pH: number): string {
  const t = Math.min(
    1,
    Math.max(0, (pH - TRANSITION_LOW) / (TRANSITION_HIGH - TRANSITION_LOW))
  );
  const r = Math.round(lerp(COLORLESS.r, PINK.r, t));
  const g = Math.round(lerp(COLORLESS.g, PINK.g, t));
  const b = Math.round(lerp(COLORLESS.b, PINK.b, t));
  return `rgb(${r}, ${g}, ${b})`;
}
