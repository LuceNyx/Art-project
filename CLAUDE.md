# Digital Escapism: contexto para asistentes de IA

Proyecto final del curso **Arte y Tecnología (UTEC)**. Experiencia web interactiva hecha con HTML, CSS y JavaScript puros (sin frameworks ni build). Explora el escapismo digital **como refugio y como evasión a la vez**. La web no describe el escapismo: hace que el visitante **realice** la transición entre realidades.

- **Publicado en:** https://lucenyx.github.io/Art-project/ (GitHub Pages, rama `main`, carpeta raíz). El repositorio es `LuceNyx/Art-project`.
- **Quién trabaja:** el proyecto empezó como un equipo de 4, pero ahora **una sola persona maneja todo el código** y es la que da las instrucciones (también trae los pedidos de sus compañeros).

## Flujo

```
MUTED WORLD ──clic en un APARATO──► TRANSICIÓN ──► IMAGINED WORLD ──portal──► MUTED WORLD (?return=)
 muted-world/                        transition/     imagined-world/
      │
      └──la PUERTA──► rutina (el tiempo pasa rápido) ──► vuelve al cuarto
```

## Principios (obligatorios)

- **Contraste:** el mundo real es pesado, comprimido y opresivo (blanco y negro, **cero color**). El imaginado es color, intensidad y libertad.
- **Transición:** entrar al mundo imaginado es una acción visible que el visitante elige (clic en un aparato).
- **Residuo:** cada situación tiene un **motivo visual** (SVG) que reaparece **en gris** dentro de la experiencia imaginada y no se puede quitar. Representa un sentimiento no resuelto que vuelve.
- **Interacciones con significado:** ocultar contenido = evasión. Color = alivio temporal (solo en el mundo imaginado).
- Obra artística reflexiva, **no** un instrumento de diagnóstico. Nada de lenguaje clínico, terror explícito, sangre ni moralejas simplistas ("los videojuegos son malos").
- **Referencias:** de OMORI se toma solo el *principio* (cada espacio expresa una forma distinta de lidiar con el dolor). **Prohibido copiar personajes, historia, sprites o diseños** de OMORI o de cualquier juego. Otras referencias de tono: *Journey* y *The Stanley Parable*.
- Los textos que ve el visitante, en **inglés**. Los comentarios de código, la documentación y las respuestas al usuario, en **español**.

## Las 7 situaciones (resumen)

| Situación (`scene`) | Objeto en el cuarto | Aparato de escape | Transición | Experiencia imaginada | Motivo (residuo) |
|---|---|---|---|---|---|
| `academic-pressure` | Lámpara y cuaderno | Portátil | Series | **Series**: catálogo de 8 plataformas (nombres en texto, no logos) → series populares como tarjetas generadas en código → capítulos con subtítulos, *Next episode in 5…* automático (`exp-video.js`) | `stacked-paper`, reflejada en la pantalla entre capítulos |
| `loneliness` | Celular en la cama | Mando | Juego en línea | **Juego en línea** con 3 amigos que pelean y escriben, combos, rondas, sin game over (`exp-online.js`) | `unanswered-bubble`, flota y las balas la atraviesan |
| `emotional-overload` | Corcho | Audífonos | Música | **Reproductor**: pared de portadas de éxitos, filtros por género, anterior/pausa/siguiente; en pausa vuelve la realidad (`exp-music.js`) | `pinned-note`, una portada gris |
| `lack-of-control` | Reloj | Computadora | Decisiones (transición) | **Creador de personaje y mundo** vóxel: ficha del yo real (gris) frente al avatar personalizable hasta los extremos; luego su mundo (`exp-choice.js`) | `stopped-clock`, junto al contador de cambios |
| `social-comparison` | Espejo con fotos | Celular | Reels | **Reels** tipo feed *For you* sin cuenta: los links de `media-links.js` (8 TikToks + 1 Instagram + 1 Facebook), barajados sin repeticiones, todo dentro de la página, autor y texto encima, gestos y autoplay/sonido por API (`reels.js`) | `blank-polaroid`, tarjeta vacía cada 5 videos |
| `uncertain-future` | Ventana | Lentes VR | VR | **Planeta alienígena inmersivo** (dos soles, anillos, montañas flotantes, criaturas), sin objetivos (`exp-vr.js`) | `lit-window`, en el horizonte, nunca se acerca |
| `family-expectations` | Foto en el estante | Consola portátil | Construir (transición) | **Mini plataformero** con personaje propio de rojo, sin puntaje ni game over (`exp-sandbox.js`) | `facedown-frame`, bloques grises del camino que no se rompen |

