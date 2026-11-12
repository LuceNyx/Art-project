# Digital Escapism: contexto para asistentes de IA

Proyecto final del curso **Arte y Tecnología (UTEC)**. Experiencia web interactiva hecha con HTML, CSS y JavaScript puros (sin frameworks, sin build, sin dependencias). Explora el escapismo digital **como refugio y como evasión a la vez**. La web no describe el escapismo: hace que el visitante **realice** la transición entre realidades.

## Flujo

```
MUTED WORLD (real, apagado) → clic (JS) → TRANSICIÓN DINÁMICA (CSS) → IMAGINED WORLD (brillante) → RESIDUO
  muted-world/                              transition/                  imagined-world/
```

## Principios (obligatorios para todas las partes)

- **Contraste:** el mundo real es pesado, comprimido y opresivo (blanco y negro, sin color). El imaginado es color y libertad.
- **Transición:** entrar al mundo imaginado es una acción visible que el visitante elige.
- **Residuo:** cada situación del Muted World tiene un **motivo visual** que reaparece dentro del mundo imaginado. Un motivo que sigue visible representa un sentimiento no resuelto que vuelve.
- **Significado de las interacciones:** ocultar contenido = evasión. Revelar una escena con color = alivio temporal (solo en el imagined world).
- Es una obra artística reflexiva, **no** un instrumento de diagnóstico. Nada de lenguaje clínico, terror explícito ni moralejas simplistas ("los videojuegos son malos").
- **Referencias:** de OMORI se toma solo el *principio* (cada espacio expresa una forma distinta de lidiar con el dolor). **Prohibido copiar personajes, historia, sprites o diseños concretos de OMORI** o de cualquier juego. Otras referencias de tono: *Journey* y *The Stanley Parable*.
- Los textos que ve el visitante están en **inglés**. Los comentarios de código y la documentación, en **español**.

## Estado de cada parte

| Parte | Carpeta | Prefijo CSS | Estado |
|---|---|---|---|
| Muted World | `muted-world/` | `mw-` | **Completo: las 7 situaciones (en revisión visual).** Los escapes son **aparatos** (portátil, mando, audífonos, computadora, celular, lentes VR, consola). **La puerta NO es un escape**: lleva a la rutina (`js/routine.js`) y vuelve al cuarto |
| Transición | `transition/` | `tr-` | **Completa.** Una forma de escapismo por situación (series, juego en línea, música, decisiones, reels, VR, construir). Recibe `?from=&motif=` y pasa a `imagined-world/` con los mismos datos. Ver `transition/README.md` |
| Imagined World | `imagined-world/` | `iw-` | **Sin paisaje: el aparato define la experiencia** (decisión del usuario). Celular → reels con links de `js/media-links.js` (el usuario edita esa lista) · mando → juego en línea · audífonos → reproductor con portadas de éxitos (`js/music-tracks.js`) · portátil → series · computadora → decisiones · VR → vuelo · consola → construir (`js/exp-*.js`). Siempre: motivo gris como residuo y portal parpadeante a `../muted-world/index.html?return=<scene>`. Ver `imagined-world/README.md` |

## Estructura

```
index.html              Entrada del sitio: redirige a muted-world/index.html
CLAUDE.md               Este archivo
muted-world/            Mundo real (ver muted-world/README.md e INTEGRATION.md)
transition/             Transición dinámica (ver transition/README.md). Objeto global: window.Transition
imagined-world/         Mundo imaginado con el goce y el portal de regreso (ver imagined-world/README.md). Objeto global: window.ImaginedWorld
prototipo-v0.1/         Prototipo anterior (página única de la v0.1), solo como referencia
css/  js/  docs/        Archivos de la v0.1, sin uso en el sitio actual. No borrar sin acuerdo del equipo
```

## Contrato de integración (resumen; detalle en `muted-world/INTEGRATION.md`)

1. Al hacer clic en el objeto de escape, el Muted World dispara en `window`:
   `CustomEvent('muted:escape', { detail: { scene, motif }, cancelable: true })`
2. Si nadie llama a `event.preventDefault()`, navega a
   `TRANSITION_URL + '?from=<scene>&motif=<motif>'` (por defecto `../transition/index.html`, en `muted-world/js/config.js`).
3. Los datos de las situaciones y sus motivos están en `window.MutedWorld.config.MUTED_SCENES` (cargando `muted-world/js/config.js`). Los SVG de los motivos están en `muted-world/assets/motifs/<motif>.svg`.
4. Para volver: `muted-world/index.html?return=<scene>`. La habitación muestra esa situación como visitada y con una luz nueva.

## Convenciones

- Cada parte usa **solo su prefijo de clases** y su carpeta. No se editan archivos de otra parte.
- Sin variables globales sueltas: cada parte agrupa su código en un objeto propio (`window.MutedWorld`, por ejemplo `window.Transition` o `window.ImaginedWorld`).
- Rutas **relativas**. Nombres de archivo en minúsculas, sin espacios ni tildes. El sitio se publica en GitHub Pages.
- Sin dependencias externas, salvo como máximo una fuente de Google Fonts por parte.
- Respetar `prefers-reduced-motion`, la navegación con teclado y el diseño responsivo.
- Nunca trabajar en `main`: usar ramas `feature/...`. No hacer commit, push ni merge sin autorización.

## Probar en local

```bash
python3 -m http.server 8000   # abrir http://localhost:8000
```

El Muted World también funciona abriendo `muted-world/index.html` con doble clic, aunque sin cargar los archivos de audio reales.
