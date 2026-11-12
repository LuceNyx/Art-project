/* =========================================================================
   IMAGINED WORLD · exp-online.js
   MANDO → JUEGO EN LÍNEA (Loneliness)
   Adrenalina y compañía: mueves una luz, disparas sola, las sombras
   estallan en color, hay combos, rondas, la pantalla tiembla y la música
   se acelera. Tres amigos pelean contigo y te escriben ("nice!", "carry
   us", "don't log off"). No hay game over: nunca hace falta irse.
   Residuo: la burbuja sin respuesta flota en gris; las balas la atraviesan.
   Controles: mouse / dedo / WASD o flechas. Se dispara automáticamente.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var AMIGOS = [
    { name: 'nova', color: '#7fe6d0' },
    { name: 'kiro', color: '#ff8fc4' },
    { name: 'mel', color: '#ffd28a' }
  ];

  // Lo que escriben tus amigos (inglés: lo ve el visitante)
  var CHAT = {
    start: [['nova', "finally you're here"], ['kiro', 'we waited for you'], ['mel', "let's gooo"]],
    combo5: [['nova', 'NICE'], ['kiro', "you're cracked"], ['mel', 'carry us']],
    combo12: [['nova', 'insane'], ['kiro', 'clip that'], ['mel', 'how are you this good']],
    round: [['mel', 'gg'], ['nova', 'one more round?'], ['kiro', "don't log off yet"]],
    hit: [['mel', 'you ok?'], ['nova', 'we got you'], ['kiro', 'stay with us']],
    late: [['kiro', "it's 3am lol"], ['mel', 'same time tomorrow?'], ['nova', 'best part of my day']]
  };

  var NOTAS_BAJO = [55, 55, 65.41, 49];      // La, La, Do, Sol (Hz)

  IW.experiences.online = function (c) {
    var reducido = c.reducido;
    c.root.innerHTML =
      '<div class="iw-game">' +
        '<canvas class="iw-game__canvas" aria-label="A fast game: shadows come at you, your friends fight with you"></canvas>' +
        '<div class="iw-game__hud">' +
          '<p class="iw-game__score"><b id="iw-g-score">0</b><span>score</span></p>' +
          '<p class="iw-game__combo" id="iw-g-combo">x1</p>' +
          '<p class="iw-game__round" id="iw-g-round">Round 1</p>' +
        '</div>' +
        '<ul class="iw-game__party" aria-label="Friends online">' +
          AMIGOS.map(function (a) {
            return '<li><i style="background:' + a.color + '"></i>' + a.name + '</li>';
          }).join('') + '<li class="iw-game__you"><i></i>you</li>' +
        '</ul>' +
        '<ol class="iw-game__chat" id="iw-g-chat" aria-live="polite" aria-label="Party chat"></ol>' +
        '<p class="iw-game__banner" id="iw-g-banner" aria-hidden="true"></p>' +
        '<p class="iw-game__help">Move: mouse, finger or WASD · you shoot on your own</p>' +
      '</div>';

    var canvas = c.root.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var el = {
      score: c.root.querySelector('#iw-g-score'),
      combo: c.root.querySelector('#iw-g-combo'),
      round: c.root.querySelector('#iw-g-round'),
      chat: c.root.querySelector('#iw-g-chat'),
      banner: c.root.querySelector('#iw-g-banner'),
      game: c.root.querySelector('.iw-game')
    };

    // Residuo: la burbuja sin respuesta (HTML encima del canvas, flota sola)
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-game__residue', c.scene.motifDescription);
    if (residuo) el.game.appendChild(residuo);

    var W = 0, H = 0, dpr = 1;
    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', medir);
    medir();

    /* ---------- Estado ---------- */
    var jugador = { x: W / 2, y: H * 0.6, tx: W / 2, ty: H * 0.6, golpe: 0, cad: 0, estela: [] };
    var aliados = AMIGOS.map(function (a, i) { return { a: (i / 3) * Math.PI * 2, color: a.color, name: a.name, cad: i * 90, x: 0, y: 0 }; });
    var enemigos = [], balas = [], chispas = [], estrellas = [];
    var puntos = 0, combo = 1, comboT = 0, bajas = 0, ronda = 1, temblor = 0;
    var jugando = false, inicio = 0, ultimoSpawn = 0, ultimo = 0, teclas = {};
    var dichos = { combo5: 0, combo12: 0, late: false };
    var musica = null;

    for (var s = 0; s < 120; s++) estrellas.push({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8 });

    /* ---------- Chat ---------- */
    function decir(lista, i) {
      var m = lista[i % lista.length];
      var amigo = AMIGOS.filter(function (a) { return a.name === m[0]; })[0];
      var li = document.createElement('li');
      li.innerHTML = '<b style="color:' + (amigo ? amigo.color : '#fff') + '">' + m[0] + '</b> ';
      li.appendChild(document.createTextNode(m[1]));
      el.chat.appendChild(li);
      while (el.chat.children.length > 6) el.chat.firstElementChild.remove();
    }
    function decirVarios(lista) {
      lista.forEach(function (m, i) { setTimeout(function () { decir(lista, i); }, 500 + i * 900); });
    }

    // La realidad también escribe, pero nadie la abre
    function mensajeDeFuera() {
      var li = document.createElement('li');
      li.className = 'iw-game__outside';
      li.textContent = '1 message from outside: "' + (c.scene.reality[1] || 'hey') + '" · unread';
      el.chat.appendChild(li);
      while (el.chat.children.length > 6) el.chat.firstElementChild.remove();
    }

    function anunciar(texto) {
      el.banner.textContent = texto;
      el.banner.classList.remove('iw-game__banner--on');
      void el.banner.offsetWidth;
      el.banner.classList.add('iw-game__banner--on');
    }

    /* ---------- Sonido ---------- */
    function sonidoDisparo() {
      IW.audio.tone({ f: 980, slide: 420, dur: 0.07, type: 'square', vol: 0.025, filter: 3000 });
    }
    function sonidoExplosion(fuerza) {
      IW.audio.noise({ dur: 0.28, freq: 700, type: 'lowpass', vol: 0.22 * fuerza });
      IW.audio.tone({ f: 160 + combo * 12, slide: 50, dur: 0.22, type: 'triangle', vol: 0.12 });
    }
    function iniciarMusica() {
      musica = IW.audio.loop(124, function (n, t) {
        var paso = n % 16;
        var compas = Math.floor(n / 16) % 4;
        if (paso % 4 === 0) IW.audio.kick(t, 0.5);
        if (paso % 2 === 1) IW.audio.noise({ when: t, dur: 0.04, freq: 8000, type: 'highpass', vol: 0.05 });
        if (paso === 4 || paso === 12) IW.audio.noise({ when: t, dur: 0.14, freq: 1800, vol: 0.12 });
        if (paso % 4 === 2 || paso === 0) {
          IW.audio.tone({ when: t, f: NOTAS_BAJO[compas] * 2, dur: 0.18, type: 'sawtooth', vol: 0.07, filter: 700 });
        }
        if (paso % 8 === 0 && ronda > 1) {
          [1, 1.5, 2].forEach(function (k) {
            IW.audio.tone({ when: t, f: NOTAS_BAJO[compas] * 4 * k, dur: 0.3, type: 'square', vol: 0.018, filter: 2200 });
          });
        }
      });
    }

    /* ---------- Entrada ---------- */
    window.addEventListener('pointermove', function (e) { jugador.tx = e.clientX; jugador.ty = e.clientY; }, { passive: true });
    window.addEventListener('pointerdown', function (e) { jugador.tx = e.clientX; jugador.ty = e.clientY; }, { passive: true });
    document.addEventListener('keydown', function (e) { teclas[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', function (e) { teclas[e.key.toLowerCase()] = false; });

    /* ---------- Lógica ---------- */
    function aparecer() {
      var lado = Math.floor(Math.random() * 4);
      var x = lado === 0 ? -30 : lado === 1 ? W + 30 : Math.random() * W;
      var y = lado === 2 ? -30 : lado === 3 ? H + 30 : Math.random() * H;
      var r = 14 + Math.random() * 14;
      enemigos.push({ x: x, y: y, r: r, vida: 1 + Math.floor(ronda / 3) + (r > 24 ? 1 : 0), vel: 0.9 + ronda * 0.22 + Math.random() * 0.6, fase: Math.random() * 6 });
    }

    function masCercano(x, y) {
      var mejor = null, d = Infinity;
      enemigos.forEach(function (en) {
        var dd = (en.x - x) * (en.x - x) + (en.y - y) * (en.y - y);
        if (dd < d) { d = dd; mejor = en; }
      });
      return mejor;
    }

    function disparar(x, y, color, sonido) {
      var obj = masCercano(x, y);
      if (!obj) return;
      var ang = Math.atan2(obj.y - y, obj.x - x);
      balas.push({ x: x, y: y, vx: Math.cos(ang) * 12, vy: Math.sin(ang) * 12, color: color, vida: 80 });
      if (sonido) sonidoDisparo();
    }

    function estallar(x, y, cantidad, tono) {
      var n = reducido ? Math.ceil(cantidad / 3) : cantidad;
      for (var i = 0; i < n && chispas.length < 500; i++) {
        var a = Math.random() * Math.PI * 2;
        var v = 1 + Math.random() * 6;
        chispas.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 40 + Math.random() * 30, h: tono + Math.random() * 60 });
      }
    }

    function matar(en, i) {
      enemigos.splice(i, 1);
      bajas++;
      puntos += 10 * combo;
      combo = Math.min(combo + 1, 99);
      comboT = 1.6;
      if (!reducido) temblor = Math.min(14, 5 + combo * 0.4);
      estallar(en.x, en.y, 22, (bajas * 37) % 360);
      sonidoExplosion(1);
      if (combo === 6 && dichos.combo5 < 3) decir(CHAT.combo5, dichos.combo5++);
      if (combo === 13 && dichos.combo12 < 3) decir(CHAT.combo12, dichos.combo12++);
      if (bajas % 15 === 0) {
        ronda++;
        anunciar('Round ' + ronda);
        decir(CHAT.round, ronda);
        if (musica) musica.setBpm(Math.min(124 + ronda * 6, 172));
        IW.audio.tone({ f: 523, dur: 0.5, type: 'triangle', vol: 0.1 });
        IW.audio.tone({ f: 784, dur: 0.6, type: 'triangle', vol: 0.08, when: IW.audio.ctx && IW.audio.ctx.currentTime + 0.12 });
      }
    }

    function paso(t) {
      var dt = Math.min(0.05, (t - ultimo) / 1000 || 0.016);
      ultimo = t;

      // Movimiento: teclado o puntero
      var kx = (teclas.d || teclas.arrowright ? 1 : 0) - (teclas.a || teclas.arrowleft ? 1 : 0);
      var ky = (teclas.s || teclas.arrowdown ? 1 : 0) - (teclas.w || teclas.arrowup ? 1 : 0);
      if (kx || ky) { jugador.tx = jugador.x + kx * 60; jugador.ty = jugador.y + ky * 60; }
      jugador.tx = Math.max(20, Math.min(W - 20, jugador.tx));
      jugador.ty = Math.max(20, Math.min(H - 20, jugador.ty));
      jugador.x += (jugador.tx - jugador.x) * 0.16;
      jugador.y += (jugador.ty - jugador.y) * 0.16;
      jugador.estela.push({ x: jugador.x, y: jugador.y });
      if (jugador.estela.length > 14) jugador.estela.shift();

      if (jugando) {
        // Aparecen sombras cada vez más seguido
        if (t - ultimoSpawn > Math.max(220, 820 - ronda * 80) && enemigos.length < 46) { aparecer(); ultimoSpawn = t; }

        jugador.cad -= dt * 1000;
        if (jugador.cad <= 0) { disparar(jugador.x, jugador.y, '#ffffff', true); jugador.cad = 140; }

        aliados.forEach(function (a, i) {
          a.a += dt * (1.2 + i * 0.2);
          a.x = jugador.x + Math.cos(a.a) * (70 + i * 14);
          a.y = jugador.y + Math.sin(a.a) * (52 + i * 10);
          a.cad -= dt * 1000;
          if (a.cad <= 0) { disparar(a.x, a.y, a.color, false); a.cad = 260 + i * 40; }
        });

        comboT -= dt;
        if (comboT <= 0 && combo > 1) combo = 1;

        // Mensajes con el tiempo: la noche avanza
        var seg = (t - inicio) / 1000;
        if (seg > 75 && !dichos.late) { dichos.late = true; decirVarios(CHAT.late); }
      }

      enemigos.forEach(function (en) {
        var a = Math.atan2(jugador.y - en.y, jugador.x - en.x);
        en.x += Math.cos(a) * en.vel;
        en.y += Math.sin(a) * en.vel;
        en.fase += dt * 3;
      });

      for (var b = balas.length - 1; b >= 0; b--) {
        var bala = balas[b];
        bala.x += bala.vx;
        bala.y += bala.vy;
        bala.vida--;
        var tocada = false;
        for (var e = enemigos.length - 1; e >= 0; e--) {
          var en = enemigos[e];
          if ((en.x - bala.x) * (en.x - bala.x) + (en.y - bala.y) * (en.y - bala.y) < en.r * en.r) {
            en.vida--;
            tocada = true;
            estallar(bala.x, bala.y, 4, 260);
            if (en.vida <= 0) matar(en, e);
            break;
          }
        }
        if (tocada || bala.vida <= 0) balas.splice(b, 1);
      }

      // Si una sombra te toca: no pierdes; tus amigos te cubren
      for (var k = enemigos.length - 1; k >= 0; k--) {
        var s2 = enemigos[k];
        if ((s2.x - jugador.x) * (s2.x - jugador.x) + (s2.y - jugador.y) * (s2.y - jugador.y) < (s2.r + 12) * (s2.r + 12)) {
          enemigos.splice(k, 1);
          jugador.golpe = 1;
          combo = 1;
          if (!reducido) temblor = 16;
          estallar(jugador.x, jugador.y, 30, 0);
          IW.audio.noise({ dur: 0.4, freq: 300, type: 'lowpass', vol: 0.3 });
          decir(CHAT.hit, Math.floor(Math.random() * 3));
        }
      }
      jugador.golpe = Math.max(0, jugador.golpe - dt * 2);

      chispas.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94; p.vida--; });
      chispas = chispas.filter(function (p) { return p.vida > 0; });
      temblor *= 0.86;

      el.score.textContent = puntos;
      el.combo.textContent = 'x' + combo;
      el.combo.classList.toggle('iw-game__combo--hot', combo >= 6);
      el.round.textContent = 'Round ' + ronda;

      dibujar(t);
      requestAnimationFrame(paso);
    }

    /* ---------- Dibujo ---------- */
    function dibujar(t) {
      ctx.save();
      if (temblor > 0.5) ctx.translate((Math.random() - 0.5) * temblor, (Math.random() - 0.5) * temblor);

      // Fondo: noche eléctrica con una rejilla que avanza
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0b0820');
      g.addColorStop(0.6, '#1a0f3a');
      g.addColorStop(1, '#2a0f3f');
      ctx.fillStyle = g;
      ctx.fillRect(-20, -20, W + 40, H + 40);

      ctx.strokeStyle = 'rgba(180,120,255,.08)';
      ctx.lineWidth = 1;
      var desp = (t * 0.03) % 60;
      for (var x = -60 + desp; x < W + 60; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = -60 + desp; y < H + 60; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      estrellas.forEach(function (s) {
        var sx = (s.x * W + t * 0.02 * s.z) % W;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + s.z * 0.5) + ')';
        ctx.fillRect(sx, s.y * H, s.z * 2, s.z * 2);
      });

      // Sombras: oscuras, con borde violeta que late
      enemigos.forEach(function (en) {
        var r = en.r * (1 + Math.sin(en.fase) * 0.06);
        ctx.beginPath();
        ctx.arc(en.x, en.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#07040f';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(190,120,255,.8)';
        ctx.shadowColor = '#b48cff';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      ctx.globalCompositeOperation = 'lighter';

      balas.forEach(function (b) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 1.6, b.y - b.vy * 1.6);
        ctx.stroke();
      });

      chispas.forEach(function (p) {
        ctx.fillStyle = 'hsla(' + p.h + ',95%,65%,' + Math.min(1, p.vida / 40) + ')';
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });

      // Estela del jugador
      jugador.estela.forEach(function (q, i) {
        ctx.fillStyle = 'rgba(160,240,255,' + (i / jugador.estela.length) * 0.25 + ')';
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4 + i * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      if (jugando) {
        aliados.forEach(function (a) {
          brillo(a.x, a.y, 9, a.color);
        });
      }
      brillo(jugador.x, jugador.y, 13, jugador.golpe > 0 ? '#ffffff' : '#bff6ff');

      ctx.globalCompositeOperation = 'source-over';

      if (jugando) {
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        aliados.forEach(function (a) {
          ctx.fillStyle = a.color;
          ctx.fillText(a.name, a.x, a.y - 16);
        });
      }
      ctx.restore();
    }

    function brillo(x, y, r, color) {
      var gr = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.3, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(paso);

    IW.ui.startCard({
      kicker: 'Lobby · 3 friends online',
      title: 'Ready?',
      sub: c.scene.pleasure,
      button: 'Play'
    }).then(function () {
      jugando = true;
      inicio = performance.now();
      anunciar('Round 1');
      decirVarios(CHAT.start);
      iniciarMusica();
      setInterval(mensajeDeFuera, 42000);
    });
  };
})();
