/* =========================================================================
   MUTED WORLD · images.js
   Carga las ilustraciones (assets/img/) y, si todavía no existen, dibuja
   en código un PLACEHOLDER con el nombre del archivo y sus medidas.
   El placeholder también sirve de guía de composición: marca dónde están
   los muebles para que la ilustración real encaje con los objetos.
   Para usar la imagen real basta con guardarla con el MISMO nombre.
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var W = 1920;
  var H = 1080;
  var cache = {};

  /** Generador pseudoaleatorio con semilla (el placeholder siempre sale igual). */
  function seeded(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  /** Polígono con bordes ligeramente irregulares (trazo "a mano"). */
  function roughPolygon(ctx, puntos, rand, temblor) {
    ctx.beginPath();
    for (var i = 0; i < puntos.length; i++) {
      var a = puntos[i];
      var b = puntos[(i + 1) % puntos.length];
      if (i === 0) ctx.moveTo(a[0], a[1]);
      var pasos = 6;
      for (var s = 1; s <= pasos; s++) {
        var t = s / pasos;
        var jx = s === pasos ? 0 : (rand() - 0.5) * temblor;
        var jy = s === pasos ? 0 : (rand() - 0.5) * temblor;
        ctx.lineTo(a[0] + (b[0] - a[0]) * t + jx, a[1] + (b[1] - a[1]) * t + jy);
      }
    }
    ctx.closePath();
  }

  function px(x) { return (x / 100) * W; }
  function py(y) { return (y / 100) * H; }
  function pct(lista) { return lista.map(function (p) { return [px(p[0]), py(p[1])]; }); }

  function fill(ctx, puntos, color, rand) {
    roughPolygon(ctx, pct(puntos), rand, 5);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* Etiqueta abajo a la derecha (no choca con los botones de la interfaz) */
  function label(ctx, file, nota) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '500 26px Georgia, serif';
    ctx.fillText('PLACEHOLDER  ·  ' + file + '  ·  ' + W + ' × ' + H, W - 160, H - 92);
    ctx.fillStyle = '#3a3a3a';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText(nota || 'Replace with your illustration (same file name and size). See IMAGE_SPEC.md', W - 160, H - 60);
    ctx.textAlign = 'left';
  }

  /* ---------- Habitación (room.jpg) ---------- */
  function drawRoom(ctx, file) {
    var r = seeded(11);

    // Pared y suelo
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, H);
    var suelo = ctx.createLinearGradient(0, py(80), 0, H);
    suelo.addColorStop(0, '#141414');
    suelo.addColorStop(1, '#070707');
    ctx.fillStyle = suelo;
    ctx.fillRect(0, py(80), W, H);

    // Techo inclinado que comprime el espacio
    fill(ctx, [[0, 0], [100, 0], [100, 8], [40, 14], [0, 42]], '#090909', r);

    // Ventana pequeña y alta
    fill(ctx, [[57.5, 16.5], [72.5, 16.5], [72.5, 42.5], [57.5, 42.5]], '#2a2a2a', r);
    var vidrio = ctx.createLinearGradient(0, py(17), 0, py(42));
    vidrio.addColorStop(0, '#4a4a4a');
    vidrio.addColorStop(1, '#232323');
    roughPolygon(ctx, pct([[58.3, 17.5], [71.7, 17.5], [71.7, 41.5], [58.3, 41.5]]), r, 3);
    ctx.fillStyle = vidrio;
    ctx.fill();
    fill(ctx, [[64.8, 17.5], [65.3, 17.5], [65.3, 41.5], [64.8, 41.5]], '#1e1e1e', r);

    // Puerta (la rendija de luz la dibuja room.js)
    fill(ctx, [[83.5, 21.5], [96.5, 21.5], [96.5, 80], [83.5, 80]], '#232323', r);
    fill(ctx, [[84.5, 23], [95.5, 23], [95.5, 80], [84.5, 80]], '#141414', r);
    ctx.beginPath();
    ctx.arc(px(86.2), py(53), 7, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fill();

    // Estante
    fill(ctx, [[19, 36.8], [33, 36.8], [33, 38.2], [19, 38.2]], '#2c2c2c', r);

    // Escritorio
    fill(ctx, [[13.5, 60], [36.5, 60], [37.5, 62.3], [12.5, 62.3]], '#2a2a2a', r);
    fill(ctx, [[12.5, 62.3], [37.5, 62.3], [37.5, 64], [12.5, 64]], '#151515', r);
    fill(ctx, [[14, 64], [15, 64], [15, 82], [14, 82]], '#101010', r);
    fill(ctx, [[35, 64], [36, 64], [36, 82], [35, 82]], '#101010', r);

    // Cama
    fill(ctx, [[47, 64], [79, 64], [82, 72], [44, 72]], '#2b2b2b', r);
    fill(ctx, [[44, 72], [82, 72], [82, 83], [44, 83]], '#1a1a1a', r);
    fill(ctx, [[45, 83], [46.2, 83], [46.2, 86], [45, 86]], '#0d0d0d', r);
    fill(ctx, [[79.8, 83], [81, 83], [81, 86], [79.8, 86]], '#0d0d0d', r);
    ctx.beginPath();
    ctx.ellipse(px(74), py(66.5), 70, 20, -0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#383838';
    ctx.fill();

    // Alfombra y sombras largas
    ctx.beginPath();
    ctx.ellipse(px(38), py(90), 360, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0f0f';
    ctx.fill();

    label(ctx, file);
  }

  /* ---------- Primer plano: escritorio (scene-academic-pressure.jpg) ---------- */
  function drawDesk(ctx, file) {
    var r = seeded(23);
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, W, H);

    // Pared con una sombra alta que se inclina sobre el escritorio
    fill(ctx, [[0, 0], [38, 0], [62, 52], [0, 52]], '#0a0a0a', r);

    // Superficie del escritorio en perspectiva
    var mesa = ctx.createLinearGradient(0, py(50), 0, H);
    mesa.addColorStop(0, '#1d1d1d');
    mesa.addColorStop(1, '#2c2c2c');
    roughPolygon(ctx, pct([[0, 52], [100, 50], [100, 100], [0, 100]]), r, 4);
    ctx.fillStyle = mesa;
    ctx.fill();

    // Vetas de madera
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 2;
    for (var i = 0; i < 9; i++) {
      var y = py(56 + i * 5);
      ctx.beginPath();
      ctx.moveTo(0, y + r() * 10);
      ctx.bezierCurveTo(W * 0.3, y - 14 + r() * 20, W * 0.7, y + 14 - r() * 20, W, y + r() * 10);
      ctx.stroke();
    }

    label(ctx, file);
  }

  /* ---------- Genérico: pared, suelo y una luz tenue ---------- */
  function drawWallFloor(ctx, file, opciones) {
    var r = seeded(opciones.semilla || 5);
    ctx.fillStyle = opciones.pared || '#141414';
    ctx.fillRect(0, 0, W, H);

    if (opciones.suelo) {
      var suelo = ctx.createLinearGradient(0, py(opciones.suelo), 0, H);
      suelo.addColorStop(0, '#0e0e0e');
      suelo.addColorStop(1, '#050505');
      roughPolygon(ctx, pct([[0, opciones.suelo], [100, opciones.suelo - 1], [100, 100], [0, 100]]), r, 4);
      ctx.fillStyle = suelo;
      ctx.fill();
    }

    if (opciones.luz) {
      var l = opciones.luz;
      var g = ctx.createRadialGradient(px(l[0]), py(l[1]), 0, px(l[0]), py(l[1]), px(l[2]));
      g.addColorStop(0, 'rgba(255,255,255,.07)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    if (opciones.sombra) fill(ctx, opciones.sombra, 'rgba(0,0,0,.55)', r);
    label(ctx, file);
  }

  function drawGeneric(ctx, file) {
    drawWallFloor(ctx, file, {});
  }

  var DIBUJOS = {
    room: drawRoom,
    'academic-pressure': drawDesk,
    // Cama en la oscuridad: casi negro (la sábana la dibuja el código)
    'loneliness': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#070707', luz: [50, 50, 40] });
    },
    // Pared detrás del corcho
    'emotional-overload': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#121212', luz: [44, 46, 45], sombra: [[76, 0], [100, 0], [100, 100], [84, 100]] });
    },
    // Pared, suelo y la sombra de la puerta
    'lack-of-control': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#131313', suelo: 92, luz: [76, 20, 26], semilla: 9 });
    },
    // Rincón con el espejo
    'social-comparison': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#141414', suelo: 90, luz: [50, 40, 40], semilla: 13 });
    },
    // Pared interior alrededor de la ventana
    'uncertain-future': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#0e0e0e', luz: [48, 46, 50] });
    },
    // Pared con el estante
    'family-expectations': function (ctx, file) {
      drawWallFloor(ctx, file, { pared: '#151515', luz: [50, 40, 42], sombra: [[0, 76], [100, 76], [100, 100], [0, 100]], semilla: 17 });
    }
  };

  /** Devuelve (y guarda) el placeholder como data URL. */
  function placeholder(kind, file) {
    var clave = kind + '|' + file;
    if (cache[clave]) return cache[clave];

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    (DIBUJOS[kind] || drawGeneric)(ctx, file);
    cache[clave] = canvas.toDataURL('image/jpeg', 0.9);
    return cache[clave];
  }

  /**
   * Carga assets/img/<file> en un <img>. Si falla (todavía no existe),
   * usa el placeholder. kind = 'room' o el id de la situación.
   */
  function load(img, file, kind) {
    img.onerror = function () {
      img.onerror = null;
      img.dataset.placeholder = 'true';
      img.src = placeholder(kind, file);
    };
    img.dataset.placeholder = 'false';
    img.src = MW.config.IMG_PATH + file;
  }

  MW.images = { load: load, placeholder: placeholder };
})();