## Estado de cada parte

| Parte | Carpeta | Prefijo CSS | Objeto global | Estado |
|---|---|---|---|---|
| Muted World | `muted-world/` | `mw-` | `window.MutedWorld` | **Completo** (7 situaciones). Escapes = **aparatos**. **La puerta NO es un escape**: en la habitación y con *Leave* (Lack of control) lleva a la rutina (`js/routine.js`: reloj acelerado, *Monday… Friday*, *Again.*) y vuelve al cuarto. **Con `?return=<scene>` se salta la pantalla de entrada**: la habitación se abre con el foco en ese objeto, ya visitado (más oscuro), y la luz nueva; si el navegador bloquea el sonido, el botón dice *tap for sound*. **Con `?preview=<scene>`** muestra solo el primer plano de la situación, sin sonido ni textos (la ventana del portal). Imágenes: **placeholders** generados en código (pendiente: ilustraciones reales, ver `assets/img/IMAGE_SPEC.md`) |
| Transición | `transition/` | `tr-` | `window.Transition` | **Completa.** Una animación por aparato: empieza en gris, el color la invade y termina en blanco. Sus dos frases incluyen **el goce** (p. ej. *"The music is louder than the room."*). *Skip* o Enter/Espacio/Escape |
| Imagined World | `imagined-world/` | `iw-` | `window.ImaginedWorld` | **Sin paisaje: el aparato define la experiencia** (tabla de arriba). **Sin pantallas de inicio**: cada experiencia arranca sola. Siempre: el residuo en gris y el **portal** (arriba a la izquierda): una ventana en gris a la escena de origen con su aparato (`muted-world/index.html?preview=<scene>` en un iframe inerte), con chispazos (destellos, glitch en los bordes, luz que titila) que insisten más a los 20 y 50 s, y los mensajes del cuarto. Vuelve a `../muted-world/index.html?return=<scene>` |

## Archivos que edita el usuario

- `imagined-world/js/media-links.js` → lista `mediaLinks` de los **reels**: TikTok, Instagram, Facebook o YouTube Shorts. Deben ser direcciones completas; los links cortos (`vt.tiktok.com`) y los placeholders se ignoran.
- `imagined-world/js/media-pool.js` → `IW.mediaPool`: banco de 25 TikToks populares `{ url, author, caption }`. **Apagado** (su `<script>` está comentado en `imagined-world/index.html`) porque el usuario eligió sus propios links; si se activa, se mezcla con ellos. **No existe una API pública para pedir videos al azar** de TikTok, Instagram o Facebook desde una página estática: por eso es una lista, verificada con `https://www.tiktok.com/player/api/v1/items?item_ids=<id>` (si devuelve `nil_core_data`, el video ya no existe). Instagram y Facebook no permiten autoplay en reproductores incrustados.
- `imagined-world/js/music-tracks.js` → lista `IW.musicTracks` de las **canciones** (título, artista, género, portada, vista previa, enlace). Se resolvieron con la API pública de búsqueda de iTunes. Dentro del archivo se explica cómo agregar más.

## Estructura

```
index.html              Entrada: redirige a muted-world/index.html
CLAUDE.md               Este archivo
muted-world/            Mundo real (README.md, INTEGRATION.md, assets/img/IMAGE_SPEC.md, assets/audio/AUDIO_SPEC.md)
  js/config.js          Contrato: MUTED_SCENES, TRANSITION_URL, ROUTINE (la puerta)
  js/room.js · scenes.js · routine.js · images.js · grain.js · audio.js
  assets/motifs/*.svg   Los 7 motivos de residuo (los reutilizan las otras partes; no se duplican)
transition/             Transición (README.md, css/transition.css, js/transition.js)
imagined-world/         Mundo imaginado (README.md)
  js/imagined.js        Entrada: elige la experiencia según `medium`, portal, avisos
  js/scene-data.js      Por situación: medium, goce, mensajes de la realidad, frase del residuo
  js/audio.js           Motor de sonido compartido (Web Audio)
  js/reels.js · exp-*.js  Las 7 experiencias
  js/world-interactions.js  ⚠ OBSOLETO (el paisaje anterior). No se carga; se puede borrar si el usuario lo aprueba
prototipo-v0.1/         Prototipo de la v0.1, solo como referencia
css/  js/  docs/        Archivos de la v0.1, sin uso en el sitio actual. No borrar sin acuerdo
```

