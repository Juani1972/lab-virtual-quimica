import type { TitrationPoint } from "../types/chemistry";

interface TitrationChartProps {
  fullCurve: TitrationPoint[];
  curveSoFar: TitrationPoint[];
  maxVolume: number;
  equivalenceVolume: number;
  currentVolume: number;
  currentPH: number;
}

const WIDTH = 480;
const HEIGHT = 300;
const PADDING = { top: 16, right: 16, bottom: 36, left: 40 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const PH_MIN = 0;
const PH_MAX = 14;

function scaleX(volume: number, maxVolume: number): number {
  if (maxVolume <= 0) return PADDING.left;
  return PADDING.left + (volume / maxVolume) * PLOT_WIDTH;
}

function scaleY(pH: number): number {
  return PADDING.top + PLOT_HEIGHT - ((pH - PH_MIN) / (PH_MAX - PH_MIN)) * PLOT_HEIGHT;
}

function toPath(points: TitrationPoint[], maxVolume: number): string {
  return points
    .map((point, index) => {
      const x = scaleX(point.volumeAdded, maxVolume);
      const y = scaleY(point.pH);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function TitrationChart({
  fullCurve,
  curveSoFar,
  maxVolume,
  equivalenceVolume,
  currentVolume,
  currentPH,
}: TitrationChartProps) {
  const yTicks = [0, 2, 4, 6, 7, 8, 10, 12, 14];

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={`Curva de titulación, pH ${currentPH.toFixed(2)} con ${currentVolume.toFixed(
        2
      )} mL de titulante agregado. Los mismos datos están disponibles como tabla más abajo.`}
    >
      {/* Grilla y eje Y */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={scaleY(tick)}
            y2={scaleY(tick)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text x={PADDING.left - 8} y={scaleY(tick) + 4} textAnchor="end" fontSize={11} fill="#64748b">
            {tick}
          </text>
        </g>
      ))}

      {/* Curva completa, tenue, como referencia */}
      <path d={toPath(fullCurve, maxVolume)} fill="none" stroke="#cbd5e1" strokeWidth={2} />

      {/* Curva ya "titulada" */}
      <path d={toPath(curveSoFar, maxVolume)} fill="none" stroke="#2563eb" strokeWidth={2.5} />

      {/* Línea de equivalencia */}
      {equivalenceVolume > 0 && equivalenceVolume <= maxVolume && (
        <line
          x1={scaleX(equivalenceVolume, maxVolume)}
          x2={scaleX(equivalenceVolume, maxVolume)}
          y1={PADDING.top}
          y2={PADDING.top + PLOT_HEIGHT}
          stroke="#f97316"
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
      )}

      {/* Punto actual */}
      <circle cx={scaleX(currentVolume, maxVolume)} cy={scaleY(currentPH)} r={5} fill="#dc2626" />

      {/* Ejes */}
      <line
        x1={PADDING.left}
        x2={WIDTH - PADDING.right}
        y1={PADDING.top + PLOT_HEIGHT}
        y2={PADDING.top + PLOT_HEIGHT}
        stroke="#475569"
        strokeWidth={1.5}
      />
      <line
        x1={PADDING.left}
        x2={PADDING.left}
        y1={PADDING.top}
        y2={PADDING.top + PLOT_HEIGHT}
        stroke="#475569"
        strokeWidth={1.5}
      />

      <text x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fontSize={12} fill="#334155">
        Volumen de base agregado (mL)
      </text>
      <text
        x={-HEIGHT / 2}
        y={12}
        textAnchor="middle"
        fontSize={12}
        fill="#334155"
        transform="rotate(-90)"
      >
        pH
      </text>
    </svg>
  );
}
