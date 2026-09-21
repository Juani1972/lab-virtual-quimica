import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tutorial } from "./Tutorial";

describe("Tutorial", () => {
  it("no renderiza nada cuando open es false", () => {
    render(<Tutorial open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("muestra el primer paso, con 'Anterior' deshabilitado", () => {
    render(<Tutorial open onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/paso 1 de/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("'Siguiente' avanza los pasos y en el último cambia a 'Empezar'", async () => {
    const user = userEvent.setup();
    render(<Tutorial open onClose={vi.fn()} />);

    const next = () => screen.getByRole("button", { name: /siguiente/i });
    await user.click(next());
    expect(screen.getByText(/paso 2 de/i)).toBeInTheDocument();

    // avanzamos hasta el final
    while (screen.queryByRole("button", { name: /siguiente/i })) {
      await user.click(next());
    }

    expect(screen.getByRole("button", { name: /empezar/i })).toBeInTheDocument();
  });

  it("'Cerrar' llama a onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tutorial open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /^cerrar$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape también llama a onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tutorial open onClose={onClose} />);

    screen.getByRole("dialog").focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
