/* =========================================================================
   NAVEGACIÓN · Integrante 1
   - Detecta la sección visible y marca el punto activo del menú.
   - Cambia body[data-mundo] para que la interfaz adapte sus colores.
   - Actualiza la barra de progreso.
   - Botón "Volver a la realidad" (reinicio).
   ========================================================================= */

import { EVENTOS, emitir } from './utils.js';

export function iniciarNavegacion() {
  observarSecciones();
  iniciarBarraProgreso();
  iniciarReinicio();
}

/** Marca como activa la sección que cruza el centro de la pantalla. */
function observarSecciones() {
  const secciones = document.querySelectorAll('main > .seccion');
  const enlaces = document.querySelectorAll('.ui-nav a');

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;

      const seccion = entrada.target;
      const mundo = seccion.dataset.mundo;
      document.body.dataset.mundo = mundo;

      enlaces.forEach((enlace) => {
        const activo = enlace.getAttribute('href') === `#${seccion.id}`;
        enlace.setAttribute('aria-current', activo ? 'true' : 'false');
      });

      emitir(EVENTOS.SECCION, { id: seccion.id, mundo });
    }
  }, {
    // Una "línea" horizontal en el centro de la pantalla
    rootMargin: '-50% 0px -50% 0px',
  });

  secciones.forEach((seccion) => observador.observe(seccion));
}

/** Barra superior: cuánto se ha recorrido de la página (0 a 1). */
function iniciarBarraProgreso() {
  const raiz = document.documentElement;
  let pendiente = false;

  function actualizar() {
    const recorrido = raiz.scrollHeight - window.innerHeight;
    const progreso = recorrido > 0 ? window.scrollY / recorrido : 0;
    raiz.style.setProperty('--progreso-pagina', progreso.toFixed(4));
    pendiente = false;
  }

  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }, { passive: true });

  actualizar();
}

/** "Volver a la realidad": avisa a todos los módulos y regresa al inicio. */
function iniciarReinicio() {
  document.querySelectorAll('[data-reiniciar]').forEach((boton) => {
    boton.addEventListener('click', () => {
      emitir(EVENTOS.REINICIAR);
      window.scrollTo({ top: 0 });
    });
  });
}
