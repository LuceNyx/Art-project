/* =========================================================================
   MUNDO VIRTUAL · Integrante 3
   - Partículas de luz en un <canvas>.
   - Fragmentos: cada clic divide el espacio en dos (narrativa fragmentada).
   - Reacciona a la "grieta" (estado.js): las partículas caen, aparecen
     mensajes del mundo real y, al final, la opción de despertar.
   ========================================================================= */

import { EVENTOS, emitir, escuchar, azar, prefiereMovimientoReducido } from './utils.js';

export function iniciarVirtual() {
  const seccion = document.getElementById('virtual');
  if (!seccion) return;

  const particulas = iniciarParticulas(seccion);
  iniciarFragmentos(seccion);
  const intrusiones = iniciarIntrusiones(seccion);
  const despertar = seccion.querySelector('.vir-despertar');

  escuchar(EVENTOS.GRIETA, ({ nivel }) => {
    particulas.cambiarNivel(nivel);
    intrusiones.cambiarNivel(nivel);
    if (despertar) despertar.hidden = nivel < 3;
  });
}

/* =========================================================================
   PARTÍCULAS
   ========================================================================= */
const COLORES_PARTICULA = ['255,255,255', '62,240,224', '255,79,184', '255,213,107'];

// Velocidad según el nivel de grieta: al final, la luz "cae"
const VELOCIDAD_POR_NIVEL = [1, 1.5, 0.4, -0.9];

