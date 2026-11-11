# Especificación de imágenes: Muted World

Mientras una imagen no exista, el código dibuja un **placeholder** gris con su nombre y sus medidas (`js/images.js`). Para poner la ilustración real, guárdala aquí con el **nombre exacto** de la tabla. No hace falta tocar el código.

## Reglas para todas las imágenes

- **Formato:** JPG, **1920 × 1080 px** (16:9, horizontal), menos de 600 KB. Puedes exportar a 2560 × 1440 si quieres más nitidez, siempre que mantengas el 16:9.
- **Solo blanco y negro / escala de grises.** Cero color. Negros profundos y blancos intensos.
- **Sin grano, sin viñeteado y sin los objetos interactivos:** el código los añade encima. Pinta el espacio, los muebles y las sombras.
- **Muy oscuras en general.** Las zonas de luz que se indican abajo deben ser algo más claras: el código también añade luz en esos mismos puntos.
- Ilustración artística, cinematográfica y ligeramente imperfecta. Nada de terror explícito.
- **Coordenadas:** en % del ancho (x) y del alto (y), medidas desde la esquina superior izquierda. Para pasarlas a píxeles: x × 19,2 y y × 10,8.

---

## `room.jpg`: la habitación (de noche)

El cuarto de una persona joven, de noche, visto casi de frente. Es un espacio comprimido, con un techo inclinado que pesa sobre la mitad izquierda.

| Elemento (lo pintas tú) | Zona (x, y en %) | Notas |
|---|---|---|
| Techo inclinado | De (0, 42) a (40, 14) y luego hasta (100, 8) | Masa oscura que aplasta el espacio |
| Pared del fondo | Desde la línea del techo hasta y = 80 | Gris muy oscuro |
| Suelo | y de 80 a 100 | Más oscuro aún |
| Ventana pequeña y alta | x 57–73, y 16–43 | Vidrio gris (luz de luna). **Las persianas las dibuja el código**: deja el vidrio limpio |
| Puerta | x 83–97, y 21–80 | **La rendija de luz bajo la puerta la pone el código** (en x ≈ 90, y ≈ 80) |
| Estante | Tabla en y ≈ 37, x 19–33 | El código pone encima la foto y los trofeos (y 29–37) |
| Escritorio | Tablero en y ≈ 60–64, x 12–38, patas hasta y 82 | El código pone encima la lámpara, el cuaderno y la pila (y 41–61) |
| Cama | x 44–82, y 64–86 | El código pone el celular en x 58–65, y 66–73 |
| Zona libre en la pared | x 37–53, y 20–40 | Ahí va el **corcho** (lo dibuja el código) |
| Pared sobre la puerta | x 85–92, y 10–20 | Ahí va el **reloj** (lo dibuja el código) |
| Rincón izquierdo, suelo | x 2–11, y 44–78 | Ahí va el **espejo** apoyado en la pared (lo dibuja el código) |

**Zonas de luz** (el resto, casi negro): la lámpara del escritorio (x 21, y 50), la ventana (x 65, y 29) y la rendija bajo la puerta (x 90, y 80). Las sombras largas de los muebles deberían alejarse de esas tres fuentes.

---

## `scene-academic-pressure.jpg`: primer plano del escritorio

El escritorio visto de cerca, un poco desde arriba. Es una perspectiva incómoda: el tablero ocupa la mitad inferior y la pared se siente cerca.

| Elemento | Zona (x, y en %) | Notas |
|---|---|---|
| Pared | y de 0 a 52 | Con una sombra alta e inclinada que cae sobre el escritorio desde la izquierda |
| Tablero del escritorio | y de 50 a 100 | Madera gastada, en perspectiva |
| Zona de la pila de hojas | x 11–32, de y 13 hacia arriba | **La pila la dibuja el código.** Deja esa zona despejada |
| Zona del cuaderno | x 34–68, y 50–86 | **El cuaderno lo dibuja el código** |
| Zona del portátil | x 71–93, y 52–78 | **El portátil y su luz los pone el código** |
| Lámpara | Arriba a la izquierda (x 4–30, y 0–48) | **La dibuja el código.** Puedes pintar solo la sombra del brazo |

**Luz:** un cono que sale de arriba a la izquierda y cae sobre el cuaderno (centro aproximado: x 44, y 70). Todo lo demás, en penumbra.

---

## Próximas situaciones (pendientes)

`scene-loneliness.jpg`, `scene-emotional-overload.jpg`, `scene-lack-of-control.jpg`, `scene-social-comparison.jpg`, `scene-uncertain-future.jpg`, `scene-family-expectations.jpg`. Las especificaciones se añadirán cuando se construya cada situación. Usa las mismas reglas: 1920 × 1080, escala de grises.
