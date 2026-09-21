import "@testing-library/jest-dom/vitest";

// jsdom no implementa el contexto 2D de <canvas>; el componente Flask ya
// maneja ctx === null con gracia, pero esto evita ruido en la consola de test.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
