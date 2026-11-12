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

  /* ---------- Portal a la realidad ---------- */
  // La realidad insiste: el portal parpadea siempre, y con el tiempo más
  var INSISTE_MAS = 20000;     // ms
  var INSISTE_MUCHO = 50000;   // ms

  function iniciarPortal(scene, urlRegreso) {
    var portal = document.getElementById('iw-portal');
    var msg = document.getElementById('iw-portal-msg');
    if (!portal) return;
    portal.href = urlRegreso;

    // Mensajes del cuarto que se cuelan, uno tras otro
    var mensajes = scene.reality && scene.reality.length ? scene.reality : ['Your room is still there.'];
    var i = 0;
    function siguiente() {
      msg.textContent = mensajes[i % mensajes.length];
      msg.classList.add('iw-portal__msg--on');
      i++;
      setTimeout(function () { msg.classList.remove('iw-portal__msg--on'); }, 3600);
    }
    setTimeout(function () {
      siguiente();
      setInterval(siguiente, 6000);
    }, 4000);

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

    // Si el motivo no llega (o no coincide), se usa el de la situación
    if (!valido(motif) || (scene.motif && motif !== scene.motif)) motif = scene.motif;

    // Paleta de la situación
    var raiz = document.documentElement.style;
    raiz.setProperty('--iw-sky-top', scene.palette.skyTop);
    raiz.setProperty('--iw-sky-mid', scene.palette.skyMid);
    raiz.setProperty('--iw-horizon', scene.palette.horizon);
    raiz.setProperty('--iw-sun', scene.palette.sun);
    document.body.dataset.scene = elegida.id || 'none';

    // Textos de llegada: el goce (por qué se escapa) y la frase del mundo
    document.getElementById('iw-arrival').textContent = scene.arrival;
    document.getElementById('iw-kicker').textContent = scene.pleasure || 'You left the room.';
    document.body.dataset.medium = scene.medium || 'screen';

    // Salida: de vuelta a la misma situación del Muted World
    var urlRegreso = IW.data.RETURN_URL + (elegida.id ? '?return=' + encodeURIComponent(elegida.id) : '');
    document.getElementById('iw-return').href = urlRegreso;
    iniciarPortal(scene, urlRegreso);

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

    // Si se entró con el CELULAR, lo primero es el feed de videos cortos
    if (scene.medium === 'feed' && IW.reels) IW.reels.init(scene, motif);

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
