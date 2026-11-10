/* =========================================================================
   EFECTOS · Integrante 4
   Comportamientos reutilizables activados por atributos data-*.
   Los demás integrantes solo marcan su HTML; la lógica vive aquí.
   ========================================================================= */

import { limitar, prefiereMovimientoReducido } from './utils.js';

export function iniciarEfectos() {
  iniciarRevelar();
  iniciarMaquinaDeEscribir();
  iniciarGlitch();
  iniciarParallax();
  iniciarPortal();
}

/* ---------- [data-revelar]: aparece al entrar en pantalla ---------- */
function iniciarRevelar() {
  const elementos = document.querySelectorAll('[data-revelar]');

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('es-visible');
        observador.unobserve(entrada.target); // se revela una sola vez
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  elementos.forEach((el) => observador.observe(el));
}

/* ---------- [data-maquina]: texto escrito letra por letra ---------- */
const PAUSA_LETRA = 55;       // milisegundos entre letras
const ESPERA_INICIAL = 700;

function iniciarMaquinaDeEscribir() {
  document.querySelectorAll('[data-maquina]').forEach((el) => {
    const texto = el.textContent.trim();
    if (prefiereMovimientoReducido()) return; // se deja el texto completo

    // Copia accesible para lectores de pantalla + versión visual animada
    el.innerHTML = `<span class="ui-solo-lectores">${texto}</span>`;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    const cursor = document.createElement('span');
    cursor.className = 'fx-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.append(visual, cursor);

    let i = 0;
    setTimeout(function escribir() {
      visual.textContent = texto.slice(0, ++i);
      if (i < texto.length) setTimeout(escribir, PAUSA_LETRA);
    }, ESPERA_INICIAL);
  });
}

/* ---------- [data-glitch]: prepara el texto para los pseudo-elementos ---------- */
function iniciarGlitch() {
  document.querySelectorAll('[data-glitch]').forEach((el) => {
    el.dataset.texto = el.innerText.trim() || el.textContent.trim();
  });
}

/* ---------- [data-parallax="factor"]: se mueve con el mouse ---------- */
const DESPLAZAMIENTO_MAXIMO = 40; // píxeles con factor 1
const SUAVIDAD = 0.06;            // 0 = no se mueve, 1 = instantáneo

function iniciarParallax() {
  const elementos = [...document.querySelectorAll('[data-parallax]')];
  const tieneMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!elementos.length || !tieneMouse || prefiereMovimientoReducido()) return;

  let objetivoX = 0, objetivoY = 0, x = 0, y = 0;
  let animando = false;

  function paso() {
    x += (objetivoX - x) * SUAVIDAD;
    y += (objetivoY - y) * SUAVIDAD;

    for (const el of elementos) {
      const factor = parseFloat(el.dataset.parallax) || 0;
      const dx = (x * factor * DESPLAZAMIENTO_MAXIMO).toFixed(1);
      const dy = (y * factor * DESPLAZAMIENTO_MAXIMO).toFixed(1);
      el.style.translate = `${dx}px ${dy}px`;
    }

    const quieto = Math.abs(objetivoX - x) < 0.001 && Math.abs(objetivoY - y) < 0.001;
    if (quieto) animando = false;
    else requestAnimationFrame(paso);
  }

  window.addEventListener('pointermove', (evento) => {
    objetivoX = (evento.clientX / window.innerWidth) * 2 - 1;  // -1 a 1
    objetivoY = (evento.clientY / window.innerHeight) * 2 - 1;
    if (!animando) {
      animando = true;
      requestAnimationFrame(paso);
    }
  }, { passive: true });
}

/* ---------- PORTAL: el celular crece con el scroll ---------- */
const ESCALA_MAXIMA = 22;

/** Devuelve 1 dentro del intervalo [inicio, fin] y 0 fuera, con bordes suaves. */
function ventana(p, inicio, fin) {
  const centro = (inicio + fin) / 2;
  const mitad = (fin - inicio) / 2;
  return limitar((1 - Math.abs(p - centro) / mitad) * 2.5, 0, 1);
}

function iniciarPortal() {
  const portal = document.getElementById('portal');
  if (!portal) return;

  const reducido = prefiereMovimientoReducido();
  let pendiente = false;

  function actualizar() {
    pendiente = false;
    const caja = portal.getBoundingClientRect();
    if (caja.bottom < 0 || caja.top > window.innerHeight) return; // fuera de pantalla

    const recorrido = portal.offsetHeight - window.innerHeight;
    const p = limitar(-caja.top / recorrido, 0, 1); // progreso 0 → 1

    // Con movimiento reducido no hay zoom: solo un fundido
    const escala = reducido ? 1 : 1 + Math.pow(p, 2.2) * ESCALA_MAXIMA;

    portal.style.setProperty('--escala', escala.toFixed(3));
    portal.style.setProperty('--oscuro', limitar(p * 2.2, 0, 1).toFixed(3));
    portal.style.setProperty('--f1', ventana(p, 0.1, 0.42).toFixed(3));
    portal.style.setProperty('--f2', ventana(p, 0.42, 0.74).toFixed(3));
    portal.style.setProperty('--luz', limitar((p - 0.8) / 0.18, 0, 1).toFixed(3));
  }

  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }, { passive: true });
  window.addEventListener('resize', actualizar);

  actualizar();
}
