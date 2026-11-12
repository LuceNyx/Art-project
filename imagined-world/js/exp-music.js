/* =========================================================================
   IMAGINED WORLD · exp-music.js
   AUDÍFONOS → DENTRO DE UNA CANCIÓN (Emotional overload)
   Una canción original (generada en código) con intro, subida y "drop".
   Todo late con ella. "Turn it up": cuanto más alto el volumen, más se
   apagan las voces de la realidad (las notas del corcho y su murmullo).
   Tocar la pantalla agrega notas a la melodía.
   Residuo: la nota clavada sigue ahí, en gris, a cualquier volumen.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var BPM = 96;
  // Am – F – C – G (frecuencias de cada acorde)
  var ACORDES = [
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [261.63, 329.63, 392],
    [196, 246.94, 293.66]
  ];
  var BAJOS = [55, 43.65, 65.41, 49];
  var PENTA = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
  // Melodía del "drop" (índices de PENTA por semicorchea; -1 = silencio)
  var MELODIA = [4, -1, 3, -1, 2, -1, 3, 4, -1, 5, -1, 4, 3, -1, 2, -1];

  IW.experiences.music = function (c) {
    var reducido = c.reducido;
    var voces = c.scene.reality.concat(['Everyone else can.', 'Why are you like this?']);

    c.root.innerHTML =
      '<div class="iw-music">' +
        '<canvas class="iw-music__canvas" aria-hidden="true"></canvas>' +
        '<div class="iw-music__voices" aria-hidden="true">' +
          voces.map(function (v, i) {
            return '<span style="--i:' + i + ';--x:' + (8 + (i * 37) % 70) + '%;--y:' + (16 + (i * 23) % 60) + '%">' + v + '</span>';
          }).join('') +
        '</div>' +
        '<div class="iw-music__track">' +
          '<p class="iw-music__now">Now playing</p>' +
          '<p class="iw-music__title">Somewhere Louder</p>' +
          '<p class="iw-music__artist">original · made for this room</p>' +
          '<div class="iw-music__bar"><span id="iw-m-progress"></span></div>' +
          '<p class="iw-music__section" id="iw-m-section">intro</p>' +
        '</div>' +
        '<label class="iw-music__volume">' +
          '<span class="iw-music__volume-label">Turn it up</span>' +
          '<input type="range" id="iw-m-vol" min="0" max="100" value="35" aria-label="Volume: turn it up to drown out the room">' +
          '<span class="iw-music__volume-value" id="iw-m-volv">35</span>' +
        '</label>' +
        '<p class="iw-music__help">Tap anywhere to add a note</p>' +
      '</div>';

    var root = c.root.querySelector('.iw-music');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var vol = root.querySelector('#iw-m-vol');
    var volv = root.querySelector('#iw-m-volv');
    var barra = root.querySelector('#iw-m-progress');
    var seccion = root.querySelector('#iw-m-section');

    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-music__residue', c.scene.motifDescription);
    if (residuo) root.appendChild(residuo);

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

    /* ---------- Volumen: la música tapa la realidad ---------- */
    var nivel = 0.35;
    var murmullo = null;

    function aplicarVolumen() {
      nivel = vol.value / 100;
      volv.textContent = vol.value;
      root.style.setProperty('--vol', nivel.toFixed(2));
      IW.audio.setLevel(0.15 + nivel * 0.85);
      if (murmullo) murmullo.gain.setTargetAtTime((1 - nivel) * 0.09, IW.audio.ctx.currentTime, 0.2);
      if (nivel > 0.92 && !aplicarVolumen.dicho) {
        aplicarVolumen.dicho = true;
        IW.ui.toast('Now nothing else fits.');
      }
    }
    vol.addEventListener('input', aplicarVolumen);
    root.addEventListener('wheel', function (e) {
      vol.value = Math.max(0, Math.min(100, Number(vol.value) - Math.sign(e.deltaY) * 4));
      aplicarVolumen();
    }, { passive: true });

    /** Las voces de la realidad: un murmullo que solo se oye con el volumen bajo. */
    function crearMurmullo() {
      var ctx = IW.audio.ctx;
      if (!ctx) return;
      var largo = ctx.sampleRate * 3;
      var buf = ctx.createBuffer(1, largo, ctx.sampleRate);
      var d = buf.getChannelData(0);
      var u = 0;
      for (var i = 0; i < largo; i++) { u = (u + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = u * 3.5; }
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 420;
      bp.Q.value = 2;
      murmullo = ctx.createGain();
      murmullo.gain.value = 0;
      // Va directo (sin el volumen de la música): por eso la música lo tapa
      src.connect(bp).connect(murmullo).connect(IW.audio.bus);
      src.start();
    }

    /* ---------- La canción ---------- */
    var analizador = null;
    var datos = null;
    var golpe = 0;      // pulso visual del bombo
    var compasTotal = 0;
    var seccionActual = 'intro';
    var chispas = [];

    function nombreSeccion(c16) {
      var b = c16 % 16;
      return b < 4 ? 'intro' : b < 8 ? 'build' : 'drop';
    }

    function tocar() {
      var ctx = IW.audio.ctx;
      analizador = ctx.createAnalyser();
      analizador.fftSize = 256;
      datos = new Uint8Array(analizador.frequencyBinCount);
      IW.audio.out.connect(analizador);

      IW.audio.loop(BPM, function (n, t) {
        var paso = n % 16;
        var compas = Math.floor(n / 16);
        var acorde = compas % 4;
        var sec = nombreSeccion(compas);
        var seg = 60 / BPM;

        if (paso === 0) {
          compasTotal = compas;
          // Pad: el acorde entero, largo y suave
          ACORDES[acorde].forEach(function (f, i) {
            IW.audio.tone({ when: t, f: f, dur: seg * 4.2, type: 'sawtooth', vol: sec === 'drop' ? 0.03 : 0.04, attack: 0.5, filter: sec === 'intro' ? 700 : 1600, detune: (i - 1) * 6 });
            IW.audio.tone({ when: t, f: f * 2, dur: seg * 4, type: 'sine', vol: 0.015, attack: 0.8 });
          });
        }
        if (sec !== 'intro') {
          if (paso % 4 === 0) { IW.audio.kick(t, sec === 'drop' ? 0.75 : 0.5); golpeEn(t); }
          if (paso % 2 === 1) IW.audio.noise({ when: t, dur: 0.05, freq: 9000, type: 'highpass', vol: sec === 'drop' ? 0.06 : 0.035 });
          if (paso % 4 === 2) IW.audio.tone({ when: t, f: BAJOS[acorde] * 2, dur: seg * 0.45, type: 'square', vol: 0.06, filter: 500 });
          // Arpegio
          var nota = ACORDES[acorde][paso % 3] * 2;
          IW.audio.tone({ when: t, f: nota, dur: seg * 0.22, type: 'triangle', vol: 0.03 });
        } else if (paso % 8 === 4) {
          IW.audio.noise({ when: t, dur: 0.06, freq: 7000, type: 'highpass', vol: 0.02 });
        }
        if (sec === 'drop') {
          if (paso === 4 || paso === 12) IW.audio.noise({ when: t, dur: 0.18, freq: 1900, vol: 0.16 });
          var m = MELODIA[paso];
          if (m >= 0) IW.audio.tone({ when: t, f: PENTA[m], dur: seg * 0.5, type: 'square', vol: 0.028, filter: 2600 });
        }
        // Subida antes del drop
        if (compas % 16 === 7 && paso >= 8) {
          IW.audio.noise({ when: t, dur: 0.08, freq: 2000 + paso * 400, vol: 0.02 + paso * 0.004 });
        }
      });
    }

    function golpeEn(t) {
      var ms = Math.max(0, (t - IW.audio.ctx.currentTime) * 1000);
      setTimeout(function () { golpe = 1; }, ms);
    }

    /* ---------- Tocar la pantalla: una nota más ---------- */
    root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('input, button, a')) return;
      if (!IW.audio.ctx) return;
      var f = PENTA[Math.floor((1 - e.clientY / H) * PENTA.length) % PENTA.length] || PENTA[0];
      IW.audio.tone({ f: f, dur: 0.9, type: 'triangle', vol: 0.09 });
      IW.audio.tone({ f: f * 2, dur: 0.6, type: 'sine', vol: 0.03 });
      for (var i = 0; i < (reducido ? 6 : 22); i++) {
        var a = Math.random() * Math.PI * 2;
        var v = 1 + Math.random() * 4;
        chispas.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 50, h: 280 + Math.random() * 90 });
      }
    });

    /* ---------- Visualizador ---------- */
    var t0 = performance.now();
    function dibujar(t) {
      var seg = (t - t0) / 1000;
      if (analizador) analizador.getByteFrequencyData(datos);
      golpe *= 0.9;

      var intensidad = 0.3 + nivel * 0.7;
      var bg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      bg.addColorStop(0, 'hsl(' + (290 + Math.sin(seg * 0.2) * 30) + ',70%,' + (16 + golpe * 10 * intensidad) + '%)');
      bg.addColorStop(1, '#07051a');
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      var cx = W / 2, cy = H * 0.46;
      var base = Math.min(W, H) * (0.16 + golpe * 0.02 * intensidad);
      var n = datos ? datos.length : 64;

      g.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var v = datos ? datos[i] / 255 : 0.15 + Math.abs(Math.sin(seg * 1.4 + i * 0.3)) * 0.1;
        var a = (i / n) * Math.PI * 2 - Math.PI / 2;
        var largo = base * 0.2 + v * base * 1.6 * intensidad;
        var x1 = cx + Math.cos(a) * base, y1 = cy + Math.sin(a) * base;
        var x2 = cx + Math.cos(a) * (base + largo), y2 = cy + Math.sin(a) * (base + largo);
        g.strokeStyle = 'hsla(' + (260 + i * 2.2) + ',95%,' + (55 + v * 20) + '%,' + (0.35 + v * 0.65) + ')';
        g.lineWidth = Math.max(2, (Math.PI * 2 * base) / n * 0.55);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      }

      var nucleo = g.createRadialGradient(cx, cy, 0, cx, cy, base);
      nucleo.addColorStop(0, 'rgba(255,240,255,' + (0.35 + golpe * 0.4) + ')');
      nucleo.addColorStop(1, 'rgba(180,120,255,0)');
      g.fillStyle = nucleo;
      g.beginPath();
      g.arc(cx, cy, base, 0, Math.PI * 2);
      g.fill();

      chispas.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vida--;
        g.fillStyle = 'hsla(' + p.h + ',95%,70%,' + (p.vida / 50) + ')';
        g.beginPath();
        g.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        g.fill();
      });
      chispas = chispas.filter(function (p) { return p.vida > 0; });
      g.globalCompositeOperation = 'source-over';

      // Progreso dentro de la canción (16 compases)
      barra.style.transform = 'scaleX(' + (((compasTotal % 16) + 1) / 16).toFixed(3) + ')';
      var s = nombreSeccion(compasTotal);
      if (s !== seccionActual && IW.audio.ctx) {
        seccionActual = s;
        seccion.textContent = s;
        root.dataset.section = s;
      }

      requestAnimationFrame(dibujar);
    }
    requestAnimationFrame(dibujar);
    aplicarVolumen();

    IW.ui.startCard({
      kicker: 'Headphones on',
      title: 'Somewhere Louder',
      sub: c.scene.pleasure,
      button: 'Play'
    }).then(function () {
      if (!IW.audio.ctx) return;
      crearMurmullo();
      aplicarVolumen();
      tocar();
      vol.focus({ preventScroll: true });
      setTimeout(function () { IW.ui.toast('Turn it up.'); }, 2500);
    });
  };
})();
