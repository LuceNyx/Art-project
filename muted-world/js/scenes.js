/* =========================================================================
   MUTED WORLD · scenes.js
   Primeros planos (close-ups) de cada situación:
   - Entrada lenta desde la habitación y botón "Back to the room".
   - Texto fragmentario que aparece poco a poco.
   - "Ocultar = evasión": la escena se oscurece, pero el problema sigue.
   - Objeto de escape: dispara 'muted:escape' y, si nadie lo maneja,
     navega a la transición (ver config.js e INTEGRATION.md).
   Cada situación es un "builder" en BUILDERS (abajo).
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var el = {};             // referencias al DOM
  var actual = null;       // situación abierta
  var origen = null;       // objeto de la habitación que la abrió (para devolver el foco)
  var temporizadores = [];
  var escapando = false;

  /* =======================================================================
     API para los builders (lo que cada situación puede usar)
     ======================================================================= */
  function crearApi(scene) {
    var oculto = false;
    return {
      scene: scene,
      content: el.content,

      /** setTimeout que se limpia solo al cerrar la escena. */
      later: function (fn, ms) {
        temporizadores.push(setTimeout(fn, reducido ? Math.min(ms, 400) : ms));
      },

      /** setInterval que se limpia solo al cerrar la escena. */
      every: function (fn, ms) {
        var id = setInterval(fn, ms);
        temporizadores.push(id);
        return id;
      },

      /** Muestra una línea de texto (las anteriores se atenúan). */
      line: function (texto) {
        var anteriores = el.lines.querySelectorAll('.mw-line');
        anteriores.forEach(function (p) { p.classList.add('mw-line--old'); });
        var p = document.createElement('p');
        p.className = 'mw-line';
        p.textContent = texto;
        el.lines.appendChild(p);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { p.classList.add('mw-line--on'); });
        });
      },

      /** Ocultar = evasión: más oscuro y más silencioso. */
      setHidden: function (valor) {
        oculto = !!valor;
        el.scene.classList.toggle('mw-scene--hidden', oculto);
        MW.audio.setDampened(oculto);
      },

      isHidden: function () { return oculto; },

      /** Convierte un botón en el objeto de escape de la situación. */
      makeEscape: function (boton) {
        boton.addEventListener('click', function () { escapar(boton); });
      }
    };
  }

  /* =======================================================================
     Abrir / cerrar
     ======================================================================= */
  function open(id, objetoHabitacion) {
    var scene = MW.config.getScene(id);
    if (!scene || !scene.ready || actual || !BUILDERS[id]) return;

    actual = scene;
    origen = objetoHabitacion || null;
    escapando = false;
    MW.room.markVisited(id);
    MW.room.zoomTo(scene, true);

    // Preparar la escena mientras la habitación se acerca
    el.title.textContent = scene.title;
    MW.images.load(el.bg, scene.image, scene.id);
    el.content.replaceChildren();
    el.lines.replaceChildren();
    el.scene.classList.remove('mw-scene--hidden');
    MW.audio.setDampened(false);
    MW.audio.setProfile(scene.id);

    BUILDERS[id](crearApi(scene));

    setTimeout(function () {
      el.scene.hidden = false;
      // Doble frame: asegura que la transición de opacidad se vea
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.scene.classList.add('mw-scene--open'); });
      });
      el.back.focus({ preventScroll: true });
      centrarVista();
    }, reducido ? 0 : 900);
  }

  function close() {
    if (!actual || escapando) return;
    var cerrando = actual;
    actual = null;

    el.scene.classList.remove('mw-scene--open');
    MW.audio.setDampened(false);
    MW.audio.setProfile('room');

    setTimeout(function () {
      limpiar();
      el.scene.hidden = true;
      MW.room.zoomTo(cerrando, false);
      if (origen) origen.focus({ preventScroll: true });
    }, reducido ? 0 : 1400);
  }

  function limpiar() {
    temporizadores.forEach(function (id) { clearTimeout(id); clearInterval(id); });
    temporizadores = [];
    el.content.replaceChildren();
    el.lines.replaceChildren();
  }

  /* =======================================================================
     Escape → contrato con mis compañeros
     ======================================================================= */
  function escapar(boton) {
    if (!actual || escapando) return;
    escapando = true;

    var scene = actual;
    var detalle = { scene: scene.id, motif: scene.motif.id };
    var evento = new CustomEvent(MW.config.ESCAPE_EVENT, { detail: detalle, cancelable: true });
    var nadieLoManejo = window.dispatchEvent(evento);

    // Si alguien llamó a preventDefault(), esa parte toma el control aquí.
    if (!nadieLoManejo) return;

    // Respaldo: la luz del objeto de escape llena la pantalla y se navega.
    var caja = boton.getBoundingClientRect();
    el.flash.style.setProperty('--mw-flash-x', (caja.left + caja.width / 2) + 'px');
    el.flash.style.setProperty('--mw-flash-y', (caja.top + caja.height / 2) + 'px');
    el.flash.classList.add('mw-flash--on');
    MW.audio.setDampened(true);

    var url = MW.config.TRANSITION_URL +
      '?from=' + encodeURIComponent(detalle.scene) +
      '&motif=' + encodeURIComponent(detalle.motif);

    setTimeout(function () { window.location.href = url; }, reducido ? 0 : 1500);
  }

  /* =======================================================================
     Teclado: Escape cierra, Tab no sale del diálogo
     ======================================================================= */
  function alTeclado(evento) {
    if (!actual) return;

    if (evento.key === 'Escape') {
      evento.preventDefault();
      close();
      return;
    }

    if (evento.key === 'Tab') {
      var enfocables = el.scene.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      if (!enfocables.length) return;
      var primero = enfocables[0];
      var ultimo = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }
  }

  /** En pantallas estrechas el primer plano empieza centrado. */
  function centrarVista() {
    var vista = el.scene.querySelector('.mw-viewport');
    vista.scrollLeft = (vista.scrollWidth - vista.clientWidth) / 2;
  }

  /* =======================================================================
     BUILDERS: una función por situación
     ======================================================================= */
  var BUILDERS = {};

  /* ---------- 1 · ACADEMIC PRESSURE ---------- */
  var LAMPARA_SVG =
    '<svg class="mw-ap-lamp" viewBox="0 0 260 270" aria-hidden="true">' +
      '<g filter="url(#mw-rough)">' +
        '<path d="M-10 30 L118 14 L176 96" fill="none" stroke="#2c2c2c" stroke-width="9" stroke-linecap="round"/>' +
        '<circle cx="118" cy="14" r="9" fill="#333"/>' +
        '<path d="M150 86 L204 74 L246 168 L128 178 Z" fill="#1a1a1a" stroke="#3d3d3d" stroke-width="3"/>' +
      '</g>' +
      '<ellipse cx="188" cy="172" rx="44" ry="9" fill="#f4f4f4" filter="url(#mw-blur)"/>' +
      '<ellipse cx="188" cy="171" rx="34" ry="5" fill="#fff"/>' +
    '</svg>';

  var PORTATIL_SVG =
    '<svg viewBox="0 0 220 130" aria-hidden="true">' +
      '<g filter="url(#mw-rough)">' +
        '<path d="M14 64 L206 64 L214 80 L6 80 Z" fill="#202020" stroke="#3a3a3a" stroke-width="2"/>' +
        '<path d="M6 84 L214 84 L198 110 L22 110 Z" fill="#161616" stroke="#333" stroke-width="2"/>' +
        '<path d="M40 92 L180 92 M44 99 L176 99" stroke="#2a2a2a" stroke-width="3"/>' +
      '</g>' +
      '<path d="M10 82 L210 82" stroke="#fff" stroke-width="5" filter="url(#mw-blur)" opacity=".9"/>' +
      '<path d="M12 82 L208 82" stroke="#fff" stroke-width="1.6"/>' +
    '</svg>';

  var GARABATOS = new Array(7).join('<span class="mw-ap-scribble"></span>');

  var HOJAS_INICIALES = 12;
  var HOJAS_MAXIMAS = 52;
  var PAUSA_HOJA = 2600; // ms entre hojas

  BUILDERS['academic-pressure'] = function (api) {
    var s = api.scene;
    api.content.innerHTML =
      '<div class="mw-ap-cone" aria-hidden="true"></div>' +
      LAMPARA_SVG +
      '<div class="mw-ap-stack" aria-hidden="true"></div>' +
      '<div class="mw-ap-notebook" aria-hidden="true">' +
        '<span class="mw-ap-loose mw-ap-loose--1"></span>' +
        '<span class="mw-ap-loose mw-ap-loose--2"></span>' +
        '<span class="mw-ap-loose mw-ap-loose--3"></span>' +
        '<div class="mw-ap-page mw-ap-page--left"><span class="mw-ap-due">Due 8:00 AM</span>' + GARABATOS + '</div>' +
        '<div class="mw-ap-leaf">' +
          '<div class="mw-ap-leaf__front mw-ap-page"><span class="mw-ap-due">p. 1 / 312</span>' + GARABATOS + '</div>' +
          '<div class="mw-ap-leaf__back"></div>' +
        '</div>' +
      '</div>' +
      '<button class="mw-ap-hide" type="button" aria-pressed="false" aria-label="' + s.hideAction + '"></button>' +
      '<button class="mw-escape mw-ap-laptop" type="button" aria-label="' + s.escapeObject.ariaLabel + '">' +
        PORTATIL_SVG + '<span class="mw-escape__glow"></span>' +
      '</button>';

    var pila = api.content.querySelector('.mw-ap-stack');
    var botonOcultar = api.content.querySelector('.mw-ap-hide');
    var total = 0;

    // Texto en orden: las 3 primeras líneas con el tiempo; "Again." (la última)
    // siempre al final: tras cerrar el cuaderno o, si no, a los 26 s.
    var mostradas = 0;
    var quiereAgain = false;

    function siguienteLinea() {
      if (mostradas >= s.lines.length - 1) return;
      api.line(s.lines[mostradas]);
      mostradas++;
      if (mostradas === s.lines.length - 1 && quiereAgain) {
        api.later(decirAgain, 2600);
      }
    }

    function decirAgain() {
      if (mostradas !== s.lines.length - 1) return; // aún faltan líneas, o ya se dijo
      api.line(s.lines[mostradas]);
      mostradas++;
    }

    function pedirAgain() {
      if (quiereAgain) return;
      quiereAgain = true;
      if (mostradas === s.lines.length - 1) {
        api.later(decirAgain, 2200);
      } else {
        // Adelanta las líneas que faltan, despacio
        api.later(siguienteLinea, 1800);
      }
    }

    // Una hoja más en la pila (cayendo o ya apoyada)
    function agregarHoja(cayendo) {
      if (total >= HOJAS_MAXIMAS) return;
      var hoja = document.createElement('span');
      hoja.className = 'mw-ap-sheet' + (cayendo ? ' mw-ap-sheet--falling' : '');
      hoja.style.setProperty('--i', total);
      hoja.style.setProperty('--dx', (Math.random() * 8 - 4).toFixed(1));
      hoja.style.setProperty('--rot', (Math.random() * 6 - 3).toFixed(1));
      pila.appendChild(hoja);
      total++;
      if (cayendo) {
        hoja.addEventListener('animationend', function () {
          hoja.classList.remove('mw-ap-sheet--falling');
        }, { once: true });
        api.later(MW.audio.rustle, 1500);
      }
    }

    for (var i = 0; i < HOJAS_INICIALES; i++) agregarHoja(false);
    if (!reducido) api.every(function () { agregarHoja(true); }, PAUSA_HOJA);

    // Texto fragmentario (cada llamada muestra la siguiente línea, si falta)
    api.later(siguienteLinea, 1800);
    api.later(siguienteLinea, 7000);
    api.later(siguienteLinea, 13000);
    api.later(pedirAgain, 26000);

    // Ocultar = evasión: cerrar el cuaderno. La pila sigue creciendo.
    botonOcultar.addEventListener('click', function () {
      var ocultar = !api.isHidden();
      api.setHidden(ocultar);
      botonOcultar.setAttribute('aria-pressed', ocultar ? 'true' : 'false');
      botonOcultar.setAttribute('aria-label', ocultar ? 'Open the notebook' : s.hideAction);
      if (ocultar) pedirAgain();
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* =======================================================================
     Inicio
     ======================================================================= */
  function init() {
    el.scene = document.getElementById('mw-scene');
    el.content = el.scene.querySelector('.mw-scene__content');
    el.bg = el.scene.querySelector('.mw-scene__bg');
    el.lines = el.scene.querySelector('.mw-lines');
    el.back = el.scene.querySelector('.mw-back');
    el.title = document.getElementById('mw-scene-title');
    el.flash = document.querySelector('.mw-flash');

    el.back.addEventListener('click', close);
    document.addEventListener('keydown', alTeclado);

    // Si se vuelve con el botón "atrás" del navegador tras escapar
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        el.flash.classList.remove('mw-flash--on');
        escapando = false;
        close();
      }
    });
  }

  MW.scenes = {
    init: init,
    open: open,
    close: close,
    isOpen: function () { return !!actual; },
    builders: BUILDERS
  };
})();
