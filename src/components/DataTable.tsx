import { useState } from "react";
import type { TitrationPoint, TitrationType } from "../types/chemistry";
import { regionLabel } from "../types/chemistry";

interface DataTableProps {
  points: TitrationPoint[];
  type: TitrationType;
}

/** Alternativa textual a la curva de titulación: misma información, en una tabla. */
export function DataTable({ points, type }: DataTableProps) {
  const [visible, setVisible] = useState(false);
  // Mostramos como mucho ~40 filas espaciadas para que la tabla sea legible.
  const step = Math.max(1, Math.floor(points.length / 40));
  const sampled = points.filter((_, index) => index % step === 0);

  return (
    <div className="data-table">
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-expanded={visible}
        aria-controls="titration-data-table"
      >
        {visible ? "Ocultar datos" : "Ver datos (tabla)"}
      </button>

      {visible && (
        <table id="titration-data-table">
          <caption>Volumen de titulante agregado y pH resultante</caption>
          <thead>
            <tr>
              <th scope="col">Volumen (mL)</th>
              <th scope="col">pH</th>
              <th scope="col">Región</th>
            </tr>
          </thead>
          <tbody>
            {sampled.map((point) => (
              <tr key={point.volumeAdded}>
                <td>{point.volumeAdded.toFixed(2)}</td>
                <td>{point.pH.toFixed(2)}</td>
                <td>{regionLabel(type, point.region)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
