# Muted World

Primera parte de **Digital Escapism**: una habitación oscura y explorable, de noche. Cada objeto abre una situación cotidiana que despierta el deseo de escapar. Dentro de cada situación, un **objeto de escape** entrega al visitante a la transición.

## Cómo abrirlo

```bash
# desde la raíz del proyecto
python3 -m http.server 8000
# abrir http://localhost:8000/muted-world/
```

También funciona con **doble clic** en `muted-world/index.html`. En ese caso el audio se genera en código, aunque haya archivos en `assets/audio/`.

## Qué hace cada archivo

| Archivo | Función |
|---|---|
| `index.html` | Estructura: habitación, primer plano, capas de atmósfera, entrada y sonido |
| `css/muted.css` | Todo el estilo (prefijo `mw-`): escenario 16:9, oscuridad, grano, escenas |
| `js/config.js` | **Contrato:** `TRANSITION_URL`, `MUTED_SCENES` (situaciones, objetos, motivos, textos) y luces de la habitación |
| `js/images.js` | Carga `assets/img/*.jpg` o, si faltan, dibuja el placeholder |
| `js/grain.js` | Textura de grano fino. Intensidad: `--mw-grain-intensity` en `muted.css` |
| `js/audio.js` | Ambiente con Web Audio (o archivos reales) y botón de silencio |
| `js/scenes.js` | Primeros planos: entrada, texto, ocultar = evasión, escape. Un *builder* por situación |
| `js/room.js` | Habitación: objetos SVG, foco de luz, polvo, huellas, regreso con `?return=`, inicio |
| `assets/img/IMAGE_SPEC.md` | Qué imágenes pintar, con nombres, medidas y zonas |
| `assets/audio/AUDIO_SPEC.md` | Qué audios se pueden añadir |
| `assets/motifs/*.svg` | Motivos de residuo, para el mundo imaginado |
| `INTEGRATION.md` | Guía para conectar la transición y el imagined world |

Todo el código vive dentro de `window.MutedWorld`: no hay otras variables globales.

## Interacción

- **Entrada:** *"Click to enter your room"*. El audio solo empieza aquí.
- **Habitación:** un foco sigue al cursor. Los objetos interactivos reciben un poco de luz. Se navega con **Tab** y se abre con **Enter**. En pantallas estrechas, se desliza en horizontal.
- **Situación:** **Escape** o *"Back to the room"* para volver. Cada una tiene una acción de ocultar (evasión) y un objeto de escape.
- **Huellas:** lo visitado queda más oscuro y la habitación se vuelve más densa. Se guarda en `sessionStorage`, así que cada visita empieza limpia.
- **Silencio:** botón *sound on/off*, que se recuerda en `localStorage`.

## Situaciones

| Situación | Estado |
|---|---|
| Academic pressure | ✅ completa |
| Loneliness, Emotional overload, Lack of control | pendientes (obligatorias) |
| Social comparison, Uncertain future, Family expectations | pendientes (propuestas) |

## Créditos

- Tipografía **EB Garamond**, de Georg Duffner y Octavio Pardo, con licencia SIL Open Font License 1.1, servida por Google Fonts.
- Todo lo demás (objetos, luces, grano, sonido) está hecho en código por el equipo.
