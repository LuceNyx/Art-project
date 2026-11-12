/* =========================================================================
   MUTED WORLD · routine.js
   LA PUERTA = EL MUNDO REAL. Abrirla no lleva al mundo imaginado:
   lleva a la rutina. Una micro-secuencia muestra el tiempo pasando muy
   rápido (reloj acelerado, luz del día que cambia, días que se repiten)
   y, al terminar, el visitante vuelve al cuarto. Todo en gris.

   Uso: MW.routine.play({ alCubrir, alTerminar })
     alCubrir   → se llama cuando la capa ya tapa la pantalla
     alTerminar → se llama al volver al cuarto
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var POR_DIA = 1350;        // ms que dura cada día
  var ENTRADA = 900;         // ms del fundido de entrada
  var FINAL = 1800;          // ms que se ve "Again." antes de volver

  var el = {};
  var activa = false;
  var temporizadores = [];

  function despues(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }

  function limpiar() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  function play(opciones) {
    opciones = opciones || {};
    if (activa) return;
    activa = true;

    var R = MW.config.ROUTINE;
    var pasos = R.steps;
    var dias = R.days;

    el.capa.hidden = false;
    el.capa.classList.remove('mw-routine--final');
    el.dia.textContent = '';
    el.paso.textContent = '';
    el.capa.style.setProperty('--mw-dia', (POR_DIA / 1000) + 's');
    // Doble frame para que se vea el fundido
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.capa.classList.add('mw-routine--on'); });
    });
    el.saltar.focus({ preventScroll: true });

    MW.audio.setProfile('lack-of-control');

    despues(function () {
      if (opciones.alCubrir) opciones.alCubrir();
      el.capa.classList.add('mw-routine--run');
      MW.audio.fastTicks(reducido ? 600 : dias.length * POR_DIA);
    }, reducido ? 0 : ENTRADA);

    var inicio = reducido ? 0 : ENTRADA;
    var duracionDias = reducido ? 1400 : dias.length * POR_DIA;

    if (reducido) {
      // Sin animación: la semana entera de un vistazo
      el.dia.textContent = dias[0] + ' — ' + dias[dias.length - 1];
      el.paso.textContent = pasos.join(' · ');
    } else {
      // Cada día: los mismos pasos, cada vez más borrosos
      dias.forEach(function (dia, d) {
        despues(function () { el.dia.textContent = dia; }, inicio + d * POR_DIA);
        pasos.forEach(function (paso, p) {
          despues(function () { el.paso.textContent = paso; }, inicio + d * POR_DIA + p * (POR_DIA / pasos.length));
        });
      });
    }

    // "Again." y de vuelta al cuarto
    despues(function () {
      el.capa.classList.add('mw-routine--final');
      el.dia.textContent = '';
      el.paso.textContent = R.ending;
    }, inicio + duracionDias);

    despues(terminar.bind(null, opciones), inicio + duracionDias + FINAL);
  }

  function terminar(opciones) {
    limpiar();
    el.capa.classList.remove('mw-routine--on', 'mw-routine--run');
    MW.audio.setProfile('room');
    setTimeout(function () {
      el.capa.hidden = true;
      activa = false;
      if (opciones && opciones.alTerminar) opciones.alTerminar();
    }, reducido ? 0 : 1200);
  }

  /** Saltar: se va directo a "Again." (la rutina no se puede evitar, solo acortar). */
  function saltar() {
    if (!activa || el.capa.classList.contains('mw-routine--final')) return;
    limpiar();
    el.capa.classList.add('mw-routine--run', 'mw-routine--final');
    el.dia.textContent = '';
    el.paso.textContent = MW.config.ROUTINE.ending;
    despues(function () { terminar(saltar.opciones); }, 1200);
  }

  function init() {
    el.capa = document.getElementById('mw-routine');
    el.dia = el.capa.querySelector('.mw-routine__day');
    el.paso = el.capa.querySelector('.mw-routine__step');
    el.saltar = el.capa.querySelector('.mw-routine__skip');
    el.saltar.addEventListener('click', saltar);
    document.addEventListener('keydown', function (e) {
      if (activa && e.key === 'Escape') { e.preventDefault(); saltar(); }
    });
  }

  MW.routine = {
    init: init,
    play: function (opciones) { saltar.opciones = opciones; play(opciones); },
    isActive: function () { return activa; }
  };
})();
