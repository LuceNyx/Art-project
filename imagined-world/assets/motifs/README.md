# Motivos de residuo

Esta carpeta está **vacía a propósito**. Los motivos **no se duplican**: el Imagined World carga los SVG originales del Muted World con una ruta relativa:

```
../muted-world/assets/motifs/<motif>.svg
```

| Situación | Motivo |
|---|---|
| `academic-pressure` | `stacked-paper.svg` |
| `loneliness` | `unanswered-bubble.svg` |
| `emotional-overload` | `pinned-note.svg` |
| `lack-of-control` | `stopped-clock.svg` |
| `social-comparison` | `blank-polaroid.svg` |
| `uncertain-future` | `lit-window.svg` |
| `family-expectations` | `facedown-frame.svg` |

La transformación (posición, escala, flotación, halo de color y reflejo en el agua) se hace con CSS en `css/imagined.css` y con `js/residual-motif.js`. El SVG sigue en gris a propósito: es el sentimiento que vuelve.
