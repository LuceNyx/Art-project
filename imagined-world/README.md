# Imagined World

Segunda parte de **Digital Escapism**. Es un mundo explorable y visualmente más vivo que *Muted World*, pensado como un espacio de alivio, libertad, control y descubrimiento. Los elementos de la realidad no desaparecen por completo: el motivo de cada situación reaparece transformado dentro de este mundo, y es lo único que sigue en gris.

## Cómo abrirlo

Desde la carpeta raíz del proyecto, inicia un servidor local:

```bash
python3 -m http.server 8000
```

Abre en el navegador:

```text
http://localhost:8000/imagined-world/
```

Para probar una situación concreta:

```text
http://localhost:8000/imagined-world/?from=academic-pressure&motif=stacked-paper
```

También funciona con doble clic en `index.html`. En ese caso el sonido se genera en código.

## Qué hace cada archivo

| Archivo | Función |
|---|---|
| `index.html` | Estructura del mundo: cielo, capas de paisaje, las tres zonas, la interfaz y la salida |
| `css/imagined.css` | Estilos visuales del mundo. Las clases usan el prefijo `iw-` |
| `js/imagined.js` | Punto de entrada: lee los parámetros de la URL, aplica la paleta y los textos, y coordina los módulos |
| `js/scene-data.js` | Configuración de las siete situaciones: textos, paleta, elementos y motivo |
| `js/world-interactions.js` | Recorrido horizontal con parallax, ambiente (partículas, hierba, estrellas) y los 7 tipos de descubrimiento |
| `js/residual-motif.js` | Carga el SVG original del motivo y lo coloca en las tres zonas |
| `js/audio.js` | Sonido ambiental opcional y campanitas, con control de silencio |
| `assets/img/IMAGE_SPEC.md` | Especificaciones para imágenes e ilustraciones |
| `assets/motifs/README.md` | Referencia a los motivos originales de `muted-world` (no se duplican) |
| `assets/audio/AUDIO_SPEC.md` | Especificaciones para el audio |

Todo el código vive dentro de `window.ImaginedWorld`: no hay otras variables globales.

## Interacción

- Recibe `from` y `motif` mediante los parámetros de la URL. Si faltan o no son válidos, se abre una versión neutra del mundo.
- **Arrival / The Threshold:** la pantalla blanca con la que se salió del *Muted World* se abre en color. Aparece una frase de llegada y el botón *Step in*.
- **The Open World:** el mundo se recorre en horizontal con la rueda del mouse, arrastrando con el dedo, con las flechas del teclado o con los botones de zona. Los elementos interactivos se descubren al activarlos. Cuando se descubren todos, la luz crece.
- **The Quiet Edge:** una orilla con agua donde se refleja el motivo. Aparecen tres líneas de reflexión y dos opciones: *Return to your room* o *Stay a little longer*.
- Todo se puede usar con mouse, teclado (Tab, Enter, flechas) o pantalla táctil.
- El sonido no se reproduce automáticamente: arranca con *Step in* (salvo que se haya silenciado antes) o con el botón *sound*. La experiencia funciona completa sin audio.
- Con `prefers-reduced-motion`, todo queda estático.

## Situaciones

| Situación | Motivo | Respuesta del mundo imaginado |
|---|---|---|
| Academic pressure | `stacked-paper` | Farolillos con tareas pequeñas que suben al cielo y quedan como estrellas. La pila sigue presente |
| Loneliness | `unanswered-bubble` | Luces que responden ("Hi.", "I'm here.") y te acompañan. La burbuja sigue sin respuesta |
| Emotional overload | `pinned-note` | Un estanque tranquilo y piedras que se ordenan una a una. La nota sigue clavada |
| Lack of control | `stopped-clock` | Palancas que colocan las tablas de un puente hacia una isla. El reloj sigue detenido |
| Social comparison | `blank-polaroid` | Flores que se abren, cada una distinta y sin puntuación. La foto sigue en blanco |
| Uncertain future | `lit-window` | Tres caminos hacia el horizonte, y todos se pueden encender. La ventana sigue a lo lejos |
| Family expectations | `facedown-frame` | Bloques para construir algo propio, sin instrucciones. El marco sigue boca abajo |

## Dirección visual

- El color contrasta con el blanco y negro del *Muted World*, pero sin saturar: azules y violetas en el cielo, turquesas y verdes en el paisaje, y luces cálidas (melocotón, rosa, amarillo).
- Movimiento ambiental sutil: partículas, nubes, estrellas, hierba y agua.
- Referencias conceptuales: el contraste emocional de **OMORI**, la escala y la luz de **Journey**, y las decisiones de **The Stanley Parable** (aquí, a diferencia del *Muted World*, elegir sí cambia el mundo). No se copia ningún recurso de esas obras.

## Integración

- Entrada: `imagined-world/index.html?from=<scene>&motif=<motif>`
- Los ids coinciden con `muted-world/INTEGRATION.md` y `muted-world/js/config.js`.
- Los SVG se cargan desde `../muted-world/assets/motifs/<motif>.svg`, sin duplicarlos.
- Regreso: `../muted-world/index.html?return=<scene>`
- Este módulo no modifica `muted-world/` ni `transition/`.

## Créditos

- Tipografía **Fraunces**, de Undercase Type, con licencia SIL Open Font License 1.1, servida por Google Fonts.
- Paisaje, elementos, luces y sonido hechos en código por el equipo. Los SVG de los motivos pertenecen al *Muted World*.
- Las referencias a OMORI, Journey y The Stanley Parable son solo conceptuales.
