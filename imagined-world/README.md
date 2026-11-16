# Imagined World

Segunda parte de **Digital Escapism**. No es un paisaje: es **lo que da el aparato** con el que se escapó. Cada objeto de escape del Muted World lleva a su propia experiencia, a pantalla completa. Lo que se siente ahí (adrenalina, compañía, emoción, dopamina, control) es la razón por la que escapamos. Y la realidad nunca desaparece del todo: el motivo de la situación sigue ahí, en gris, y un portal parpadea para volver.

## Cómo abrirlo

```bash
python3 -m http.server 8000      # desde la raíz del proyecto
```

```text
http://localhost:8000/imagined-world/?from=loneliness&motif=unanswered-bubble
```

Normalmente se llega desde `transition/`. Sin parámetros se abre el celular (reels).

## Un aparato, una experiencia

| Aparato (Muted World) | Situación | Experiencia | Archivo |
|---|---|---|---|
| 📱 Celular | Social comparison | **Reels** con los reproductores oficiales: el primero al azar y luego una lista barajada sin repetir hasta agotar todos los links (ningún video vuelve antes de 4 pasos). Deslizar arriba/abajo (capa de gestos), rueda, flechas, PageUp/PageDown y botones ▲ ▼. Autoplay y sonido por las APIs oficiales de YouTube y TikTok; el siguiente se precarga y el anterior se descarga. ♥ y contador de tiempo acelerado | `js/reels.js` |
| 🎮 Mando | Loneliness | **Juego en línea**: disparas a sombras junto a 3 amigos que pelean contigo y te escriben; combos, rondas, la música se acelera, no hay game over | `js/exp-online.js` |
| 🎧 Audífonos | Emotional overload | **Reproductor de música**: la pantalla llena de portadas de éxitos (pop, latino, hip-hop, K-pop, R&B, rock, electrónica, afrobeats, indie), filtros por género y abajo anterior · pausa · siguiente, progreso y volumen. Vistas previas oficiales de 30 s (Apple Music); al terminar una, empieza la siguiente. En pausa, todo se vuelve gris y vuelven las voces de la realidad | `js/exp-music.js` + `js/music-tracks.js` |
| 💻 Portátil | Academic pressure | **Series**: primero un catálogo de 8 plataformas (Netflix, Prime Video, HBO Max, Disney+, Apple TV+, Hulu, Paramount+, Crunchyroll; el nombre en texto con estilo propio, no los logos) y, en cada una, sus series más populares como tarjetas con afiches abstractos generados en código. Al elegir una: capítulos cinematográficos con subtítulos y música que crece; *Next episode in 5…* arranca solo. *← Browse* vuelve al catálogo | `js/exp-video.js` |
| 🖥️ Computadora | Lack of control | **Creador de personaje y mundo** en vóxeles (estética propia). Paso 1: a la izquierda la ficha del yo real (en gris); a la derecha el avatar con tamaño, musculatura, complexión, pelo, piel, ojos, ropa y poderes (vuelo, fuerza, fuego, rayo, invisible), y ajustes rápidos *Titan* / *Idol* / *Random* para llegar a los extremos. Paso 2: terreno, cielo, bloques y objetos (árboles, castillo, cascada, portal, una estatua del avatar), con el avatar dentro | `js/exp-choice.js` |
| 🥽 Lentes VR | Uncertain future | **Un planeta que no existe**, visto a través de un visor: dos soles, un planeta gigante con anillos, cordilleras en capas con niebla y cristales, montañas flotantes con cascadas, suelo luminoso que avanza, una ballena del cielo, un caminante gigante y medusas de luz. Mirar con el mouse, el dedo o las flechas. Lentes con viñeta y aberración cromática, HUD tenue. Canvas 2D sin librerías | `js/exp-vr.js` |
| 🕹️ Consola portátil | Family expectations | **Mini plataformero**: personaje pixel art original (gorra y overoles rojos), corre y salta entre plataformas y bloques ✦ con cámara lateral. Sin puntaje ni game over: si cae, reaparece en la última zona segura; la bandera reinicia el nivel. Teclado (flechas/A D + Espacio) y botones táctiles | `js/exp-sandbox.js` |

### El residuo (la realidad que sigue ahí)
| Experiencia | Dónde aparece el motivo, en gris |
|---|---|
| Reels | Cada 5 videos, una tarjeta vacía: *"Nothing here."* |
| Juego | La burbuja sin respuesta flota y las balas la atraviesan. En el chat llega un mensaje de fuera que nadie abre |
| Música | Una portada gris entre todas: la nota clavada. Y al pausar, la realidad vuelve |
| Series | Entre capítulos, en la pantalla oscura, se refleja la pila de hojas |
| Creador | El reloj detenido en las 7:00, junto al contador de cambios que sí avanza |
| VR | La ventana encendida en el horizonte, que nunca se acerca |
| Plataformero | Bloques grises con el marco boca abajo: un muro que hay que saltar y una plataforma; no se rompen ni se tapan |

