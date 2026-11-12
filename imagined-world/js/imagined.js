/* =========================================================================
   IMAGINED WORLD · imagined.js
   Punto de entrada. Lee ?from=<scene>&motif=<motif>, elige la EXPERIENCIA
   del aparato con el que se entró y la monta a pantalla completa.
   Comunes a todas: el portal gris de vuelta a la realidad (parpadea e
   insiste cada vez más), el botón de sonido, los avisos breves y la
   tarjeta de inicio ("Play" / "Start", que también enciende el sonido).
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function valido(id) { return typeof id === 'string' && /^[a-z0-9-]+$/.test(id); }

  /* ---------- Avisos breves y tarjeta de inicio ---------- */
  var temporizadorAviso = null;

  IW.ui = {
    /** Texto breve abajo al centro. */
    toast: function (texto, ms) {
      var t = document.getElementById('iw-toast');
      if (!t || !texto) return;
      t.classList.remove('iw-toast--on');
      clearTimeout(temporizadorAviso);
      setTimeout(function () {
        t.textContent = texto;
        t.classList.add('iw-toast--on');
        temporizadorAviso = setTimeout(function () { t.classList.remove('iw-toast--on'); }, ms || 3200);
      }, 80);
    },

    /**
     * Antes había una tarjeta "Play" / "Start". Ya no: la experiencia
     * arranca sola al terminar la transición (la frase del goce se ve en la
     * transición). El sonido se enciende ya; si el navegador lo bloquea,
     * empieza con el primer toque o tecla (ver audio.js).
     * Se mantiene el nombre para que las experiencias no cambien.
     */
    startCard: function () {
      IW.audio.start();
      return new Promise(function (resolver) { setTimeout(resolver, reducido ? 0 : 350); });
    }
  };

  /* ---------- Portal a la realidad ---------- */
  var INSISTE_MAS = 20000;
  var INSISTE_MUCHO = 50000;

  function iniciarPortal(scene, url) {
    var portal = document.getElementById('iw-portal');
    var msg = document.getElementById('iw-portal-msg');
    portal.href = url;
    var mensajes = scene.reality && scene.reality.length ? scene.reality : ['Your room is still there.'];
    var i = 0;
    function siguiente() {
      msg.textContent = mensajes[i % mensajes.length];
      msg.classList.add('iw-portal__msg--on');
      i++;
      setTimeout(function () { msg.classList.remove('iw-portal__msg--on'); }, 3600);
    }
    setTimeout(function () { siguiente(); setInterval(siguiente, 6000); }, 4000);
    setTimeout(function () { portal.classList.add('iw-portal--louder'); }, INSISTE_MAS);
    setTimeout(function () { portal.classList.add('iw-portal--loudest'); }, INSISTE_MUCHO);
  }

  /* ---------- Inicio ---------- */
  function init() {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    var motif = params.get('motif');

    var elegida = IW.data.resolve(valido(from) ? from : null);
    var scene = elegida.data;
    if (!valido(motif) || (scene.motif && motif !== scene.motif)) motif = scene.motif;

    document.body.dataset.medium = scene.medium;
    document.body.dataset.scene = elegida.id || 'none';

    var urlRegreso = IW.data.RETURN_URL + (elegida.id ? '?return=' + encodeURIComponent(elegida.id) : '');
    IW.audio.init();
    iniciarPortal(scene, urlRegreso);

    // El aparato define la experiencia
    var experiencia = IW.experiences[scene.medium] || IW.experiences.feed;
    experiencia({
      scene: scene,
      sceneId: elegida.id,
      motifId: motif,
      root: document.getElementById('iw-stage'),
      reducido: reducido
    });

    // Llegada: el blanco de la transición se abre
    var flash = document.getElementById('iw-flash');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { flash.classList.add('iw-flash--gone'); });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
