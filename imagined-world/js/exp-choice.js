/* =========================================================================
   IMAGINED WORLD · exp-choice.js
   COMPUTADORA → CREAR PERSONAJE Y MUNDO (Lack of control)
   Un creador estilo vóxel (bloques en 3D isométrico), con estética propia
   y sin recursos de ningún juego.
   Paso 1 · Personaje: a la izquierda, la ficha del yo real (en gris, como
   el cuarto). A la derecha, el avatar: tamaño, musculatura, complexión,
   pelo, piel, ojos, ropa y poderes. Se puede llegar a los extremos.
   La comparación lado a lado es el punto: sin burlas ni moraleja.
   Paso 2 · Mundo: terreno, cielo, bloques y objetos, con el avatar dentro.
   Residuo: el reloj detenido en las 7:00 junto a un contador que sí avanza.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var C30 = Math.cos(Math.PI / 6), S30 = 0.5;

  /* =======================================================================
     Dibujo isométrico de cajas (vóxeles)
     ======================================================================= */
  function sombra(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.round(((n >> 16) & 255) * f));
    var g = Math.min(255, Math.round(((n >> 8) & 255) * f));
    var b = Math.min(255, Math.round((n & 255) * f));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function Iso(ctx, ox, oy, s) {
    function P(x, y, z) { return [ox + (x - z) * C30 * s, oy + (x + z) * S30 * s - y * s]; }
    function cara(pts, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    /** Caja con esquina mínima (x,y,z) y tamaño (w,h,d). Se ven arriba, +x y +z. */
    function caja(x, y, z, w, h, d, color, alfa) {
      if (alfa !== undefined) ctx.globalAlpha = alfa;
      cara([P(x, y + h, z), P(x + w, y + h, z), P(x + w, y + h, z + d), P(x, y + h, z + d)], sombra(color, 1.18));
      cara([P(x + w, y, z), P(x + w, y + h, z), P(x + w, y + h, z + d), P(x + w, y, z + d)], sombra(color, 0.82));
      cara([P(x, y, z + d), P(x + w, y, z + d), P(x + w, y + h, z + d), P(x, y + h, z + d)], sombra(color, 1));
      if (alfa !== undefined) ctx.globalAlpha = 1;
    }
    /** Rectángulo sobre la cara frontal (+z) de algo: ojos, botones, detalles. */
    function frente(x, y, z, w, h, color) {
      cara([P(x, y, z), P(x + w, y, z), P(x + w, y + h, z), P(x, y + h, z)], color);
    }
    return { P: P, caja: caja, frente: frente, ctx: ctx, s: s };
  }

  /* =======================================================================
     El avatar en vóxeles
     ======================================================================= */
  var PIELES = ['#f6d3b3', '#e8b48f', '#c98c62', '#9a643f', '#6b4128', '#f2e0ff'];
  var PELO_COL = ['#2a1d16', '#6b4126', '#d9a441', '#e9e4dc', '#ff6fae', '#5ad1ff', '#9b5bff'];
  var ROPA = {
    hoodie: { label: 'Hoodie', top: '#8a8f99', bottom: '#3f5a85' },
    armor: { label: 'Armor', top: '#c9d2e0', bottom: '#8792a6' },
    gown: { label: 'Gown', top: '#ff7eb6', bottom: '#ff7eb6' },
    suit: { label: 'Suit', top: '#25263a', bottom: '#25263a' },
    hero: { label: 'Hero', top: '#3a6cff', bottom: '#2747b8' }
  };
  var PELOS = { short: 'Short', long: 'Long', spiky: 'Spiky', bun: 'Bun', none: 'None' };
  var OJOS = { normal: 'Normal', glow: 'Glowing', star: 'Stars' };
  var PODERES = { flight: 'Flight', strength: 'Strength', fire: 'Fire', lightning: 'Lightning', invisible: 'Invisible' };

  /** El yo real: siempre igual, siempre en gris. */
  var REAL = { altura: 1, musculo: 0.15, complexion: 0.45, pelo: 'short', peloCol: 0, piel: 1, ojos: 'normal', ropa: 'hoodie', ropaCol: null, poderes: {} };

  /**
   * Dibuja un avatar. a = parámetros; t = tiempo (animación de poderes).
   * Unidades: un humano "normal" mide 32 vóxeles.
   */
  function dibujarAvatar(iso, a, t, base) {
    base = base || { x: 0, y: 0, z: 0 };
    var g = iso.ctx;
    var hs = a.altura;                         // escala de altura
    var m = a.musculo;                         // 0..1
    var cx = a.complexion;                     // 0 delgado .. 1 ancho
    var vuela = a.poderes.flight;
    var flota = vuela ? 4 + Math.sin(t * 0.003) * 1.5 : 0;
    var X = base.x, Y = base.y + flota, Z = base.z;
    var piel = PIELES[a.piel];
    var ropa = ROPA[a.ropa];
    var top = a.ropaCol || ropa.top;
    var bottom = a.ropaCol || ropa.bottom;
    var alfa = a.poderes.invisible ? 0.35 + Math.sin(t * 0.004) * 0.12 : undefined;

    var anchoTorso = 7 + cx * 3 + m * 6;
    var fondo = 3.5 + cx * 1.5 + m * 3;
    var anchoBrazo = 3 + m * 3.5;
    var anchoPierna = 3.2 + cx * 0.8 + m * 1.8;
    var piernas = 12 * hs, torso = 12 * hs, brazos = 11 * hs, cabeza = 7 + hs * 1.2;
    var x0 = X - anchoTorso / 2, z0 = Z - fondo / 2;

    // Sombra en el piso
    var ps = iso.P(X, base.y, Z);
    g.fillStyle = 'rgba(0,0,0,.22)';
    g.beginPath(); g.ellipse(ps[0], ps[1], (anchoTorso + 6) * iso.s * 0.7, (anchoTorso + 6) * iso.s * 0.35, 0, 0, Math.PI * 2); g.fill();

    // Aura de fuerza (detrás)
    if (a.poderes.strength) {
      var pa = iso.P(X, Y + (piernas + torso) * 0.7, Z);
      var r = (torso + piernas) * iso.s * (0.9 + Math.sin(t * 0.006) * 0.05);
      var gr = g.createRadialGradient(pa[0], pa[1], r * 0.1, pa[0], pa[1], r);
      gr.addColorStop(0, 'rgba(255,90,60,.45)');
      gr.addColorStop(1, 'rgba(255,90,60,0)');
      g.fillStyle = gr;
      g.fillRect(pa[0] - r, pa[1] - r, r * 2, r * 2);
    }

    // Alas (detrás de la espalda)
    if (vuela) {
      var aleteo = Math.sin(t * 0.008) * 4;
      iso.caja(x0 - 9, Y + piernas + torso * 0.3 + aleteo, z0 - 1.5, 9, torso * 0.9, 1, '#f4f0ff', 0.85);
      iso.caja(x0 + anchoTorso, Y + piernas + torso * 0.3 + aleteo, z0 - 1.5, 9, torso * 0.9, 1, '#f4f0ff', 0.85);
    }
    // Capa del traje de héroe
    if (a.ropa === 'hero') iso.caja(x0, Y + 2, z0 - 1, anchoTorso, piernas + torso - 2, 1, '#e8344d', alfa);

    // Piernas (o falda del vestido)
    if (a.ropa === 'gown') {
      iso.caja(x0 - 2, Y, z0 - 1, anchoTorso + 4, piernas + 1, fondo + 2, bottom, alfa);
    } else {
      iso.caja(X - anchoPierna - 0.4, Y, Z - anchoPierna / 2, anchoPierna, piernas, anchoPierna, bottom, alfa);
      iso.caja(X + 0.4, Y, Z - anchoPierna / 2, anchoPierna, piernas, anchoPierna, bottom, alfa);
    }

    // Brazo izquierdo (el más lejano)
    var yBrazo = Y + piernas + torso - brazos;
    iso.caja(x0 - anchoBrazo, yBrazo, Z - anchoBrazo / 2, anchoBrazo, brazos, anchoBrazo, a.ropa === 'gown' ? piel : top, alfa);
    // Torso
    iso.caja(x0, Y + piernas, z0, anchoTorso, torso, fondo, top, alfa);
    if (a.ropa === 'armor') {
      iso.caja(x0 - 1.5, Y + piernas + torso - 3, z0 - 0.5, 4, 3, fondo + 1, '#e8eef8', alfa);
      iso.caja(x0 + anchoTorso - 2.5, Y + piernas + torso - 3, z0 - 0.5, 4, 3, fondo + 1, '#e8eef8', alfa);
    }
    if (a.ropa === 'suit') iso.frente(X - 0.6, Y + piernas + torso * 0.35, z0 + fondo + 0.01, 1.2, torso * 0.6, '#d8304a');
    if (a.ropa === 'hero') iso.frente(X - 2, Y + piernas + torso * 0.5, z0 + fondo + 0.01, 4, 4, '#ffd36e');
    // Brazo derecho (el más cercano)
    iso.caja(x0 + anchoTorso, yBrazo, Z - anchoBrazo / 2, anchoBrazo, brazos, anchoBrazo, a.ropa === 'gown' ? piel : top, alfa);
    // Manos
    iso.caja(x0 - anchoBrazo, yBrazo - 2, Z - anchoBrazo / 2, anchoBrazo, 2, anchoBrazo, piel, alfa);
    iso.caja(x0 + anchoTorso, yBrazo - 2, Z - anchoBrazo / 2, anchoBrazo, 2, anchoBrazo, piel, alfa);

    // Cabeza
    var hy = Y + piernas + torso;
    iso.caja(X - cabeza / 2, hy, Z - cabeza / 2, cabeza, cabeza, cabeza, piel, alfa);
    // Ojos
    var ojoCol = a.ojos === 'glow' ? '#7ff0ff' : a.ojos === 'star' ? '#ffd36e' : '#2a1d16';
    var ez = Z + cabeza / 2 + 0.02;
    [-cabeza * 0.28, cabeza * 0.12].forEach(function (dx) {
      iso.frente(X + dx, hy + cabeza * 0.45, ez, cabeza * 0.16, cabeza * 0.16, ojoCol);
    });
    if (a.ojos !== 'normal') {
      var po = iso.P(X, hy + cabeza * 0.53, ez);
      var gr2 = g.createRadialGradient(po[0], po[1], 0, po[0], po[1], cabeza * iso.s);
      gr2.addColorStop(0, a.ojos === 'glow' ? 'rgba(127,240,255,.5)' : 'rgba(255,211,110,.5)');
      gr2.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr2;
      g.fillRect(po[0] - cabeza * iso.s, po[1] - cabeza * iso.s, cabeza * iso.s * 2, cabeza * iso.s * 2);
    }
    // Pelo
    var pc = PELO_COL[a.peloCol];
    if (a.pelo === 'short') iso.caja(X - cabeza / 2 - 0.3, hy + cabeza * 0.75, Z - cabeza / 2 - 0.3, cabeza + 0.6, cabeza * 0.32, cabeza + 0.6, pc, alfa);
    if (a.pelo === 'long') {
      iso.caja(X - cabeza / 2 - 0.4, hy + cabeza * 0.7, Z - cabeza / 2 - 0.4, cabeza + 0.8, cabeza * 0.4, cabeza + 0.8, pc, alfa);
      iso.caja(X - cabeza / 2 - 0.4, hy - cabeza * 0.6, Z - cabeza / 2 - 0.6, cabeza + 0.8, cabeza * 1.3, 1.4, pc, alfa);
    }
    if (a.pelo === 'spiky') {
      for (var k = 0; k < 4; k++) iso.caja(X - cabeza / 2 + k * cabeza / 4, hy + cabeza, Z - 1, cabeza / 4, 2 + (k % 2) * 2.5, 2, pc, alfa);
      iso.caja(X - cabeza / 2 - 0.3, hy + cabeza * 0.8, Z - cabeza / 2 - 0.3, cabeza + 0.6, cabeza * 0.25, cabeza + 0.6, pc, alfa);
    }
    if (a.pelo === 'bun') {
      iso.caja(X - cabeza / 2 - 0.3, hy + cabeza * 0.78, Z - cabeza / 2 - 0.3, cabeza + 0.6, cabeza * 0.28, cabeza + 0.6, pc, alfa);
      iso.caja(X - 2, hy + cabeza + 0.6, Z - 2, 4, 3, 4, pc, alfa);
    }

    // Fuego en las manos
    if (a.poderes.fire) {
      [x0 - anchoBrazo / 2, x0 + anchoTorso + anchoBrazo / 2].forEach(function (hx, i) {
        var pf = iso.P(hx, yBrazo - 1, Z);
        for (var f = 0; f < 6; f++) {
          var fy = pf[1] - ((t * 0.05 + f * 9 + i * 13) % 26) * iso.s * 0.5;
          var fr = (4 - f * 0.4) * iso.s;
          g.fillStyle = f % 2 ? 'rgba(255,190,60,.8)' : 'rgba(255,90,40,.7)';
          g.fillRect(pf[0] - fr / 2 + Math.sin(t * 0.01 + f) * iso.s, fy, fr, fr);
        }
      });
    }
    // Rayos
    if (a.poderes.lightning) {
      g.strokeStyle = 'rgba(180,230,255,.9)';
      g.lineWidth = 2;
      for (var l = 0; l < 3; l++) {
        var p0 = iso.P(X + (Math.random() - 0.5) * 20, hy + cabeza + 4, Z);
        g.beginPath(); g.moveTo(p0[0], p0[1]);
        var px = p0[0], py = p0[1];
        for (var sgm = 0; sgm < 5; sgm++) { px += (Math.random() - 0.5) * 18; py += 10; g.lineTo(px, py); }
        if (Math.random() < 0.5) g.stroke();
      }
    }
  }

  /* =======================================================================
     El mundo en vóxeles
     ======================================================================= */
  var TERRENOS = { plains: 'Plains', mountains: 'Mountains', islands: 'Sky islands', desert: 'Desert', snow: 'Snow peaks' };
  var CIELOS = { day: 'Day', sunset: 'Sunset', night: 'Night', aurora: 'Aurora' };
  var MATERIALES = { grass: ['Grass', '#6fcf6a', '#8a5a3a'], sand: ['Sand', '#f0d38a', '#d0a860'], crystal: ['Crystal', '#9fe8ff', '#6a8fd8'], gold: ['Gold', '#ffd36e', '#c9962e'], obsidian: ['Obsidian', '#4a3a6e', '#2a1f40'] };
  var OBJETOS = { trees: 'Trees', castle: 'Castle', waterfall: 'Waterfall', portal: 'Portal', statue: 'A statue of you' };

  function alturaTerreno(tipo, i, j) {
    var n = Math.sin(i * 0.9) * Math.cos(j * 0.7) + Math.sin((i + j) * 0.4);
    if (tipo === 'plains') return 1 + Math.round(n * 0.4 + 0.5);
    if (tipo === 'mountains') return 1 + Math.max(0, Math.round(n * 2.6 + (Math.abs(i - 4) < 3 && Math.abs(j - 3) < 3 ? 3 : 0)));
    if (tipo === 'desert') return 1 + Math.round(Math.abs(Math.sin(i * 0.6 + j * 0.2)) * 1.4);
    if (tipo === 'snow') return 2 + Math.max(0, Math.round(n * 2 + 1));
    return Math.hypot(i - 6, j - 6) < 4.2 ? 2 + Math.round(n * 0.6 + 0.6) : 0;   // islas
  }

  /* =======================================================================
     La experiencia
     ======================================================================= */
  IW.experiences.choice = function (c) {
    var reducido = c.reducido;

    var avatar = { altura: 1, musculo: 0.2, complexion: 0.45, pelo: 'short', peloCol: 0, piel: 1, ojos: 'normal', ropa: 'hoodie', ropaCol: null, poderes: {} };
    var mundo = { terreno: 'plains', cielo: 'day', material: 'grass', objetos: { trees: true } };
    var cambios = 0;
    var paso = 1;

    function opciones(nombre, mapa, actual) {
      return Object.keys(mapa).map(function (k) {
        return '<button type="button" class="iw-cr__opt" data-g="' + nombre + '" data-v="' + k + '" aria-pressed="' + (k === actual) + '">' + mapa[k] + '</button>';
      }).join('');
    }
    function muestras(nombre, lista, actual) {
      return lista.map(function (col, i) {
        return '<button type="button" class="iw-cr__swatch" data-g="' + nombre + '" data-v="' + i + '" aria-pressed="' + (i === actual) + '" aria-label="' + nombre + ' ' + (i + 1) + '" style="--c:' + col + '"></button>';
      }).join('');
    }

    c.root.innerHTML =
      '<div class="iw-cr" data-paso="1">' +
        '<header class="iw-cr__top">' +
          '<p class="iw-cr__step" id="iw-cr-step">Step 1 of 2 · Who do you want to be?</p>' +
          '<p class="iw-cr__count">Changes: <b id="iw-cr-count">0</b></p>' +
        '</header>' +

        // PASO 1
        '<section class="iw-cr__pane iw-cr__pane--char" aria-label="Your character">' +
          '<figure class="iw-cr__id" aria-label="ID card of the real you">' +
            '<p class="iw-cr__id-head">ID · 0427 <span>valid until tomorrow</span></p>' +
            '<canvas class="iw-cr__id-photo" width="220" height="260" aria-hidden="true"></canvas>' +
            '<dl class="iw-cr__id-data">' +
              '<dt>Name</dt><dd>You</dd>' +
              '<dt>Height</dt><dd>1.68 m</dd>' +
              '<dt>Build</dt><dd>average</dd>' +
              '<dt>Wears</dt><dd>grey hoodie, jeans</dd>' +
              '<dt>Powers</dt><dd>none listed</dd>' +
            '</dl>' +
          '</figure>' +
          '<div class="iw-cr__stage"><canvas class="iw-cr__avatar" aria-label="Your avatar"></canvas></div>' +
          '<div class="iw-cr__panel">' +
            '<div class="iw-cr__presets">' +
              '<button type="button" class="iw-cr__preset" data-preset="titan">Titan</button>' +
              '<button type="button" class="iw-cr__preset" data-preset="idol">Idol</button>' +
              '<button type="button" class="iw-cr__preset" data-preset="random">Random</button>' +
            '</div>' +
            '<label class="iw-cr__range">Size <input type="range" data-g="altura" min="70" max="260" value="100"></label>' +
            '<label class="iw-cr__range">Muscles <input type="range" data-g="musculo" min="0" max="100" value="20"></label>' +
            '<label class="iw-cr__range">Build <input type="range" data-g="complexion" min="0" max="100" value="45"></label>' +
            '<p class="iw-cr__label">Hair</p><div class="iw-cr__row">' + opciones('pelo', PELOS, avatar.pelo) + '</div>' +
            '<div class="iw-cr__row">' + muestras('peloCol', PELO_COL, avatar.peloCol) + '</div>' +
            '<p class="iw-cr__label">Skin</p><div class="iw-cr__row">' + muestras('piel', PIELES, avatar.piel) + '</div>' +
            '<p class="iw-cr__label">Eyes</p><div class="iw-cr__row">' + opciones('ojos', OJOS, avatar.ojos) + '</div>' +
            '<p class="iw-cr__label">Outfit</p><div class="iw-cr__row">' + opciones('ropa', Object.keys(ROPA).reduce(function (o, k) { o[k] = ROPA[k].label; return o; }, {}), avatar.ropa) + '</div>' +
            '<p class="iw-cr__label">Powers</p><div class="iw-cr__row">' +
              Object.keys(PODERES).map(function (k) { return '<button type="button" class="iw-cr__opt" data-power="' + k + '" aria-pressed="false">' + PODERES[k] + '</button>'; }).join('') +
            '</div>' +
            '<button type="button" class="iw-cr__next" id="iw-cr-next">Next: your world →</button>' +
          '</div>' +
        '</section>' +

        // PASO 2
        '<section class="iw-cr__pane iw-cr__pane--world" aria-label="Your world" hidden>' +
          '<div class="iw-cr__stage iw-cr__stage--world"><canvas class="iw-cr__world" aria-label="Your world, with you in it"></canvas></div>' +
          '<div class="iw-cr__panel">' +
            '<p class="iw-cr__label">Land</p><div class="iw-cr__row">' + opciones('terreno', TERRENOS, mundo.terreno) + '</div>' +
            '<p class="iw-cr__label">Sky</p><div class="iw-cr__row">' + opciones('cielo', CIELOS, mundo.cielo) + '</div>' +
            '<p class="iw-cr__label">Blocks</p><div class="iw-cr__row">' + opciones('material', Object.keys(MATERIALES).reduce(function (o, k) { o[k] = MATERIALES[k][0]; return o; }, {}), mundo.material) + '</div>' +
            '<p class="iw-cr__label">Things</p><div class="iw-cr__row">' +
              Object.keys(OBJETOS).map(function (k) { return '<button type="button" class="iw-cr__opt" data-obj="' + k + '" aria-pressed="' + !!mundo.objetos[k] + '">' + OBJETOS[k] + '</button>'; }).join('') +
            '</div>' +
            '<button type="button" class="iw-cr__next iw-cr__next--back" id="iw-cr-back">← Your character</button>' +
          '</div>' +
        '</section>' +
      '</div>';

    var root = c.root.querySelector('.iw-cr');
    var cvAvatar = root.querySelector('.iw-cr__avatar');
    var cvMundo = root.querySelector('.iw-cr__world');
    var cvFoto = root.querySelector('.iw-cr__id-photo');
    var contador = root.querySelector('#iw-cr-count');

    // Residuo: el reloj detenido junto al contador de cambios
    var residuo = IW.motif.button(c.motifId, c.scene.residue, 'iw-cr__residue', c.scene.motifDescription);
    if (residuo) root.querySelector('.iw-cr__count').appendChild(residuo);

    /* ---------- Cambios ---------- */
    function contar() {
      cambios++;
      contador.textContent = cambios;
      IW.audio.tone({ f: 523 + (cambios % 5) * 66, dur: 0.18, type: 'triangle', vol: 0.05 });
    }

    function marcar(grupo, valor) {
      root.querySelectorAll('[data-g="' + grupo + '"]').forEach(function (b) {
        if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.v === String(valor)));
      });
    }

    root.addEventListener('input', function (e) {
      var g = e.target.dataset.g;
      if (!g) return;
      avatar[g] = g === 'altura' ? e.target.value / 100 : e.target.value / 100;
      contar();
    });

    root.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.g) {
        var g = b.dataset.g, v = b.dataset.v;
        if (g === 'peloCol' || g === 'piel') avatar[g] = Number(v);
        else if (g in avatar) avatar[g] = v;
        else mundo[g] = v;
        marcar(g, v);
        contar();
      } else if (b.dataset.power) {
        var p = b.dataset.power;
        avatar.poderes[p] = !avatar.poderes[p];
        b.setAttribute('aria-pressed', String(!!avatar.poderes[p]));
        contar();
      } else if (b.dataset.obj) {
        var o = b.dataset.obj;
        mundo.objetos[o] = !mundo.objetos[o];
        b.setAttribute('aria-pressed', String(!!mundo.objetos[o]));
        contar();
      } else if (b.dataset.preset) {
        preset(b.dataset.preset);
        contar();
      } else if (b.id === 'iw-cr-next') {
        irPaso(2);
      } else if (b.id === 'iw-cr-back') {
        irPaso(1);
      }
    });

    function sincronizarControles() {
      root.querySelector('[data-g="altura"]').value = Math.round(avatar.altura * 100);
      root.querySelector('[data-g="musculo"]').value = Math.round(avatar.musculo * 100);
      root.querySelector('[data-g="complexion"]').value = Math.round(avatar.complexion * 100);
      ['pelo', 'peloCol', 'piel', 'ojos', 'ropa'].forEach(function (g) { marcar(g, avatar[g]); });
      root.querySelectorAll('[data-power]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!avatar.poderes[b.dataset.power])); });
    }

    function preset(n) {
      if (n === 'titan') {
        avatar = { altura: 2.6, musculo: 1, complexion: 1, pelo: 'spiky', peloCol: 0, piel: 2, ojos: 'glow', ropa: 'armor', ropaCol: null, poderes: { strength: true, flight: true, lightning: true } };
      } else if (n === 'idol') {
        avatar = { altura: 1.7, musculo: 0.05, complexion: 0.05, pelo: 'long', peloCol: 4, piel: 0, ojos: 'star', ropa: 'gown', ropaCol: null, poderes: { flight: true } };
      } else {
        var ks = Object.keys;
        avatar = {
          altura: 0.7 + Math.random() * 1.9, musculo: Math.random(), complexion: Math.random(),
          pelo: ks(PELOS)[Math.floor(Math.random() * 5)], peloCol: Math.floor(Math.random() * PELO_COL.length),
          piel: Math.floor(Math.random() * PIELES.length), ojos: ks(OJOS)[Math.floor(Math.random() * 3)],
          ropa: ks(ROPA)[Math.floor(Math.random() * 5)], ropaCol: null, poderes: {}
        };
        ks(PODERES).forEach(function (p) { if (Math.random() < 0.35) avatar.poderes[p] = true; });
      }
      sincronizarControles();
    }

    function irPaso(n) {
      paso = n;
      root.dataset.paso = n;
      root.querySelector('.iw-cr__pane--char').hidden = n !== 1;
      root.querySelector('.iw-cr__pane--world').hidden = n !== 2;
      root.querySelector('#iw-cr-step').textContent = n === 1 ? 'Step 1 of 2 · Who do you want to be?' : 'Step 2 of 2 · Where do you live?';
      IW.audio.tone({ f: 392, dur: 0.3, type: 'triangle', vol: 0.06 });
      IW.audio.tone({ f: 587, dur: 0.4, type: 'triangle', vol: 0.05, when: IW.audio.ctx && IW.audio.ctx.currentTime + 0.1 });
      medir();
    }

    /* ---------- Lienzos ---------- */
    function ajustar(cv) {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.parentNode.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width * d));
      cv.height = Math.max(1, Math.round(r.height * d));
      var g = cv.getContext('2d');
      g.setTransform(d, 0, 0, d, 0, 0);
      return { g: g, w: r.width, h: r.height };
    }
    var lienzos = {};
    function medir() {
      if (paso === 1) lienzos.avatar = ajustar(cvAvatar);
      else lienzos.mundo = ajustar(cvMundo);
    }
    window.addEventListener('resize', medir);

    // La foto de la ficha: el yo real, en gris (se dibuja una vez)
    (function () {
      var g = cvFoto.getContext('2d');
      g.fillStyle = '#d9d9d9';
      g.fillRect(0, 0, 220, 260);
      var iso = Iso(g, 110, 232, 4.4);
      dibujarAvatar(iso, REAL, 0);
      // En gris, como el cuarto
      var img = g.getImageData(0, 0, 220, 260);
      for (var i = 0; i < img.data.length; i += 4) {
        var y = img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = y;
      }
      g.putImageData(img, 0, 0);
    })();

    /* ---------- Dibujo continuo ---------- */
    function dibujarEscenaAvatar(t) {
      var L = lienzos.avatar;
      if (!L) return;
      var g = L.g;
      var cielo = g.createLinearGradient(0, 0, 0, L.h);
      cielo.addColorStop(0, '#2a2060');
      cielo.addColorStop(1, '#6a4fa8');
      g.fillStyle = cielo;
      g.fillRect(0, 0, L.w, L.h);
      // Escala para que hasta el más grande quepa
      var alto = (12 * avatar.altura * 2 + 9 + avatar.altura * 1.2 + 10);
      var s = Math.min(L.h * 0.8 / alto, L.w / 46);
      var iso = Iso(g, L.w / 2, L.h * 0.88, s);
      // Plataforma de bloques
      for (var i = -2; i <= 1; i++) for (var j = -2; j <= 1; j++) iso.caja(i * 6, -4, j * 6, 6, 4, 6, (i + j) % 2 ? '#8a7fc8' : '#9d92dc');
      dibujarAvatar(iso, avatar, reducido ? 0 : t);
    }

    function dibujarMundo(t) {
      var L = lienzos.mundo;
      if (!L) return;
      var g = L.g;
      var cielos = {
        day: ['#5aa8ff', '#cfeaff'], sunset: ['#3a2a6e', '#ffb07a'],
        night: ['#05071e', '#1c2050'], aurora: ['#04091c', '#123a4a']
      }[mundo.cielo];
      var gr = g.createLinearGradient(0, 0, 0, L.h);
      gr.addColorStop(0, cielos[0]);
      gr.addColorStop(1, cielos[1]);
      g.fillStyle = gr;
      g.fillRect(0, 0, L.w, L.h);
      if (mundo.cielo === 'night' || mundo.cielo === 'aurora') {
        g.fillStyle = 'rgba(255,255,255,.8)';
        for (var s2 = 0; s2 < 90; s2++) g.fillRect((s2 * 137) % L.w, (s2 * 71) % (L.h * 0.6), 1.6, 1.6);
      }
      if (mundo.cielo === 'aurora') {
        g.globalCompositeOperation = 'lighter';
        for (var q = 0; q < 2; q++) {
          g.beginPath();
          for (var x = 0; x <= L.w; x += 16) {
            var y = L.h * (0.15 + q * 0.07) + Math.sin(x * 0.01 + t * 0.0006 * (q + 1)) * 26;
            if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.lineTo(L.w, L.h * 0.5); g.lineTo(0, L.h * 0.5); g.closePath();
          var ag = g.createLinearGradient(0, 0, 0, L.h * 0.5);
          ag.addColorStop(0, q ? 'rgba(190,120,255,.3)' : 'rgba(120,255,200,.32)');
          ag.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = ag;
          g.fill();
        }
        g.globalCompositeOperation = 'source-over';
      }
      if (mundo.cielo === 'day' || mundo.cielo === 'sunset') {
        var sol = g.createRadialGradient(L.w * 0.8, L.h * 0.18, 0, L.w * 0.8, L.h * 0.18, L.h * 0.25);
        sol.addColorStop(0, 'rgba(255,250,220,1)');
        sol.addColorStop(0.15, 'rgba(255,230,170,.7)');
        sol.addColorStop(1, 'rgba(255,200,150,0)');
        g.fillStyle = sol;
        g.fillRect(0, 0, L.w, L.h);
      }

      var N = 12;
      var s = Math.min(L.w / (N * 6 * 1.9), L.h / (N * 6 * 1.3)) * 0.85;
      var iso = Iso(g, L.w / 2, L.h * 0.58, s);
      // MATERIALES[k] = [nombre, color de arriba, color del costado]
      var mat = MATERIALES[mundo.material];
      var colArriba = mat[1], colCostado = mat[2];
      var flotar = mundo.terreno === 'islands' ? Math.sin(t * 0.001) * 3 : 0;
      // Columnas de terreno (de atrás hacia adelante)
      var alturas = {};
      for (var suma = 0; suma <= (N - 1) * 2; suma++) {
        for (var i = 0; i < N; i++) {
          var j = suma - i;
          if (j < 0 || j >= N) continue;
          var hgt = alturaTerreno(mundo.terreno, i, j);
          alturas[i + ',' + j] = hgt;
          if (hgt <= 0) continue;
          var px = (i - N / 2) * 6, pz = (j - N / 2) * 6;
          var y0 = flotar;
          iso.caja(px, y0, pz, 6, (hgt - 1) * 6, 6, colCostado);
          iso.caja(px, y0 + (hgt - 1) * 6, pz, 6, 6, 6, mundo.terreno === 'snow' && hgt > 3 ? '#f4f8ff' : colArriba);
          objetoEn(iso, i, j, px, y0 + hgt * 6, pz, t);
        }
      }
      // El avatar, en el centro de su mundo
      var hc = alturas['6,6'] || 1;
      var escalaAv = 0.55;
      var isoAv = Iso(g, iso.P(3, hc * 6 + flotar, 3)[0], iso.P(3, hc * 6 + flotar, 3)[1], s * escalaAv);
      dibujarAvatar(isoAv, avatar, reducido ? 0 : t);
    }

    function objetoEn(iso, i, j, x, y, z, t) {
      var o = mundo.objetos;
      if (o.trees && (i * 7 + j * 3) % 11 === 0 && !(i === 6 && j === 6)) {
        iso.caja(x + 2, y, z + 2, 2, 8, 2, '#7a4a2a');
        iso.caja(x, y + 8, z, 6, 6, 6, mundo.terreno === 'snow' ? '#e8f0ff' : '#3e9a5a');
      }
      if (o.castle && i === 2 && j === 2) {
        iso.caja(x - 3, y, z - 3, 12, 14, 12, '#c9c4d8');
        iso.caja(x - 4, y + 14, z - 4, 4, 8, 4, '#b5aecb');
        iso.caja(x + 6, y + 14, z + 6, 4, 8, 4, '#b5aecb');
        iso.caja(x - 4, y + 22, z - 4, 4, 4, 4, '#ff7eb6');
        iso.caja(x + 6, y + 22, z + 6, 4, 4, 4, '#ff7eb6');
      }
      if (o.waterfall && i === 9 && j === 2) {
        iso.caja(x, y, z, 6, 18, 6, '#8a7fc8');
        var caida = (t * 0.03) % 6;
        iso.caja(x + 6, y - 18 + caida, z + 1, 1, 34, 4, '#8fe0ff', 0.75);
      }
      if (o.portal && i === 9 && j === 9) {
        iso.caja(x, y, z + 2, 2, 16, 2, '#4a3a6e');
        iso.caja(x + 8, y, z + 2, 2, 16, 2, '#4a3a6e');
        iso.caja(x, y + 16, z + 2, 10, 2, 2, '#4a3a6e');
        // La luz del portal late
        iso.caja(x + 2, y, z + 2.6, 6, 16, 0.6, '#b38cff', 0.55 + Math.sin(t * 0.004) * 0.25);
      }
      if (o.statue && i === 3 && j === 8) {
        iso.caja(x - 2, y, z - 2, 10, 4, 10, '#e9e4dc');
        var est = Iso(iso.ctx, iso.P(x + 3, y + 4, z + 3)[0], iso.P(x + 3, y + 4, z + 3)[1], iso.s * 0.7);
        var dorado = JSON.parse(JSON.stringify(avatar));
        dorado.ropa = 'suit'; dorado.ropaCol = '#ffd36e'; dorado.piel = 5; dorado.poderes = {};
        dibujarAvatar(est, dorado, 0);
      }
    }

    function bucle(t) {
      if (paso === 1) dibujarEscenaAvatar(t);
      else dibujarMundo(t);
      requestAnimationFrame(bucle);
    }

    medir();
    requestAnimationFrame(bucle);

    IW.ui.startCard().then(function () {
      IW.audio.loop(64, function (k, t) {
        if (k % 32 === 0) [196, 246.94, 293.66].forEach(function (f) { IW.audio.tone({ when: t, f: f, dur: 7, type: 'sine', vol: 0.03, attack: 2 }); });
      });
    });
  };
})();