Tocar el motivo muestra una frase (*"Still no reply."*, *"It still says seven."*…).

### Común a todas
- **Sin pantallas de inicio:** cada experiencia arranca sola al terminar la transición (la frase del goce se ve en la transición). Si el navegador bloquea el sonido, el botón dice *tap for sound* y el primer toque o tecla lo enciende.
- **Portal a la realidad** (arriba a la izquierda): una ventana en gris a la escena de la que vino el visitante, con su aparato de escape (carga `../muted-world/index.html?preview=<scene>` en miniatura, inerte y sin sonido). Da *chispazos*: destellos suaves, glitch leve en los bordes y la luz de la escena que titila; a los 20 y 50 s insiste más. Muestra los mensajes del cuarto. Al pasar el cursor o enfocarla, la ventana se agranda. Con `prefers-reduced-motion`, solo un brillo quieto. Al hacer clic se vuelve **directo al cuarto** con `?return=<scene>` (sin la pantalla de entrada).
- **Sonido** (abajo a la derecha): todo se genera en código con Web Audio. La preferencia de silencio se guarda.
- Teclado: el juego y la VR usan WASD o flechas; las decisiones, 1/2/3; construir, flechas + Espacio y 1-9; los reels, ↓; la música, el control de volumen.

## Archivos

| Archivo | Función |
|---|---|
| `index.html` | Escenario, reels, portal, sonido y scripts |
| `css/imagined.css` | Base, avisos, portal (ventana y chispazos) y reels |
| `css/experiences.css` | Diseño de cada experiencia (una sección por aparato) |
| `js/imagined.js` | Lee `?from=&motif=`, elige la experiencia del aparato y la monta. Portal con la ventana al cuarto |
| `js/scene-data.js` | Por situación: aparato (`medium`), goce, mensajes de la realidad y frase del residuo |
| `js/audio.js` | Motor de sonido compartido (notas, ruido, bombo, secuenciador) |
| `js/residual-motif.js` | Carga el SVG original del motivo desde `../muted-world/assets/motifs/` |
| `js/media-links.js` | **Tus links de reels** (lista `mediaLinks`) |
| `js/music-tracks.js` | **Las canciones de los audífonos**: título, artista, género, portada, vista previa y enlace (instrucciones para agregar más dentro del archivo) |
| `js/reels.js` · `js/exp-*.js` | Las siete experiencias |
| `js/world-interactions.js` | ⚠ Obsoleto (el paisaje anterior). Ya no se carga |

Todo vive dentro de `window.ImaginedWorld`. Cada experiencia se registra en `ImaginedWorld.experiences[medium]`.

## Cambiar los videos (reels)

Edita solo la lista `mediaLinks` de `js/media-links.js`:

| Plataforma | Formato que se reproduce dentro de la página |
|---|---|
| TikTok | `https://www.tiktok.com/@usuario/video/1234567890123456789` |
| Instagram | `https://www.instagram.com/reel/CODIGO/` (también `/reels/` o `/p/`) |
| Facebook | `https://www.facebook.com/reel/1234567890` (también `web.facebook.com`) |
| YouTube Shorts | `https://www.youtube.com/shorts/ID` (o `youtu.be/ID`) |

- Los **links cortos** (`vt.tiktok.com`, `vm.tiktok.com`, `fb.watch`) no se pueden incrustar. Copia la dirección completa. Si se dejan, se muestran como tarjeta *Open ↗*.
- Lo que no es un video (`LINK_7`, `tiktok.com/es/`…) se ignora solo.

## Integración

- Entrada: `imagined-world/index.html?from=<scene>&motif=<motif>`, con los ids de `muted-world/js/config.js`.
- Regreso: `../muted-world/index.html?return=<scene>` (el portal).
- Este módulo no modifica `muted-world/` ni `transition/`.

## Créditos

- Tipografía **Fraunces** (Undercase Type, SIL Open Font License 1.1), servida por Google Fonts.
- Escenas, juegos, música y sonidos son originales y están hechos en código. No se usa ningún personaje, canción, escenario ni recurso de otras obras.
- Los videos de los reels pertenecen a sus autores y se muestran con los reproductores oficiales de cada plataforma.
