import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Controls } from "./Controls";
import { INDICATORS } from "../engine/indicators";
import type { ComponentProps } from "react";
import type { TitrationSetup } from "../types/chemistry";

const weakAcidSetup: TitrationSetup = {
  type: "acido-debil-base-fuerte",
  analyteConcentration: 0.1,
  analyteVolume: 25,
  titrantConcentration: 0.1,
  ka: 1.8e-5,
};

function renderControls(overrides: Partial<ComponentProps<typeof Controls>> = {}) {
  const onSetupChange = vi.fn();
  const onVolumeChange = vi.fn();
  const onIndicatorChange = vi.fn();
  const onReset = vi.fn();

  render(
    <Controls
      setup={weakAcidSetup}
      volumeAdded={0}
      maxVolume={50}
      region="antes"
      indicator={INDICATORS[0]}
      onSetupChange={onSetupChange}
      onVolumeChange={onVolumeChange}
      onIndicatorChange={onIndicatorChange}
      onReset={onReset}
      {...overrides}
    />
  );

  return { onSetupChange, onVolumeChange, onIndicatorChange, onReset };
}

describe("Controls", () => {
  it("muestra el selector de especie de ácido débil cuando el tipo lo requiere", () => {
    renderControls();
    expect(screen.getByLabelText(/especie/i)).toBeInTheDocument();
  });

  it("al cambiar a 'ácido fuerte — base fuerte' oculta el selector de especie (Ka)", () => {
    renderControls({
      setup: {
        type: "acido-fuerte-base-fuerte",
        analyteConcentration: 0.1,
        analyteVolume: 25,
        titrantConcentration: 0.1,
      },
    });
    expect(screen.queryByLabelText(/especie/i)).not.toBeInTheDocument();
  });

  it("cambiar el tipo de reacción notifica el nuevo tipo y limpia ka/kb según corresponda", async () => {
    const user = userEvent.setup();
    const { onSetupChange } = renderControls();

    await user.selectOptions(screen.getByLabelText(/reacción/i), "base-debil-acido-fuerte");

    expect(onSetupChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "base-debil-acido-fuerte", ka: undefined })
    );
  });

  it("cambiar el indicador notifica el nuevo indicador seleccionado", async () => {
    const user = userEvent.setup();
    const { onIndicatorChange } = renderControls();

    const target = INDICATORS.find((item) => item.id === "azul-bromotimol")!;
    await user.selectOptions(screen.getByLabelText(/indicador/i), target.id);

    expect(onIndicatorChange).toHaveBeenCalledWith(target);
  });

  it("el slider de volumen es accesible por teclado y expone el estado vía aria-valuetext", () => {
    renderControls();
    const slider = screen.getByLabelText(/volumen agregado/i);
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("aria-valuetext", expect.stringContaining("mililitros"));
  });

  it("el botón de reinicio dispara onReset", async () => {
    const user = userEvent.setup();
    const { onReset } = renderControls();

    await user.click(screen.getByRole("button", { name: /reiniciar bureta/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
