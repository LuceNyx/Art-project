# Narrativa: Escapismo Digital

## Idea central

El mundo virtual seduce porque promete lo que lo cotidiano no da. Pero mientras más tiempo pasa el visitante allí, más hueco se vuelve: **la evasión tiene un costo y la página lo hace visible**.

## Recorrido (scroll vertical, una sola página)

| # | Sección | Responsable | Qué siente el visitante | Recursos |
|---|---|---|---|---|
| 0 | **Prólogo** `#prologo` | I1 | Silencio, una pregunta | Negro, máquina de escribir, título que emerge |
| 1 | **Cotidiano** `#cotidiano` | I2 | Rutina, peso, repetición | Grises, grano, tipografía mono. Escenas: alarma (posponer), tren, aula, celular |
| 2 | **Portal** `#portal` | I4 | Tentación: "solo un momento" | El celular crece con el scroll hasta tragarse la pantalla |
| 3 | **Virtual** `#virtual` | I3 | Asombro, libertad, color | Degradados, islas flotantes, partículas, fragmentos que se dividen al hacer clic |
| 3b | **Grieta** (dentro de `#virtual`) | I3 + I4 | Inquietud: algo no está bien | Niveles 0 a 3: glitch, desaturación, líneas de escaneo, mensajes reales que se filtran, las partículas caen |
| 4 | **Reflexión** `#reflexion` | I1 | Calma, conciencia | Tiempo real que pasó "escapando", preguntas finales, "Volver a la realidad" |

## El motivo del color

En el mundo cotidiano, **el único color es la luz de las pantallas**: un punto cian en el pupitre del visitante y, después, el celular que se enciende en magenta. El otro mundo se filtra poco a poco. En la grieta ocurre lo contrario: **el gris del mundo real invade lo virtual**.

## Niveles de la grieta (`js/estado.js`)

Puntaje = segundos en el mundo virtual + 4 × clics.

| Nivel | Puntaje | Efecto |
|---|---|---|
| 0 | 0 | Mundo virtual pleno |
| 1 | 15 o más | Glitch ocasional en el título, cambio de tono, aparecen algunas frases "de sombra" |
| 2 | 40 o más | Desaturación, líneas de escaneo, mensajes del mundo real cada ~4 s |
| 3 | 70 o más | Casi gris, glitch intenso, las partículas caen, aparece "¿Sigues ahí? / Despertar" |

## Pendiente para próximas versiones

- Ilustraciones definitivas por escena (libres o generadas con IA, registradas en `atribuciones.md`).
- Sonido ambiente por mundo (se activa solo después de un clic del visitante).
- Textos finales revisados por todo el equipo.
