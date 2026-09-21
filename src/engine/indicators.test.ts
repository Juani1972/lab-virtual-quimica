import { describe, expect, it } from "vitest";
import { INDICATORS, indicatorColor, indicatorStateLabel } from "./indicators";

const phenolphthalein = INDICATORS.find((item) => item.id === "fenolftaleina")!;

describe("indicatorColor", () => {
  it("devuelve el color bajo cuando el pH está muy por debajo del viraje", () => {
    expect(indicatorColor(2, phenolphthalein)).toBe("rgb(235, 240, 250)");
  });

  it("devuelve el color alto cuando el pH está muy por encima del viraje", () => {
    expect(indicatorColor(13, phenolphthalein)).toBe("rgb(214, 51, 132)");
  });

  it("interpola a mitad de camino entre los dos colores en el centro de la zona de viraje", () => {
    const midPH = (phenolphthalein.transitionLow + phenolphthalein.transitionHigh) / 2;
    const midColor = indicatorColor(midPH, phenolphthalein);
    const match = midColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    expect(match).not.toBeNull();
    const [, r, g, b] = match!.map(Number);
    expect(r).toBe(Math.round((235 + 214) / 2));
    expect(g).toBe(Math.round((240 + 51) / 2));
    expect(b).toBe(Math.round((250 + 132) / 2));
  });
});

describe("indicatorStateLabel", () => {
  it("usa la etiqueta baja lejos del viraje por abajo", () => {
    expect(indicatorStateLabel(2, phenolphthalein)).toBe(phenolphthalein.labelLow);
  });

  it("usa la etiqueta alta lejos del viraje por arriba", () => {
    expect(indicatorStateLabel(13, phenolphthalein)).toBe(phenolphthalein.labelHigh);
  });

  it("marca 'en viraje' dentro de la zona de transición", () => {
    const midPH = (phenolphthalein.transitionLow + phenolphthalein.transitionHigh) / 2;
    expect(indicatorStateLabel(midPH, phenolphthalein)).toBe("en viraje");
  });
});

describe("catálogo de indicadores", () => {
  it("cada indicador tiene una zona de viraje válida (low < high)", () => {
    for (const indicator of INDICATORS) {
      expect(indicator.transitionLow).toBeLessThan(indicator.transitionHigh);
    }
  });
});
