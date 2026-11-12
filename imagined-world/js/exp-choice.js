/* =========================================================================
   IMAGINED WORLD · exp-choice.js
   COMPUTADORA → JUEGO DE DECISIONES (Lack of control)
   Lo contrario de las 7:00 que se repiten: aquí cada elección cambia el
   mundo al instante. Tres opciones por turno (lluvia, montañas, un río,
   una segunda luna…); el mundo obedece y el contador de turnos sube.
   Residuo: el reloj detenido en las 7:00 sigue en la esquina, en gris.
   Teclado: 1, 2, 3 o Tab + Enter.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var CIELOS = {
    dawn:   ['#3a2a6e', '#ff9e8a', '#ffd9a8'],
    day:    ['#3f7fd6', '#8fd0ff', '#dff3ff'],
    dusk:   ['#2a1f5a', '#b85a9e', '#ffb38a'],
    night:  ['#070a22', '#141a44', '#2a2a5e'],
    aurora: ['#04091c', '#0d2440', '#1b3a52']
  };

  // Lo que el visitante puede elegir (inglés: lo ve el visitante)
  var ACCIONES = [
    { label: 'Make it night', f: function (m) { m.sky = 'night'; } },
    { label: 'Bring the dawn', f: function (m) { m.sky = 'dawn'; } },
    { label: 'A bright blue day', f: function (m) { m.sky = 'day'; } },
    { label: 'Paint the sky with lights', f: function (m) { m.sky = 'aurora'; } },
    { label: 'A slow golden dusk', f: function (m) { m.sky = 'dusk'; } },
    { label: 'Make it rain', f: function (m) { m.weather = 'rain'; } },
    { label: 'Let it snow', f: function (m) { m.weather = 'snow'; } },
    { label: 'Fill the air with petals', f: function (m) { m.weather = 'petals'; } },
    { label: 'Clear the sky', f: function (m) { m.weather = 'clear'; } },
    { label: 'Raise the mountains', f: function (m) { m.amp = Math.min(1.6, m.amp + 0.45); } },
    { label: 'Flatten the land', f: function (m) { m.amp = Math.max(0.15, m.amp - 0.45); } },
    { label: 'Grow a forest', f: function (m) { m.trees = Math.min(40, m.trees + 12); } },
    { label: 'Open a river', f: function (m) { m.river = true; } },
    { label: 'Build a bridge', f: function (m) { m.river = true; m.bridge = true; } },
    { label: 'Raise a tower of light', f: function (m) { m.tower = true; } },
    { label: 'Call the birds', f: function (m) { m.birds = Math.min(24, m.birds + 8); } },
    { label: 'Light a thousand lanterns', f: function (m) { m.lanterns = Math.min(80, m.lanterns + 30); } },
    { label: 'Add a second moon', f: function (m) { m.moons = Math.min(3, m.moons + 1); } },
    { label: 'Plant a garden', f: function (m) { m.flowers = Math.min(120, m.flowers + 40); } }
  ];

  var RESPUESTAS = ['Because you chose.', 'It listened.', 'Just like that.', 'The world changed.', 'Your call.', 'Done.'];

  function mezclar(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    var r = Math.round(((x >> 16) & 255) + ((((y >> 16) & 255) - ((x >> 16) & 255)) * t));
    var gg = Math.round(((x >> 8) & 255) + ((((y >> 8) & 255) - ((x >> 8) & 255)) * t));
    var bb = Math.round((x & 255) + (((y & 255) - (x & 255)) * t));
    return 'rgb(' + r + ',' + gg + ',' + bb + ')';
  }

  IW.experiences.choice = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-choice">' +
        '<canvas class="iw-choice__canvas" aria-label="Your world. It changes with every choice."></canvas>' +
        '<div class="iw-choice__hud">' +
          '<p class="iw-choice__name">Your world</p>' +
          '<p class="iw-choice__turn" id="iw-c-turn">Turn 1</p>' +
        '</div>' +
        '<div class="iw-choice__panel">' +
          '<p class="iw-choice__ask">What happens next?</p>' +
          '<div class="iw-choice__options" id="iw-c-options"></div>' +
        '</div>' +
      '</div>';

    var root = c.root.querySelector('.iw-choice');
    var canvas = root.querySelector('canvas');
    var g = canvas.getContext('2d');
    var opciones = root.querySelector('#iw-c-options');
    var turno = root.querySelector('#iw-c-turn');

    // Residuo: el reloj detenido, junto al contador de turnos
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-choice__residue', c.scene.motifDescription);
    if (residuo) root.querySelector('.iw-choice__hud').appendChild(residuo);

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

    // Estado del mundo y valores "suavizados" para animar los cambios
    var mundo = { sky: 'dusk', weather: 'clear', amp: 0.6, trees: 6, river: false, bridge: false, tower: false, birds: 0, lanterns: 0, moons: 0, flowers: 0 };
    var visto = { skyFrom: 'dusk', skyT: 1, amp: 0.6, trees: 6, river: 0, bridge: 0, tower: 0 };
    var n = 1;
    var ultimas = [];
    var particulas = [];
    var picos = [];
    for (var i = 0; i <= 24; i++) picos.push(0.4 + Math.random() * 0.6);

    /* ---------- Sonido ---------- */
    function acorde() {
      var base = [261.63, 329.63, 392, 523.25];
      base.forEach(function (f, k) {
        IW.audio.tone({ f: f * (1 + (n % 3) * 0.125), dur: 1.2, type: 'triangle', vol: 0.06, when: IW.audio.ctx && IW.audio.ctx.currentTime + k * 0.07 });
      });
    }
    function ambiente() {
      IW.audio.loop(60, function (k, t) {
        if (k % 32 === 0) {
          [130.81, 196, 261.63].forEach(function (f) {
            IW.audio.tone({ when: t, f: f, dur: 7.5, type: 'sine', vol: 0.035, attack: 2 });
          });
        }
      });
    }

    /* ---------- Turnos ---------- */
    function nuevasOpciones() {
      var pool = ACCIONES.filter(function (a) { return ultimas.indexOf(a) === -1; });
      var elegidas = [];
      while (elegidas.length < 3) {
        var a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        elegidas.push(a);
      }
      opciones.replaceChildren();
      elegidas.forEach(function (a, k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'iw-choice__opt';
        b.innerHTML = '<kbd>' + (k + 1) + '</kbd>';
        b.appendChild(document.createTextNode(a.label));
        b.addEventListener('click', function () { elegir(a); });
        opciones.appendChild(b);
      });
      ultimas = elegidas;
      opciones.classList.remove('iw-choice__options--in');
      void opciones.offsetWidth;
      opciones.classList.add('iw-choice__options--in');
    }

    function elegir(a) {
      var cieloAntes = mundo.sky;
      a.f(mundo);
      if (mundo.sky !== cieloAntes) { visto.skyFrom = cieloAntes; visto.skyT = 0; }
      n++;
      turno.textContent = 'Turn ' + n;
      IW.ui.toast(RESPUESTAS[n % RESPUESTAS.length], 1800);
      acorde();
      nuevasOpciones();
      var primero = opciones.querySelector('button');
      if (primero && document.activeElement && document.activeElement.classList.contains('iw-choice__opt')) primero.focus({ preventScroll: true });
    }

    document.addEventListener('keydown', function (e) {
      if (['1', '2', '3'].indexOf(e.key) === -1) return;
      var b = opciones.querySelectorAll('button')[Number(e.key) - 1];
      if (b) b.click();
    });

    /* ---------- Dibujo del mundo ---------- */
    function dibujar(t) {
      var k = reducido ? 1 : 0.03;
      visto.skyT = Math.min(1, visto.skyT + (reducido ? 1 : 0.012));
      visto.amp += (mundo.amp - visto.amp) * k;
      visto.trees += (mundo.trees - visto.trees) * k * 2;
      visto.river += ((mundo.river ? 1 : 0) - visto.river) * k;
      visto.bridge += ((mundo.bridge ? 1 : 0) - visto.bridge) * k;
      visto.tower += ((mundo.tower ? 1 : 0) - visto.tower) * k;

      var a = CIELOS[visto.skyFrom], b = CIELOS[mundo.sky];
      var gr = g.createLinearGradient(0, 0, 0, H * 0.75);
      gr.addColorStop(0, mezclar(a[0], b[0], visto.skyT));
      gr.addColorStop(0.6, mezclar(a[1], b[1], visto.skyT));
      gr.addColorStop(1, mezclar(a[2], b[2], visto.skyT));
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);

      var noche = mundo.sky === 'night' || mundo.sky === 'aurora';
      if (noche) {
        g.fillStyle = 'rgba(255,255,255,.7)';
        for (var s = 0; s < 80; s++) g.fillRect((s * 97) % W, (s * 53) % (H * 0.5), 1.6, 1.6);
      }
      if (mundo.sky === 'aurora') {
        g.globalCompositeOperation = 'lighter';
        for (var q = 0; q < 2; q++) {
          g.beginPath();
          for (var x = 0; x <= W; x += 20) {
            var y = H * (0.18 + q * 0.08) + Math.sin(x * 0.005 + t * 0.0005 * (q + 1)) * 40;
            if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.lineTo(W, H * 0.6); g.lineTo(0, H * 0.6); g.closePath();
          var ag = g.createLinearGradient(0, H * 0.1, 0, H * 0.55);
          ag.addColorStop(0, q ? 'rgba(190,120,255,.3)' : 'rgba(120,255,200,.32)');
          ag.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = ag;
          g.fill();
        }
        g.globalCompositeOperation = 'source-over';
      }

      // Sol o lunas
      if (noche || mundo.moons) {
        for (var m = 0; m <= mundo.moons; m++) {
          if (!noche && m === 0) continue;
          g.fillStyle = m ? '#ffd9f0' : '#f4f1ff';
          g.shadowColor = g.fillStyle; g.shadowBlur = 30;
          g.beginPath(); g.arc(W * (0.75 - m * 0.16), H * (0.18 + m * 0.07), 26 - m * 6, 0, Math.PI * 2); g.fill();
          g.shadowBlur = 0;
        }
      }
      if (!noche) {
        var sol = g.createRadialGradient(W * 0.72, H * 0.3, 0, W * 0.72, H * 0.3, H * 0.25);
        sol.addColorStop(0, 'rgba(255,250,220,1)');
        sol.addColorStop(0.15, 'rgba(255,230,170,.8)');
        sol.addColorStop(1, 'rgba(255,200,150,0)');
        g.fillStyle = sol;
        g.fillRect(0, 0, W, H);
      }

      // Montañas que crecen o se aplanan
      g.fillStyle = noche ? '#1c1f4a' : '#7a72c4';
      g.beginPath();
      g.moveTo(0, H * 0.7);
      picos.forEach(function (p, i) {
        g.lineTo((i / (picos.length - 1)) * W, H * 0.7 - p * H * 0.3 * visto.amp);
      });
      g.lineTo(W, H); g.lineTo(0, H); g.fill();

      // Suelo
      var suelo = g.createLinearGradient(0, H * 0.68, 0, H);
      suelo.addColorStop(0, noche ? '#1d3a3a' : '#4fa07a');
      suelo.addColorStop(1, noche ? '#0c1c20' : '#24573f');
      g.fillStyle = suelo;
      g.fillRect(0, H * 0.7, W, H);

      // Río y puente
      if (visto.river > 0.01) {
        g.globalAlpha = visto.river;
        g.fillStyle = noche ? '#3a5a9a' : '#8fd6ff';
        g.beginPath();
        g.moveTo(W * 0.46, H * 0.7);
        g.quadraticCurveTo(W * 0.4, H * 0.85, W * 0.3, H);
        g.lineTo(W * 0.52, H);
        g.quadraticCurveTo(W * 0.5, H * 0.84, W * 0.5, H * 0.7);
        g.fill();
        g.globalAlpha = 1;
      }
      if (visto.bridge > 0.01) {
        g.globalAlpha = visto.bridge;
        g.strokeStyle = '#d8a878';
        g.lineWidth = 8;
        g.beginPath(); g.moveTo(W * 0.33, H * 0.86); g.quadraticCurveTo(W * 0.43, H * 0.78, W * 0.55, H * 0.86); g.stroke();
        g.globalAlpha = 1;
      }

      // Torre de luz
      if (visto.tower > 0.01) {
        var th = H * 0.42 * visto.tower;
        g.fillStyle = '#2e2858';
        g.fillRect(W * 0.18, H * 0.72 - th, 26, th);
        var luz = g.createRadialGradient(W * 0.18 + 13, H * 0.72 - th, 0, W * 0.18 + 13, H * 0.72 - th, 90);
        luz.addColorStop(0, 'rgba(255,240,190,.95)');
        luz.addColorStop(1, 'rgba(255,240,190,0)');
        g.fillStyle = luz;
        g.fillRect(W * 0.18 - 80, H * 0.72 - th - 90, 190, 180);
      }

      // Bosque
      for (var tIdx = 0; tIdx < Math.round(visto.trees); tIdx++) {
        var tx = ((tIdx * 0.618 + 0.05) % 1) * W;
        if (Math.abs(tx - W * 0.45) < W * 0.08 && mundo.river) continue;
        var ty = H * (0.74 + ((tIdx * 37) % 20) / 100);
        var ts = 18 + ((tIdx * 13) % 16);
        g.fillStyle = noche ? '#16302c' : '#2f7a5a';
        g.beginPath(); g.moveTo(tx, ty - ts * 2.2); g.lineTo(tx + ts * 0.7, ty); g.lineTo(tx - ts * 0.7, ty); g.fill();
      }

      // Jardín
      for (var f = 0; f < mundo.flowers; f++) {
        g.fillStyle = ['#ff8fc4', '#ffd28a', '#b38cff', '#ffffff'][f % 4];
        g.fillRect(((f * 0.381) % 1) * W, H * (0.8 + ((f * 7) % 18) / 100), 4, 4);
      }

      // Pájaros
      g.strokeStyle = noche ? 'rgba(255,255,255,.6)' : 'rgba(40,30,70,.7)';
      g.lineWidth = 2;
      for (var p = 0; p < mundo.birds; p++) {
        var bx = ((t * 0.04 * (1 + (p % 3) * 0.2) + p * 140) % (W + 200)) - 100;
        var by = H * (0.2 + ((p * 17) % 25) / 100) + Math.sin(t * 0.003 + p) * 8;
        var ala = Math.sin(t * 0.012 + p) * 6;
        g.beginPath(); g.moveTo(bx - 10, by - ala); g.lineTo(bx, by); g.lineTo(bx + 10, by - ala); g.stroke();
      }

      // Farolillos que suben
      for (var l = 0; l < mundo.lanterns; l++) {
        var ly = H * 0.75 - ((t * 0.02 + l * 37) % (H * 0.75));
        var lx = ((l * 0.271) % 1) * W + Math.sin(t * 0.001 + l) * 12;
        var lg = g.createRadialGradient(lx, ly, 0, lx, ly, 10);
        lg.addColorStop(0, 'rgba(255,220,150,.95)');
        lg.addColorStop(1, 'rgba(255,160,90,0)');
        g.fillStyle = lg;
        g.fillRect(lx - 10, ly - 10, 20, 20);
      }

      // Clima
      if (mundo.weather !== 'clear') {
        if (particulas.length < 220) particulas.push({ x: Math.random() * W, y: -10, v: 1 + Math.random() * 2, r: Math.random() * 6 });
        particulas.forEach(function (q2) {
          if (mundo.weather === 'rain') { q2.y += q2.v * 6; g.strokeStyle = 'rgba(200,220,255,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(q2.x, q2.y); g.lineTo(q2.x - 3, q2.y + 14); g.stroke(); }
          else if (mundo.weather === 'snow') { q2.y += q2.v; q2.x += Math.sin(q2.y * 0.02); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(q2.x, q2.y, 2 + q2.r * 0.3, 0, Math.PI * 2); g.fill(); }
          else { q2.y += q2.v * 0.8; q2.x += Math.sin(q2.y * 0.01 + q2.r) * 1.5; g.fillStyle = 'rgba(255,170,210,.85)'; g.beginPath(); g.ellipse(q2.x, q2.y, 4, 2.4, q2.y * 0.05, 0, Math.PI * 2); g.fill(); }
          if (q2.y > H) { q2.y = -10; q2.x = Math.random() * W; }
        });
      } else if (particulas.length) {
        particulas = [];
      }

      requestAnimationFrame(dibujar);
    }
    requestAnimationFrame(dibujar);

    IW.ui.startCard({
      kicker: 'Press start',
      title: 'Your world',
      sub: c.scene.pleasure,
      button: 'Start'
    }).then(function () {
      ambiente();
      nuevasOpciones();
      var primero = opciones.querySelector('button');
      if (primero) primero.focus({ preventScroll: true });
    });
  };
})();
