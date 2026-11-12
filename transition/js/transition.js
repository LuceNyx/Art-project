/* =========================================================================
   TRANSICIÓN DINÁMICA · transition.js
   1. Lee ?from=<scene>&motif=<motif> (ids de muted-world/js/config.js).
   2. Elige la FORMA DE ESCAPISMO de esa situación y arma su escena.
   3. La escena empieza en gris (aún es la realidad) y el color la invade:
      la animación es CSS (transition.css); aquí solo se arma y se cronometra.
   4. Al terminar (o con "Skip"), un blanco lleno de luz entrega al
      visitante al Imagined World con los mismos datos.
   Todo vive dentro de window.Transition.
   ========================================================================= */

(function () {
  'use strict';

  var TR = (window.Transition = window.Transition || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NEXT_URL = '../imagined-world/index.html';

  var DURACION = 7200;     // ms hasta el blanco final
  var SALIDA = 1100;       // ms del blanco antes de navegar

  /*
   * Situación → forma de escapismo (según su objeto de escape en el Muted World)
   *   motif: el motivo esperado (si llega otro, se corrige)
   *   lines: dos frases breves (inglés)
   */
  var MEDIOS = {
    'academic-pressure':   { medium: 'video',   motif: 'stacked-paper',     lines: ['Just one more.', 'The next episode starts on its own.'] },
    'loneliness':          { medium: 'online',  motif: 'unanswered-bubble', lines: ['They were waiting for you.', 'Your friends are online.'] },
    'emotional-overload':  { medium: 'music',   motif: 'pinned-note',       lines: ['Turn it up.', 'The music is louder than the room.'] },
    'lack-of-control':     { medium: 'choice',  motif: 'stopped-clock',     lines: ['Press start.', 'Here, every choice works.'] },
    'social-comparison':   { medium: 'feed',    motif: 'blank-polaroid',    lines: ['One more.', 'The feed never ends.'] },
    'uncertain-future':    { medium: 'vr',      motif: 'lit-window',        lines: ['Somewhere else.', 'Here, the world has a map.'] },
    'family-expectations': { medium: 'sandbox', motif: 'facedown-frame',    lines: ['Build anything.', 'In this world, you build the rules.'] }
  };

  var POR_DEFECTO = { medium: 'screen', motif: null, lines: ['Somewhere else.', 'Anywhere but here.'] };

  function repetir(n, fn) {
    var html = '';
    for (var i = 0; i < n; i++) html += fn(i);
    return html;
  }

  /* =======================================================================
     ESCENAS: una plantilla por forma de escapismo
     ======================================================================= */
  var ESCENAS = {

    /* Series y videos: el portátil se abre, el siguiente capítulo empieza solo */
    video: function () {
      return '<div class="tr-laptop">' +
          '<div class="tr-laptop__screen">' +
            '<span class="tr-play"></span>' +
            '<div class="tr-thumbs">' + repetir(14, function (i) {
              return '<span style="--h:' + (i * 47 % 360) + '"></span>';
            }) + '</div>' +
            '<div class="tr-bar"><span></span></div>' +
            '<p class="tr-next">Next episode in <b class="tr-count">5</b></p>' +
          '</div>' +
          '<div class="tr-laptop__base"></div>' +
        '</div>';
    },

    /* Juego en línea: alguien se conecta, luego todos */
    online: function () {
      var saludos = ['hey!', "you're here", 'join us', 'gg', 'finally'];
      return '<div class="tr-online">' +
          '<span class="tr-online__ring"></span>' +
          '<span class="tr-online__core"></span>' +
          '<p class="tr-online__status" id="tr-status">Connecting…</p>' +
          repetir(5, function (i) {
            return '<span class="tr-avatar" style="--a:' + (-150 + i * 30) + 'deg;--h:' + (160 + i * 45) +
              ';--d:' + (2.6 + i * 0.35).toFixed(2) + 's"><i>' + saludos[i] + '</i></span>';
          }) +
        '</div>';
    },

    /* Música: las notas grises salen volando con las ondas */
    music: function () {
      return '<div class="tr-music">' +
          repetir(5, function (i) {
            return '<span class="tr-paper" style="--x:' + (-36 + i * 18) + 'vmin;--y:' + (i % 2 ? -18 : 14) +
              'vmin;--r:' + (i * 23 % 40 - 20) + 'deg;--d:' + (1.2 + i * 0.15).toFixed(2) + 's"></span>';
          }) +
          repetir(5, function (i) { return '<span class="tr-wave" style="--d:' + (0.9 + i * 0.55).toFixed(2) + 's"></span>'; }) +
          '<svg class="tr-headphones" viewBox="0 0 200 170" aria-hidden="true">' +
            '<path d="M30 110 Q30 22 100 22 Q170 22 170 110" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>' +
            '<rect x="14" y="96" width="42" height="66" rx="18" fill="currentColor"/>' +
            '<rect x="144" y="96" width="42" height="66" rx="18" fill="currentColor"/>' +
          '</svg>' +
          '<div class="tr-eq">' + repetir(22, function (i) {
            return '<span style="--d:' + (0.35 + (i * 37 % 50) / 100).toFixed(2) + 's;--h:' + (180 + i * 9) + '"></span>';
          }) + '</div>' +
        '</div>';
    },

    /* Decisiones: la computadora se enciende en un mapa de rutas */
    choice: function () {
      return '<div class="tr-choice">' +
          '<span class="tr-choice__screen"></span>' +
          '<svg class="tr-choice__map" viewBox="0 0 400 300" aria-hidden="true">' +
            '<path class="tr-route" style="--d:2.2s" d="M200 290 C200 230 200 210 200 180"/>' +
            '<path class="tr-route" style="--d:2.9s" d="M200 180 C170 150 120 140 90 100"/>' +
            '<path class="tr-route" style="--d:3.2s" d="M200 180 C200 140 200 110 200 70"/>' +
            '<path class="tr-route" style="--d:3.5s" d="M200 180 C230 150 280 140 310 100"/>' +
            '<path class="tr-route" style="--d:4.1s" d="M90 100 C70 70 60 50 50 20 M200 70 C210 50 220 30 230 10 M310 100 C330 70 350 50 360 20"/>' +
            '<circle class="tr-node" style="--d:2.7s" cx="200" cy="180" r="9"/>' +
            '<circle class="tr-node" style="--d:3.6s" cx="90" cy="100" r="8"/>' +
            '<circle class="tr-node" style="--d:3.8s" cx="200" cy="70" r="8"/>' +
            '<circle class="tr-node" style="--d:4.0s" cx="310" cy="100" r="8"/>' +
          '</svg>' +
        '</div>';
    },

    /* Reels: el celular se enciende y el feed no termina */
    feed: function () {
      var tarjetas = repetir(16, function (i) {
        return '<span class="tr-card" style="--h:' + (i * 61 % 360) + '"><i></i></span>';
      });
      return '<div class="tr-feed">' +
          '<div class="tr-phone"><div class="tr-feed__col">' + tarjetas + tarjetas + '</div></div>' +
          repetir(9, function (i) {
            return '<span class="tr-heart" style="--x:' + (14 + i * 2.4).toFixed(1) + 'vmin;--d:' + (2.2 + i * 0.42).toFixed(2) + 's"></span>';
          }) +
        '</div>';
    },

    /* Realidad virtual: te pones los lentes y ves a través de ellos */
    vr: function () {
      return '<div class="tr-vr">' +
          '<span class="tr-vr__headset"><i></i><i></i></span>' +
          '<div class="tr-vr__lenses">' +
            '<span class="tr-vr__lens"><span class="tr-vr__view"></span></span>' +
            '<span class="tr-vr__lens"><span class="tr-vr__view"></span></span>' +
          '</div>' +
          '<p class="tr-vr__label">Loading world…</p>' +
        '</div>';
    },

    /* Construir: la consola portátil arma un mundo de bloques */
    sandbox: function () {
      var COLS = 12;
      var FILAS = 8;
      var pixeles = repetir(COLS * FILAS, function (i) {
        var fila = Math.floor(i / COLS);
        var col = i % COLS;
        var tono;
        if (fila === 1 && (col === 8 || col === 9)) tono = '48, 95%, 72%';         // sol
        else if (fila < 5) tono = (205 + fila * 6) + ', 70%, ' + (62 + fila * 4) + '%'; // cielo
        else if (fila === 5) tono = '135, 45%, 52%';                                // hierba
        else tono = '28, 40%, ' + (44 - (fila - 6) * 6) + '%';                       // tierra
        var retraso = 1.9 + (FILAS - 1 - fila) * 0.22 + col * 0.03;
        return '<span style="--c:hsl(' + tono + ');--d:' + retraso.toFixed(2) + 's"></span>';
      });
      return '<div class="tr-sandbox">' +
          '<div class="tr-handheld">' +
            '<span class="tr-handheld__pad tr-handheld__pad--l"></span>' +
            '<div class="tr-handheld__screen"><div class="tr-pixels">' + pixeles + '</div></div>' +
            '<span class="tr-handheld__pad tr-handheld__pad--r"></span>' +
          '</div>' +
          '<p class="tr-sandbox__title">New world</p>' +
        '</div>';
    },

    /* Sin situación: una pantalla cualquiera */
    screen: function () {
      return '<div class="tr-screen"><span class="tr-screen__glow"></span></div>';
    }
  };

  /* =======================================================================
     Cronología
     ======================================================================= */
  var saliendo = false;
  var destino = NEXT_URL;

  function salir() {
    if (saliendo) return;
    saliendo = true;
    document.getElementById('tr-burst').classList.add('tr-burst--on');
    setTimeout(function () { window.location.href = destino; }, reducido ? 300 : SALIDA);
  }

  function frase(texto) {
    var cont = document.getElementById('tr-caption');
    var p = document.createElement('p');
    p.className = 'tr-line';
    p.textContent = texto;
    cont.appendChild(p);
  }

  /** Pequeños cambios de texto dentro de algunas escenas. */
  function detalles(medio) {
    if (medio === 'video') {
      var cuenta = document.querySelector('.tr-count');
      [4, 3, 2, 1].forEach(function (n, i) {
        setTimeout(function () { if (cuenta) cuenta.textContent = n; }, 3200 + i * 600);
      });
    }
    if (medio === 'online') {
      var estado = document.getElementById('tr-status');
      setTimeout(function () { if (estado) estado.textContent = '1 friend online'; }, 2500);
      setTimeout(function () { if (estado) estado.textContent = '5 friends online'; }, 4000);
    }
    if (medio === 'vr') {
      var etiqueta = document.querySelector('.tr-vr__label');
      setTimeout(function () { if (etiqueta) etiqueta.textContent = 'Welcome.'; }, 4300);
    }
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    var valido = /^[a-z0-9-]+$/.test(from || '') && Object.prototype.hasOwnProperty.call(MEDIOS, from);
    var datos = valido ? MEDIOS[from] : POR_DEFECTO;

    if (valido) {
      destino = NEXT_URL + '?from=' + encodeURIComponent(from) + '&motif=' + encodeURIComponent(datos.motif);
    }

    document.body.dataset.medium = datos.medium;
    document.getElementById('tr-scene').innerHTML = ESCENAS[datos.medium]();

    // Las frases aparecen con su propio retraso (CSS); aquí solo se colocan
    datos.lines.forEach(frase);

    if (reducido) {
      // Sin animación: un momento quieto ya en color y luego se pasa
      document.body.classList.add('tr-static');
      setTimeout(salir, 2600);
    } else {
      detalles(datos.medium);
      setTimeout(salir, DURACION);
    }

    // Saltar: botón, Enter, Espacio o Escape
    var saltar = document.getElementById('tr-skip');
    saltar.addEventListener('click', salir);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        salir();
      }
    });

    // Si se vuelve con el botón "atrás", no se queda en blanco
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) window.location.reload();
    });
  }

  TR.media = MEDIOS;
  document.addEventListener('DOMContentLoaded', init);
})();
