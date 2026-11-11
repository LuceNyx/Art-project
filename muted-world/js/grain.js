/* =========================================================================
   MUTED WORLD · grain.js
   Genera UNA vez una textura de grano fino (canvas) y la aplica como
   fondo de .mw-grain. Se mueve muy lento con CSS (steps), así que no
   cuesta rendimiento. Intensidad: variable CSS --mw-grain-intensity.
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var TAMANO = 180; // píxeles de la textura (se repite en mosaico)

  function crearTextura() {
    var canvas = document.createElement('canvas');
    canvas.width = TAMANO;
    canvas.height = TAMANO;
    var ctx = canvas.getContext('2d');
    var datos = ctx.createImageData(TAMANO, TAMANO);
    var p = datos.data;

    for (var i = 0; i < p.length; i += 4) {
      var azar = Math.random();
      // Partículas pequeñas y diferenciadas: la mayoría de píxeles vacíos,
      // algunos claros y unos pocos muy brillantes.
      var alfa = 0;
      var valor = 255;
      if (azar > 0.985) { alfa = 255; }                 // motas brillantes
      else if (azar > 0.9) { alfa = 120; valor = 200; }  // grano medio
      else if (azar > 0.72) { alfa = 45; valor = 160; }  // grano fino
      p[i] = p[i + 1] = p[i + 2] = valor;
      p[i + 3] = alfa;
    }

    ctx.putImageData(datos, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function iniciar() {
    var capa = document.querySelector('.mw-grain');
    if (!capa) return;
    capa.style.setProperty('--mw-grain-image', 'url(' + crearTextura() + ')');
  }

  /** Cambia la intensidad del grano en vivo (0 a 0.4). */
  function setIntensity(valor) {
    document.documentElement.style.setProperty('--mw-grain-intensity', String(valor));
  }

  MW.grain = { init: iniciar, setIntensity: setIntensity };
})();
