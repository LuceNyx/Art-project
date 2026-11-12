/* =========================================================================
   IMAGINED WORLD · exp-sandbox.js
   CONSOLA PORTÁTIL → CONSTRUIR (Family expectations)
   Un mundo de bloques para hacer lo que quieras: elegir un color y pintar
   (clic o arrastrar). No hay instrucciones, ni metas, ni nota. Cada bloque
   suena. De vez en cuando el mundo responde: "Yours." "No one is grading
   this."
   Residuo: el marco boca abajo ocupa unos bloques en gris que no se
   pueden tapar.
   Teclado: flechas para mover el cursor, Espacio para poner, 1-9 colores.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var COLORES = [
    { name: 'grass', c: '#5bbf7a' }, { name: 'earth', c: '#a8744f' }, { name: 'stone', c: '#9aa3c4' },
    { name: 'water', c: '#5fb6e8' }, { name: 'sun', c: '#ffd36e' }, { name: 'rose', c: '#ff8fb8' },
    { name: 'violet', c: '#a98bff' }, { name: 'snow', c: '#f6f4ff' }, { name: 'erase', c: null }
  ];
  var NOTAS = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];
  var HITOS = { 8: 'Yours.', 25: 'No one is grading this.', 50: "It doesn't have to be anything.", 90: 'You built this.', 150: 'Keep going. Or stop. Both are fine.' };

  IW.experiences.sandbox = function (c) {
    c.root.innerHTML =
      '<div class="iw-sand">' +
        '<canvas class="iw-sand__canvas" aria-label="A world of blocks. Choose a color and paint."></canvas>' +
        '<p class="iw-sand__count">Blocks placed: <b id="iw-s-count">0</b></p>' +
        '<div class="iw-sand__palette" role="radiogroup" aria-label="Block colors" id="iw-s-palette"></div>' +
      '</div>';

    var root = c.root.querySelector('.iw-sand');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var paleta = root.querySelector('#iw-s-palette');
    var contador = root.querySelector('#iw-s-count');

    var W = 0, H = 0, CEL = 32, COLS = 0, FILAS = 0;
    var mundo = [];         // mundo[f][c] = color o null
    var bloqueado = {};     // celdas del residuo
    var colocados = 0;
    var actual = 0;
    var cursor = { c: 0, f: 0, visible: false };
    var pintando = false;
    var listo = false;

    // Residuo: el marco boca abajo (se dibuja en gris sobre sus celdas)
    var imgResiduo = IW.motif.img(c.motifId);

    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * d);
      canvas.height = Math.round(H * d);
      g.setTransform(d, 0, 0, d, 0, 0);
      CEL = Math.max(22, Math.round(Math.min(W, H) / 22));
      var nCols = Math.ceil(W / CEL), nFilas = Math.ceil(H / CEL);
      if (nCols !== COLS || nFilas !== FILAS) crearMundo(nCols, nFilas);
    }

    function crearMundo(nc, nf) {
      var viejo = mundo;
      COLS = nc;
      FILAS = nf;
      mundo = [];
      for (var f = 0; f < FILAS; f++) {
        mundo.push([]);
        for (var k = 0; k < COLS; k++) mundo[f].push(viejo[f] && viejo[f][k] !== undefined ? viejo[f][k] : null);
      }
      // Un poco de suelo para empezar
      if (!viejo.length) {
        for (var col = 0; col < COLS; col++) {
          mundo[FILAS - 1][col] = '#a8744f';
          mundo[FILAS - 2][col] = '#a8744f';
          mundo[FILAS - 3][col] = '#5bbf7a';
        }
      }
      // El residuo ocupa 4×2 celdas sobre el suelo, a la derecha
      bloqueado = {};
      var c0 = Math.max(1, COLS - 8), f0 = FILAS - 5;
      for (var df = 0; df < 2; df++) for (var dc = 0; dc < 4; dc++) bloqueado[(f0 + df) + ',' + (c0 + dc)] = true;
      bloqueado.zona = { c: c0, f: f0 };
    }

    window.addEventListener('resize', medir);
    medir();

    /* ---------- Paleta ---------- */
    COLORES.forEach(function (col, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'iw-sand__swatch' + (col.c ? '' : ' iw-sand__swatch--erase');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', col.name);
      b.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      if (col.c) b.style.setProperty('--c', col.c);
      b.innerHTML = '<kbd>' + (i + 1) + '</kbd>';
      b.addEventListener('click', function () { elegir(i); });
      paleta.appendChild(b);
    });

    function elegir(i) {
      actual = i;
      paleta.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
    }

    /* ---------- Pintar ---------- */
    function celdaDe(x, y) { return { c: Math.floor(x / CEL), f: Math.floor(y / CEL) }; }

    function poner(celda) {
      if (!listo || celda.f < 0 || celda.f >= FILAS || celda.c < 0 || celda.c >= COLS) return;
      if (bloqueado[celda.f + ',' + celda.c]) {
        IW.ui.toast(c.scene.residue, 2200);
        return;
      }
      var color = COLORES[actual].c;
      if (mundo[celda.f][celda.c] === color) return;
      mundo[celda.f][celda.c] = color;
      if (color) {
        colocados++;
        contador.textContent = colocados;
        IW.audio.tone({ f: NOTAS[(FILAS - celda.f) % NOTAS.length], dur: 0.5, type: 'triangle', vol: 0.06 });
        if (HITOS[colocados]) IW.ui.toast(HITOS[colocados]);
      } else {
        IW.audio.noise({ dur: 0.06, freq: 1200, vol: 0.05 });
      }
    }

    canvas.addEventListener('pointerdown', function (e) {
      pintando = true;
      canvas.setPointerCapture(e.pointerId);
      poner(celdaDe(e.clientX, e.clientY));
    });
    canvas.addEventListener('pointermove', function (e) {
      cursor = { c: Math.floor(e.clientX / CEL), f: Math.floor(e.clientY / CEL), visible: true };
      if (pintando) poner(celdaDe(e.clientX, e.clientY));
    });
    canvas.addEventListener('pointerup', function () { pintando = false; });
    canvas.addEventListener('pointerleave', function () { cursor.visible = false; });

    document.addEventListener('keydown', function (e) {
      if (!listo) return;
      var mov = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (mov) {
        e.preventDefault();
        cursor.c = Math.max(0, Math.min(COLS - 1, cursor.c + mov[0]));
        cursor.f = Math.max(0, Math.min(FILAS - 1, cursor.f + mov[1]));
        cursor.visible = true;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
        e.preventDefault();
        poner(cursor);
      }
      var n = Number(e.key);
      if (n >= 1 && n <= COLORES.length) elegir(n - 1);
    });

    /* ---------- Dibujo ---------- */
    function dibujar(t) {
      var cielo = g.createLinearGradient(0, 0, 0, H);
      cielo.addColorStop(0, '#6fa8ff');
      cielo.addColorStop(0.7, '#bfe0ff');
      cielo.addColorStop(1, '#ffe9cf');
      g.fillStyle = cielo;
      g.fillRect(0, 0, W, H);

      // Nubes de bloques que pasan
      g.fillStyle = 'rgba(255,255,255,.8)';
      for (var n = 0; n < 4; n++) {
        var nx = ((t * 0.01 + n * 400) % (W + 300)) - 150;
        var ny = CEL * (2 + n * 1.6);
        g.fillRect(nx, ny, CEL * 4, CEL);
        g.fillRect(nx + CEL, ny - CEL, CEL * 2, CEL);
      }

      for (var f = 0; f < FILAS; f++) {
        for (var k = 0; k < COLS; k++) {
          var col = mundo[f][k];
          if (!col) continue;
          var x = k * CEL, y = f * CEL;
          g.fillStyle = col;
          g.fillRect(x, y, CEL, CEL);
          // Relieve de bloque
          g.fillStyle = 'rgba(255,255,255,.22)';
          g.fillRect(x, y, CEL, 3);
          g.fillStyle = 'rgba(0,0,0,.16)';
          g.fillRect(x, y + CEL - 3, CEL, 3);
          g.fillRect(x + CEL - 2, y, 2, CEL);
        }
      }

      // El residuo: celdas grises con el marco boca abajo
      var z = bloqueado.zona;
      if (z) {
        g.fillStyle = '#8c8c8c';
        g.fillRect(z.c * CEL, z.f * CEL, CEL * 4, CEL * 2);
        g.fillStyle = 'rgba(0,0,0,.2)';
        g.fillRect(z.c * CEL, z.f * CEL + CEL * 2 - 3, CEL * 4, 3);
        if (imgResiduo && imgResiduo.complete && imgResiduo.naturalWidth) {
          g.save();
          g.filter = 'grayscale(1)';
          g.drawImage(imgResiduo, z.c * CEL, z.f * CEL - CEL * 0.5, CEL * 4, CEL * 3);
          g.restore();
        }
      }

      // Cursor
      if (cursor.visible && listo) {
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;
        g.setLineDash([4, 3]);
        g.strokeRect(cursor.c * CEL + 1, cursor.f * CEL + 1, CEL - 2, CEL - 2);
        g.setLineDash([]);
      }

      requestAnimationFrame(dibujar);
    }
    requestAnimationFrame(dibujar);

    IW.ui.startCard({
      kicker: 'New world',
      title: 'Build anything',
      sub: c.scene.pleasure,
      button: 'Start'
    }).then(function () {
      listo = true;
      cursor = { c: Math.floor(COLS / 2), f: FILAS - 4, visible: false };
      IW.audio.loop(72, function (k, t) {
        if (k % 32 === 0) {
          [261.63, 329.63, 392].forEach(function (f) { IW.audio.tone({ when: t, f: f, dur: 6, type: 'sine', vol: 0.025, attack: 1.5 }); });
        }
      });
      paleta.querySelector('button').focus({ preventScroll: true });
    });
  };
})();
