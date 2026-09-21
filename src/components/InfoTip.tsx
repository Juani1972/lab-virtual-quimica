import { useId, useState } from "react";

interface InfoTipProps {
  label: string;
  text: string;
}

/**
 * Botón "ⓘ" con una explicación breve. Se muestra con hover y con foco por
 * teclado; como un tap en un botón también lo enfoca, esto alcanza para
 * pantallas táctiles sin necesitar además un manejador de click separado
 * (que compite con el evento de foco y termina auto-cancelándose).
 */
export function InfoTip({ label, text }: InfoTipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-trigger"
        aria-describedby={visible ? id : undefined}
        aria-expanded={visible}
        aria-label={`Ayuda: ${label}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        ⓘ
      </button>
      {visible && (
        <span role="tooltip" id={id} className="info-tip-bubble">
          {text}
        </span>
      )}
    </span>
  );
}
