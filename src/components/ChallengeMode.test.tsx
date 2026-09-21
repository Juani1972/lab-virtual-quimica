import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChallengeMode } from "./ChallengeMode";

describe("ChallengeMode", () => {
  it("el botón de revelar está deshabilitado hasta elegir una predicción", () => {
    render(<ChallengeMode equivalencePH={8.72} onResolved={vi.fn()} />);
    expect(screen.getByRole("button", { name: /revelar resultado/i })).toBeDisabled();
  });

  it("llama a onResolved(true) cuando la predicción es correcta", async () => {
    const user = userEvent.setup();
    const onResolved = vi.fn();
    render(<ChallengeMode equivalencePH={8.72} onResolved={onResolved} />);

    await user.click(screen.getByRole("radio", { name: /básico/i }));
    await user.click(screen.getByRole("button", { name: /revelar resultado/i }));

    expect(onResolved).toHaveBeenCalledWith(true);
    expect(screen.getByText(/acertaste/i)).toBeInTheDocument();
  });

  it("llama a onResolved(false) cuando la predicción es incorrecta", async () => {
    const user = userEvent.setup();
    const onResolved = vi.fn();
    render(<ChallengeMode equivalencePH={8.72} onResolved={onResolved} />);

    await user.click(screen.getByRole("radio", { name: /ácido/i }));
    await user.click(screen.getByRole("button", { name: /revelar resultado/i }));

    expect(onResolved).toHaveBeenCalledWith(false);
    expect(screen.getByText(/no esta vez/i)).toBeInTheDocument();
  });

  it("'Predecir de nuevo' vuelve a la pantalla de predicción", async () => {
    const user = userEvent.setup();
    render(<ChallengeMode equivalencePH={7} onResolved={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: /neutro/i }));
    await user.click(screen.getByRole("button", { name: /revelar resultado/i }));
    await user.click(screen.getByRole("button", { name: /predecir de nuevo/i }));

    expect(screen.getByRole("button", { name: /revelar resultado/i })).toBeDisabled();
  });
});
