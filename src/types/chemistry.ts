export interface TitrationSetup {
  /** Concentración inicial del ácido débil (mol/L) */
  acidConcentration: number;
  /** Volumen inicial del ácido en el matraz (mL) */
  acidVolume: number;
  /** Constante de disociación ácida Ka */
  ka: number;
  /** Concentración de la base fuerte en la bureta (mol/L) */
  baseConcentration: number;
}

export type TitrationRegion =
  | "acido-debil"
  | "tampon"
  | "equivalencia"
  | "exceso-base";

export interface TitrationPoint {
  /** Volumen de base agregado (mL) */
  volumeAdded: number;
  pH: number;
  region: TitrationRegion;
}

export interface TitrationState extends TitrationSetup {
  /** Volumen de base agregado hasta el momento (mL) */
  volumeAdded: number;
  /** Volumen de equivalencia calculado (mL) */
  equivalenceVolume: number;
  pH: number;
  region: TitrationRegion;
  /** Historial de puntos ya "agregados" para dibujar la curva */
  curve: TitrationPoint[];
}
