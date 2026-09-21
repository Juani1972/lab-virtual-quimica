interface BuretteProps {
  /** Fracción de base restante en la bureta, 0..1 */
  remainingFraction: number;
}

const WIDTH = 40;
const HEIGHT = 240;

export function Burette({ remainingFraction }: BuretteProps) {
  const clamped = Math.min(1, Math.max(0, remainingFraction));
  const liquidHeight = clamped * (HEIGHT - 20);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Bureta con ${(clamped * 100).toFixed(0)}% de base restante`}
    >
      <rect
        x={10}
        y={10}
        width={WIDTH - 20}
        height={HEIGHT - 20}
        rx={4}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
      />
      <rect
        x={11}
        y={10 + (HEIGHT - 20 - liquidHeight)}
        width={WIDTH - 22}
        height={liquidHeight}
        fill="#3b82f6"
        opacity={0.85}
      />
      <polygon
        points={`${WIDTH / 2 - 5},${HEIGHT - 10} ${WIDTH / 2 + 5},${HEIGHT - 10} ${WIDTH / 2},${HEIGHT}`}
        fill="#94a3b8"
      />
    </svg>
  );
}
