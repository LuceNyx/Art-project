# Escapismo Digital

Experiencia web interactiva que explora críticamente el **escapismo digital**: el contraste entre el mundo cotidiano y el mundo imaginado o virtual, y el costo de quedarse demasiado tiempo en él.

Proyecto final de **Artes Digitales**, Universidad de Ingeniería y Tecnología (UTEC).

## Ver la página en local

Los módulos de JavaScript necesitan un servidor local (no funciona con doble clic sobre `index.html`).

```bash
python3 -m http.server 8000
```

Luego abre **http://localhost:8000**. En VS Code también puedes usar la extensión *Live Server*.

## Estructura

```
index.html            Página única con 5 secciones (cada bloque marcado con su responsable)
css/
  base.css            Variables, reset y navegación                 (Integrante 1)
  estructura.css      Prólogo y reflexión                           (Integrante 1)
  cotidiano.css       Mundo cotidiano                               (Integrante 2)
  virtual.css         Mundo virtual y estados de la grieta          (Integrante 3)
  efectos.css         Apariciones, glitch, portal, movimiento reducido (Integrante 4)
js/
  main.js             Punto de entrada: inicia todos los módulos    (Integrante 1)
  navegacion.js       Sección activa, progreso, reinicio            (Integrante 1)
  cotidiano.js        Reloj, aula, notificaciones                   (Integrante 2)
  virtual.js          Partículas, fragmentos, intrusiones           (Integrante 3)
  efectos.js          data-revelar, data-glitch, parallax, portal   (Integrante 4)
  estado.js           Tiempo de escape y niveles de grieta          (Integrante 4)
  utils.js            Funciones y eventos compartidos               (Integrante 4)
assets/               Imágenes, audio y fuentes (por mundo)
docs/
  narrativa.md        Guion de la experiencia
  atribuciones.md     Recursos usados y sus licencias
CLAUDE.md             Reglas del proyecto para asistentes de IA
```

## Flujo de trabajo en equipo

1. Partir de `main` actualizado: `git switch main && git pull`
2. Crear una rama propia: `git switch -c feature/nombre-tarea`
3. Hacer commits pequeños en español: `feat(cotidiano): agrega escena del tren`
4. Antes del PR, traer los cambios del equipo: `git pull origin main`
5. Subir la rama y abrir un Pull Request hacia `main` (se usa la plantilla automática)
6. Otro integrante revisa y aprueba, y se fusiona con **Squash and merge**

Reglas clave: cada integrante edita **solo sus archivos** y, en `index.html`, **solo el bloque de su sección**. Ver `CLAUDE.md`.

## Publicación

GitHub Pages desde la rama `main`, carpeta raíz. El archivo `.nojekyll` hace que los archivos se sirvan tal cual. Todas las rutas son relativas.

## Créditos

Ver [docs/atribuciones.md](docs/atribuciones.md).
