import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InfoTip } from "./InfoTip";

describe("InfoTip", () => {
  it("el texto de ayuda está oculto por defecto", () => {
    render(<InfoTip label="Bureta" text="Contiene el titulante." />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("un click (que enfoca el botón) muestra el tooltip; salir del foco lo oculta", async () => {
    const user = userEvent.setup();
    render(
      <>
        <InfoTip label="Bureta" text="Contiene el titulante." />
        <button type="button">otro elemento</button>
      </>
    );

    const trigger = screen.getByRole("button", { name: /ayuda: bureta/i });
    await user.click(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Contiene el titulante.");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "otro elemento" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("el foco por teclado también muestra el tooltip", async () => {
    const user = userEvent.setup();
    render(<InfoTip label="Bureta" text="Contiene el titulante." />);

    await user.tab();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
