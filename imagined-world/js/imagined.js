/* =========================================================================
   IMAGINED WORLD · imagined.js
   Punto de entrada: lee ?from=<scene>&motif=<motif>, elige la situación,
   aplica su paleta y sus textos, y coordina los módulos.
   Recorrido: Arrival / The Threshold → The Open World → The Quiet Edge
   → regreso a ../muted-world/index.html?return=<scene>
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function valido(id) { return typeof id === 'string' && /^[a-z0-9-]+$/.test(id); }

  /* ---------- Respuestas del mundo (texto breve, abajo al centro) ---------- */
  var temporizadorRespuesta = null;
  IW.ui = {
    respond: function (texto) {
      var r = document.getElementById('iw-response');
      if (!r || !texto) return;
      r.classList.remove('iw-response--on');
      clearTimeout(temporizadorRespuesta);
      // Pequeña pausa para que el cambio de texto se note
      setTimeout(function () {
        r.textContent = texto;
        r.classList.add('iw-response--on');
        temporizadorRespuesta = setTimeout(function () { r.classList.remove('iw-response--on'); }, 4200);
      }, 120);
    }
  };

  /* ---------- The Quiet Edge: líneas lentas y la salida ---------- */
  var bordeMostrado = false;

  function mostrarBorde(scene) {
    if (bordeMostrado) return;
    bordeMostrado = true;
    var cont = document.getElementById('iw-edge-lines');
    var acciones = document.getElementById('iw-edge-actions');
    var pausa = reducido ? 0 : 2600;

    scene.edge.forEach(function (linea, i) {
      setTimeout(function () {
        var p = document.createElement('p');
        p.className = 'iw-edge-line';
        p.textContent = linea;
        cont.appendChild(p);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { p.classList.add('iw-edge-line--on'); });
        });
      }, 600 + i * pausa);
    });

    setTimeout(function () { acciones.hidden = false; }, 600 + scene.edge.length * pausa);
  }

  /* ---------- Inicio ---------- */
  function init() {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    var motif = params.get('motif');

    var elegida = IW.data.resolve(valido(from) ? from : null);
    var scene = elegida.data;

    // Si el motivo no llega (o no coincide), se usa el de la situación
    if (!valido(motif) || (scene.motif && motif !== scene.motif)) motif = scene.motif;

    // Paleta de la situación
    var raiz = document.documentElement.style;
    raiz.setProperty('--iw-sky-top', scene.palette.skyTop);
    raiz.setProperty('--iw-sky-mid', scene.palette.skyMid);
    raiz.setProperty('--iw-horizon', scene.palette.horizon);
    raiz.setProperty('--iw-sun', scene.palette.sun);
    document.body.dataset.scene = elegida.id || 'none';

    // Textos de llegada
    document.getElementById('iw-arrival').textContent = scene.arrival;
    if (!elegida.id) document.getElementById('iw-kicker').textContent = 'You are somewhere else.';

    // Salida: de vuelta a la misma situación del Muted World
    document.getElementById('iw-return').href = IW.data.RETURN_URL + (elegida.id ? '?return=' + encodeURIComponent(elegida.id) : '');

    IW.audio.init();
    IW.world.init(
      scene,
      function (zona) { if (zona === 'iw-edge') mostrarBorde(scene); },
      function () {
        document.body.classList.add('iw-all-found');
        IW.ui.respond(scene.afterAll);
      }
    );
    IW.motif.init(scene, motif);

    // "Step in": sonido (si se permite) y entrada al Open World
    document.getElementById('iw-step').addEventListener('click', function () {
      IW.audio.startIfAllowed();
      IW.world.goToZone('iw-open');
    });

    // "Stay a little longer": volver a explorar (seguir escapando)
    document.getElementById('iw-stay').addEventListener('click', function () {
      IW.world.goToZone('iw-open');
    });

    // Llegada: el blanco de la salida del Muted World se abre en color
    var flash = document.getElementById('iw-flash');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { flash.classList.add('iw-flash--gone'); });
    });

    document.getElementById('iw-step').focus({ preventScroll: true });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
