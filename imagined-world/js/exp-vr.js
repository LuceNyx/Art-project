/* =========================================================================
   IMAGINED WORLD · exp-vr.js
   LENTES VR → UN PLANETA QUE NO EXISTE (Uncertain future)
   Vista a través de un visor: un mundo imposible. Dos soles, un planeta
   gigante con anillos en el cielo, montañas que flotan con cascadas,
   cordilleras en capas con niebla, un suelo que brilla y criaturas: una
   ballena del cielo a lo lejos, un caminante de patas larguísimas en el
   horizonte y medusas de luz cerca de la cámara.
   Canvas 2D pseudo-3D (sin librerías). Efecto de lentes: viñeta doble,
   aberración cromática en los bordes y HUD tenue.
   Residuo: la ventana encendida en el horizonte, en gris; nunca se acerca.
   Controles: mirar con el mouse o el dedo (o flechas).
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  /** Pseudoaleatorio con semilla: el paisaje siempre sale igual. */
  function semilla(s) {
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  /** Ruido suave 1D (suma de senos) para las cordilleras. */
  function cresta(x, k) {
    return Math.sin(x * 0.9 + k) * 0.45 + Math.sin(x * 2.3 + k * 1.7) * 0.25 + Math.sin(x * 5.1 + k * 0.6) * 0.12 + Math.abs(Math.sin(x * 0.37 + k)) * 0.35;
  }

  /*
   * Resplandores pre-dibujados: crear un degradado por objeto y por cuadro
   * es lento; aquí se dibujan una vez (por tono) y se reutilizan como imagen.
   */
  var cacheBrillo = {};
  function brillo(tono) {
    var clave = tono === null ? 'blanco' : Math.round(tono / 20) * 20;
    if (cacheBrillo[clave]) return cacheBrillo[clave];
    var cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    var x = cv.getContext('2d');
    var gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    var col = tono === null ? '255,240,220' : null;
    if (col) {
      gr.addColorStop(0, 'rgba(' + col + ',1)');
      gr.addColorStop(1, 'rgba(' + col + ',0)');
    } else {
      gr.addColorStop(0, 'hsla(' + clave + ',95%,75%,1)');
      gr.addColorStop(0.4, 'hsla(' + clave + ',95%,62%,.45)');
      gr.addColorStop(1, 'hsla(' + clave + ',95%,60%,0)');
    }
    x.fillStyle = gr;
    x.fillRect(0, 0, 64, 64);
    cacheBrillo[clave] = cv;
    return cv;
  }

  IW.experiences.vr = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-vr">' +
        '<canvas class="iw-vr__canvas" aria-label="Looking through a headset at an alien planet: two suns, a ringed giant in the sky, floating mountains and slow enormous creatures"></canvas>' +
        '<div class="iw-vr__hud" aria-hidden="true">' +
          '<p class="iw-vr__label">VEYA-9 · surface</p>' +
          '<p class="iw-vr__data"><span id="iw-vr-alt">ALT 1,240 m</span> · −12 °C · 0.38 g · <span id="iw-vr-time">00:00</span></p>' +
          '<div class="iw-vr__compass"><span id="iw-vr-compass">N · · · NE · · · E · · · SE · · · S · · · SW · · · W · · · NW · · · N</span></div>' +
        '</div>' +
        '<p class="iw-vr__help">Look around with the mouse, a finger or the arrow keys</p>' +
      '</div>';

    var root = c.root.querySelector('.iw-vr');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var hud = { alt: root.querySelector('#iw-vr-alt'), time: root.querySelector('#iw-vr-time'), compass: root.querySelector('#iw-vr-compass') };

    // Residuo: la ventana encendida, fija en el horizonte
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-vr__residue', c.scene.motifDescription);
    if (residuo) root.appendChild(residuo);

    var W = 0, H = 0;
    var capas = [];   // cordilleras pre-dibujadas (lienzos fuera de pantalla)
    var visor = null; // las lentes del visor (viñeta doble + borde de colores), pre-dibujadas

    /**
     * El visor se dibuja UNA vez por tamaño de pantalla: negro con dos
     * lentes recortadas de borde suave y un fino borde magenta/cian
     * (aberración cromática). En cada cuadro solo se pega encima.
     */
    function crearVisor() {
      visor = document.createElement('canvas');
      visor.width = W;
      visor.height = H;
      var x = visor.getContext('2d');
      var R = Math.max(W, H) * 0.34;
      var lentes = [[W * 0.3, H * 0.5], [W * 0.7, H * 0.5]];
      x.fillStyle = 'rgba(0,0,0,.94)';
      x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'destination-out';
      lentes.forEach(function (l) {
        var gr = x.createRadialGradient(l[0], l[1], R * 0.78, l[0], l[1], R);
        gr.addColorStop(0, 'rgba(0,0,0,1)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gr;
        x.beginPath(); x.arc(l[0], l[1], R, 0, Math.PI * 2); x.fill();
      });
      x.globalCompositeOperation = 'lighter';
      lentes.forEach(function (l) {
        [[R * 0.955, 'rgba(60,220,255,.14)'], [R * 0.985, 'rgba(255,60,200,.16)']].forEach(function (a) {
          x.strokeStyle = a[1];
          x.lineWidth = R * 0.022;
          x.beginPath(); x.arc(l[0], l[1], a[0], 0, Math.PI * 2); x.stroke();
        });
      });
    }

    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 1.25);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * d);
      canvas.height = Math.round(H * d);
      g.setTransform(d, 0, 0, d, 0, 0);
      crearCapas();
      crearVisor();
    }

    /* ---------- Cordilleras en capas, con niebla (se dibujan una vez) ---------- */
    var COLORES_CAPA = [
      { c: '#8a7fc8', niebla: 0.62, alto: 0.2, k: 1.2 },
      { c: '#6a5aa8', niebla: 0.45, alto: 0.26, k: 3.8 },
      { c: '#4a3d86', niebla: 0.28, alto: 0.32, k: 7.1 },
      { c: '#2c2460', niebla: 0.12, alto: 0.4, k: 11.4 }
    ];

    function crearCapas() {
      capas = COLORES_CAPA.map(function (cfg, i) {
        var ancho = Math.round(W * 2.2);
        var alto = Math.round(H * 0.6);
        var cv = document.createElement('canvas');
        cv.width = ancho;
        cv.height = alto;
        var x = cv.getContext('2d');
        var rnd = semilla(7 + i * 13);
        // Silueta de la cordillera (repetible en horizontal)
        x.beginPath();
        x.moveTo(0, alto);
        for (var px = 0; px <= ancho; px += 6) {
          var u = (px / ancho) * Math.PI * 2 * 3;
          var y = alto - (0.35 + cresta(u, cfg.k) * 0.5) * alto * cfg.alto * 2.2;
          x.lineTo(px, y);
        }
        x.lineTo(ancho, alto);
        x.closePath();
        var gr = x.createLinearGradient(0, 0, 0, alto);
        gr.addColorStop(0, cfg.c);
        gr.addColorStop(1, '#120c2a');
        x.fillStyle = gr;
        x.fill();
        // Picos de cristal brillantes en las capas cercanas
        if (i >= 2) {
          for (var k = 0; k < 26; k++) {
            var cx = rnd() * ancho, base = alto * (0.55 + rnd() * 0.35), h = 10 + rnd() * 34 * (i - 1);
            x.fillStyle = 'rgba(127,240,220,' + (0.25 + rnd() * 0.35) + ')';
            x.beginPath(); x.moveTo(cx, base - h); x.lineTo(cx + h * 0.18, base); x.lineTo(cx - h * 0.18, base); x.fill();
          }
        }
        // Niebla encima
        x.globalCompositeOperation = 'source-atop';
        var niebla = x.createLinearGradient(0, 0, 0, alto);
        niebla.addColorStop(0, 'rgba(255,190,200,' + cfg.niebla + ')');
        niebla.addColorStop(0.7, 'rgba(160,120,200,' + cfg.niebla * 0.6 + ')');
        niebla.addColorStop(1, 'rgba(40,20,80,0)');
        x.fillStyle = niebla;
        x.fillRect(0, 0, ancho, alto);
        return { cv: cv, vel: 0.06 + i * 0.09, base: 0.5 + i * 0.035 };
      });
    }

    window.addEventListener('resize', medir);
    medir();

    /* ---------- Elementos del mundo ---------- */
    var rnd = semilla(42);
    var islas = [];
    for (var i = 0; i < 7; i++) {
      islas.push({ x: rnd() * 2 - 0.5, y: 0.18 + rnd() * 0.28, z: 0.3 + rnd() * 0.7, r: 0.6 + rnd() * 0.8, fase: rnd() * 6, cascada: rnd() < 0.6 });
    }
    var medusas = [];
    for (var m = 0; m < 9; m++) {
      medusas.push({ x: rnd(), y: 0.25 + rnd() * 0.5, z: 0.4 + rnd() * 0.9, fase: rnd() * 6, hue: 170 + rnd() * 140 });
    }
    var esporas = [];
    for (var e = 0; e < 90; e++) esporas.push({ x: rnd(), y: rnd(), z: 0.2 + rnd() * 1.2, v: 0.2 + rnd() * 0.6 });
    var plantas = [];
    for (var p = 0; p < 70; p++) plantas.push({ x: rnd() * 2 - 1, z: rnd(), hue: 160 + rnd() * 160, h: 0.5 + rnd() });
    var estrellas = [];
    for (var s = 0; s < 140; s++) estrellas.push({ x: rnd(), y: rnd() * 0.45, b: rnd() });

    /* ---------- Cámara (mirar alrededor) ---------- */
    var cam = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, roll: 0 };
    var teclas = {};
    window.addEventListener('pointermove', function (e) {
      cam.tyaw = (e.clientX / W - 0.5) * 2;
      cam.tpitch = (e.clientY / H - 0.5) * 2;
    }, { passive: true });
    document.addEventListener('keydown', function (e) { teclas[e.key] = true; });
    document.addEventListener('keyup', function (e) { teclas[e.key] = false; });

    /* ---------- Sonido: un mundo enorme ---------- */
    function sonido() {
      var ctx = IW.audio.ctx;
      if (!ctx) return;
      // Viento
      var largo = ctx.sampleRate * 3;
      var buf = ctx.createBuffer(1, largo, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i2 = 0; i2 < largo; i2++) d[i2] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
      var gv = ctx.createGain(); gv.gain.value = 0.05;
      src.connect(lp).connect(gv).connect(IW.audio.out);
      src.start();
      // Acorde extraño que flota, y la llamada lejana de la ballena
      IW.audio.loop(60, function (k, t) {
        if (k % 32 === 0) {
          [98, 146.83, 233.08, 311.13].forEach(function (f) {
            IW.audio.tone({ when: t, f: f, dur: 8, type: 'sine', vol: 0.03, attack: 2.5 });
          });
        }
        if (k % 96 === 40) {
          IW.audio.tone({ when: t, f: 180, slide: 90, dur: 3.5, type: 'sine', vol: 0.06, attack: 0.8, filter: 600 });
          IW.audio.tone({ when: t + 0.4, f: 270, slide: 140, dur: 3, type: 'triangle', vol: 0.025, attack: 0.8, filter: 700 });
        }
        if (k % 24 === 12) IW.audio.tone({ when: t, f: [1046, 1175, 1397, 1568][(k / 24) % 4 | 0], dur: 2.2, type: 'sine', vol: 0.015 });
      });
    }

    /* ---------- Dibujo ---------- */
    var t0 = performance.now();

    function dibujar(t) {
      var seg = (t - t0) / 1000;
      // Cámara: sigue al puntero con suavidad y un vaivén de respiración
      var kx = (teclas.ArrowRight ? 1 : 0) - (teclas.ArrowLeft ? 1 : 0);
      var ky = (teclas.ArrowDown ? 1 : 0) - (teclas.ArrowUp ? 1 : 0);
      if (kx || ky) { cam.tyaw = Math.max(-1, Math.min(1, cam.tyaw + kx * 0.02)); cam.tpitch = Math.max(-1, Math.min(1, cam.tpitch + ky * 0.02)); }
      var suave = reducido ? 0.2 : 0.04;
      cam.yaw += (cam.tyaw - cam.yaw) * suave;
      cam.pitch += (cam.tpitch - cam.pitch) * suave;
      var respiro = reducido ? 0 : Math.sin(seg * 0.6) * 4;
      cam.roll += ((cam.tyaw - cam.yaw) * 0.12 - cam.roll) * 0.05;

      var hy = H * (0.56 - cam.pitch * 0.12) + respiro;   // horizonte
      var avance = reducido ? seg * 0.2 : seg;           // vuelo lento hacia delante

      g.save();
      g.translate(W / 2, H / 2);
      g.rotate(reducido ? 0 : cam.roll * 0.06);
      g.translate(-W / 2, -H / 2);

      // Cielo
      var cielo = g.createLinearGradient(0, 0, 0, hy);
      cielo.addColorStop(0, '#0a0b2e');
      cielo.addColorStop(0.45, '#3a1f6a');
      cielo.addColorStop(0.8, '#c0507a');
      cielo.addColorStop(1, '#ffb27a');
      g.fillStyle = cielo;
      g.fillRect(-40, -40, W + 80, hy + 40);

      // Estrellas (todavía visibles con dos soles)
      estrellas.forEach(function (st) {
        var sx = ((st.x - cam.yaw * 0.04) % 1 + 1) % 1 * W;
        g.fillStyle = 'rgba(255,255,255,' + (0.2 + st.b * 0.5) * (1 - st.y * 1.6) + ')';
        g.fillRect(sx, st.y * hy, 1.5, 1.5);
      });

      // El planeta gigante con anillos
      var px = W * (0.72 - cam.yaw * 0.06), py = hy * (0.42 - cam.pitch * 0.05), pr = Math.min(W, H) * 0.28;
      g.save();
      g.translate(px, py);
      g.rotate(-0.32);
      anillo(pr, true);
      var pg = g.createRadialGradient(-pr * 0.35, -pr * 0.35, pr * 0.1, 0, 0, pr);
      pg.addColorStop(0, '#ffd8b0');
      pg.addColorStop(0.5, '#c87a9a');
      pg.addColorStop(1, '#3a2060');
      g.fillStyle = pg;
      g.beginPath(); g.arc(0, 0, pr, 0, Math.PI * 2); g.fill();
      // Bandas del planeta
      g.save();
      g.beginPath(); g.arc(0, 0, pr, 0, Math.PI * 2); g.clip();
      for (var bnd = -5; bnd <= 5; bnd++) {
        g.fillStyle = bnd % 2 ? 'rgba(255,230,210,.10)' : 'rgba(80,30,90,.14)';
        g.fillRect(-pr, bnd * pr * 0.17, pr * 2, pr * 0.09);
      }
      g.restore();
      anillo(pr, false);
      g.restore();

      // Los dos soles, con resplandor y rayos
      sol(W * (0.24 - cam.yaw * 0.08), hy - H * 0.16, Math.min(W, H) * 0.06, '255,190,120', seg);
      sol(W * (0.4 - cam.yaw * 0.08), hy - H * 0.3, Math.min(W, H) * 0.028, '170,220,255', seg + 2);

      // La ballena del cielo: enorme, lejos, lenta
      ballena(seg, hy);

      // Cordilleras con parallax
      capas.forEach(function (cp, i) {
        var ancho = cp.cv.width;
        var desp = ((avance * 18 * cp.vel + cam.yaw * W * cp.vel * 0.6) % ancho + ancho) % ancho;
        // La base de cada cordillera queda justo sobre el horizonte (las cercanas, un poco más abajo)
        var y = hy - cp.cv.height + 6 + i * 10;
        for (var xx = -desp; xx < W; xx += ancho) g.drawImage(cp.cv, xx, y);
        // El caminante gigante entre la segunda y la tercera capa
        if (i === 1) caminante(seg, hy);
      });

      // Suelo luminoso en perspectiva
      var suelo = g.createLinearGradient(0, hy, 0, H);
      suelo.addColorStop(0, '#2a1c55');
      suelo.addColorStop(1, '#0a0820');
      g.fillStyle = suelo;
      g.fillRect(-40, hy, W + 80, H - hy + 40);
      g.globalCompositeOperation = 'lighter';
      plantas.forEach(function (pl) {
        var z = ((pl.z - avance * 0.05) % 1 + 1) % 1;       // se acercan
        var prof = 0.05 + z;
        var sx = W / 2 + ((pl.x - cam.yaw * 0.4) * W * 0.6) / prof;
        var sy = hy + (H - hy) * (0.04 / prof) * 2.2;
        if (sy > H + 40 || sx < -60 || sx > W + 60) return;
        var tam = (6 / prof) * pl.h;
        g.globalAlpha = 0.8;
        g.drawImage(brillo(pl.hue), sx - tam * 1.6, sy - tam * 2.6, tam * 3.2, tam * 3.2);
        g.globalAlpha = 1;
        g.strokeStyle = 'hsla(' + pl.hue + ',80%,60%,.5)';
        g.lineWidth = Math.max(1, tam * 0.12);
        g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + tam * 0.2, sy - tam * 0.6, sx, sy - tam); g.stroke();
      });
      g.globalCompositeOperation = 'source-over';

      // Niebla en el horizonte
      var niebla = g.createLinearGradient(0, hy - H * 0.12, 0, hy + H * 0.1);
      niebla.addColorStop(0, 'rgba(255,170,190,0)');
      niebla.addColorStop(0.5, 'rgba(255,170,190,.28)');
      niebla.addColorStop(1, 'rgba(255,170,190,0)');
      g.fillStyle = niebla;
      g.fillRect(-40, hy - H * 0.12, W + 80, H * 0.22);

      // Montañas flotantes con cascadas
      islas.slice().sort(function (a, b) { return a.z - b.z; }).forEach(function (is) {
        var x = ((is.x - avance * 0.004 * is.z - cam.yaw * 0.15 * is.z) % 2 + 2) % 2 - 0.5;
        isla(x * W, hy * (is.y + Math.sin(seg * 0.3 + is.fase) * 0.015) - cam.pitch * 20 * is.z, Math.min(W, H) * 0.12 * is.r * is.z, is, seg);
      });

      // Medusas de luz, cerca
      g.globalCompositeOperation = 'lighter';
      medusas.forEach(function (md) {
        var x = ((md.x + seg * 0.006 * md.z - cam.yaw * 0.3 * md.z) % 1.2 + 1.2) % 1.2 - 0.1;
        medusa(x * W, H * md.y + Math.sin(seg * 0.8 + md.fase) * 20 - cam.pitch * 40 * md.z, 22 * md.z + 6, md, seg);
      });

      // Esporas: polvo luminoso que pasa junto a la cámara (desenfocado)
      esporas.forEach(function (sp) {
        sp.y -= 0.0006 * sp.v * (reducido ? 0.2 : 1);
        if (sp.y < -0.05) sp.y = 1.05;
        var x = ((sp.x - cam.yaw * 0.25 * sp.z + seg * 0.004 * sp.z) % 1 + 1) % 1;
        var r = sp.z * 3;
        g.globalAlpha = Math.min(1, 0.5 / sp.z);
        g.drawImage(brillo(null), x * W - r * 2.5, sp.y * H - r * 2.5, r * 5, r * 5);
        g.globalAlpha = 1;
      });
      g.globalCompositeOperation = 'source-over';
      g.restore();

      // Las lentes del visor encima de todo
      if (visor) g.drawImage(visor, 0, 0, W, H);

      // HUD
      hud.alt.textContent = 'ALT ' + Math.round(1240 + Math.sin(seg * 0.2) * 40 - cam.pitch * 60).toLocaleString('en-US') + ' m';
      var min = Math.floor(seg / 60), sg = Math.floor(seg % 60);
      hud.time.textContent = String(min).padStart(2, '0') + ':' + String(sg).padStart(2, '0');
      hud.compass.style.transform = 'translateX(' + (-cam.yaw * 120 - 50) + 'px)';

      requestAnimationFrame(dibujar);
    }

    function anillo(pr, detras) {
      // Mitad de atrás (antes del planeta) o de delante (después)
      g.save();
      g.beginPath();
      if (detras) g.rect(-pr * 2.4, -pr * 2, pr * 4.8, pr * 2);
      else g.rect(-pr * 2.4, 0, pr * 4.8, pr * 2);
      g.clip();
      [[2.1, 'rgba(255,220,200,.35)', 10], [1.8, 'rgba(200,160,230,.4)', 14], [1.5, 'rgba(255,200,170,.25)', 6]].forEach(function (a) {
        g.strokeStyle = a[1];
        g.lineWidth = a[2];
        g.beginPath();
        g.ellipse(0, 0, pr * a[0], pr * a[0] * 0.22, 0, 0, Math.PI * 2);
        g.stroke();
      });
      g.restore();
    }

    function sol(x, y, r, rgb, seg) {
      g.globalCompositeOperation = 'lighter';
      var halo = g.createRadialGradient(x, y, 0, x, y, r * 7);
      halo.addColorStop(0, 'rgba(' + rgb + ',.9)');
      halo.addColorStop(0.15, 'rgba(' + rgb + ',.45)');
      halo.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = halo;
      g.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
      // Rayos de luz que bajan
      if (!reducido) {
        for (var k = 0; k < 5; k++) {
          var a = 1.2 + k * 0.18 + Math.sin(seg * 0.2 + k) * 0.03;
          var gr = g.createLinearGradient(x, y, x + Math.cos(a) * H, y + Math.sin(a) * H);
          gr.addColorStop(0, 'rgba(' + rgb + ',.10)');
          gr.addColorStop(1, 'rgba(' + rgb + ',0)');
          g.fillStyle = gr;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + Math.cos(a - 0.04) * H * 1.2, y + Math.sin(a - 0.04) * H * 1.2);
          g.lineTo(x + Math.cos(a + 0.04) * H * 1.2, y + Math.sin(a + 0.04) * H * 1.2);
          g.fill();
        }
      }
      g.fillStyle = 'rgb(' + rgb + ')';
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)';
      g.beginPath(); g.arc(x, y, r * 0.7, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
    }

    /** Ballena del cielo: un cuerpo de segmentos que ondula, muy lejos. */
    function ballena(seg, hy) {
      var largo = Math.min(W, H) * 0.55;
      var x0 = ((seg * 8 - cam.yaw * 60) % (W + largo * 2)) - largo;
      var y0 = hy * 0.3;
      var n = 26;
      g.save();
      g.globalAlpha = 0.55;
      for (var i = n; i >= 0; i--) {
        var u = i / n;
        var x = x0 - u * largo;
        var y = y0 + Math.sin(seg * 0.8 - u * 4) * largo * 0.05;
        var r = largo * 0.06 * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.05)) + 2;
        g.fillStyle = '#2a1f55';
        g.beginPath(); g.ellipse(x, y, r * 1.4, r, 0, 0, Math.PI * 2); g.fill();
        // Manchas bioluminiscentes
        if (i % 3 === 0) {
          g.fillStyle = 'rgba(127,240,220,.6)';
          g.beginPath(); g.arc(x, y - r * 0.3, r * 0.18, 0, Math.PI * 2); g.fill();
        }
        // Aletas
        if (i === 8) {
          var ala = Math.sin(seg * 1.2) * r * 1.6;
          g.fillStyle = '#2a1f55';
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - r * 2, y + ala - r * 2, x - r * 3.4, y + ala); g.quadraticCurveTo(x - r * 1.6, y + ala * 0.5, x, y + r * 0.5); g.fill();
        }
      }
      g.restore();
    }

    /** Caminante: un ser altísimo de tres patas en el horizonte. */
    function caminante(seg, hy) {
      var x = ((W * 0.15 + seg * 4 - cam.yaw * W * 0.12) % (W * 1.4)) - W * 0.2;
      var base = hy - 4;
      var alto = H * 0.36;
      var cuerpoY = base - alto + Math.sin(seg * 0.9) * 6;
      g.save();
      g.globalAlpha = 0.7;
      g.strokeStyle = '#3a2a6e';
      g.lineWidth = 3;
      for (var k = 0; k < 3; k++) {
        var fase = seg * 0.9 + k * 2.1;
        var pie = x - 40 + k * 40 + Math.sin(fase) * 24;
        var rod = cuerpoY + alto * 0.5;
        g.beginPath();
        g.moveTo(x, cuerpoY);
        g.quadraticCurveTo((x + pie) / 2 + Math.cos(fase) * 18, rod, pie, base - Math.max(0, Math.cos(fase)) * 8);
        g.stroke();
      }
      g.fillStyle = '#3a2a6e';
      g.beginPath(); g.ellipse(x, cuerpoY, 26, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,210,150,.9)';
      g.beginPath(); g.arc(x + 14, cuerpoY - 2, 3, 0, Math.PI * 2); g.fill();
      g.restore();
    }

    function isla(x, y, r, is, seg) {
      // Roca que cuelga
      var gr = g.createLinearGradient(x, y - r * 0.2, x, y + r * 1.6);
      gr.addColorStop(0, '#6a4a9a');
      gr.addColorStop(1, '#1a1035');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(x - r, y);
      g.quadraticCurveTo(x - r * 0.6, y + r * 0.8, x - r * 0.15, y + r * 1.6);
      g.quadraticCurveTo(x + r * 0.1, y + r * 1.1, x + r * 0.3, y + r * 1.3);
      g.quadraticCurveTo(x + r * 0.7, y + r * 0.6, x + r, y);
      g.closePath();
      g.fill();
      // Cima con vegetación luminosa
      g.fillStyle = '#3fbf9a';
      g.beginPath(); g.ellipse(x, y, r, r * 0.18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(160,255,220,.5)';
      for (var k = -3; k <= 3; k++) {
        g.beginPath(); g.arc(x + k * r * 0.25, y - r * 0.12, r * 0.08, 0, Math.PI * 2); g.fill();
      }
      // Cascada que cae al vacío
      if (is.cascada) {
        var cg = g.createLinearGradient(x, y, x, y + r * 3);
        cg.addColorStop(0, 'rgba(200,240,255,.7)');
        cg.addColorStop(1, 'rgba(200,240,255,0)');
        g.fillStyle = cg;
        var ondula = Math.sin(seg * 3 + is.fase) * r * 0.02;
        g.fillRect(x + r * 0.55 + ondula, y, r * 0.09, r * 3);
      }
      // Niebla según la distancia
      g.fillStyle = 'rgba(255,170,190,' + (0.45 * (1 - is.z)) + ')';
      g.beginPath(); g.ellipse(x, y + r * 0.5, r * 1.1, r * 1.2, 0, 0, Math.PI * 2); g.fill();
    }

    function medusa(x, y, r, md, seg) {
      var pulso = 1 + Math.sin(seg * 2 + md.fase) * 0.12;
      g.globalAlpha = 0.7;
      g.drawImage(brillo(md.hue), x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
      g.globalAlpha = 1;
      g.fillStyle = 'hsla(' + md.hue + ',90%,80%,.55)';
      g.beginPath(); g.ellipse(x, y, r * pulso, r * 0.7 / pulso, 0, Math.PI, 0); g.fill();
      g.strokeStyle = 'hsla(' + md.hue + ',90%,75%,.35)';
      g.lineWidth = 1.5;
      for (var k = -2; k <= 2; k++) {
        g.beginPath();
        g.moveTo(x + k * r * 0.3, y);
        g.quadraticCurveTo(x + k * r * 0.3 + Math.sin(seg * 2 + k) * r * 0.4, y + r * 1.4, x + k * r * 0.2, y + r * 2.6);
        g.stroke();
      }
    }

    requestAnimationFrame(dibujar);
    IW.ui.startCard().then(sonido);
  };
})();
