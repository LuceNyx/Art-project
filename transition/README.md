# Transición dinámica

El puente entre el **Muted World** y el **Imagined World**. Cada situación del cuarto tiene un objeto de escape, y cada objeto lleva a una **forma de escapismo** distinta. La transición la muestra: empieza en gris (todavía es la realidad), el color la invade y la cámara se zambulle dentro hasta que todo es luz.

## Flujo

```
muted-world/  ── clic en el objeto de escape ──►  transition/index.html?from=<scene>&motif=<motif>
                                                     (≈ 7 s, o "Skip")
                                                  ──►  imagined-world/index.html?from=<scene>&motif=<motif>
```

Llega en blanco, igual que se sale del Muted World, y se va en blanco, igual que empieza el Imagined World. Por eso los tres pasos se ven como uno solo.

## Formas de escapismo

| Situación | Objeto de escape | Forma de escapismo | Qué se ve |
|---|---|---|---|
| Academic pressure | Portátil | `video`: series y videos | La tapa se abre, miniaturas que pasan solas, *Next episode in 5…* |
| Loneliness | Mando | `online`: juego en línea | *Connecting…*, cinco amigos se conectan y saludan (*hey!*, *you're here*) |
| Emotional overload | Audífonos | `music`: música | Las notas grises del corcho salen volando, ondas de sonido y ecualizador |
| Lack of control | Computadora en espera | `choice`: juego de decisiones | El monitor se enciende (una línea que se abre) y aparece un mapa de rutas que se encienden: *Press start.* |
| Social comparison | Celular | `feed`: reels | Se levanta el celular, la pantalla se enciende y el feed se acelera con corazones. Luego, en el Imagined World, se abre un **reproductor de reels con tus links** |
| Uncertain future | Lentes VR | `vr`: realidad virtual | Los lentes se acercan hasta ponértelos y se ve a través de sus dos lentes: *Loading world… Welcome.* |

**La puerta ya no es un escape.** En el Muted World, la puerta lleva al mundo real: una jornada que pasa muy rápido y vuelve al cuarto (`muted-world/js/routine.js`). No pasa por esta transición.
| Family expectations | Consola portátil | `sandbox`: juego de construir | Un mundo de bloques se arma de abajo arriba: *New world* |

Sin parámetros (o con parámetros no válidos) se muestra una luz genérica y se pasa al Imagined World sin situación.

## Archivos

| Archivo | Función |
|---|---|
| `index.html` | Estructura: escenario, frases, blancos de entrada y salida, botón *Skip* |
| `css/transition.css` | Toda la animación (CSS), con un bloque por forma de escapismo. Prefijo `tr-` |
| `js/transition.js` | Lee la URL, elige la forma, arma su escena, cronometra y navega. Objeto global `window.Transition` |

## Accesibilidad

- **Skip:** botón visible, o las teclas Enter, Espacio o Escape.
- **Movimiento reducido:** se muestra un solo cuadro quieto, ya en color, durante 2,6 s.
- Sin sonido: el navegador no permite audio sin una interacción en esta página, y la transición no lo necesita.

## Cambiar algo

- **Duración:** `DURACION` (ms hasta el blanco) y `SALIDA` en `js/transition.js`. Si la cambias, ajusta los `animation-delay` de `transition.css`.
- **Frases:** `MEDIOS[...].lines` en `js/transition.js`.
- **Colores:** `--tr-h` (tono) por forma de escapismo, al inicio de `transition.css`.
