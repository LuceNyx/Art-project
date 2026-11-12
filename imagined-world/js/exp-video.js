/* =========================================================================
   IMAGINED WORLD · exp-video.js
   PORTÁTIL → SERIES (Academic pressure)
   Estás dentro de una serie: capítulos cortos y cinematográficos (escenas
   originales dibujadas en canvas), subtítulos con emoción y música que
   crece. Al terminar, "Next episode in 5…" arranca solo: parar cuesta
   más que seguir. El contador de horas vistas no deja de subir.
   Residuo: entre capítulos, con la pantalla a oscuras, se refleja la pila
   de hojas.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var DURACION = 30;      // s por capítulo
  var CUENTA = 5;         // s de "Next episode in…"
  var MIN_POR_CAP = 47;   // minutos "vistos" por capítulo

  // Capítulos originales (se repiten en bucle con número creciente)
  var CAPITULOS = [
    { scene: 'sea', title: 'The Long Way Home',
      lines: ['You came back.', "I didn't think you would.", 'Stay. Just for tonight.', 'Look how the light stays.'] },
    { scene: 'city', title: 'Rain on Neon',
      lines: ["Everyone's waiting for you.", 'Then let them wait.', 'Here, nobody asks.', 'One more street. Then home.'] },
    { scene: 'aurora', title: 'Northern Lights',
      lines: ['What if this is the good part?', "Then don't let it end.", 'Breathe. Look up.', "We'll see what happens next."] }
  ];

  // Acordes de la banda sonora: Re – Si menor – Sol – La
  var BANDA = [[146.83, 185, 220], [123.47, 146.83, 185], [196, 246.94, 293.66], [220, 277.18, 329.63]];

  IW.experiences.video = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-video">' +
        '<canvas class="iw-video__canvas" aria-hidden="true"></canvas>' +
        '<div class="iw-video__bars" aria-hidden="true"></div>' +
        '<div class="iw-video__top">' +
          '<p class="iw-video__show">Continue watching</p>' +
          '<p class="iw-video__ep" id="iw-v-ep">S1 · E4</p>' +
        '</div>' +
        '<p class="iw-video__sub" id="iw-v-sub" aria-live="polite"></p>' +
        '<button class="iw-video__skip" id="iw-v-skip" type="button" hidden>Skip intro</button>' +
        '<div class="iw-video__controls">' +
          '<p class="iw-video__title" id="iw-v-title"></p>' +
          '<div class="iw-video__bar"><span id="iw-v-bar"></span></div>' +
          '<p class="iw-video__time" id="iw-v-time">0:00 / 0:30</p>' +
        '</div>' +
        '<div class="iw-video__next" id="iw-v-next" hidden>' +
          '<div class="iw-video__reflection" id="iw-v-refl" aria-hidden="true"></div>' +
          '<p class="iw-video__next-label">Next episode in <b id="iw-v-count">5</b></p>' +
          '<p class="iw-video__next-title" id="iw-v-next-title"></p>' +
          '<button class="iw-video__now" id="iw-v-now" type="button">Watch now</button>' +
          '<p class="iw-video__watched" id="iw-v-watched"></p>' +
        '</div>' +
      '</div>';

    var root = c.root.querySelector('.iw-video');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var el = {
      ep: root.querySelector('#iw-v-ep'), sub: root.querySelector('#iw-v-sub'), skip: root.querySelector('#iw-v-skip'),
      title: root.querySelector('#iw-v-title'), bar: root.querySelector('#iw-v-bar'), time: root.querySelector('#iw-v-time'),
      next: root.querySelector('#iw-v-next'), count: root.querySelector('#iw-v-count'), nextTitle: root.querySelector('#iw-v-next-title'),
      now: root.querySelector('#iw-v-now'), watched: root.querySelector('#iw-v-watched'), refl: root.querySelector('#iw-v-refl')
    };

    // Residuo: la pila de hojas reflejada en la pantalla oscura
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-video__residue', c.scene.motifDescription);
    if (residuo) el.refl.appendChild(residuo);

    var W = 0, H = 0;
    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * d);
      canvas.height = Math.round(H * d);
      g.setTransform(d, 0, 0, d, 0, 0);
    }
    window.addEventListener('resize', medir);
    medir();

    var numero = 4;        // empieza "a mitad de temporada"
    var vistos = 0;
    var cap = CAPITULOS[0];
    var inicioCap = 0;
    var reproduciendo = false;
    var enCuenta = false;
    var musica = null;
    var lluvia = [], nieve = [];
    for (var i = 0; i < 160; i++) {
      lluvia.push({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.8 });
      nieve.push({ x: Math.random(), y: Math.random(), v: 0.1 + Math.random() * 0.25, r: 0.8 + Math.random() * 1.8 });
    }

    function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function horas(min) { var h = Math.floor(min / 60); return h ? h + ' h ' + (min % 60) + ' min' : min + ' min'; }

    /* ---------- Banda sonora: crece hacia el clímax ---------- */
    function iniciarMusica() {
      musica = IW.audio.loop(70, function (n, t) {
        if (!reproduciendo) return;
        var paso = n % 16;
        var compas = Math.floor(n / 16) % 4;
        var avance = (performance.now() - inicioCap) / 1000 / DURACION;
        var seg = 60 / 70;
        if (paso === 0) {
          BANDA[compas].forEach(function (f, k) {
            IW.audio.tone({ when: t, f: f, dur: seg * 4.4, type: 'sawtooth', vol: 0.025 + avance * 0.02, attack: 0.9, filter: 600 + avance * 1600, detune: (k - 1) * 7 });
          });
          IW.audio.tone({ when: t, f: BANDA[compas][0] / 2, dur: seg * 4, type: 'sine', vol: 0.08, attack: 0.5 });
        }
        // Piano: notas sueltas, y más hacia el clímax
        if (paso % (avance > 0.55 ? 2 : 4) === 0) {
          var nota = BANDA[compas][(paso / 2) % 3] * (avance > 0.55 ? 4 : 2);
          IW.audio.tone({ when: t, f: nota, dur: 1.4, type: 'triangle', vol: 0.035 });
        }
        if (avance > 0.6 && paso % 8 === 0) IW.audio.kick(t, 0.25);
      });
    }

    /* ---------- Capítulos ---------- */
    function empezarCapitulo() {
      cap = CAPITULOS[(numero - 4) % CAPITULOS.length];
      inicioCap = performance.now();
      reproduciendo = true;
      enCuenta = false;
      el.next.hidden = true;
      el.ep.textContent = 'S1 · E' + numero;
      el.title.textContent = 'E' + numero + ' · ' + cap.title;
      el.sub.textContent = '';
      el.skip.hidden = false;
      setTimeout(function () { el.skip.hidden = true; }, 7000);
      root.dataset.scene = cap.scene;
    }

    function terminarCapitulo() {
      reproduciendo = false;
      enCuenta = true;
      vistos++;
      el.sub.textContent = '';
      el.skip.hidden = true;
      var siguiente = CAPITULOS[(numero + 1 - 4) % CAPITULOS.length];
      el.nextTitle.textContent = 'E' + (numero + 1) + ' · ' + siguiente.title;
      el.watched.textContent = "You've been watching for " + horas(vistos * MIN_POR_CAP + 132);
      el.next.hidden = false;
      el.now.focus({ preventScroll: true });
      var n = CUENTA;
      el.count.textContent = n;
      var id = setInterval(function () {
        n--;
        el.count.textContent = Math.max(n, 0);
        IW.audio.tone({ f: 660, dur: 0.12, type: 'sine', vol: 0.04 });
        if (n <= 0 || !enCuenta) { clearInterval(id); if (enCuenta) siguienteCapitulo(); }
      }, 1000);
      terminarCapitulo.id = id;
    }

    function siguienteCapitulo() {
      clearInterval(terminarCapitulo.id);
      numero++;
      empezarCapitulo();
    }

    el.now.addEventListener('click', siguienteCapitulo);
    el.skip.addEventListener('click', function () {
      inicioCap -= 6000;
      el.skip.hidden = true;
    });

    /* ---------- Escenas (originales, en canvas) ---------- */
    function cielo(c1, c2, c3) {
      var gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, c1);
      gr.addColorStop(0.55, c2);
      gr.addColorStop(1, c3);
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    }

    function escenaMar(t, p) {
      cielo('#2b1d5e', '#e0708a', '#ffb98a');
      var sy = H * (0.5 + p * 0.08);
      var sol = g.createRadialGradient(W * 0.5, sy, 0, W * 0.5, sy, H * 0.35);
      sol.addColorStop(0, 'rgba(255,240,200,1)');
      sol.addColorStop(0.12, 'rgba(255,210,150,.9)');
      sol.addColorStop(1, 'rgba(255,160,120,0)');
      g.fillStyle = sol;
      g.fillRect(0, 0, W, H);
      // Mar con destellos
      var mar = g.createLinearGradient(0, H * 0.62, 0, H);
      mar.addColorStop(0, '#5b3a7a');
      mar.addColorStop(1, '#1d1238');
      g.fillStyle = mar;
      g.fillRect(0, H * 0.62, W, H);
      for (var i = 0; i < 40; i++) {
        var y = H * 0.63 + i * i * 0.35;
        var ancho = 40 + Math.sin(t * 0.001 + i) * 30 + i * 6;
        g.fillStyle = 'rgba(255,220,180,' + (0.5 - i * 0.011) + ')';
        g.fillRect(W * 0.5 - ancho / 2 + Math.sin(t * 0.002 + i * 2) * 10, y, ancho, 2);
      }
      // Dos siluetas, juntas
      g.fillStyle = '#140b26';
      [[0.44, 1], [0.49, 0.92]].forEach(function (s) {
        var x = W * s[0], base = H * 0.82, h = H * 0.13 * s[1];
        g.beginPath(); g.arc(x, base - h, h * 0.13, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(x - h * 0.16, base); g.quadraticCurveTo(x, base - h * 1.05, x + h * 0.16, base); g.fill();
      });
      g.fillRect(0, H * 0.82, W, H);
    }

    function escenaCiudad(t) {
      cielo('#0b0a26', '#2a1650', '#3a1440');
      // Edificios con ventanas encendidas
      for (var i = 0; i < 14; i++) {
        var bx = (i / 14) * W - 20, bw = W / 12, bh = H * (0.3 + ((i * 37) % 30) / 100);
        g.fillStyle = '#120c2a';
        g.fillRect(bx, H * 0.68 - bh, bw, bh);
        for (var v = 0; v < 18; v++) {
          var on = ((i * 7 + v * 13) % 5) < 2;
          if (!on) continue;
          var col = ['#ff8fc4', '#7fe6d0', '#ffd28a', '#b38cff'][(i + v) % 4];
          g.fillStyle = col;
          g.globalAlpha = 0.55 + Math.sin(t * 0.002 + i + v) * 0.2;
          g.fillRect(bx + 8 + (v % 3) * (bw / 3.2), H * 0.68 - bh + 14 + Math.floor(v / 3) * 22, bw / 6, 9);
          g.globalAlpha = 1;
        }
      }
      // Calle mojada que refleja
      var calle = g.createLinearGradient(0, H * 0.68, 0, H);
      calle.addColorStop(0, '#2a1840');
      calle.addColorStop(1, '#0a0618');
      g.fillStyle = calle;
      g.fillRect(0, H * 0.68, W, H);
      for (var r = 0; r < 12; r++) {
        g.fillStyle = ['rgba(255,143,196,.25)', 'rgba(127,230,208,.22)', 'rgba(255,210,138,.2)'][r % 3];
        g.fillRect((r / 12) * W + 10, H * 0.7, W / 30, H * 0.3 * (0.4 + (r % 4) * 0.15));
      }
      // Lluvia
      g.strokeStyle = 'rgba(200,210,255,.35)';
      g.lineWidth = 1;
      lluvia.forEach(function (d) {
        d.y += d.v * 0.02;
        if (d.y > 1) { d.y = 0; d.x = Math.random(); }
        g.beginPath();
        g.moveTo(d.x * W, d.y * H);
        g.lineTo(d.x * W - 4, d.y * H + 16);
        g.stroke();
      });
    }

    function escenaAurora(t) {
      cielo('#050a20', '#0c1a3a', '#1a2d50');
      // Cintas de aurora
      g.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 3; k++) {
        g.beginPath();
        for (var x = 0; x <= W; x += 16) {
          var y = H * (0.25 + k * 0.07) + Math.sin(x * 0.004 + t * 0.0004 * (k + 1)) * 60 + Math.sin(x * 0.011 + t * 0.0007) * 20;
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.lineTo(W, H * 0.7); g.lineTo(0, H * 0.7); g.closePath();
        var gr = g.createLinearGradient(0, H * 0.15, 0, H * 0.6);
        gr.addColorStop(0, ['rgba(120,255,200,.35)', 'rgba(180,120,255,.3)', 'rgba(255,150,220,.22)'][k]);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      // Colinas nevadas y una cabaña con la ventana encendida
      g.fillStyle = '#c9d6f0';
      g.beginPath(); g.moveTo(0, H * 0.75);
      g.quadraticCurveTo(W * 0.3, H * 0.62, W * 0.6, H * 0.72);
      g.quadraticCurveTo(W * 0.85, H * 0.8, W, H * 0.7);
      g.lineTo(W, H); g.lineTo(0, H); g.fill();
      g.fillStyle = '#2a2140';
      g.fillRect(W * 0.62, H * 0.66, W * 0.06, H * 0.07);
      g.beginPath(); g.moveTo(W * 0.61, H * 0.665); g.lineTo(W * 0.65, H * 0.62); g.lineTo(W * 0.69, H * 0.665); g.fill();
      g.fillStyle = '#ffd28a';
      g.shadowColor = '#ffd28a'; g.shadowBlur = 20;
      g.fillRect(W * 0.64, H * 0.68, W * 0.015, H * 0.025);
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(255,255,255,.8)';
      nieve.forEach(function (f) {
        f.y += f.v * 0.004;
        if (f.y > 1) { f.y = 0; f.x = Math.random(); }
        g.beginPath(); g.arc(f.x * W + Math.sin(t * 0.001 + f.y * 10) * 8, f.y * H, f.r, 0, Math.PI * 2); g.fill();
      });
    }

    function dibujar(t) {
      var p = reproduciendo ? Math.min(1, (performance.now() - inicioCap) / 1000 / DURACION) : 0;
      g.save();
      // Cámara: un acercamiento lento durante el capítulo
      var z = reducido ? 1 : 1 + p * 0.08;
      g.translate(W / 2, H / 2);
      g.scale(z, z);
      g.translate(-W / 2, -H / 2);
      if (cap.scene === 'sea') escenaMar(t, p);
      else if (cap.scene === 'city') escenaCiudad(t);
      else escenaAurora(t);
      g.restore();
      // Grano de película
      if (!reducido) {
        g.fillStyle = 'rgba(255,255,255,.025)';
        for (var i = 0; i < 60; i++) g.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
      }

      if (reproduciendo) {
        var s = (performance.now() - inicioCap) / 1000;
        el.bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        el.time.textContent = fmt(s) + ' / ' + fmt(DURACION);
        var linea = s < 4 ? '' : s < 11 ? cap.lines[0] : s < 18 ? cap.lines[1] : s < 24 ? cap.lines[2] : cap.lines[3];
        if (el.sub.textContent !== linea) el.sub.textContent = linea;
        if (s >= DURACION) terminarCapitulo();
      }
      requestAnimationFrame(dibujar);
    }
    requestAnimationFrame(dibujar);

    IW.ui.startCard({
      kicker: 'Continue watching · S1 · E4',
      title: CAPITULOS[0].title,
      sub: c.scene.pleasure,
      button: 'Play'
    }).then(function () {
      iniciarMusica();
      empezarCapitulo();
    });
  };
})();
