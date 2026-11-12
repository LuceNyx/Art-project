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
| Lack of control | Luz bajo la puerta | `choice`: juego de decisiones | La rendija se abre en una puerta y un mapa de rutas que se encienden |
| Social comparison | Foto en blanco | `feed`: reels | La foto se vuelve un teléfono con un feed que se acelera y corazones |
| Uncertain future | Ventana encendida | `vr`: realidad virtual | La ventana se abre en las dos lentes de un visor: *Loading world… Welcome.* |
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
