# 🧪 Laboratorio Virtual de Química

Laboratorio virtual interactivo para experimentar con química a nivel pedagógico.
Funciona en **PC y tablet** desde el navegador, sin instalaciones.

## ✨ Características actuales

- **Tres tipos de titulación**: ácido débil–base fuerte, ácido fuerte–base
  fuerte y base débil–ácido fuerte, cada una con su propio modelo de pH.
- Simulación por regiones: analito puro, tampón (cuando aplica), equivalencia
  y exceso de titulante.
- Visualización en canvas del matraz Erlenmeyer y la bureta.
- **4 indicadores reales** con su zona de viraje (fenolftaleína, azul de
  bromotimol, rojo de metilo, naranja de metilo), con el cambio de color
  siempre acompañado de una etiqueta de texto (no depende solo del color).
- Curva de titulación dibujada en vivo, con el punto de equivalencia marcado.
- **Tabla de datos** como alternativa accesible a la curva (volumen, pH,
  región), oculta por defecto y desplegable con un botón.
- Selector de especies comunes (ácidos y bases débiles) y parámetros
  ajustables (concentración, volumen).
- Controles totalmente operables por teclado, con `aria-label`/`aria-valuetext`
  en el matraz y el slider de volumen, y una región `aria-live` que anuncia
  el pH actual.
- Interfaz responsive, pensada para uso táctil.

## 🛠️ Stack

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Canvas API / SVG** para el renderizado 2D
- **Vitest + React Testing Library** para tests unitarios y de componentes
- Sin backend: todo corre en el navegador

## 🚀 Cómo ejecutarlo

```bash
# Requiere Node.js 20 o superior
npm install
npm run dev
```

Abrí la URL que imprime Vite (por defecto `http://localhost:5173`).

### Otros scripts

```bash
npm run test       # corre la suite de tests una vez
npm run test:watch # tests en modo watch
npm run lint        # ESLint
npm run typecheck   # TypeScript, sin emitir archivos
npm run build       # typecheck + build de producción
```

Un workflow de GitHub Actions (`.github/workflows/ci.yml`) corre lint,
typecheck, tests y build en cada push/PR a `main`.

## 🧮 Modelo químico

El motor (`src/engine/titration.ts`) calcula el pH exacto según el tipo de
titulación elegido:

- **Ácido débil — base fuerte**:
  1. Analito puro: se resuelve `Ka = x² / (C₀ − x)` para `[H⁺]`.
  2. Tampón: Henderson-Hasselbalch, `pH = pKa + log([A⁻]/[HA])`.
  3. Equivalencia: hidrólisis de la base conjugada `A⁻`, con `Kb = Kw / Ka`.
  4. Exceso de titulante: el pH queda dominado por el `OH⁻` en exceso.
- **Ácido fuerte — base fuerte**: disociación completa; antes de la
  equivalencia domina el `H⁺` en exceso, en la equivalencia `pH = 7`, después
  domina el `OH⁻` en exceso.
- **Base débil — ácido fuerte**: análogo al primer caso pero para el par
  base/ácido conjugado (`Ka = Kw / Kb`), con hidrólisis ácida en la
  equivalencia (`pH < 7`).

El color del indicador (`src/engine/indicators.ts`) se interpola linealmente
entre sus dos colores dentro de la zona de viraje declarada por cada
indicador.

## 📁 Estructura

```
src/
  types/      Tipos compartidos (TitrationSetup, TitrationState, ...)
  engine/     Cálculo de pH e indicadores (puro, sin UI, con tests)
  hooks/      useTitration: estado de la simulación
  components/ Flask, Burette, TitrationChart, DataTable, Controls
  test/       Setup compartido de Vitest
```

## 🗺️ Próximas fases

- Titulaciones polipróticas (H₃PO₄, H₂CO₃) con múltiples puntos de
  equivalencia.
- Modo "receta guiada" con pasos y preguntas de comprobación.
- Modo "cálculo inverso": dado un pH y un volumen, estimar la concentración
  desconocida.
- Despliegue automático de una demo pública (GitHub Pages).

## 📄 Licencia

MIT — ver [LICENSE](./LICENSE).
