/* =========================================================================
   UTILIDADES COMPARTIDAS · Integrante 4 (lo usan todos)
   Funciones pequeñas y los nombres oficiales de los eventos.
   Cambios aquí afectan a todo el equipo: SOLO mediante Pull Request.
   ========================================================================= */

/**
 * Eventos personalizados del proyecto. Los módulos se comunican con ellos
 * en lugar de importarse entre sí (así nadie depende del código de otro).
 *
 *  SECCION      → { id, mundo }  cambia la sección visible (navegacion.js)
 *  INTERACCION  → { origen }     el visitante interactúa en el mundo virtual
 *  GRIETA       → { nivel }      cambia el nivel de degradación 0-3 (estado.js)
 *  REINICIAR    → {}             el visitante vuelve a empezar
 */
export const EVENTOS = {
  SECCION: 'escapismo:seccion',
  INTERACCION: 'escapismo:interaccion',
  GRIETA: 'escapismo:grieta',
  REINICIAR: 'escapismo:reiniciar',
};

/** Emite un evento del proyecto en document. */
export function emitir(nombre, detalle = {}) {
  document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}

/** Escucha un evento del proyecto. La función recibe el "detail". */
export function escuchar(nombre, funcion) {
  document.addEventListener(nombre, (evento) => funcion(evento.detail));
}

/** Limita un número entre un mínimo y un máximo. */
export function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

/** Elemento aleatorio de una lista. */
export function azar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** true si el visitante pidió reducir el movimiento en su sistema. */
export function prefiereMovimientoReducido() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Convierte segundos en texto legible: "45 segundos", "2 min 10 s". */
export function formatearTiempo(segundos) {
  if (segundos < 60) {
    return `${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`;
  }
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
}
