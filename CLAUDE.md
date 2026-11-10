# Reglas del proyecto para asistentes de IA (Claude Code y otros)

Proyecto: **Escapismo Digital**, página web artística de una sola página (HTML5 + CSS3 + JavaScript modular, sin frameworks ni dependencias). Equipo de 4 integrantes (UTEC, Artes Digitales). Se publica en GitHub Pages.

## Reglas obligatorias

1. **Escribe en español**: comentarios, nombres de variables y funciones, textos y mensajes de commit.
2. **Toca solo los archivos del integrante que te está usando** (ver la tabla de abajo). Si una tarea exige cambiar un archivo de otra persona, detente y avisa: ese cambio va en un PR aparte y lo revisa su dueño.
3. En `index.html`, edita **solo dentro del bloque marcado** de la sección correspondiente (`<!-- ===== SECCIÓN · Integrante N ===== -->` … `<!-- ===== FIN ... ===== -->`).
4. **Nunca trabajes en `main`**. Usa una rama `feature/nombre-tarea`. No hagas commit, push ni merge sin autorización explícita.
5. **No instales dependencias** ni agregues librerías externas sin consultarlo.
6. **Rutas siempre relativas** (`css/base.css`, `assets/img/...`). Nunca empiezan con `/`. Nombres de archivo en minúsculas, sin tildes ni espacios.
7. **Prefijos de clases CSS**: `.ui-`, `.pro-`, `.ref-` (I1) · `.cot-` (I2) · `.vir-` (I3) · `.fx-` (I4).
8. No modifiques las variables de `css/base.css`, `js/utils.js` ni `js/main.js` salvo que la tarea lo pida expresamente.
9. Todo recurso externo (imagen, audio, fuente, imagen generada por IA) se registra en `docs/atribuciones.md`, en el apartado del integrante.
10. Respeta `prefers-reduced-motion` y mantén el diseño responsivo (probar a 375 px de ancho).

## Dueños de archivos

| Integrante | Archivos |
|---|---|
| I1 · Estructura | `index.html` (estructura, `<head>`, navegación, prólogo, reflexión), `css/base.css`, `css/estructura.css`, `js/main.js`, `js/navegacion.js`, `README.md` |
| I2 · Cotidiano | bloque `#cotidiano` en `index.html`, `css/cotidiano.css`, `js/cotidiano.js`, `assets/*/cotidiano/` |
| I3 · Virtual | bloque `#virtual` en `index.html`, `css/virtual.css`, `js/virtual.js`, `assets/*/virtual/` |
| I4 · Interactividad | bloque `#portal` en `index.html`, `css/efectos.css`, `js/efectos.js`, `js/estado.js`, `js/utils.js` |

## Cómo se comunican los módulos

- Los módulos **no se importan entre sí**: solo importan `js/utils.js`.
- Eventos (definidos en `EVENTOS` dentro de `utils.js`):
  - `escapismo:seccion` → `{ id, mundo }`: cambia la sección visible.
  - `escapismo:interaccion` → `{ origen }`: interacción en el mundo virtual (suma a la grieta).
  - `escapismo:grieta` → `{ nivel }`: nivel de degradación de 0 a 3.
  - `escapismo:reiniciar`: el visitante vuelve a empezar.
- Efectos por atributos (los implementa I4): `data-revelar`, `data-maquina`, `data-glitch`, `data-parallax="factor"`. Usa `style="--retraso:.2s"` para escalonar apariciones.
- `[data-revelar]` y `[data-parallax]` usan la propiedad CSS `translate`: no los combines en el mismo elemento.
- `.vir::after` está reservado para las líneas de escaneo de `efectos.css`.

## Probar en local

```bash
python3 -m http.server 8000   # luego abrir http://localhost:8000
```

Los módulos JS no funcionan si se abre `index.html` con doble clic: siempre usa el servidor local.
