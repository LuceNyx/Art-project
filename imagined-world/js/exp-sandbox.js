/* =========================================================================
   IMAGINED WORLD · exp-sandbox.js
   CONSOLA PORTÁTIL → MINI PLATAFORMERO (Family expectations)
   Un nivel corto de plataformas con cámara lateral. El personaje es
   ORIGINAL (pixel art dibujado en código): gorra y overoles rojos, camisa
   blanca. No copia el sprite ni el diseño de ningún juego.
   Corre, salta, golpea bloques ✦ desde abajo. Sin puntaje y sin game over:
   si cae, reaparece. Al llegar a la bandera, vuelve a empezar.
   Residuo: bloques grises con el marco boca abajo; son parte del camino y
   no se pueden quitar ni tapar.
   Controles: flechas / A D + Espacio / W / ↑, y botones táctiles.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var FILAS = 14;
  var COLS = 132;

  /* ---------- El personaje (12×16 px). Diseño propio ---------- */
  var PALETA = {
    R: '#e0453c', r: '#a8302a', S: '#f2c29b', H: '#5a3a22', W: '#f6f2ea', w: '#cfc8bb',
    B: '#ffd36e', K: '#3a2a24', E: '#1c1c22'
  };
  var CUERPO = [
    '....RRRRR...',
    '...RRRRRRR..',
    '...RRRRRRRRR',
    '...HHSSSE...',
    '..HSSSSSSS..',
    '...SSSSSS...',
    '....SSSS....',
    '...WRWWRW...',
    '..WWRWWRWW..',
    '.SWWRRRRWWS.',
    '..S.RBRBR.S.',
    '....RRRRR...',
    '....RRRRR...'
  ];
  var PIERNAS = {
    quieto: ['....RR.RR...', '....RR.RR...', '...KKK.KKK..'],
    corre1: ['...RR...RR..', '..RR.....RR.', '.KKK.....KKK'],
    corre2: ['.....RRR....', '.....RRR....', '.....KKKK...'],
    salto:  ['...RR..RR...', '..RR....RR..', '.KK......KK.']
  };

  function crearSprite(filas) {
    var c = document.createElement('canvas');
    c.width = 12;
    c.height = filas.length;
    var g = c.getContext('2d');
    filas.forEach(function (fila, y) {
      for (var x = 0; x < fila.length; x++) {
        var col = PALETA[fila[x]];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    });
    return c;
  }

  var SPRITES = {};
  Object.keys(PIERNAS).forEach(function (k) {
    var filas = CUERPO.slice();
    if (k === 'salto') {
      // Brazos arriba al saltar
      filas[8] = '.SWWRWWRWWS.';
      filas[9] = '..WWRRRRWW..';
    }
    SPRITES[k] = crearSprite(filas.concat(PIERNAS[k]));
  });

  /* ---------- El nivel ---------- */
  // '#' suelo · 'b' ladrillo · '*' bloque ✦ · 'u' bloque ya golpeado
  // '=' plataforma de madera · 'R' bloque gris del residuo · 'F' bandera
  function crearNivel() {
    var m = [];
    for (var f = 0; f < FILAS; f++) { m.push([]); for (var c = 0; c < COLS; c++) m[f].push('.'); }
    function poner(f, c, t) { if (f >= 0 && f < FILAS && c >= 0 && c < COLS) m[f][c] = t; }
    // Suelo con algunos huecos
    var huecos = [[22, 24], [41, 43], [70, 73], [96, 98]];
    for (var col = 0; col < COLS; col++) {
      var enHueco = huecos.some(function (h) { return col >= h[0] && col <= h[1]; });
      if (!enHueco) { poner(12, col, '#'); poner(13, col, '#'); }
    }
    // Bloques y ladrillos para golpear
    [[8, 10, 'b'], [8, 11, '*'], [8, 12, 'b'], [8, 13, '*'], [8, 14, 'b'], [4, 12, '*']].forEach(function (p) { poner(p[0], p[1], p[2]); });
    [[8, 30, '*'], [8, 31, 'b'], [8, 32, '*'], [8, 50, 'b'], [8, 51, '*'], [8, 52, 'b'], [5, 51, '*']].forEach(function (p) { poner(p[0], p[1], p[2]); });
    // Plataformas sobre los huecos
    for (var a = 20; a <= 26; a++) poner(9, a, '=');
    for (var b2 = 39; b2 <= 45; b2++) poner(8, b2, '=');
    for (var d = 68; d <= 75; d++) poner(9, d, '=');
    for (var e = 94; e <= 100; e++) poner(9, e, '=');
    // Escalones
    [[11, 34], [10, 35], [11, 35], [9, 36], [10, 36], [11, 36]].forEach(function (p) { poner(p[0], p[1], '#'); });
    // EL RESIDUO: un muro de bloques grises que hay que saltar (no se puede quitar)
    for (var rf = 9; rf <= 11; rf++) for (var rc = 58; rc <= 60; rc++) poner(rf, rc, 'R');
    // ...y una plataforma gris más adelante
    for (var rp = 82; rp <= 85; rp++) poner(8, rp, 'R');
    [[8, 88, '*'], [8, 89, 'b'], [8, 90, '*']].forEach(function (p) { poner(p[0], p[1], p[2]); });
    // Escalera final y bandera
    for (var s = 0; s < 6; s++) for (var sf = 11 - s; sf <= 11; sf++) poner(sf, 112 + s, '#');
    poner(11, 124, 'F');
    return m;
  }

  function solido(t) { return t === '#' || t === 'b' || t === '*' || t === 'u' || t === '=' || t === 'R'; }

  IW.experiences.sandbox = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-plat">' +
        '<canvas class="iw-plat__canvas" aria-label="A short platform level. Run and jump to the flag."></canvas>' +
        '<p class="iw-plat__help" id="iw-p-help">← → run · Space jump</p>' +
        '<div class="iw-plat__pad" aria-label="Touch controls">' +
          '<button type="button" class="iw-plat__btn" data-k="left" aria-label="Run left">◀</button>' +
          '<button type="button" class="iw-plat__btn" data-k="right" aria-label="Run right">▶</button>' +
          '<button type="button" class="iw-plat__btn iw-plat__btn--jump" data-k="jump" aria-label="Jump">⤒</button>' +
        '</div>' +
      '</div>';

    var root = c.root.querySelector('.iw-plat');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var ayuda = root.querySelector('#iw-p-help');
    var imgResiduo = IW.motif.img(c.motifId);
    if (window.matchMedia('(pointer: coarse), (max-width: 40rem)').matches) ayuda.textContent = '◀ ▶ run · ⤒ jump';

    var nivel = crearNivel();
    var rebote = {};   // "f,c" → tiempo de animación al golpear un bloque
    var chispas = [];
    var W = 0, H = 0, T = 32;

    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * d);
      canvas.height = Math.round(H * d);
      g.setTransform(d, 0, 0, d, 0, 0);
      g.imageSmoothingEnabled = false;
      // En vertical (celular) se ven al menos 12 columnas por delante
      T = Math.max(24, Math.floor(Math.min(H / FILAS, W / 12)));
    }
    window.addEventListener('resize', medir);
    medir();

    /* ---------- Jugador ---------- */
    var inicio = { x: 3, y: 10 };
    var control = { x: 3, y: 10 };   // punto de reaparición
    var j = { x: 0, y: 0, vx: 0, vy: 0, w: 0.62, h: 1.2, suelo: false, dir: 1, coyote: 0, buffer: 0, parpadeo: 0, anim: 0 };
    function reaparecer(p) { j.x = p.x; j.y = p.y; j.vx = 0; j.vy = 0; j.parpadeo = 60; }
    reaparecer(inicio);

    var teclas = { left: false, right: false, jump: false };
    var saltoSoltado = true;

    function tecla(e, valor) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') teclas.left = valor;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') teclas.right = valor;
      else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') teclas.jump = valor;
      else return;
      e.preventDefault();
    }
    document.addEventListener('keydown', function (e) { tecla(e, true); });
    document.addEventListener('keyup', function (e) { tecla(e, false); });

    // Botones táctiles (mantener presionado)
    root.querySelectorAll('.iw-plat__btn').forEach(function (b) {
      var k = b.dataset.k;
      var on = function (e) { e.preventDefault(); teclas[k] = true; b.classList.add('iw-plat__btn--on'); };
      var off = function () { teclas[k] = false; b.classList.remove('iw-plat__btn--on'); };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('pointercancel', off);
    });

    /* ---------- Sonido (chiptune propio) ---------- */
    var MELODIA = [659, 0, 784, 659, 0, 523, 587, 0, 659, 0, 523, 0, 440, 0, 0, 0];
    function musica() {
      IW.audio.loop(132, function (n, t) {
        var paso = n % 16;
        var compas = Math.floor(n / 16) % 4;
        var nota = MELODIA[paso];
        if (nota) IW.audio.tone({ when: t, f: nota * (compas === 3 ? 0.89 : 1), dur: 0.14, type: 'square', vol: 0.03, filter: 2600 });
        if (paso % 4 === 0) IW.audio.tone({ when: t, f: [131, 110, 147, 98][compas], dur: 0.2, type: 'triangle', vol: 0.09 });
        if (paso % 4 === 2) IW.audio.noise({ when: t, dur: 0.03, freq: 7000, type: 'highpass', vol: 0.025 });
      });
    }
    function sonidoSalto() { IW.audio.tone({ f: 330, slide: 760, dur: 0.18, type: 'square', vol: 0.05, filter: 2400 }); }
    function sonidoGolpe() { IW.audio.tone({ f: 220, slide: 150, dur: 0.1, type: 'triangle', vol: 0.12 }); }

    /* ---------- Física ---------- */
    function tile(f, col) {
      if (col < 0 || col >= COLS) return '#';
      if (f < 0 || f >= FILAS) return '.';
      return nivel[f][col];
    }

    function golpear(f, col) {
      var t = tile(f, col);
      rebote[f + ',' + col] = 12;
      if (t === '*') {
        nivel[f][col] = 'u';
        IW.audio.tone({ f: 988, dur: 0.12, type: 'square', vol: 0.05 });
        IW.audio.tone({ f: 1319, dur: 0.3, type: 'square', vol: 0.04, when: IW.audio.ctx && IW.audio.ctx.currentTime + 0.08 });
        for (var i = 0; i < (reducido ? 4 : 14); i++) {
          var a = Math.random() * Math.PI * 2;
          chispas.push({ x: col + 0.5, y: f, vx: Math.cos(a) * 0.08, vy: -0.05 - Math.random() * 0.12, vida: 40, h: Math.random() * 360 });
        }
      } else if (t === 'R') {
        // El residuo no se rompe ni cambia
        sonidoGolpe();
        IW.ui.toast(c.scene.residue, 2200);
      } else {
        sonidoGolpe();
      }
    }

    function moverEjeX() {
      j.x += j.vx;
      var arriba = Math.floor(j.y - j.h + 0.01), abajo = Math.floor(j.y - 0.01);
      for (var f = arriba; f <= abajo; f++) {
        if (j.vx > 0 && solido(tile(f, Math.floor(j.x + j.w / 2)))) { j.x = Math.floor(j.x + j.w / 2) - j.w / 2 - 0.001; j.vx = 0; }
        if (j.vx < 0 && solido(tile(f, Math.floor(j.x - j.w / 2)))) { j.x = Math.floor(j.x - j.w / 2) + 1 + j.w / 2 + 0.001; j.vx = 0; }
      }
    }

    function moverEjeY() {
      j.y += j.vy;
      j.suelo = false;
      var izq = Math.floor(j.x - j.w / 2 + 0.02), der = Math.floor(j.x + j.w / 2 - 0.02);
      for (var col = izq; col <= der; col++) {
        if (j.vy >= 0 && solido(tile(Math.floor(j.y), col))) {
          j.y = Math.floor(j.y);
          j.vy = 0;
          j.suelo = true;
        } else if (j.vy < 0 && solido(tile(Math.floor(j.y - j.h), col))) {
          var f = Math.floor(j.y - j.h);
          j.y = f + 1 + j.h + 0.001;
          j.vy = 0;
          // Golpe al bloque que está justo encima del centro
          if (col === Math.floor(j.x) || izq === der) golpear(f, col);
        }
      }
    }

    var meta = false;
    function paso() {
      var acel = 0.012, max = 0.15, grav = 0.022;
      if (teclas.left) { j.vx = Math.max(-max, j.vx - acel); j.dir = -1; }
      else if (teclas.right) { j.vx = Math.min(max, j.vx + acel); j.dir = 1; }
      else j.vx *= j.suelo ? 0.78 : 0.94;
      if (Math.abs(j.vx) < 0.002) j.vx = 0;

      // Salto con margen ("coyote") y búfer; soltar antes = salto corto
      j.coyote = j.suelo ? 6 : j.coyote - 1;
      if (teclas.jump && saltoSoltado) { j.buffer = 6; saltoSoltado = false; }
      if (!teclas.jump) saltoSoltado = true;
      if (j.buffer > 0 && j.coyote > 0) {
        j.vy = -0.38;
        j.coyote = 0;
        j.buffer = 0;
        sonidoSalto();
      }
      j.buffer--;
      if (!teclas.jump && j.vy < -0.12) j.vy = -0.12;
      j.vy = Math.min(0.5, j.vy + grav);

      moverEjeX();
      moverEjeY();
      j.anim += Math.abs(j.vx) * 2.2;
      if (j.parpadeo > 0) j.parpadeo--;

      // Punto de reaparición: la última posición segura sobre el suelo
      if (j.suelo && j.x > control.x + 2 && solido(tile(Math.floor(j.y), Math.floor(j.x))) &&
          solido(tile(Math.floor(j.y), Math.floor(j.x - 0.5))) && solido(tile(Math.floor(j.y), Math.floor(j.x + 0.5)))) {
        control = { x: j.x, y: j.y };
      }

      // Si cae: reaparece (sin game over)
      if (j.y > FILAS + 2) {
        IW.audio.tone({ f: 523, slide: 262, dur: 0.4, type: 'triangle', vol: 0.08 });
        reaparecer(control);
      }

      // Bandera: un pequeño festejo y otra vez desde el inicio
      if (!meta && Math.floor(j.x) >= 123 && Math.floor(j.x) <= 125) {
        meta = true;
        [523, 659, 784, 1047].forEach(function (f, i) {
          IW.audio.tone({ f: f, dur: 0.25, type: 'square', vol: 0.05, when: IW.audio.ctx && IW.audio.ctx.currentTime + i * 0.12 });
        });
        IW.ui.toast('You made it. Again?', 2400);
        setTimeout(function () {
          nivel = crearNivel();
          control = { x: inicio.x, y: inicio.y };
          reaparecer(inicio);
          meta = false;
        }, 2600);
      }

      Object.keys(rebote).forEach(function (k) { if (--rebote[k] <= 0) delete rebote[k]; });
      chispas.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += 0.004; p.vida--; });
      chispas = chispas.filter(function (p) { return p.vida > 0; });
    }

    /* ---------- Dibujo ---------- */
    var camX = 0;
    function dibujar(t) {
      var objetivo = j.x * T - W * 0.4;
      camX += (Math.max(0, Math.min(COLS * T - W, objetivo)) - camX) * 0.12;
      var oy = H - FILAS * T;   // el nivel se apoya abajo

      // Cielo
      var cielo = g.createLinearGradient(0, 0, 0, H);
      cielo.addColorStop(0, '#6aa8ff');
      cielo.addColorStop(1, '#c9e6ff');
      g.fillStyle = cielo;
      g.fillRect(0, 0, W, H);

      // Montañas y colinas lejanas (parallax, en escalones de píxel)
      capa(0.15, '#a8c4f0', H * 0.55, 220, 0.5);
      capa(0.35, '#7cc48a', H * 0.7, 160, 0.35);

      // Nubes
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (var n = 0; n < 8; n++) {
        var nx = ((n * 420 - camX * 0.25 + t * 0.006) % (W + 400) + W + 400) % (W + 400) - 200;
        var ny = H * (0.08 + (n % 3) * 0.07);
        var s = T * 0.5;
        g.fillRect(nx, ny, s * 6, s);
        g.fillRect(nx + s, ny - s, s * 4, s);
        g.fillRect(nx + s * 2, ny - s * 2, s * 2, s);
      }

      // Tiles visibles
      var c0 = Math.max(0, Math.floor(camX / T) - 1), c1 = Math.min(COLS - 1, Math.ceil((camX + W) / T) + 1);
      for (var f = 0; f < FILAS; f++) {
        for (var col = c0; col <= c1; col++) {
          var tt = nivel[f][col];
          if (tt === '.') continue;
          var x = Math.round(col * T - camX);
          var y = Math.round(f * T + oy - (rebote[f + ',' + col] ? Math.sin((rebote[f + ',' + col] / 12) * Math.PI) * T * 0.3 : 0));
          dibujarTile(tt, x, y, f, col, t);
        }
      }

      // Chispas de los bloques ✦
      chispas.forEach(function (p) {
        g.fillStyle = 'hsla(' + p.h + ',95%,65%,' + (p.vida / 40) + ')';
        g.fillRect(p.x * T - camX - 3, p.y * T + oy - 3, 6, 6);
      });

      // Jugador
      if (!(j.parpadeo > 0 && Math.floor(j.parpadeo / 4) % 2)) {
        var sprite = !j.suelo ? SPRITES.salto : Math.abs(j.vx) > 0.01 ? (Math.floor(j.anim) % 2 ? SPRITES.corre1 : SPRITES.corre2) : SPRITES.quieto;
        var escala = (T * j.h) / 16;
        var px = j.x * T - camX, py = j.y * T + oy;
        g.save();
        g.translate(Math.round(px), Math.round(py));
        g.scale(j.dir * escala, escala);
        g.drawImage(sprite, -6, -16);
        g.restore();
      }
    }

    function capa(vel, color, base, ancho, altura) {
      g.fillStyle = color;
      var desp = -(camX * vel) % ancho;
      for (var x = desp - ancho; x < W + ancho; x += ancho) {
        var paso2 = T * 0.5;
        for (var k = 0; k < 6; k++) {
          var hh = (k < 3 ? k + 1 : 6 - k) * paso2 * altura * 2;
          g.fillRect(Math.round(x + k * (ancho / 6)), Math.round(base - hh), Math.ceil(ancho / 6) + 1, Math.round(hh + H - base));
        }
      }
    }

    function dibujarTile(tt, x, y, f, col, t) {
      if (tt === '#') {
        g.fillStyle = '#b06a3b'; g.fillRect(x, y, T, T);
        g.fillStyle = '#8f5230'; g.fillRect(x + T * 0.2, y + T * 0.55, T * 0.18, T * 0.18); g.fillRect(x + T * 0.65, y + T * 0.3, T * 0.15, T * 0.15);
        if (tile(f - 1, col) === '.' || tile(f - 1, col) === 'F') {
          g.fillStyle = '#5bc26a'; g.fillRect(x, y, T, T * 0.28);
          g.fillStyle = '#3e9a4f'; g.fillRect(x, y + T * 0.28, T, T * 0.06);
        }
        return;
      }
      if (tt === 'b') {
        g.fillStyle = '#c9683f'; g.fillRect(x, y, T, T);
        g.fillStyle = '#7a3a22';
        g.fillRect(x, y + T / 2 - 1, T, 2);
        g.fillRect(x + T / 2 - 1, y, 2, T / 2);
        g.fillRect(x + T / 4 - 1, y + T / 2, 2, T / 2);
        g.fillRect(x + (3 * T) / 4 - 1, y + T / 2, 2, T / 2);
        return;
      }
      if (tt === '*' || tt === 'u') {
        g.fillStyle = tt === '*' ? '#ffcf4a' : '#a88a5a'; g.fillRect(x, y, T, T);
        g.fillStyle = tt === '*' ? '#c7891b' : '#7c6440';
        g.fillRect(x, y + T - 3, T, 3); g.fillRect(x + T - 3, y, 3, T);
        if (tt === '*') {
          // Estrella de cuatro puntas que brilla
          var b = 0.75 + Math.sin(t * 0.006 + col) * 0.25;
          g.fillStyle = 'rgba(255,255,255,' + b + ')';
          var cx = x + T / 2, cy = y + T / 2, r = T * 0.32;
          g.beginPath();
          g.moveTo(cx, cy - r); g.lineTo(cx + r * 0.25, cy - r * 0.25); g.lineTo(cx + r, cy); g.lineTo(cx + r * 0.25, cy + r * 0.25);
          g.lineTo(cx, cy + r); g.lineTo(cx - r * 0.25, cy + r * 0.25); g.lineTo(cx - r, cy); g.lineTo(cx - r * 0.25, cy - r * 0.25);
          g.fill();
        }
        return;
      }
      if (tt === '=') {
        g.fillStyle = '#d9a46b'; g.fillRect(x, y, T, T * 0.4);
        g.fillStyle = '#9c6a3c'; g.fillRect(x, y + T * 0.34, T, T * 0.06); g.fillRect(x + T * 0.48, y, 2, T * 0.34);
        return;
      }
      if (tt === 'R') {
        // EL RESIDUO: gris, con el marco boca abajo
        g.fillStyle = '#8c8c8c'; g.fillRect(x, y, T, T);
        g.fillStyle = '#6c6c6c'; g.fillRect(x, y + T - 3, T, 3); g.fillRect(x + T - 3, y, 3, T);
        g.fillStyle = '#a8a8a8'; g.fillRect(x, y, T, 3);
        if (imgResiduo && imgResiduo.complete && imgResiduo.naturalWidth) {
          g.save();
          g.globalAlpha = 0.85;
          g.filter = 'grayscale(1)';
          g.drawImage(imgResiduo, x + T * 0.1, y + T * 0.1, T * 0.8, T * 0.8);
          g.restore();
        }
        return;
      }
      if (tt === 'F') {
        g.fillStyle = '#eee'; g.fillRect(x + T * 0.45, y - T * 7, T * 0.1, T * 8);
        g.fillStyle = '#ff8fc4';
        var ola = Math.sin(t * 0.008) * T * 0.1;
        g.beginPath(); g.moveTo(x + T * 0.55, y - T * 7); g.lineTo(x + T * 1.8, y - T * 6.4 + ola); g.lineTo(x + T * 0.55, y - T * 5.8); g.fill();
      }
    }

    /* ---------- Bucle ---------- */
    var acumulado = 0, previo = performance.now();
    function bucle(t) {
      acumulado += Math.min(100, t - previo);
      previo = t;
      // Física a 60 pasos por segundo, sin importar los fps de la pantalla
      while (acumulado >= 16.67) { paso(); acumulado -= 16.67; }
      dibujar(t);
      requestAnimationFrame(bucle);
    }
    requestAnimationFrame(bucle);

    setTimeout(function () { ayuda.classList.add('iw-plat__help--off'); }, 6000);

    IW.ui.startCard().then(musica);
  };
})();
