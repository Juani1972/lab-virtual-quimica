import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renderiza el pH inicial y el punto de equivalencia para la configuración por defecto", () => {
    render(<App />);

    expect(screen.getByText(/pH 2\.8[0-9]/)).toBeInTheDocument();
    expect(screen.getByText(/V\. equivalencia: 25\.00 mL/)).toBeInTheDocument();
  });

  it("expone el control de tipo de reacción y el de indicador", () => {
    render(<App />);

    expect(screen.getByLabelText(/reacción/i, { selector: "select" })).toBeInTheDocument();
    expect(screen.getByLabelText(/indicador/i, { selector: "select" })).toBeInTheDocument();
  });

  it("incluye la tabla de datos como alternativa accesible a la curva", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: /ver datos/i })).toBeInTheDocument();
  });
});
