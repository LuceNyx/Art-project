# Especificación de audio: Imagined World

Ahora mismo **todo el sonido se genera en código** (`js/audio.js`). Si guardas aquí un archivo con el **nombre exacto** de la tabla, se usa ese archivo en lugar del sonido generado, sin tocar el código.

| Archivo | Capa | Descripción |
|---|---|---|
| `ambient-pad.mp3` | Ambiente | Un acorde suave y abierto que respira despacio. Cálido, sin melodía marcada |
| `water.mp3` | Agua y viento | Agua tranquila o brisa lejana, sin olas fuertes |

Las campanitas de los descubrimientos se generan siempre en código, con una escala pentatónica y un eco suave.

**Reglas**
- MP3, de 30 a 90 s, en **bucle sin corte**.
- Volumen normalizado (alrededor de −16 LUFS). El código ya los reproduce bajos.
- Licencia libre (CC0 o CC BY, con su atribución en el README) o grabación propia.
- **Nunca autoplay:** el sonido arranca con *Step in* o con el botón *sound*.
- Los archivos reales solo se cargan con un servidor local o en GitHub Pages. Con doble clic se usa el sonido generado.
