/* =========================================================================
   IMAGINED WORLD · world-interactions.js
   Exploración y descubrimiento:
   - Recorrido horizontal (rueda, arrastre táctil, flechas, botones de zona)
     con parallax en las capas del paisaje.
   - Partículas, estrellas y hierba (ambiente sutil).
   - Elementos interactivos del Open World: siete tipos, uno por situación.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = {};

  function azar(a, b) { return a + Math.random() * (b - a); }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* =======================================================================
     RECORRIDO Y PARALLAX
     ======================================================================= */
  var capas = [];
  var pendiente = false;

  function ajustarCapas() {
    var max = el.world.scrollWidth - el.world.clientWidth;
    capas.forEach(function (c) {
      // Cada capa es tan ancha como necesita para no dejar huecos
      c.el.style.width = (window.innerWidth + max * c.depth + 2) + 'px';
    });
    moverCapas();
  }

  function moverCapas() {
    pendiente = false;
    var x = el.world.scrollLeft;
    capas.forEach(function (c) {
      c.el.style.transform = 'translate3d(' + (-x * c.depth).toFixed(1) + 'px,0,0)';
    });
  }

  function alDesplazar() {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(moverCapas);
    }
  }

  /** La rueda vertical avanza en horizontal. */
  function alRueda(e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.world.scrollLeft += e.deltaY;
    e.preventDefault();
  }

  /** Flechas del teclado: avanzar y retroceder. */
  function alTeclado(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var paso = window.innerWidth * 0.4;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { irA(el.world.scrollLeft + paso); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { irA(el.world.scrollLeft - paso); e.preventDefault(); }
  }

  function irA(x) {
    el.world.scrollTo({ left: x, behavior: reducido ? 'auto' : 'smooth' });
  }

  /** Lleva la vista a una zona (id de la sección). */
  function goToZone(id) {
    var zona = document.getElementById(id);
    if (!zona) return;
    var destino = zona.offsetLeft;
    // En el Open World se centra un poco más adentro
    if (id === 'iw-open') destino += Math.min(window.innerWidth * 0.1, zona.offsetWidth * 0.05);
    irA(destino);
  }

  /** Al enfocar algo con Tab, se desplaza para que quede a la vista. */
  function alEnfocar(e) {
    var t = e.target;
    if (!el.world.contains(t)) return;
    var caja = t.getBoundingClientRect();
    var margen = window.innerWidth * 0.18;
    if (caja.left < margen || caja.right > window.innerWidth - margen) {
      irA(el.world.scrollLeft + caja.left - window.innerWidth / 2 + caja.width / 2);
    }
  }

  /** Zona visible: actualiza los botones de zona y avisa a imagined.js. */
  function observarZonas(alCambiar) {
    var botones = document.querySelectorAll('.iw-zones button');
    botones.forEach(function (b) {
      b.addEventListener('click', function () { goToZone(b.dataset.zone); });
    });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        document.body.dataset.zone = id;
        botones.forEach(function (b) { b.setAttribute('aria-current', b.dataset.zone === id ? 'true' : 'false'); });
        if (alCambiar) alCambiar(id);
      });
    }, { root: el.world, rootMargin: '0px -50% 0px -50%' });

    document.querySelectorAll('.iw-zone').forEach(function (z) { obs.observe(z); });
  }

  /* =======================================================================
     AMBIENTE: estrellas, hierba y partículas
     ======================================================================= */
  function crearEstrellas() {
    var html = '';
    for (var i = 0; i < 46; i++) {
      html += '<span class="iw-star" style="left:' + azar(0, 100).toFixed(1) + '%;top:' + azar(0, 100).toFixed(1) +
        '%;--d:' + azar(3, 7).toFixed(1) + 's;--del:-' + azar(0, 7).toFixed(1) + 's"></span>';
    }
    document.getElementById('iw-stars').innerHTML = html;
  }

  function crearHierba() {
    var cont = document.getElementById('iw-grass');
    var html = '';
    var n = window.innerWidth < 640 ? 70 : 120;
    for (var i = 0; i < n; i++) {
      html += '<span class="iw-blade" style="left:' + azar(0, 100).toFixed(2) + '%;--b:' + azar(6, 70).toFixed(0) +
        ';--h:' + azar(2, 5.5).toFixed(1) + ';--d:' + azar(2.6, 5).toFixed(1) + 's;--del:-' + azar(0, 5).toFixed(1) + 's"></span>';
    }
    cont.innerHTML = html;
  }

  var COLORES = ['255,236,200', '190,240,226', '240,214,255', '255,214,200'];
  var particulas = [];
  var pctx = null;
  var forma = 'screen';   // forma de escapismo: cambia la silueta de algunas partículas

  /*
   * El goce, en el aire: una de cada tres partículas tiene la forma del
   * escapismo de la situación (notas, corazones, píxeles, marcos…).
   */
  function figura(x, y, r, color, alfa) {
    var s = r * 3.2;
    pctx.fillStyle = 'rgba(' + color + ',' + alfa + ')';
    pctx.strokeStyle = 'rgba(' + color + ',' + alfa + ')';
    pctx.lineWidth = Math.max(1, r * 0.5);
    pctx.beginPath();
    if (forma === 'music') {
      // Nota musical
      pctx.ellipse(x, y, s * 0.42, s * 0.32, -0.4, 0, 6.29);
      pctx.fill();
      pctx.fillRect(x + s * 0.3, y - s * 1.4, Math.max(1.2, r * 0.45), s * 1.4);
      return;
    }
    if (forma === 'feed') {
      // Corazón
      pctx.moveTo(x, y + s * 0.5);
      pctx.bezierCurveTo(x - s, y - s * 0.2, x - s * 0.4, y - s, x, y - s * 0.35);
      pctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.2, x, y + s * 0.5);
      pctx.fill();
      return;
    }
    if (forma === 'sandbox') { pctx.fillRect(x - s / 2, y - s / 2, s, s); return; }
    if (forma === 'online') { pctx.arc(x, y, s * 0.5, 0, 6.29); pctx.stroke(); return; }
    if (forma === 'video') { pctx.strokeRect(x - s * 0.6, y - s * 0.38, s * 1.2, s * 0.76); return; }
    if (forma === 'choice') {
      pctx.moveTo(x, y - s * 0.6); pctx.lineTo(x + s * 0.45, y); pctx.lineTo(x, y + s * 0.6); pctx.lineTo(x - s * 0.45, y);
      pctx.fill();
      return;
    }
    if (forma === 'vr') {
      // Destello de cuatro puntas
      pctx.moveTo(x, y - s * 0.7); pctx.lineTo(x + s * 0.15, y - s * 0.15); pctx.lineTo(x + s * 0.7, y);
      pctx.lineTo(x + s * 0.15, y + s * 0.15); pctx.lineTo(x, y + s * 0.7); pctx.lineTo(x - s * 0.15, y + s * 0.15);
      pctx.lineTo(x - s * 0.7, y); pctx.lineTo(x - s * 0.15, y - s * 0.15);
      pctx.fill();
      return;
    }
    pctx.arc(x, y, r, 0, 6.29);
    pctx.fill();
  }

  function iniciarParticulas() {
    var c = document.getElementById('iw-particles');
    pctx = c.getContext('2d');

    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 1.5);
      c.width = Math.round(window.innerWidth * d);
      c.height = Math.round(window.innerHeight * d);
      pctx.setTransform(d, 0, 0, d, 0, 0);
      var n = Math.round(Math.min(70, window.innerWidth / 18));
      particulas = [];
      for (var i = 0; i < n; i++) {
        particulas.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: azar(0.8, 2.4),
          vx: azar(-0.12, 0.12),
          vy: azar(-0.3, -0.05),
          f: Math.random() * 6.28,
          c: COLORES[i % COLORES.length]
        });
      }
      dibujar(0);
    }

    function dibujar(t) {
      pctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < particulas.length; i++) {
        var p = particulas[i];
        if (!reducido) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
          if (p.x < -10) p.x = window.innerWidth + 10;
          if (p.x > window.innerWidth + 10) p.x = -10;
        }
        var a = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.0008 + p.f));
        if (i % 3 === 0 && forma !== 'screen') {
          figura(p.x, p.y, p.r, p.c, (a * 1.2).toFixed(2));
          continue;
        }
        var g = pctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(' + p.c + ',' + a.toFixed(2) + ')');
        g.addColorStop(1, 'rgba(' + p.c + ',0)');
        pctx.fillStyle = g;
        pctx.fillRect(p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      }
    }

    function bucle(t) {
      if (!document.hidden) dibujar(t);
      requestAnimationFrame(bucle);
    }

    window.addEventListener('resize', medir);
    medir();
    if (!reducido) requestAnimationFrame(bucle);
  }

  /* =======================================================================
     DESCUBRIMIENTOS: un tipo por situación
     Cada tipo define: html (contenido del botón), extras (decorado de la
     zona) y activar (qué cambia en el mundo al descubrirlo).
     ======================================================================= */
  var KINDS = {};

  /* ----- Farolillos: tareas pequeñas que se cumplen y suben al cielo ----- */
  KINDS.lantern = {
    html: function (d) {
      return '<span class="iw-lantern__body"></span>' +
        (d.text ? '<span class="iw-disc__label">' + esc(d.text) + '</span>' : '');
    },
    activar: function (boton) {
      boton.classList.add('iw-rise');
      // Cuando termina de subir, queda una estrella cálida en el cielo
      setTimeout(function () {
        var s = document.createElement('span');
        s.className = 'iw-star iw-star--lantern';
        s.style.left = azar(20, 80).toFixed(1) + '%';
        s.style.top = azar(10, 60).toFixed(1) + '%';
        document.getElementById('iw-stars').appendChild(s);
      }, reducido ? 0 : 7000);
    }
  };

  /* ----- Luciérnagas: presencias que se quedan contigo ----- */
  var acompanantes = [];
  var puntero = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 };

  function moverAcompanantes(t) {
    acompanantes.forEach(function (a, i) {
      var ang = t * 0.0006 + i * 1.6;
      var tx = puntero.x + Math.cos(ang) * (46 + i * 12);
      var ty = puntero.y + Math.sin(ang) * (30 + i * 8) - 30;
      a.x += (tx - a.x) * (reducido ? 1 : 0.04);
      a.y += (ty - a.y) * (reducido ? 1 : 0.04);
      a.el.style.transform = 'translate3d(' + (a.x - 9).toFixed(1) + 'px,' + (a.y - 9).toFixed(1) + 'px,0)';
    });
    if (acompanantes.length && !reducido) requestAnimationFrame(moverAcompanantes);
  }

  KINDS.firefly = {
    html: function () { return '<span class="iw-firefly__core"></span>'; },
    activar: function (boton) {
      var caja = boton.getBoundingClientRect();
      var a = document.createElement('span');
      a.className = 'iw-companion';
      a.setAttribute('aria-hidden', 'true');
      document.body.appendChild(a);
      acompanantes.push({ el: a, x: caja.left + caja.width / 2, y: caja.top + caja.height / 2 });

      if (acompanantes.length === 1) {
        // Siguen al cursor (o al último toque en pantallas táctiles)
        var seguir = function (e) {
          puntero.x = e.clientX;
          puntero.y = e.clientY;
          if (reducido) moverAcompanantes(0);
        };
        window.addEventListener('pointermove', seguir, { passive: true });
        window.addEventListener('pointerdown', seguir, { passive: true });
        if (!reducido) requestAnimationFrame(moverAcompanantes);
      }
      if (reducido) moverAcompanantes(0);
    }
  };

  /* ----- Piedras: se ordenan junto al estanque, una a una ----- */
  var piedrasColocadas = 0;
  KINDS.stone = {
    extras: function () { return '<span class="iw-pond"></span>'; },
    html: function () { return '<span class="iw-stone__body"></span>'; },
    preparar: function (boton) { boton.style.setProperty('--rot', azar(-40, 40).toFixed(0) + 'deg'); },
    activar: function (boton) {
      // Fila ordenada en la orilla del estanque
      boton.style.left = (41 + piedrasColocadas * 6) + '%';
      boton.style.top = '78%';
      piedrasColocadas++;
    }
  };

  /* ----- Palancas: cada una coloca una tabla del puente hacia la isla ----- */
  KINDS.lever = {
    extras: function (scene) {
      var tablas = '';
      scene.discoveries.forEach(function (d, i) {
        tablas += '<span class="iw-plank" data-plank="' + i + '" style="--px:' + (47 + i * 8) + '"></span>';
      });
      return '<span class="iw-stream"></span>' + tablas + '<span class="iw-island"><span class="iw-island__tree"></span></span>';
    },
    html: function () { return '<span class="iw-lever__base"></span><span class="iw-lever__arm"></span>'; },
    activar: function (boton, d, i) {
      var tabla = el.extras.querySelector('[data-plank="' + i + '"]');
      if (tabla) tabla.classList.add('iw-plank--set');
    }
  };

  /* ----- Flores: cada una abre distinta; ninguna es "mejor" ----- */
  var TONOS_FLOR = ['#ffb3c7', '#ffd59a', '#a8e6d8', '#c9b3ff', '#ffc9a8', '#b3d9ff'];
  function flor(i) {
    var petalos = 5 + (i * 2) % 5;
    var color = TONOS_FLOR[i % TONOS_FLOR.length];
    var forma = '';
    for (var k = 0; k < petalos; k++) {
      forma += '<ellipse cx="50" cy="26" rx="' + (9 + (i % 3) * 3) + '" ry="22" fill="' + color +
        '" opacity=".9" transform="rotate(' + (360 / petalos * k) + ' 50 50)"/>';
    }
    return '<svg class="iw-flower__bloom" viewBox="0 0 100 100" aria-hidden="true">' + forma +
      '<circle cx="50" cy="50" r="10" fill="#fff4cc"/></svg>';
  }

  KINDS.flower = {
    html: function (d, i) {
      return '<span class="iw-flower__stem"></span><span class="iw-flower__bud"></span>' + flor(i);
    },
    activar: function () { /* el CSS abre la flor */ }
  };

  /* ----- Caminos: varios hacia el horizonte; todos se pueden encender ----- */
  KINDS.path = {
    extras: function (scene) {
      return scene.discoveries.map(function (d, i) {
        return '<span class="iw-path" data-path="' + i + '" style="--bx:' + d.x + '"></span>';
      }).join('');
    },
    html: function (d) { return '<span class="iw-disc__label">' + esc(d.label.replace('A path ', '')) + '</span>'; },
    preparar: function (boton) { boton.style.setProperty('--y', 90); },
    activar: function (boton, d, i) {
      var camino = el.extras.querySelector('[data-path="' + i + '"]');
      if (camino) camino.classList.add('iw-path--lit');
    }
  };

  /* ----- Bloques: construir algo propio, sin instrucciones ----- */
  var COLORES_BLOQUE = ['#ffc9a8', '#a8e6d8', '#c9b3ff', '#ffe3a1'];
  KINDS.block = {
    extras: function () { return '<span class="iw-build" id="iw-build"></span>'; },
    html: function (d, i) {
      return '<span class="iw-block iw-block--' + esc(d.text) + '" style="--c:' + COLORES_BLOQUE[i % 4] + '"></span>';
    },
    activar: function (boton, d, i) {
      var pieza = document.createElement('span');
      pieza.className = 'iw-placed iw-block--' + d.text;
      pieza.style.setProperty('--c', COLORES_BLOQUE[i % 4]);
      pieza.style.setProperty('--rot', azar(-6, 6).toFixed(1) + 'deg');
      document.getElementById('iw-build').appendChild(pieza);
    }
  };

  /* ----- Motor común ----- */
  function crearDescubrimientos(scene, alTerminar) {
    var tipo = KINDS[scene.kind] || KINDS.lantern;
    if (tipo.extras) el.extras.innerHTML = tipo.extras(scene);

    var encontrados = 0;
    scene.discoveries.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'iw-disc iw-disc--' + scene.kind;
      b.style.setProperty('--x', d.x);
      b.style.setProperty('--y', d.y);
      b.setAttribute('aria-label', d.label);
      b.innerHTML = tipo.html(d, i);
      if (tipo.preparar) tipo.preparar(b, d, i);

      b.addEventListener('click', function () {
        if (b.classList.contains('iw-found')) {
          IW.ui.respond(d.response);
          return;
        }
        b.classList.add('iw-found');
        b.setAttribute('aria-label', d.label + ' (found)');
        tipo.activar(b, d, i);
        IW.ui.respond(d.response);
        IW.audio.chime(i + 1);
        encontrados++;
        if (encontrados === scene.discoveries.length && alTerminar) {
          setTimeout(alTerminar, reducido ? 0 : 3200);
        }
      });

      el.discoveries.appendChild(b);
    });
  }

  /* =======================================================================
     Inicio
     ======================================================================= */
  function init(scene, alCambiarZona, alTerminar) {
    el.world = document.getElementById('iw-world');
    el.discoveries = document.getElementById('iw-discoveries');
    el.extras = document.getElementById('iw-extras');

    document.querySelectorAll('.iw-layer').forEach(function (c) {
      capas.push({ el: c, depth: parseFloat(c.dataset.depth) || 0 });
    });

    forma = scene.medium || 'screen';
    crearEstrellas();
    crearHierba();
    iniciarParticulas();
    crearDescubrimientos(scene, alTerminar);
    observarZonas(alCambiarZona);

    el.world.addEventListener('scroll', alDesplazar, { passive: true });
    el.world.addEventListener('wheel', alRueda, { passive: false });
    document.addEventListener('keydown', alTeclado);
    document.addEventListener('focusin', alEnfocar);
    window.addEventListener('resize', ajustarCapas);
    ajustarCapas();
  }

  IW.world = { init: init, goToZone: goToZone };
})();
