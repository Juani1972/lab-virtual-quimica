import { useId, useState } from "react";

interface InfoTipProps {
  label: string;
  text: string;
}

/**
 * Botón "ⓘ" con una explicación breve. Se muestra con hover y con foco
 * (mouse, teclado o tap). El hover y el foco se rastrean en estados
 * separados en vez de un solo booleano: en un tap real, el navegador puede
 * disparar eventos de foco y de mouse sintéticos en cualquier orden, y si
 * ambos escribieran el mismo booleano uno podía "cancelar" al otro (por
 * ejemplo, un mouseleave sintético llegando después del focus). Con dos
 * estados independientes, cada evento solo apaga su propia fuente.
 */
export function InfoTip({ label, text }: InfoTipProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = hovered || focused;
  const id = useId();

  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-trigger"
        aria-describedby={visible ? id : undefined}
        aria-expanded={visible}
        aria-label={`Ayuda: ${label}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="info-tip-glyph" aria-hidden="true">
          ⓘ
        </span>
      </button>
      {visible && (
        <span role="tooltip" id={id} className="info-tip-bubble">
          {text}
        </span>
      )}
    </span>
  );
}
