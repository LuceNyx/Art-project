# Especificación de audio: Muted World

Ahora mismo **todo el sonido se genera en código** con la Web Audio API (`js/audio.js`). Si guardas aquí un archivo con el **nombre exacto** de la tabla, se usa ese archivo en lugar del sonido generado, sin tocar el código.

**Reglas**
- **MP3** (o cambia la extensión en `CAPAS`, dentro de `js/audio.js`), mono o estéreo, de 20 a 60 s.
- **Bucles sin corte:** el final debe empalmar con el principio. Se reproducen en bucle exacto con Web Audio.
- Volumen normalizado (alrededor de −16 LUFS). El código ya los reproduce muy bajos.
- Licencia libre (CC0 o CC BY, con su atribución en el README) o grabación propia.
- Los archivos reales **solo se cargan con un servidor local o en GitHub Pages**. Con doble clic se usa el sonido generado.

| Archivo | Capa | Descripción |
|---|---|---|
| `room-tone.mp3` | Respiración del cuarto | Tono de habitación grave y casi inaudible, con un vaivén muy lento |
| `rain.mp3` | Lluvia lejana | Lluvia al otro lado de una ventana cerrada, sin truenos |
| `lamp-hum.mp3` | Lámpara | Zumbido eléctrico suave de una lámpara o un fluorescente |
| `clock-tick.mp3` | Reloj | Tic-tac de un reloj de pared, 1 tic por segundo, bucle exacto (por ejemplo, 30 s) |
| `phone-vibration.mp3` | Celular | Vibración apagada contra un colchón: dos pulsos y luego silencio (por ejemplo, un ciclo de 9 s) |

**Mezcla por escena** (en `PERFILES`, dentro de `js/audio.js`):
- **Habitación:** respiración + lluvia + un poco de reloj y de vibración.
- **Academic pressure:** domina el zumbido de la lámpara. Además, cada hoja que cae suena con un roce de papel, que siempre se genera en código.
- **Al ocultar** (evasión): todo suena más bajo y más apagado, como detrás de una pared.