function iniciarParticulas(seccion) {
  const canvas = seccion.querySelector('.vir-particulas');
  const ctx = canvas?.getContext('2d');
  const sinAnimacion = prefiereMovimientoReducido();

  let ancho = 0;
  let alto = 0;
  let lista = [];
  let velocidad = VELOCIDAD_POR_NIVEL[0];
  let visible = false;
  let animando = false;

  if (!ctx) return { cambiarNivel() {} };

  function redimensionar() {
    const densidad = Math.min(window.devicePixelRatio || 1, 1.5);
    ancho = canvas.clientWidth;
    alto = canvas.clientHeight;
    canvas.width = Math.round(ancho * densidad);
    canvas.height = Math.round(alto * densidad);
    ctx.setTransform(densidad, 0, 0, densidad, 0, 0);

    const cantidad = Math.round(Math.min(140, (ancho * alto) / 11000));
    lista = Array.from({ length: cantidad }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      radio: Math.random() * 1.8 + 0.4,
      rapidez: Math.random() * 0.4 + 0.1,
      fase: Math.random() * Math.PI * 2,
      color: azar(COLORES_PARTICULA),
    }));
    dibujar(performance.now());
  }

  function dibujar(tiempo) {
    ctx.clearRect(0, 0, ancho, alto);

    for (const p of lista) {
      if (!sinAnimacion) {
        p.y -= p.rapidez * velocidad;
        if (p.y < -5) { p.y = alto + 5; p.x = Math.random() * ancho; }
        if (p.y > alto + 5) { p.y = -5; p.x = Math.random() * ancho; }
      }
      const brillo = 0.3 + 0.7 * Math.abs(Math.sin(tiempo * 0.001 + p.fase));
      ctx.fillStyle = `rgba(${p.color}, ${brillo.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function bucle(tiempo) {
    if (!visible) { animando = false; return; }
    dibujar(tiempo);
    requestAnimationFrame(bucle);
  }

  // Solo se anima cuando la sección está en pantalla (ahorra batería)
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible && !animando && !sinAnimacion) {
      animando = true;
      requestAnimationFrame(bucle);
    }
  }).observe(seccion);

  let pendiente = false;
  window.addEventListener('resize', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; redimensionar(); });
  });

  redimensionar();

  return {
    cambiarNivel(nivel) { velocidad = VELOCIDAD_POR_NIVEL[nivel] ?? 1; },
  };
}

/* =========================================================================
   FRAGMENTOS
   ========================================================================= */
const PROFUNDIDAD_MAXIMA = 4; // hasta 16 fragmentos

const FRASES_LUZ = [
  'quédate', 'un nivel más', 'aquí eres alguien', 'no mires atrás',
  'todo está bien', 'brilla', 'solo uno más', 'aquí no duele',
  'sigue', 'olvida', 'eres libre', 'otra vez',
];

const FRASES_SOMBRA = [
  '¿qué hora es?', 'se hace tarde', '¿quién te espera?', '¿dónde estás?',
  'no hay nadie', 'vuelve', '¿y mañana?', 'esto no es real',
];

const FONDOS = [
  'linear-gradient(135deg, #ff4fb8, #5b1fa8)',
  'linear-gradient(160deg, #3ef0e0, #2b0d63)',
  'linear-gradient(200deg, #ffd56b, #ff4fb8)',
  'radial-gradient(circle at 30% 30%, #ff9ad5, #4a1690)',
  'linear-gradient(120deg, #5b1fa8, #3ef0e0)',
  'linear-gradient(45deg, #1a0638, #ff4fb8)',
  'radial-gradient(circle at 70% 60%, #ffd56b, #8a3fd1 70%)',
];

function iniciarFragmentos(seccion) {
  const contenedor = seccion.querySelector('.vir-fragmentos');
  if (!contenedor) return;

  let nivelGrieta = 0;
  escuchar(EVENTOS.GRIETA, ({ nivel }) => { nivelGrieta = nivel; });

  function frase() {
    // Con la grieta, se cuelan frases del mundo real
    const usarSombra = nivelGrieta >= 2 || (nivelGrieta === 1 && Math.random() < 0.3);
    return azar(usarSombra ? FRASES_SOMBRA : FRASES_LUZ);
  }

  function crearFragmento(profundidad) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'vir-fragmento vir-fragmento--nace';
    boton.dataset.profundidad = profundidad;
    boton.style.setProperty('--profundidad', profundidad);
    boton.style.setProperty('--fondo-frag', azar(FONDOS));
    boton.textContent = frase();
    return boton;
  }

  // Un solo "escuchador" para todos los fragmentos (delegación de eventos)
  contenedor.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.vir-fragmento');
    if (!boton) return;

    emitir(EVENTOS.INTERACCION, { origen: 'fragmento' });
    const profundidad = Number(boton.dataset.profundidad);

    if (profundidad >= PROFUNDIDAD_MAXIMA) {
      // Ya no se divide más: solo cambia de frase y color
      boton.textContent = frase();
      boton.style.setProperty('--fondo-frag', azar(FONDOS));
      boton.classList.remove('vir-fragmento--nace');
      void boton.offsetWidth;
      boton.classList.add('vir-fragmento--nace');
      return;
    }

    // Se divide en dos: alterna horizontal / vertical
    const division = document.createElement('div');
    division.className = 'vir-division' + (profundidad % 2 ? ' vir-division--columna' : '');
    const primero = crearFragmento(profundidad + 1);
    division.append(primero, crearFragmento(profundidad + 1));
    boton.replaceWith(division);
    primero.focus({ preventScroll: true }); // mantiene el foco para teclado
  });

  escuchar(EVENTOS.REINICIAR, () => {
    contenedor.replaceChildren(crearFragmento(0));
    contenedor.firstElementChild.textContent = 'entra';
  });
}

/* =========================================================================
   INTRUSIONES DEL MUNDO REAL
   ========================================================================= */
const MENSAJES_REALES = [
  ['Mamá', '¿Vas a cenar?'],
  ['Batería', '4 % restante'],
  ['Recordatorio', 'Entrega del proyecto: mañana 08:00'],
  ['Reloj', 'Son las 03:12'],
  ['Llamada perdida', 'Papá (3)'],
  ['Mensaje', '¿Estás bien? No respondes.'],
  ['Alarma', 'Mañana 06:00'],
  ['Grupo del curso', '¿Alguien sabe algo de ti?'],
];

const PAUSA_POR_NIVEL = { 2: 4200, 3: 2000 }; // milisegundos
const MAXIMO_INTRUSIONES = 4;

function iniciarIntrusiones(seccion) {
  const lista = seccion.querySelector('.vir-intrusiones');
  let intervalo = null;
  let indice = 0;

  function agregar() {
    // Solo si el visitante está mirando el mundo virtual
    if (document.body.dataset.mundo !== 'virtual') return;

    const [titulo, texto] = MENSAJES_REALES[indice % MENSAJES_REALES.length];
    indice++;

    const item = document.createElement('li');
    item.className = 'vir-intrusion';
    item.style.setProperty('--giro', `${(Math.random() * 4 - 2).toFixed(1)}deg`);
    item.innerHTML = `<b>${titulo}</b>${texto}`;
    lista.append(item);

    if (lista.children.length > MAXIMO_INTRUSIONES) {
      lista.firstElementChild.remove();
    }
  }

  function detener() {
    clearInterval(intervalo);
    intervalo = null;
  }

  function cambiarNivel(nivel) {
    detener();
    if (nivel < 2) {
      lista.replaceChildren();
      return;
    }
    agregar();
    intervalo = setInterval(agregar, PAUSA_POR_NIVEL[nivel]);
  }

  if (!lista) return { cambiarNivel() {} };
  return { cambiarNivel };
}
