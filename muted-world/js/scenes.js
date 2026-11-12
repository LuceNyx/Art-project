/* =========================================================================
   MUTED WORLD · scenes.js
   Primeros planos (close-ups) de cada situación:
   - Entrada lenta desde la habitación y botón "Back to the room".
   - Texto fragmentario que aparece poco a poco.
   - "Ocultar = evasión": la escena se oscurece, pero el problema sigue.
   - Objeto de escape: dispara 'muted:escape' y, si nadie lo maneja,
     navega a la transición (ver config.js e INTEGRATION.md).
   Cada situación es un "builder" en BUILDERS (más abajo).
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
     Utilidades
     ======================================================================= */
  function azar(min, max) { return min + Math.random() * (max - min); }

  /** Escapa texto para insertarlo en HTML. */
  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Enlaza un botón de "ocultar" (evasión) con su escena. */
  function botonOcultar(api, boton, textoMostrar, alCambiar) {
    boton.addEventListener('click', function () {
      var ocultar = !api.isHidden();
      api.setHidden(ocultar);
      boton.setAttribute('aria-pressed', ocultar ? 'true' : 'false');
      boton.setAttribute('aria-label', ocultar ? textoMostrar : api.scene.hideAction);
      if (alCambiar) alCambiar(ocultar);
    });
  }

  /* =======================================================================
     API para los builders (lo que cada situación puede usar)
     ======================================================================= */
  function crearApi(scene) {
    var oculto = false;
    var api = {
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

      /** Muestra una línea de texto (las anteriores se atenúan). variante: 'voice' */
      line: function (texto, variante) {
        el.lines.querySelectorAll('.mw-line').forEach(function (p) { p.classList.add('mw-line--old'); });
        var p = document.createElement('p');
        p.className = 'mw-line' + (variante ? ' mw-line--' + variante : '');
        p.textContent = texto;
        el.lines.appendChild(p);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { p.classList.add('mw-line--on'); });
        });
      },

      clearLines: function () { el.lines.replaceChildren(); },

      /**
       * Muestra lineas[0..n-2] en los tiempos dados (ms) y la ÚLTIMA siempre
       * al final: al llamar a .final() (p. ej. al ocultar) o en finalEn ms.
       * Así el orden nunca se rompe.
       */
      sequence: function (lineas, tiempos, finalEn, variante) {
        var mostradas = 0;
        var quiereFinal = false;
        var ultima = lineas.length - 1;

        function siguiente() {
          if (mostradas >= ultima) return;
          api.line(lineas[mostradas], variante);
          mostradas++;
          if (mostradas === ultima && quiereFinal) api.later(decirFinal, 2600);
        }
        function decirFinal() {
          if (mostradas !== ultima) return;
          api.line(lineas[ultima], variante);
          mostradas++;
        }
        function pedirFinal() {
          if (quiereFinal) return;
          quiereFinal = true;
          if (mostradas === ultima) api.later(decirFinal, 2200);
          else api.later(siguiente, 1800); // adelanta las que faltan, despacio
        }

        tiempos.forEach(function (t) { api.later(siguiente, t); });
        if (finalEn) api.later(pedirFinal, finalEn);
        return { next: siguiente, final: pedirFinal };
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
    return api;
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
    el.scene.dataset.scene = scene.id;
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

  /** inmediato: cerrar sin animación (cuando otra capa ya cubre la pantalla). */
  function close(inmediato) {
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
    }, reducido || inmediato === true ? 0 : 1400);
  }

  function limpiar() {
    temporizadores.forEach(function (id) { clearTimeout(id); clearInterval(id); });
    temporizadores = [];
    el.content.replaceChildren();
    el.lines.replaceChildren();
    delete el.scene.dataset.scene;
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
      var enfocables = Array.prototype.filter.call(
        el.scene.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
        function (n) { return n.offsetParent !== null; }
      );
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

  /** Botón de escape estándar: dibujo SVG + luz que crece. */
  function htmlEscape(clase, scene, svg) {
    return '<button class="mw-escape ' + clase + '" type="button" aria-label="' + esc(scene.escapeObject.ariaLabel) + '">' +
      (svg || '') + '<span class="mw-escape__glow"></span></button>';
  }

  function htmlOcultar(clase, scene) {
    return '<button class="' + clase + '" type="button" aria-pressed="false" aria-label="' + esc(scene.hideAction) + '"></button>';
  }

  /* =======================================================================
     BUILDERS: una función por situación
     ======================================================================= */
  var BUILDERS = {};

  /* ---------------------------------------------------------------------
     1 · ACADEMIC PRESSURE: escritorio, hojas que se apilan, cuaderno
     --------------------------------------------------------------------- */
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

  BUILDERS['academic-pressure'] = function (api) {
    var s = api.scene;
    var HOJAS_INICIALES = 12;
    var HOJAS_MAXIMAS = 52;

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
      htmlOcultar('mw-ap-hide', s) +
      htmlEscape('mw-ap-laptop', s, PORTATIL_SVG);

    var pila = api.content.querySelector('.mw-ap-stack');
    var total = 0;

    function agregarHoja(cayendo) {
      if (total >= HOJAS_MAXIMAS) return;
      var hoja = document.createElement('span');
      hoja.className = 'mw-ap-sheet' + (cayendo ? ' mw-ap-sheet--falling' : '');
      hoja.style.setProperty('--i', total);
      hoja.style.setProperty('--dx', azar(-4, 4).toFixed(1));
      hoja.style.setProperty('--rot', azar(-3, 3).toFixed(1));
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
    if (!reducido) api.every(function () { agregarHoja(true); }, 2600);

    var texto = api.sequence(s.lines, [1800, 7000, 13000], 26000);

    // Ocultar = evasión: cerrar el cuaderno. La pila sigue creciendo.
    botonOcultar(api, api.content.querySelector('.mw-ap-hide'), 'Open the notebook', function (oculto) {
      if (oculto) texto.final();
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     2 · LONELINESS: celular sobre la cama, mensajes sin respuesta.
     La cámara se aleja: el cuarto crece y la figura se queda pequeña.
     --------------------------------------------------------------------- */
  var FIGURA_SVG =
    '<svg class="mw-lo-figure" viewBox="0 0 120 140" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<circle cx="62" cy="30" r="15" fill="#070707"/>' +
      '<path d="M40 52 Q62 38 84 54 L92 104 Q96 122 80 128 L34 128 Q22 122 26 104 Z" fill="#070707"/>' +
      '<path d="M30 96 Q60 80 96 98 L98 112 Q62 100 26 114 Z" fill="#0d0d0d"/>' +
    '</g></svg>';

  var MANDO_SVG =
    '<svg viewBox="0 0 160 90" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<path d="M30 30 Q80 14 130 30 Q156 40 150 70 Q144 86 124 78 L104 64 L56 64 L36 78 Q16 86 10 70 Q4 40 30 30 Z" fill="#141414" stroke="#2e2e2e" stroke-width="2"/>' +
      '<circle cx="48" cy="44" r="8" fill="#0a0a0a"/><circle cx="112" cy="44" r="8" fill="#0a0a0a"/>' +
    '</g>' +
    '<circle cx="80" cy="34" r="6" fill="#fff" filter="url(#mw-blur)"/><circle cx="80" cy="34" r="3" fill="#fff"/></svg>';

  BUILDERS['loneliness'] = function (api) {
    var s = api.scene;
    api.content.innerHTML =
      '<div class="mw-lo-zoom">' +
        '<div class="mw-lo-sheet" aria-hidden="true"></div>' +
        FIGURA_SVG +
        '<div class="mw-lo-phone" aria-hidden="true">' +
          '<span class="mw-lo-glow"></span>' +
          '<span class="mw-lo-phone__inner">' +
            '<span class="mw-lo-phone__front"><span class="mw-lo-chat"></span></span>' +
            '<span class="mw-lo-phone__back"></span>' +
          '</span>' +
          '<span class="mw-lo-buzz"></span>' +
        '</div>' +
        htmlOcultar('mw-lo-hide', s) +
      '</div>' +
      htmlEscape('mw-lo-controller', s, MANDO_SVG);

    var chat = api.content.querySelector('.mw-lo-chat');
    var zoom = api.content.querySelector('.mw-lo-zoom');
    var visto = false;
    var quiereFinal = false;

    function burbuja(texto) {
      var b = document.createElement('span');
      b.className = 'mw-lo-bubble';
      b.textContent = texto;
      chat.appendChild(b);
    }

    function marcarVisto() {
      var v = document.createElement('span');
      v.className = 'mw-lo-seen';
      v.textContent = s.lines[2];
      chat.appendChild(v);
      visto = true;
      if (quiereFinal) api.later(final, 2600);
    }

    // "Nobody's typing." solo después de "Seen"
    function final() {
      if (!visto || final.hecho) return;
      final.hecho = true;
      api.line(s.lines[3]);
    }
    function pedirFinal() {
      quiereFinal = true;
      if (visto) api.later(final, 2200);
    }

    api.later(function () { burbuja(s.lines[0]); }, 1800);
    api.later(function () { burbuja(s.lines[1]); }, 4600);
    api.later(marcarVisto, 9000);
    api.later(pedirFinal, 20000);

    // La habitación crece; la figura se queda pequeña
    api.later(function () { zoom.classList.add('mw-lo-zoom--lejos'); }, 1200);

    botonOcultar(api, api.content.querySelector('.mw-lo-hide'), 'Turn the phone face up', function (oculto) {
      if (oculto) pedirFinal();
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     3 · EMOTIONAL OVERLOAD: notas que se amontonan hasta tapar el corcho
     --------------------------------------------------------------------- */
  var AUDIFONOS_SVG =
    '<svg viewBox="0 0 120 220" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<circle cx="60" cy="10" r="6" fill="#444"/>' +
      '<path d="M60 14 L60 26" stroke="#333" stroke-width="2"/>' +
      '<path d="M22 96 Q22 26 60 26 Q98 26 98 96" fill="none" stroke="#1c1c1c" stroke-width="9"/>' +
      '<rect x="10" y="88" width="26" height="40" rx="10" fill="#151515" stroke="#2c2c2c" stroke-width="2"/>' +
      '<rect x="84" y="88" width="26" height="40" rx="10" fill="#151515" stroke="#2c2c2c" stroke-width="2"/>' +
    '</g>' +
    '<path d="M97 128 Q104 168 84 214" fill="none" stroke="#fff" stroke-width="5" filter="url(#mw-blur)" opacity=".8"/>' +
    '<path d="M97 128 Q104 168 84 214" fill="none" stroke="#fff" stroke-width="1.4"/></svg>';

  BUILDERS['emotional-overload'] = function (api) {
    var s = api.scene;
    var NOTAS_MAXIMAS = 46;

    api.content.innerHTML =
      '<div class="mw-eo-frame">' +
        '<div class="mw-eo-board" aria-hidden="true"><div class="mw-eo-notes"></div></div>' +
        '<div class="mw-eo-cloth" aria-hidden="true"></div>' +
        '<div class="mw-eo-roll" aria-hidden="true"></div>' +
      '</div>' +
      htmlOcultar('mw-eo-hide', s) +
      htmlEscape('mw-eo-headphones', s, AUDIFONOS_SVG);

    var notas = api.content.querySelector('.mw-eo-notes');
    var total = 0;

    function nota(texto) {
      if (total >= NOTAS_MAXIMAS) return;
      var n = document.createElement('span');
      n.className = 'mw-eo-note' + (texto ? '' : ' mw-eo-note--scribble');
      // Las primeras se reparten; luego se amontonan encima de las demás
      n.style.left = azar(2, 78).toFixed(1) + '%';
      n.style.top = azar(2, 80).toFixed(1) + '%';
      n.style.setProperty('--rot', azar(-14, 14).toFixed(1) + 'deg');
      n.style.setProperty('--tam', (1 + Math.min(total, 30) * 0.02).toFixed(2));
      n.style.setProperty('--tono', Math.round(azar(176, 222)));
      if (texto) n.textContent = texto;
      notas.appendChild(n);
      total++;
    }

    // Las 5 frases, una a una; después, notas sin fin (repetidas o garabatos)
    s.lines.forEach(function (linea, i) {
      api.later(function () { nota(linea); }, 1400 + i * 2400);
    });
    api.later(function () {
      if (reducido) {
        for (var k = 0; k < 24; k++) nota(Math.random() < 0.3 ? s.lines[k % s.lines.length] : '');
        return;
      }
      api.every(function () {
        nota(Math.random() < 0.3 ? s.lines[Math.floor(Math.random() * s.lines.length)] : '');
      }, 900);
    }, 1400 + s.lines.length * 2400);

    // Ocultar = evasión: la sábana tapa el corcho, pero las notas se marcan
    // a través de la tela y la franja inferior sigue a la vista.
    botonOcultar(api, api.content.querySelector('.mw-eo-hide'), 'Pull the sheet away');

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     4 · LACK OF CONTROL: la puerta, dos opciones, el mismo resultado
     --------------------------------------------------------------------- */
  var RELOJ_SVG =
    '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="46" fill="#1a1a1a"/>' +
      '<circle cx="50" cy="50" r="40" fill="#cfcfcf"/>' +
      '<path d="M50 14 V20 M50 80 V86 M14 50 H20 M80 50 H86" stroke="#333" stroke-width="3"/>' +
      '<path class="mw-lc-hour" d="M50 50 L36 74" stroke="#111" stroke-width="5" stroke-linecap="round"/>' +
      '<path class="mw-lc-minute" d="M50 50 L50 18" stroke="#111" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="mw-lc-second" d="M50 56 L50 14" stroke="#555" stroke-width="1.2"/>' +
      '<circle cx="50" cy="50" r="3" fill="#111"/>' +
    '</svg>';

  // Computadora en espera: el escape de esta situación (la puerta ya no lo es)
  var COMPUTADORA_SVG =
    '<svg viewBox="0 0 220 170" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<rect x="20" y="8" width="180" height="118" rx="10" fill="#161616" stroke="#2e2e2e" stroke-width="3"/>' +
      '<rect x="34" y="20" width="152" height="92" rx="4" fill="#0b0b0b"/>' +
      '<path d="M96 126 L124 126 L132 146 L88 146 Z" fill="#1c1c1c"/>' +
      '<rect x="58" y="146" width="104" height="8" rx="3" fill="#202020"/>' +
      '<path d="M40 162 L180 162" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round"/>' +
    '</g>' +
    '<rect class="mw-lc-scan" x="34" y="64" width="152" height="2" fill="#fff" opacity=".18"/>' +
    '<circle class="mw-lc-led" cx="186" cy="118" r="4" fill="#fff"/></svg>';

  BUILDERS['lack-of-control'] = function (api) {
    var s = api.scene;
    api.content.innerHTML =
      '<div class="mw-lc-door" aria-hidden="true"><span class="mw-lc-knob"></span></div>' +
      // La luz bajo la puerta sigue ahí, pero ahora es la del mundo de fuera (rutina)
      '<span class="mw-lc-under" aria-hidden="true"></span>' +
      '<div class="mw-lc-wash" aria-hidden="true"></div>' +
      '<div class="mw-lc-shadow" aria-hidden="true"><span class="mw-lc-shadow__hand"></span></div>' +
      '<div class="mw-lc-clock" aria-hidden="true">' +
        '<span class="mw-lc-clock__inner">' +
          '<span class="mw-lc-clock__front">' + RELOJ_SVG + '</span>' +
          '<span class="mw-lc-clock__back"></span>' +
        '</span>' +
      '</div>' +
      htmlOcultar('mw-lc-hide', s) +
      '<button class="mw-lc-choice mw-lc-choice--leave" type="button" aria-label="Leave: open the door and go to work" hidden>Leave</button>' +
      '<button class="mw-lc-choice mw-lc-choice--stay" type="button" hidden>Stay</button>' +
      htmlEscape('mw-lc-computer', s, COMPUTADORA_SVG) +
      '<div class="mw-lc-blackout" aria-hidden="true"></div>';

    var opciones = api.content.querySelectorAll('.mw-lc-choice');
    var apagon = api.content.querySelector('.mw-lc-blackout');
    var reloj = api.content.querySelector('.mw-lc-clock');
    var veces = 0;

    function mostrarOpciones(visibles) {
      opciones.forEach(function (b) { b.hidden = !visibles; b.disabled = !visibles; });
    }

    api.later(function () { api.line(s.lines[0]); }, 1800);
    api.later(function () { api.line(s.lines[1]); mostrarOpciones(true); }, 5200);

    // LEAVE: la puerta lleva al mundo real. Una jornada pasa muy rápido
    // (js/routine.js) y se vuelve al cuarto.
    opciones[0].addEventListener('click', function () {
      mostrarOpciones(false);
      MW.routine.play({ alCubrir: function () { close(true); } });
    });

    // STAY: quedarse tampoco cambia nada; todo vuelve a las 7:00
    [opciones[1]].forEach(function (boton) {
      boton.addEventListener('click', function () {
        veces++;
        var foco = 1;
        mostrarOpciones(false);
        apagon.classList.add('mw-lc-blackout--on');

        api.later(function () {
          api.clearLines();
          api.line(s.lines[0]);
          // Reinicia el segundero: la misma mañana, otra vez
          reloj.classList.remove('mw-lc-clock--run');
          void reloj.offsetWidth;
          reloj.classList.add('mw-lc-clock--run');
          apagon.classList.remove('mw-lc-blackout--on');
        }, 1600);

        api.later(function () {
          api.line(veces === 1 ? s.lines[2] : s.lines[3]);
          mostrarOpciones(true);
          opciones[foco].focus({ preventScroll: true });
        }, 4200);
      });
    });

    reloj.classList.add('mw-lc-clock--run');

    // Ocultar = evasión: girar el reloj. El tic-tac calla,
    // pero la sombra de la aguja sigue girando en la pared.
    botonOcultar(api, api.content.querySelector('.mw-lc-hide'), 'Turn the clock around', function (oculto) {
      MW.audio.setProfile(oculto ? 'lack-of-control-hidden' : 'lack-of-control');
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     5 · SOCIAL COMPARISON: fotos de otros que se multiplican; tu reflejo
     se hace cada vez más pequeño
     --------------------------------------------------------------------- */
  // Posiciones de las fotos alrededor del espejo (x, y en %, giro)
  var HUECOS_FOTOS = [
    [24, 10, -8], [68, 8, 6], [22, 40, 5], [70, 36, -6], [26, 68, -4], [68, 64, 9],
    [36, 2, 3], [56, 4, -5], [18, 24, 10], [76, 20, -9], [16, 56, -7], [78, 50, 4],
    [30, 82, 8], [62, 84, -3], [44, 88, 5], [20, 84, -10]
  ];

  function fotoSvg(personas) {
    var g = '';
    for (var i = 0; i < personas; i++) {
      var x = 20 + (60 / personas) * (i + 0.5);
      // Siluetas sin rostro con los brazos en alto: "felices"
      g += '<circle cx="' + x + '" cy="34" r="7" fill="#1c1c1c"/>' +
           '<path d="M' + (x - 11) + ' 70 Q' + x + ' 40 ' + (x + 11) + ' 70 Z" fill="#1c1c1c"/>' +
           '<path d="M' + (x - 8) + ' 50 L' + (x - 15) + ' 30 M' + (x + 8) + ' 50 L' + (x + 15) + ' 30" stroke="#1c1c1c" stroke-width="3"/>';
    }
    return '<svg viewBox="0 0 100 70" aria-hidden="true"><rect width="100" height="70" fill="#8a8a8a"/>' +
      '<rect y="52" width="100" height="18" fill="#6a6a6a"/>' + g + '</svg>';
  }

  BUILDERS['social-comparison'] = function (api) {
    var s = api.scene;
    api.content.innerHTML =
      '<div class="mw-sc-mirror" aria-hidden="true">' +
        '<div class="mw-sc-glass">' +
          '<svg class="mw-sc-reflection" viewBox="0 0 100 160" aria-hidden="true"><g filter="url(#mw-rough)">' +
            '<ellipse cx="50" cy="40" rx="17" ry="21" fill="#0b0b0b"/>' +
            '<path d="M14 160 Q16 82 50 74 Q84 82 86 160 Z" fill="#0b0b0b"/>' +
          '</g></svg>' +
        '</div>' +
        '<div class="mw-sc-shirt"></div>' +
      '</div>' +
      '<div class="mw-sc-photos" aria-hidden="true"></div>' +
      htmlOcultar('mw-sc-hide', s) +
      // El escape: un celular junto al espejo con un feed que no termina (en gris)
      htmlEscape('mw-sc-phone', s,
        '<span class="mw-sc-phone__body"><span class="mw-sc-phone__screen">' +
          '<span class="mw-sc-phone__feed"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
        '</span></span>');

    var fotos = api.content.querySelector('.mw-sc-photos');
    var espejo = api.content.querySelector('.mw-sc-mirror');
    var n = 0;

    function foto() {
      if (n >= HUECOS_FOTOS.length) return;
      var h = HUECOS_FOTOS[n];
      var f = document.createElement('span');
      f.className = 'mw-sc-photo';
      f.style.left = h[0] + '%';
      f.style.top = h[1] + '%';
      f.style.setProperty('--rot', h[2] + 'deg');
      var pie = n === 0 ? s.lines[0] : n === 1 ? s.lines[1] : '';
      f.innerHTML = fotoSvg(1 + (n % 3)) + (pie ? '<span class="mw-sc-caption">' + esc(pie) + '</span>' : '');
      fotos.appendChild(f);
      n++;
      // Tu reflejo se encoge con cada foto
      espejo.style.setProperty('--sc-yo', Math.max(0.42, 1 - n * 0.04).toFixed(2));
    }

    api.later(foto, 1500);
    api.later(foto, 4500);
    api.later(function () {
      if (reducido) { for (var k = 0; k < 10; k++) foto(); return; }
      api.every(foto, 2600);
    }, 7500);

    var texto = api.sequence([s.lines[2], s.lines[3]], [11000], 24000);

    botonOcultar(api, api.content.querySelector('.mw-sc-hide'), 'Uncover the mirror', function (oculto) {
      if (oculto) texto.final();
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     6 · UNCERTAIN FUTURE: la ventana, la lluvia, edificios enormes
     --------------------------------------------------------------------- */
  // Edificios: [x, ancho, alto] en % de la ventana
  var EDIFICIOS = [[-2, 16, 82], [12, 12, 64], [22, 18, 92], [38, 10, 58], [46, 20, 88], [64, 12, 70], [74, 16, 96], [88, 14, 76]];

  BUILDERS['uncertain-future'] = function (api) {
    var s = api.scene;
    var edificios = EDIFICIOS.map(function (e, i) {
      return '<span class="mw-uf-building" style="left:' + e[0] + '%;width:' + e[1] + '%;height:' + e[2] + '%;--tono:' + (8 + (i % 3) * 4) + '"></span>';
    }).join('');
    var laminas = '';
    for (var i = 0; i < 16; i++) laminas += '<span class="mw-uf-slat" style="--i:' + i + '"></span>';
    // Gotas que resbalan por el vidrio (posiciones al azar, sin patrón)
    var gotas = '';
    for (var g = 0; g < (reducido ? 0 : 42); g++) {
      gotas += '<span class="mw-uf-drop" style="left:' + azar(0, 100).toFixed(1) + '%;--d:' +
        azar(0.7, 1.6).toFixed(2) + 's;--del:-' + azar(0, 2).toFixed(2) + 's"></span>';
    }

    api.content.innerHTML =
      '<div class="mw-uf-window" aria-hidden="true">' +
        '<div class="mw-uf-outside">' +
          '<div class="mw-uf-city">' + edificios + '<span class="mw-uf-litpane"></span></div>' +
          '<div class="mw-uf-road"></div>' +
          '<div class="mw-uf-fog"></div>' +
        '</div>' +
        '<div class="mw-uf-rain">' + gotas + '</div>' +
        '<div class="mw-uf-blinds">' + laminas + '</div>' +
        '<span class="mw-uf-mullion"></span>' +
      '</div>' +
      '<button class="mw-uf-hide" type="button" aria-pressed="false" aria-label="' + esc(s.hideAction) + '"><span class="mw-uf-cord"></span></button>' +
      // El escape: unos lentes de realidad virtual sobre el alféizar
      htmlEscape('mw-uf-vr', s,
        '<svg viewBox="0 0 220 110" aria-hidden="true"><g filter="url(#mw-rough)">' +
          '<path d="M14 40 Q10 30 30 26 L190 26 Q210 30 206 40 L200 84 Q196 96 180 96 L134 96 Q122 96 116 84 L110 74 L104 84 Q98 96 86 96 L40 96 Q24 96 20 84 Z" fill="#171717" stroke="#333" stroke-width="3"/>' +
          '<path d="M30 26 Q110 4 190 26" fill="none" stroke="#2a2a2a" stroke-width="8"/>' +
        '</g>' +
        '<circle class="mw-uf-vr__lens" cx="66" cy="60" r="20" fill="#fff" opacity=".22"/>' +
        '<circle class="mw-uf-vr__lens" cx="154" cy="60" r="20" fill="#fff" opacity=".22"/></svg>');

    var texto = api.sequence(s.lines, [1800, 6500, 12000], 24000);

    // Ocultar = evasión: bajar la persiana. La lluvia sigue; la ciudad
    // y la ventana encendida asoman entre las láminas.
    botonOcultar(api, api.content.querySelector('.mw-uf-hide'), 'Raise the blinds', function (oculto) {
      if (oculto) texto.final();
    });

    api.makeEscape(api.content.querySelector('.mw-escape'));
  };

  /* ---------------------------------------------------------------------
     7 · FAMILY EXPECTATIONS: la foto familiar, voces tras la pared
     --------------------------------------------------------------------- */
  var FAMILIA_SVG =
    '<svg viewBox="0 0 200 150" aria-hidden="true">' +
      '<rect width="200" height="150" fill="#9c9c9c"/>' +
      '<rect y="108" width="200" height="42" fill="#7c7c7c"/>' +
      '<g fill="#262626">' +
        '<circle cx="46" cy="48" r="13"/><path d="M24 132 Q26 70 46 66 Q66 70 68 132 Z"/>' +
        '<circle cx="154" cy="46" r="13"/><path d="M132 132 Q134 68 154 64 Q174 68 176 132 Z"/>' +
        '<circle cx="80" cy="66" r="10"/><path d="M64 132 Q66 86 80 82 Q94 86 96 132 Z"/>' +
      '</g>' +
      // Tú: la única figura borrosa
      '<g fill="#3a3a3a" filter="url(#mw-blur)">' +
        '<circle cx="118" cy="62" r="11"/><path d="M100 132 Q102 82 118 78 Q134 82 136 132 Z"/>' +
      '</g>' +
    '</svg>';

  var TROFEO_SVG =
    '<svg viewBox="0 0 80 140" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<path d="M14 10 H66 Q64 62 40 70 Q16 62 14 10 Z" fill="#4a4a4a"/>' +
      '<path d="M14 18 Q0 20 4 36 Q8 48 18 46 M66 18 Q80 20 76 36 Q72 48 62 46" fill="none" stroke="#4a4a4a" stroke-width="5"/>' +
      '<rect x="32" y="70" width="16" height="34" fill="#3a3a3a"/>' +
      '<rect x="18" y="104" width="44" height="12" fill="#2e2e2e"/><rect x="12" y="116" width="56" height="20" fill="#262626"/>' +
      '<path d="M22 16 Q24 44 36 56" stroke="#8a8a8a" stroke-width="3" fill="none" opacity=".6"/>' +
    '</g></svg>';

  var CONSOLA_SVG =
    '<svg viewBox="0 0 140 80" aria-hidden="true"><g filter="url(#mw-rough)">' +
      '<rect x="6" y="10" width="128" height="62" rx="16" fill="#141414" stroke="#2c2c2c" stroke-width="2"/>' +
      '<circle cx="24" cy="42" r="7" fill="#0a0a0a"/><circle cx="116" cy="42" r="7" fill="#0a0a0a"/>' +
    '</g>' +
    '<rect x="40" y="20" width="60" height="40" rx="3" fill="#fff" filter="url(#mw-blur)" opacity=".85"/>' +
    '<rect x="42" y="22" width="56" height="36" rx="2" fill="#f2f2f2"/></svg>';

  BUILDERS['family-expectations'] = function (api) {
    var s = api.scene;
    api.content.innerHTML =
      '<div class="mw-fe-wall" aria-hidden="true"></div>' +
      htmlEscape('mw-fe-console', s, CONSOLA_SVG) +
      '<div class="mw-fe-trophy mw-fe-trophy--1" aria-hidden="true">' + TROFEO_SVG + '</div>' +
      '<div class="mw-fe-trophy mw-fe-trophy--2" aria-hidden="true">' + TROFEO_SVG + '</div>' +
      '<div class="mw-fe-frame" aria-hidden="true"><div class="mw-fe-frame__inner">' + FAMILIA_SVG + '</div></div>' +
      '<div class="mw-fe-shelf" aria-hidden="true"></div>' +
      htmlOcultar('mw-fe-hide', s);

    // Voces al otro lado de la pared (siguen aunque se voltee el marco)
    var texto = api.sequence(s.lines, [2200, 8000], 15000, 'voice');

    botonOcultar(api, api.content.querySelector('.mw-fe-hide'), 'Stand the frame up', function (oculto) {
      if (oculto) texto.final();
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
