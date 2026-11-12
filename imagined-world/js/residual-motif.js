/* =========================================================================
   IMAGINED WORLD · residual-motif.js
   El residuo: el motivo que llega desde la realidad (?motif=). Se usa el
   SVG ORIGINAL de muted-world/assets/motifs/ (no se duplica). Cada
   experiencia lo coloca dentro de sí; siempre en GRIS y nunca desaparece.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  function valido(id) { return typeof id === 'string' && /^[a-z0-9-]+$/.test(id); }

  /** Ruta del SVG del motivo (o null). */
  function src(id) { return valido(id) ? IW.data.MOTIF_PATH + id + '.svg' : null; }

  /** Imagen del motivo, lista para poner en una experiencia (o null). */
  function img(id, clase) {
    var s = src(id);
    if (!s) return null;
    var i = document.createElement('img');
    i.src = s;
    i.alt = '';
    i.draggable = false;
    i.className = 'iw-residue' + (clase ? ' ' + clase : '');
    // Si el SVG no existe, no se deja nada roto
    i.addEventListener('error', function () { i.remove(); });
    return i;
  }

  /**
   * Botón con el motivo: al tocarlo, la experiencia recuerda que sigue ahí.
   * (Para canvas, cada experiencia puede usar img() y dibujarlo.)
   */
  function button(id, texto, clase, descripcion) {
    var i = img(id);
    if (!i) return null;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'iw-residue-btn' + (clase ? ' ' + clase : '');
    b.setAttribute('aria-label', 'Something from your room: ' + (descripcion || id));
    b.appendChild(i);
    b.addEventListener('click', function () { if (texto) IW.ui.toast(texto); });
    return b;
  }

  IW.motif = { src: src, img: img, button: button };
})();
