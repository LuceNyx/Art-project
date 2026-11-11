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

## `scene-loneliness.jpg`: la cama en la oscuridad

Es **casi negra**. La sábana, el celular, la figura y el mando los dibuja el código, y además la cámara se aleja despacio. Pinta solo el vacío del cuarto alrededor de la cama: el suelo y la pared, perdiéndose en la oscuridad.

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| x 0–100, y 0–100 | Fondo: oscuridad casi total, quizá el borde de un mueble muy lejos |
| Centro (x 36–64, y 15–85) | La sábana y el celular. No pintes nada claro aquí |
| x 74–87, y 78–91 | El mando en el suelo, con su luz |

**Luz:** solo la del celular, en el centro (la pone el código). Todo lo demás, negro.

---

## `scene-emotional-overload.jpg`: la pared del corcho

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| x 12–76, y 6–92 | **El corcho, las notas y la sábana** (código). Deja la pared lisa |
| x 79–88, y 12–48 | Audífonos colgados de una chincheta (código) |
| x 76–100 | Sombra vertical fuerte sobre la pared |

**Luz:** tenue y centrada en el corcho (x 44, y 46).

---

## `scene-lack-of-control.jpg`: la puerta y el reloj

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| x 38–64, y 8–92 | **La puerta** (código). Puedes pintar su marco y su sombra |
| x 70–83, y 10–33 | **El reloj** (código). Debe haber luz en la pared a su alrededor |
| y 92–100 | Suelo. La rendija de luz bajo la puerta la pone el código (x 38–64, y ≈ 95) |
| x 10–30, y 60–80 | El borde de la cama, donde aparece "Stay" |

**Luz:** una mancha clara en la pared, arriba a la derecha (x 76, y 20), y la rendija bajo la puerta.

---

## `scene-social-comparison.jpg`: el rincón del espejo

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| x 38–62, y 6–92 | **El espejo** (código). Deja la pared lisa detrás |
| x 16–90, y 0–100 | Fotos pegadas alrededor del espejo (código) |
| y 90–100 | Suelo |

**Luz:** frontal y suave, centrada en el espejo (x 50, y 40).

---

## `scene-uncertain-future.jpg`: la pared alrededor de la ventana

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| x 16–80, y 6–90 | **La ventana entera** (código): ciudad, lluvia y persiana |
| x 81–85, y 7–67 | El cordón de la persiana (código) |
| El resto | Pared interior muy oscura. Puede tener la sombra del marco |

**Luz:** solo la que entra por la ventana (la pone el código).

---

## `scene-family-expectations.jpg`: la pared del estante

| Zona (x, y en %) | Qué hay (código) |
|---|---|
| y 72–76 | **El estante** (código). Bajo él, una sombra larga |
| x 35–65, y 32–72 | El marco con la foto familiar (código) |
| x 18–27 y x 72–81, y 44–72 | Trofeos (código) |
| x 76–88, y 57–69 | La consola que asoma tras un trofeo (código) |

**Luz:** cálida en intención, pero gris: centrada en la foto (x 50, y 40). La pared puede tener un papel tapiz muy tenue (sin patrón geométrico visible).
