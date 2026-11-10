/* =========================================================================
   ESTADO DEL ESCAPE · Integrante 4
   Mide cuánto tiempo pasa el visitante en el mundo virtual y cuántas
   veces interactúa. Con eso calcula el nivel de "grieta" (0 a 3):
   mientras más se queda, más se degrada el mundo imaginado.
   ========================================================================= */

import { EVENTOS, emitir, escuchar, formatearTiempo } from './utils.js';

// Puntaje = segundos en el mundo virtual + (clics × PESO_CLIC)
const PESO_CLIC = 4;
// Puntaje mínimo para cada nivel: [nivel 0, nivel 1, nivel 2, nivel 3]
const UMBRALES = [0, 15, 40, 70];

let segundos = 0;
let clics = 0;
let nivel = 0;
let enVirtual = false;

export function iniciarEstado() {
  const virtual = document.getElementById('virtual');
  if (!virtual) return;

  // ¿El mundo virtual ocupa la parte central de la pantalla?
  new IntersectionObserver(([entrada]) => {
    enVirtual = entrada.isIntersecting;
  }, { rootMargin: '-35% 0px -35% 0px' }).observe(virtual);

  // Cuenta un segundo solo si está mirando el mundo virtual y la pestaña está activa
  setInterval(() => {
    if (enVirtual && !document.hidden) {
      segundos++;
      actualizar(virtual);
    }
  }, 1000);

  escuchar(EVENTOS.INTERACCION, () => {
    clics++;
    actualizar(virtual);
  });

  escuchar(EVENTOS.REINICIAR, () => {
    segundos = 0;
    clics = 0;
    actualizar(virtual);
  });

  actualizar(virtual);
}

function calcularNivel() {
  const puntaje = segundos + clics * PESO_CLIC;
  let resultado = 0;
  UMBRALES.forEach((minimo, i) => {
    if (puntaje >= minimo) resultado = i;
  });
  return resultado;
}

function actualizar(virtual) {
  const nuevoNivel = calcularNivel();
  if (nuevoNivel !== nivel) {
    nivel = nuevoNivel;
    virtual.dataset.grieta = String(nivel);
    emitir(EVENTOS.GRIETA, { nivel });
  }

  // Datos que muestra la sección de reflexión
  document.querySelectorAll('[data-tiempo-escape]').forEach((el) => {
    el.textContent = formatearTiempo(segundos);
  });
  document.querySelectorAll('[data-clics-escape]').forEach((el) => {
    el.textContent = clics;
  });
}

/** Lectura del estado actual (por si otro módulo lo necesita). */
export function obtenerEstado() {
  return { segundos, clics, nivel };
}
