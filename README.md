# 🧪 Laboratorio Virtual de Química

Laboratorio virtual interactivo para experimentar con química a nivel pedagógico.
Funciona en **PC y tablet** desde el navegador, sin instalaciones.

## ✨ Características actuales

- **Titulación ácido débil — base fuerte** con cálculo de pH en tiempo real.
- Simulación por regiones: ácido débil, tampón, equivalencia y exceso de base.
- Visualización en canvas del matraz Erlenmeyer y la bureta.
- Cambio de color según el indicador (fenolftaleína).
- Curva de titulación dibujada en vivo, con el punto de equivalencia marcado.
- Selector de ácidos comunes (acético, fórmico, cianhídrico, hipocloroso) y
  parámetros ajustables (concentración, volumen).
- Interfaz responsive, pensada para uso táctil.

## 🛠️ Stack

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Canvas API / SVG** para el renderizado 2D
- Sin backend: todo corre en el navegador

## 🚀 Cómo ejecutarlo

```bash
# Requiere Node.js 20 o superior
npm install
npm run dev
```

Abrí la URL que imprime Vite (por defecto `http://localhost:5173`).

## 🧮 Modelo químico

El motor (`src/engine/titration.ts`) calcula el pH exacto en cada región de la
curva de titulación de un ácido débil monoprótico con una base fuerte:

1. **Ácido débil puro** (antes de agregar base): se resuelve
   `Ka = x² / (C₀ − x)` para `[H⁺]`.
2. **Región tampón**: ecuación de Henderson-Hasselbalch,
   `pH = pKa + log([A⁻]/[HA])`.
3. **Punto de equivalencia**: hidrólisis de la base conjugada `A⁻`,
   usando `Kb = Kw / Ka`.
4. **Exceso de base**: el pH queda dominado por el `OH⁻` en exceso.

## 📁 Estructura

```
src/
  types/      Tipos compartidos (TitrationSetup, TitrationState, ...)
  engine/     Cálculo de pH y color del indicador (puro, sin UI)
  hooks/      useTitration: estado de la simulación
  components/ Flask, Burette, TitrationChart, Controls
```

## 🗺️ Próximas fases

- Otros tipos de titulación (base débil — ácido fuerte, polipróticos).
- Más indicadores con distintas zonas de viraje.
- Modo "receta guiada" con pasos y preguntas.

## 📄 Licencia

MIT — ver [LICENSE](./LICENSE).
