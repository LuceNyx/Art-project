/* =========================================================================
   IMAGINED WORLD · exp-vr.js
   LENTES VR → VOLAR (Uncertain future)
   Vista a través de dos lentes. Vuelas sobre un mundo enorme y atraviesas
   anillos de luz. Siempre hay un objetivo claro y una distancia que baja:
   "Reach the light · 1.2 km". Al cumplirlo, aparece otro. Aquí el mundo
   tiene un mapa.
   Residuo: la ventana encendida sigue en el horizonte, en gris, y nunca
   se acerca por más que vueles.
   Controles: mouse / dedo para dirigir, o flechas / WASD.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var OBJETIVOS = ['Reach the light', 'Fly through the gates', 'Follow the birds', 'Find the floating island', 'Touch the clouds', 'Cross the bright valley'];
  var NOTAS = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  IW.experiences.vr = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-vr">' +
        '<canvas class="iw-vr__canvas" aria-label="Flying through a wide bright world, through rings of light"></canvas>' +
        '<div class="iw-vr__lenses" aria-hidden="true"></div>' +
        '<div class="iw-vr__hud">' +
          '<p class="iw-vr__label">Objective</p>' +
          '<p class="iw-vr__goal" id="iw-vr-goal">Reach the light</p>' +
          '<p class="iw-vr__dist"><span id="iw-vr-dist">1.2 km</span> · gates <span id="iw-vr-gates">0</span></p>' +
        '</div>' +
        '<p class="iw-vr__banner" id="iw-vr-banner" aria-live="polite"></p>' +
        '<p class="iw-vr__help">Steer with the mouse, a finger or the arrow keys</p>' +
      '</div>';

    var root = c.root.querySelector('.iw-vr');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var el = {
      goal: root.querySelector('#iw-vr-goal'), dist: root.querySelector('#iw-vr-dist'),
      gates: root.querySelector('#iw-vr-gates'), banner: root.querySelector('#iw-vr-banner')
    };

    // Residuo: la ventana encendida, fija en el horizonte
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-vr__residue', c.scene.motifDescription);
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

    var cam = { x: 0, y: 0, tx: 0, ty: 0 };
    var anillos = [];
    var nubes = [];
    var pajaros = [];
    var velocidad = 0.6;
    var volando = false;
    var distancia = 1200;
    var objetivo = 0;
    var puertas = 0;
    var avance = 0;
    var teclas = {};

    for (var n = 0; n < 14; n++) nubes.push({ x: (Math.random() - 0.5) * 30, y: -2 - Math.random() * 3, z: 2 + Math.random() * 40, w: 3 + Math.random() * 4 });
    for (var b = 0; b < 9; b++) pajaros.push({ x: (Math.random() - 0.5) * 6, y: -1.5 - Math.random(), z: 6 + b * 4, f: Math.random() * 6 });

    function nuevoAnillo(z) {
      anillos.push({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 - 0.4, z: z, hue: 180 + Math.random() * 140, hecho: false });
    }
    for (var a = 0; a < 6; a++) nuevoAnillo(8 + a * 7);

    function proyectar(x, y, z) {
      var f = Math.min(W, H) * 0.9;
      return { sx: W / 2 + ((x - cam.x) * f) / z, sy: H * 0.46 + ((y - cam.y) * f) / z, k: f / z };
    }

    function anunciar(t) {
      el.banner.textContent = t;
      el.banner.classList.remove('iw-vr__banner--on');
      void el.banner.offsetWidth;
      el.banner.classList.add('iw-vr__banner--on');
    }

    /* ---------- Entrada ---------- */
    window.addEventListener('pointermove', function (e) {
      cam.tx = ((e.clientX / W) - 0.5) * 4;
      cam.ty = ((e.clientY / H) - 0.5) * 2.2;
    }, { passive: true });
    document.addEventListener('keydown', function (e) { teclas[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', function (e) { teclas[e.key.toLowerCase()] = false; });

    /* ---------- Sonido: viento y un acorde que flota ---------- */
    function sonido() {
      var ctx = IW.audio.ctx;
      if (!ctx) return;
      var largo = ctx.sampleRate * 3;
      var buf = ctx.createBuffer(1, largo, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 500;
      var gv = ctx.createGain();
      gv.gain.value = 0.05;
      src.connect(lp).connect(gv).connect(IW.audio.out);
      src.start();
      sonido.viento = lp;
      IW.audio.loop(80, function (k, t) {
        if (k % 32 === 0) {
          [196, 293.66, 392, 587.33].forEach(function (f) {
            IW.audio.tone({ when: t, f: f, dur: 6.5, type: 'sine', vol: 0.03, attack: 1.8 });
          });
        }
      });
    }

    /* ---------- Bucle ---------- */
    var ultimo = 0;
    function paso(t) {
      var dt = Math.min(0.05, (t - ultimo) / 1000 || 0.016);
      ultimo = t;

      var kx = (teclas.arrowright || teclas.d ? 1 : 0) - (teclas.arrowleft || teclas.a ? 1 : 0);
      var ky = (teclas.arrowdown || teclas.s ? 1 : 0) - (teclas.arrowup || teclas.w ? 1 : 0);
      if (kx || ky) { cam.tx = Math.max(-2, Math.min(2, cam.tx + kx * dt * 3)); cam.ty = Math.max(-1.1, Math.min(1.1, cam.ty + ky * dt * 2)); }
      cam.x += (cam.tx - cam.x) * 0.05;
      cam.y += (cam.ty - cam.y) * 0.05;

      var v = volando ? velocidad * (reducido ? 0.5 : 1) : 0.08;
      avance += v * dt * 10;

      anillos.forEach(function (r) {
        r.z -= v * dt * 10;
        if (!r.hecho && r.z < 1.2 && volando) {
          r.hecho = true;
          var dx = r.x - cam.x, dy = r.y - cam.y;
          if (dx * dx + dy * dy < 0.9) {
            puertas++;
            velocidad = Math.min(1.6, velocidad + 0.05);
            IW.audio.tone({ f: NOTAS[puertas % NOTAS.length], dur: 1.2, type: 'triangle', vol: 0.09 });
            IW.audio.tone({ f: NOTAS[(puertas + 2) % NOTAS.length] * 2, dur: 0.8, type: 'sine', vol: 0.04 });
            anunciar('+1');
          }
        }
      });
      anillos = anillos.filter(function (r) { return r.z > 0.3; });
      while (anillos.length < 6) nuevoAnillo((anillos.length ? anillos[anillos.length - 1].z : 8) + 7);

      nubes.forEach(function (q) { q.z -= v * dt * 6; if (q.z < 1) { q.z = 40; q.x = (Math.random() - 0.5) * 30; } });
      pajaros.forEach(function (q) { q.z -= v * dt * 4; q.f += dt * 8; if (q.z < 1) { q.z = 40; q.x = (Math.random() - 0.5) * 6; } });

      // Objetivo: siempre claro, siempre alcanzable
      if (volando) {
        distancia -= v * dt * 60;
        if (distancia <= 0) {
          objetivo++;
          distancia = 900 + Math.random() * 900;
          el.goal.textContent = OBJETIVOS[objetivo % OBJETIVOS.length];
          anunciar('Objective complete');
          IW.ui.toast('New objective: ' + OBJETIVOS[objetivo % OBJETIVOS.length], 2600);
          [523.25, 659.25, 783.99].forEach(function (f, i) {
            IW.audio.tone({ f: f, dur: 1.4, type: 'triangle', vol: 0.07, when: IW.audio.ctx && IW.audio.ctx.currentTime + i * 0.12 });
          });
        }
        el.dist.textContent = (distancia / 1000).toFixed(1) + ' km';
        el.gates.textContent = puertas;
        if (sonido.viento) sonido.viento.frequency.setTargetAtTime(400 + velocidad * 600, IW.audio.ctx.currentTime, 0.3);
      }

      dibujar(t);
      requestAnimationFrame(paso);
    }

    function dibujar(t) {
      var hy = H * 0.46 - cam.y * 40;
      // Cielo
      var cielo = g.createLinearGradient(0, 0, 0, hy);
      cielo.addColorStop(0, '#17205a');
      cielo.addColorStop(0.6, '#6a5ab8');
      cielo.addColorStop(1, '#ffc9a0');
      g.fillStyle = cielo;
      g.fillRect(0, 0, W, hy);
      // La luz del objetivo, en el horizonte
      var lx = W / 2 - cam.x * 60;
      var luz = g.createRadialGradient(lx, hy, 0, lx, hy, H * 0.4);
      luz.addColorStop(0, 'rgba(255,250,230,1)');
      luz.addColorStop(0.08, 'rgba(255,230,180,.9)');
      luz.addColorStop(1, 'rgba(255,190,150,0)');
      g.fillStyle = luz;
      g.fillRect(0, 0, W, H);

      // Montañas lejanas
      g.fillStyle = '#8a7fd0';
      g.beginPath();
      g.moveTo(0, hy);
      for (var i = 0; i <= 20; i++) {
        var mx = (i / 20) * W;
        g.lineTo(mx, hy - (Math.sin(i * 1.7 + 1) * 0.5 + 0.6) * H * 0.07 - cam.x * 0);
      }
      g.lineTo(W, hy); g.closePath(); g.fill();

      // Suelo con rejilla en perspectiva que avanza
      var suelo = g.createLinearGradient(0, hy, 0, H);
      suelo.addColorStop(0, '#3a2f7a');
      suelo.addColorStop(1, '#0d0a2a');
      g.fillStyle = suelo;
      g.fillRect(0, hy, W, H - hy);
      g.strokeStyle = 'rgba(127,230,208,.35)';
      g.lineWidth = 1;
      for (var z = 1; z < 30; z++) {
        var zz = z - (avance % 1);
        var y = hy + (H * 0.5) / zz;
        if (y > H) continue;
        g.globalAlpha = Math.min(1, 1.6 / zz + 0.1);
        g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
      }
      g.globalAlpha = 1;
      for (var xl = -12; xl <= 12; xl++) {
        var p1 = proyectar(xl, 2, 30), p2 = proyectar(xl, 2, 0.6);
        g.beginPath(); g.moveTo(p1.sx, Math.max(hy, p1.sy)); g.lineTo(p2.sx, p2.sy); g.stroke();
      }

      // Nubes
      nubes.slice().sort(function (a2, b2) { return b2.z - a2.z; }).forEach(function (q) {
        var p = proyectar(q.x, q.y, q.z);
        var r = q.w * p.k * 0.3;
        if (r < 2) return;
        var ng = g.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r);
        ng.addColorStop(0, 'rgba(255,240,255,' + Math.min(0.5, 6 / q.z) + ')');
        ng.addColorStop(1, 'rgba(255,240,255,0)');
        g.fillStyle = ng;
        g.fillRect(p.sx - r, p.sy - r, r * 2, r * 2);
      });

      // Pájaros
      g.strokeStyle = 'rgba(255,255,255,.75)';
      g.lineWidth = 2;
      pajaros.forEach(function (q) {
        var p = proyectar(q.x, q.y, q.z);
        var s = Math.max(3, p.k * 0.08);
        var ala = Math.sin(q.f) * s * 0.5;
        g.beginPath(); g.moveTo(p.sx - s, p.sy - ala); g.lineTo(p.sx, p.sy); g.lineTo(p.sx + s, p.sy - ala); g.stroke();
      });

      // Anillos de luz (de lejos a cerca)
      anillos.slice().sort(function (a2, b2) { return b2.z - a2.z; }).forEach(function (r) {
        var p = proyectar(r.x, r.y, r.z);
        var radio = 0.9 * p.k;
        if (radio > W * 2) return;
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = 'hsla(' + r.hue + ',95%,70%,' + Math.min(1, 3 / r.z + 0.2) + ')';
        g.lineWidth = Math.max(2, radio * 0.08);
        g.shadowColor = 'hsl(' + r.hue + ',95%,65%)';
        g.shadowBlur = 20;
        g.beginPath(); g.arc(p.sx, p.sy, radio, 0, Math.PI * 2); g.stroke();
        g.shadowBlur = 0;
        g.globalCompositeOperation = 'source-over';
      });

      // Marcador del objetivo: siempre sabes hacia dónde ir
      g.fillStyle = '#fff6e0';
      g.beginPath();
      g.moveTo(lx, hy - 46); g.lineTo(lx + 8, hy - 36); g.lineTo(lx, hy - 26); g.lineTo(lx - 8, hy - 36); g.closePath();
      g.fill();
    }

    requestAnimationFrame(paso);

    IW.ui.startCard({
      kicker: 'Headset on',
      title: 'Loading world',
      sub: c.scene.pleasure,
      button: 'Start'
    }).then(function () {
      volando = true;
      sonido();
      anunciar('Welcome');
    });
  };
})();
