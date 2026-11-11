# Integración con el Muted World

Guía para quien construya la **transición** (`transition/`, prefijo `tr-`) o el **imagined world** (`imagined-world/`, prefijo `iw-`).

## 1. Cómo sale el visitante del Muted World

Dentro de cada situación hay un **objeto de escape**. Al hacer clic en él, el Muted World dispara en `window`:

```js
new CustomEvent('muted:escape', {
  detail: { scene: 'academic-pressure', motif: 'stacked-paper' },
  cancelable: true
});
```

Hay dos maneras de recibirlo.

**A. En otra página (lo normal).** Si nadie llama a `preventDefault()`, el Muted World hace un fundido a blanco de unos 1,5 s y navega a:

```
../transition/index.html?from=<scene>&motif=<motif>
```

La URL se define en `TRANSITION_URL`, al inicio de `muted-world/js/config.js`. Para leer los datos en la transición:

```js
const params = new URLSearchParams(location.search);
const scene = params.get('from');   // p. ej. "academic-pressure"
const motif = params.get('motif');  // p. ej. "stacked-paper"
```

**B. En la misma página.** Si se carga código propio dentro de `muted-world/index.html`, se puede tomar el control sin navegar:

```js
window.addEventListener('muted:escape', (e) => {
  e.preventDefault();             // el Muted World ya no navega
  const { scene, motif } = e.detail;
  // ...empieza la transición aquí
});
```

## 2. Situaciones y motivos de residuo

Para obtener los datos completos, carga `<script src="../muted-world/js/config.js"></script>` y usa `window.MutedWorld.config.MUTED_SCENES`. Cada elemento trae `id`, `title`, `roomObject`, `escapeObject`, `motif: { id, description, file }`, `lines` y `ready`.

| scene | motif | Descripción del motivo | ¿Lista? |
|---|---|---|---|
| `academic-pressure` | `stacked-paper` | Una pila torcida de hojas que no deja de crecer | ✅ |
| `loneliness` | `unanswered-bubble` | Una burbuja de mensaje vacía marcada como "Seen" | pendiente |
| `emotional-overload` | `pinned-note` | Una nota arrugada sujeta con una sola chincheta | pendiente |
| `lack-of-control` | `stopped-clock` | Un reloj detenido en las 7:00 | pendiente |
| `social-comparison` | `blank-polaroid` | Una foto instantánea vacía | pendiente |
| `uncertain-future` | `lit-window` | Un rectángulo encendido en un edificio oscuro | pendiente |
| `family-expectations` | `facedown-frame` | Un marco de foto boca abajo | pendiente |

Los SVG están en `muted-world/assets/motifs/<motif>.svg`. Desde `transition/` o desde `imagined-world/` la ruta es `../muted-world/assets/motifs/<motif>.svg`. Son grises con fondo transparente: se pueden recolorear, desenfocar o animar en el mundo imaginado. Recuerda que un motivo que sigue visible es un sentimiento que vuelve.

## 3. Cómo volver al Muted World

```
../muted-world/index.html?return=<scene>
```

La habitación muestra esa situación como visitada (más oscura, con un detalle cambiado) y una **luz nueva** que antes no estaba: el regreso no es igual a la partida. La pantalla de entrada dice *"Click to return to your room"*. Los ids no válidos se ignoran.

## 4. Lo que NO se toca

Todo lo que está dentro de `muted-world/` pertenece al Muted World. Para conectarse, solo se necesita:

- cambiar `TRANSITION_URL` en `muted-world/js/config.js`, si la transición vive en otra ruta;
- leer `MUTED_SCENES` y los SVG de `assets/motifs/`.

No edites `muted-world/css/muted.css` ni los demás archivos de `muted-world/js/`. Usa siempre tus propios prefijos (`tr-`, `iw-`) y tu propio objeto global, para no chocar con `window.MutedWorld`.

`transition/index.html` es un **PLACEHOLDER**: se puede reemplazar completo.