## Contrato de integración (detalle en `muted-world/INTEGRATION.md`)

1. Al hacer clic en el aparato de escape, el Muted World dispara en `window`: `CustomEvent('muted:escape', { detail: { scene, motif }, cancelable: true })`.
2. Si nadie llama a `preventDefault()`, navega a `../transition/index.html?from=<scene>&motif=<motif>`. La transición pasa a `../imagined-world/index.html` con los mismos parámetros.
3. Datos: `window.MutedWorld.config.MUTED_SCENES` (cargando `muted-world/js/config.js`). Motivos: `muted-world/assets/motifs/<motif>.svg`.
4. Regreso: `muted-world/index.html?return=<scene>`. Entra directo a la habitación (sin *Click to enter*), con el foco en el objeto de esa situación, marcada como visitada (más oscura) y con una luz nueva.
5. Miniatura: `muted-world/index.html?preview=<scene>` muestra solo el primer plano de la situación, sin sonido, textos ni controles, y no cuenta como visita. La usa la ventana del portal.

## Convenciones

- Cada parte usa **su prefijo de clases** y su objeto global. No hay variables globales sueltas.
- Scripts **clásicos** (no módulos ES): así también funciona con doble clic.
- Rutas **relativas**. Nombres de archivo en minúsculas, sin espacios ni tildes.
- Dependencias: ninguna librería. Como máximo una fuente de Google Fonts por parte (EB Garamond en el Muted World, Fraunces en la transición y el mundo imaginado). **Excepciones aceptadas por el usuario:** los reproductores oficiales incrustados de TikTok, Instagram, Facebook y YouTube (reels) y las portadas y vistas previas de Apple Music (música). Requieren internet.
- **Sonido:** nunca autoplay a la fuerza. Si el navegador lo bloquea, el botón dice *tap for sound* y el primer toque o tecla lo enciende. Hay un botón de silencio y la preferencia se guarda en `localStorage`.
- Respetar `prefers-reduced-motion`, la navegación con teclado y el diseño responsivo (probar a 390 px).
- El atributo `hidden` debe ocultar siempre (`[hidden]{display:none!important}`); si no, capas invisibles bloquean los clics.

## Flujo de trabajo (autorizado por el usuario)

- Trabajar siempre en una rama `feature/...`, nunca directo en `main`.
- **El usuario autorizó de forma permanente** commit, push, abrir el PR y fusionarlo a `main` (squash) sin preguntar cada vez, una vez terminado **y comprobado** el trabajo. Luego, esperar a que GitHub Pages publique y darle el enlace.
- Borrar archivos o ramas, o hacer un force push, **sí se consulta antes**.
- Commits en español, con la línea de coautoría que indique el sistema.

## Probar

```bash
python3 -m http.server 8000   # abrir http://localhost:8000
```

- Para revisar en un navegador real se usa **Playwright** (Chromium), instalado en la carpeta temporal de la sesión, fuera del proyecto. Las librerías del sistema ya están en el Codespace.
- **Limitaciones conocidas del Chromium de pruebas:** no reproduce **AAC**, que es el formato de las vistas previas de Apple; para probar la música se sustituye el audio por un WAV. Tampoco decodifica el video de TikTok: su reproductor carga, pero muestra *Player error* (`onPlayerError` 3001). En Chrome, Edge o Safari reales ambos funcionan.
- **TikTok en modo directo** (`MODO_DIRECTO` en `reels.js`), como con los primeros links: la URL exacta del oEmbed (`embed_from=oembed&autoplay=1&muted=1&loop=1&music_info=1&description=1&rel=0`), **un solo reproductor a la vez** (sin precarga), sin `credentialless` y con el centro del video libre (solo franjas laterales para deslizar), para que el clic llegue al reproductor de TikTok. No recarga ni salta videos con error; sin internet, espera y recarga al volver. En la versión con precarga, capa encima y recargas, la mayoría de los videos fallaban en laptops (sí andaban en celular).

## Pendiente

- Ilustraciones reales del Muted World (`muted-world/assets/img/IMAGE_SPEC.md`).
- Decidir si se borra `imagined-world/js/world-interactions.js` (obsoleto).
