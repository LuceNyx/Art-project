# Especificación de imágenes: Imagined World

Ahora mismo **todo el paisaje está dibujado en código**: cielo, sol, nubes, montañas (SVG), hierba, agua y los elementos interactivos. No hace falta ninguna imagen para que el mundo funcione.

Si más adelante quieren ilustraciones propias, estas son las piezas que se pueden reemplazar. Hacerlo requiere un pequeño cambio en `index.html` o en `css/imagined.css`.

| Pieza | Archivo sugerido | Medidas | Notas |
|---|---|---|---|
| Cielo | `sky.jpg` | 1920 × 1080 | Degradado de azul profundo arriba a melocotón en el horizonte (a un 76 % de la altura). Sin montañas |
| Montañas lejanas | `layer-far.png` | 3000 × 400, transparente | Lavanda suave. Se desplazan al 12 % de la velocidad |
| Colinas medias | `layer-mid.png` | 4000 × 400, transparente | Turquesa. 32 % de la velocidad |
| Colinas cercanas | `layer-near.png` | 6000 × 360, transparente | Verde. 62 % de la velocidad |

**Reglas**
- **Color como alivio, no como saturación:** tonos suaves y luminosos, nunca neón.
- **Sin personajes ni escenarios de otras obras** (OMORI, Journey, etc.): solo inspiración conceptual.
- El horizonte debe quedar entre el 60 % y el 70 % de la altura, porque los elementos interactivos se colocan sobre el suelo, del 55 % al 85 %.
- Si se generan con IA, registra la herramienta, la fecha y el prompt en el README.
