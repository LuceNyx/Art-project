/* =========================================================================
   MUNDO COTIDIANO · Integrante 2
   - Reloj con botón "Posponer" (la rutina que se repite).
   - Genera los pupitres del aula.
   - Celular que se llena de notificaciones hasta "llamar" al otro mundo.
   ========================================================================= */

export function iniciarCotidiano() {
  const seccion = document.getElementById('cotidiano');
  if (!seccion) return;

  iniciarReloj(seccion);
  crearPupitres(seccion);
  iniciarCelular(seccion);
}

/* ---------- Escena 1: reloj ---------- */
const MENSAJES_ALARMA = [
  'La alarma suena. Otra vez.',
  'Cinco minutos más.',
  'Solo cinco más. Nadie lo notará.',
  'Ya es tarde. Siempre es tarde.',
];

function iniciarReloj(seccion) {
  const reloj = seccion.querySelector('.cot-reloj');
  const minutosEl = seccion.querySelector('.cot-reloj__m');
  const mensaje = seccion.querySelector('.cot-reloj-mensaje');
  const boton = seccion.querySelector('.cot-boton');
  if (!reloj || !boton) return;

  let veces = 0;

  boton.addEventListener('click', () => {
    veces++;
    minutosEl.textContent = String(veces * 5).padStart(2, '0');
    mensaje.textContent = MENSAJES_ALARMA[Math.min(veces, MENSAJES_ALARMA.length - 1)];

    // Reinicia la animación de vibración
    reloj.classList.remove('cot-reloj--suena');
    void reloj.offsetWidth;
    reloj.classList.add('cot-reloj--suena');

    if (veces >= MENSAJES_ALARMA.length - 1) {
      boton.disabled = true;
      boton.textContent = 'Ya no se puede posponer';
    }
  });
}

/* ---------- Escena 3: aula ---------- */
const TOTAL_PUPITRES = 30;
const PUPITRE_PROPIO = 21; // posición del pupitre "tuyo"

function crearPupitres(seccion) {
  const contenedor = seccion.querySelector('.cot-pupitres');
  if (!contenedor) return;

  for (let i = 0; i < TOTAL_PUPITRES; i++) {
    const pupitre = document.createElement('span');
    pupitre.className = 'cot-pupitre' + (i === PUPITRE_PROPIO ? ' cot-pupitre--tu' : '');
    contenedor.append(pupitre);
  }
}

/* ---------- Escena 4: celular ---------- */
const NOTIFICACIONES = [
  ['Familia (14)', 'Mamá: ¿llegaste bien?'],
  ['Recordatorio', 'Entrega del proyecto: mañana 08:00'],
  ['Banco', 'Tu saldo es bajo'],
  ['Grupo del curso', '¿Alguien avanzó la parte 3?'],
  ['Batería', '12 % restante'],
  ['Correo', '3 mensajes sin leer'],
  ['Calendario', 'Mañana: 06:00 alarma'],
];

const PAUSA_NOTIFICACION = 750; // milisegundos
const MAXIMO_VISIBLES = 6;

function iniciarCelular(seccion) {
  const celular = seccion.querySelector('.cot-celular');
  const lista = seccion.querySelector('.cot-notificaciones');
  if (!celular || !lista) return;

  const observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observador.disconnect(); // solo ocurre una vez
    llenarNotificaciones(celular, lista);
  }, { threshold: 0.6 });

  observador.observe(celular);
}

function llenarNotificaciones(celular, lista) {
  let indice = 0;

  const intervalo = setInterval(() => {
    const [app, texto] = NOTIFICACIONES[indice];
    const item = document.createElement('li');
    item.className = 'cot-notif';
    item.innerHTML = `<b>${app}</b>${texto}`;
    lista.prepend(item); // la más nueva arriba

    if (lista.children.length > MAXIMO_VISIBLES) {
      lista.lastElementChild.remove();
    }

    indice++;
    if (indice >= NOTIFICACIONES.length) {
      clearInterval(intervalo);
      // La pantalla se enciende con el color del otro mundo
      setTimeout(() => celular.classList.add('cot-celular--brilla'), 600);
    }
  }, PAUSA_NOTIFICACION);
}
