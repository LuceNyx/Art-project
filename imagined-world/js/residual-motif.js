/* =========================================================================
   IMAGINED WORLD · residual-motif.js
   El motivo que llega desde la realidad (?motif=). Se carga el SVG
   ORIGINAL de muted-world/assets/motifs/ (no se duplica ni se modifica).

   Transformación: aparece en las tres zonas (lejos al llegar, flotando
   en el Open World, reflejado en el agua del Quiet Edge) y es lo único
   que sigue en gris. Se puede tocar, pero no desaparece.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  // Solo se aceptan ids simples (letras minúsculas, números y guiones)
  function valido(id) { return typeof id === 'string' && /^[a-z0-9-]+$/.test(id); }

  function imagen(src, alt) {
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.decoding = 'async';
    img.draggable = false;
    return img;
  }

  /**
   * scene: datos de la situación · motifId: id recibido por la URL
   * Devuelve true si el motivo se colocó.
   */
  function init(scene, motifId) {
    if (!valido(motifId) || !scene.motifSpot) return false;

    var src = IW.data.MOTIF_PATH + motifId + '.svg';
    var colocados = [];

    // 1. Open World: el motivo, flotando, se puede tocar
    var spot = scene.motifSpot;
    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'iw-motif';
    boton.style.setProperty('--x', spot.x);
    boton.style.setProperty('--y', spot.y);
    boton.style.setProperty('--size', spot.size);
    boton.setAttribute('aria-label', 'Something from your room: ' + (scene.motifDescription || motifId));
    boton.appendChild(imagen(src));
    boton.addEventListener('click', function () {
      IW.ui.respond(scene.motifText || 'It came with you.');
      IW.audio.chime(0);
    });
    document.getElementById('iw-discoveries').appendChild(boton);
    colocados.push(boton);

    // 2. Llegada: un eco lejano
    var eco = document.createElement('div');
    eco.className = 'iw-motif-echo';
    eco.setAttribute('aria-hidden', 'true');
    eco.appendChild(imagen(src));
    document.getElementById('iw-threshold').appendChild(eco);
    colocados.push(eco);

    // 3. Quiet Edge: su reflejo en el agua
    var reflejo = document.getElementById('iw-reflection');
    if (reflejo) reflejo.appendChild(imagen(src));

    // Si el SVG no carga (id desconocido), no se deja nada roto
    boton.querySelector('img').addEventListener('error', function () {
      colocados.forEach(function (n) { n.remove(); });
      if (reflejo) reflejo.replaceChildren();
    });

    return true;
  }

  IW.motif = { init: init };
})();
