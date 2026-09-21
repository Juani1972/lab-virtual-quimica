export type TitrationType =
  | "acido-debil-base-fuerte"
  | "acido-fuerte-base-fuerte"
  | "base-debil-acido-fuerte";

export interface TitrationSetup {
  type: TitrationType;
  /** Concentración inicial de la especie en el matraz (mol/L) */
  analyteConcentration: number;
  /** Volumen inicial de la especie en el matraz (mL) */
  analyteVolume: number;
  /** Concentración del titulante en la bureta (mol/L) */
  titrantConcentration: number;
  /** Ka del ácido débil (solo aplica a "acido-debil-base-fuerte") */
  ka?: number;
  /** Kb de la base débil (solo aplica a "base-debil-acido-fuerte") */
  kb?: number;
}

export type TitrationRegion = "antes" | "tampon" | "equivalencia" | "despues";

export interface TitrationPoint {
  /** Volumen de titulante agregado (mL) */
  volumeAdded: number;
  pH: number;
  region: TitrationRegion;
}

export interface TitrationState extends TitrationSetup {
  volumeAdded: number;
  equivalenceVolume: number;
  pH: number;
  region: TitrationRegion;
  /** Historial de puntos ya "agregados" para dibujar la curva */
  curve: TitrationPoint[];
}

export interface TitrationTypeMeta {
  analyteLabel: string;
  titrantLabel: string;
  usesKa: boolean;
  usesKb: boolean;
}

export const TITRATION_TYPE_META: Record<TitrationType, TitrationTypeMeta> = {
  "acido-debil-base-fuerte": {
    analyteLabel: "Ácido débil",
    titrantLabel: "Base fuerte",
    usesKa: true,
    usesKb: false,
  },
  "acido-fuerte-base-fuerte": {
    analyteLabel: "Ácido fuerte",
    titrantLabel: "Base fuerte",
    usesKa: false,
    usesKb: false,
  },
  "base-debil-acido-fuerte": {
    analyteLabel: "Base débil",
    titrantLabel: "Ácido fuerte",
    usesKa: false,
    usesKb: true,
  },
};

export const TITRATION_TYPE_OPTIONS: { value: TitrationType; label: string }[] = [
  { value: "acido-debil-base-fuerte", label: "Ácido débil — Base fuerte" },
  { value: "acido-fuerte-base-fuerte", label: "Ácido fuerte — Base fuerte" },
  { value: "base-debil-acido-fuerte", label: "Base débil — Ácido fuerte" },
];

export function regionLabel(type: TitrationType, region: TitrationRegion): string {
  const meta = TITRATION_TYPE_META[type];
  switch (region) {
    case "antes":
      return `Exceso de ${meta.analyteLabel.toLowerCase()}`;
    case "tampon":
      return "Región tampón";
    case "equivalencia":
      return "Punto de equivalencia";
    case "despues":
      return `Exceso de ${meta.titrantLabel.toLowerCase()}`;
  }
}

export function regionExplanation(region: TitrationRegion): string {
  switch (region) {
    case "antes":
      return "Todavía no reaccionó titulante: el pH depende solo del analito en el matraz.";
    case "tampon":
      return "El analito débil y su especie conjugada conviven en el matraz: el pH cambia lento (efecto tampón).";
    case "equivalencia":
      return "Se agregó justo la cantidad estequiométrica de titulante. El pH puede no ser 7 si hay hidrólisis.";
    case "despues":
      return "Ya no queda analito: el pH está dominado por el titulante en exceso.";
  }
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface IndicatorDef {
  id: string;
  name: string;
  /** pH donde empieza el viraje */
  transitionLow: number;
  /** pH donde termina el viraje */
  transitionHigh: number;
  colorLow: RGBColor;
  colorHigh: RGBColor;
  /** Descripción textual del color por debajo de transitionLow (no depende del color en sí) */
  labelLow: string;
  /** Descripción textual del color por encima de transitionHigh */
  labelHigh: string;
}
