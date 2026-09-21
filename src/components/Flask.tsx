import { useEffect, useRef } from "react";
import { indicatorColor } from "../engine/indicator";

interface FlaskProps {
  pH: number;
  fillLevel: number; // 0..1, qué tan lleno se ve el matraz
}

const WIDTH = 220;
const HEIGHT = 260;

export function Flask({ pH, fillLevel }: FlaskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Cuerpo del Erlenmeyer
    const neckTopY = 20;
    const neckBottomY = 90;
    const neckHalfWidth = 18;
    const baseHalfWidth = 80;
    const baseY = HEIGHT - 20;

    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 - neckHalfWidth, neckTopY);
    ctx.lineTo(WIDTH / 2 + neckHalfWidth, neckTopY);
    ctx.lineTo(WIDTH / 2 + neckHalfWidth, neckBottomY);
    ctx.lineTo(WIDTH / 2 + baseHalfWidth, baseY);
    ctx.lineTo(WIDTH / 2 - baseHalfWidth, baseY);
    ctx.lineTo(WIDTH / 2 - neckHalfWidth, neckBottomY);
    ctx.closePath();

    ctx.save();
    ctx.clip();

    // Líquido: llenamos desde abajo según fillLevel
    const liquidTop = baseY - fillLevel * (baseY - neckTopY);
    ctx.fillStyle = indicatorColor(pH);
    ctx.fillRect(0, liquidTop, WIDTH, baseY - liquidTop);
    ctx.restore();

    // Contorno de vidrio
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    // Reflejo sutil
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 - baseHalfWidth + 12, baseY - 8);
    ctx.lineTo(WIDTH / 2 - neckHalfWidth + 4, neckBottomY + 6);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [pH, fillLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={`Matraz Erlenmeyer con solución a pH ${pH.toFixed(2)}`}
    />
  );
}
