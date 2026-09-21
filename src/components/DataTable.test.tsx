import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";
import type { TitrationPoint } from "../types/chemistry";

const points: TitrationPoint[] = [
  { volumeAdded: 0, pH: 2.87, region: "antes" },
  { volumeAdded: 12.5, pH: 4.74, region: "tampon" },
  { volumeAdded: 25, pH: 8.72, region: "equivalencia" },
];

describe("DataTable", () => {
  it("la tabla está oculta por defecto, como alternativa que no compite con el gráfico", () => {
    render(<DataTable points={points} type="acido-debil-base-fuerte" />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver datos/i })).toBeInTheDocument();
  });

  it("muestra la tabla con los datos al hacer click en el botón", async () => {
    const user = userEvent.setup();
    render(<DataTable points={points} type="acido-debil-base-fuerte" />);

    await user.click(screen.getByRole("button", { name: /ver datos/i }));

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(screen.getByText("2.87")).toBeInTheDocument();
    expect(screen.getByText("Punto de equivalencia")).toBeInTheDocument();
  });

  it("el botón alterna a 'Ocultar datos' y actualiza aria-expanded", async () => {
    const user = userEvent.setup();
    render(<DataTable points={points} type="acido-debil-base-fuerte" />);

    const button = screen.getByRole("button", { name: /ver datos/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /ocultar datos/i })).toBeInTheDocument();
  });
});
