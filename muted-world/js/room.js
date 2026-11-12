/* =========================================================================
   MUTED WORLD · room.js
   La habitación: objetos interactivos, iluminación (canvas), polvo,
   huellas de lo visitado, regreso desde el mundo imaginado (?return=)
   y la pantalla de entrada. También arranca todo (init al final).
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var cfg = MW.config;
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var el = {};
  var visitadas = leerLista(cfg.STORAGE.visited);
  var regresos = leerLista(cfg.STORAGE.returned);

  /* =======================================================================
     Estado guardado en sessionStorage (una visita = una sesión)
     ======================================================================= */
  function leerLista(clave) {
    try {
      var valor = JSON.parse(sessionStorage.getItem(clave) || '[]');
      return Array.isArray(valor) ? valor : [];
    } catch (e) { return []; }
  }

  function guardarLista(clave, lista) {
    try { sessionStorage.setItem(clave, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
  }

  function agregar(lista, clave, id) {
    if (lista.indexOf(id) === -1) {
      lista.push(id);
      guardarLista(clave, lista);
    }
  }

  /* =======================================================================
     DIBUJOS DE LOS OBJETOS (SVG en escala de grises)
     .mw-before-visit / .mw-after-visit → detalle que cambia tras visitar
     ======================================================================= */
  var DIBUJOS = {
    'academic-pressure':
      '<svg viewBox="0 0 196 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<ellipse cx="26" cy="96" rx="16" ry="4" fill="#2a2a2a"/>' +
        '<path d="M26 95 L34 50 L58 30" stroke="#3a3a3a" stroke-width="3" fill="none"/>' +
        '<path d="M46 22 L70 18 L80 44 L40 48 Z" fill="#262626" stroke="#4a4a4a" stroke-width="1.5"/>' +
        '<g class="mw-before-visit">' +
          '<path d="M82 84 L118 80 L119 97 L80 99 Z" fill="#bcbcbc"/>' +
          '<path d="M118 80 L154 84 L157 99 L119 97 Z" fill="#d2d2d2"/>' +
          '<path d="M86 86 L114 83 M86 90 L114 87 M87 94 L115 91 M123 84 L150 87 M123 88 L151 91 M124 92 L152 95" stroke="#6a6a6a" stroke-width="1"/>' +
        '</g>' +
        '<g class="mw-after-visit"><path d="M88 83 L130 81 L134 97 L86 99 Z" fill="#232323" stroke="#3c3c3c" stroke-width="1.5"/></g>' +
        '<path d="M160 98 L192 98 L190 62 L162 64 Z" fill="#9a9a9a"/>' +
        '<path d="M160 92 L192 91 M161 86 L191 85 M161 80 L191 79 M162 74 L190 73 M162 68 L190 67" stroke="#555" stroke-width="1"/>' +
        '<path d="M158 62 L194 59 L192 65 L160 66 Z" fill="#d2d2d2"/>' +
      '</g>' +
      '<ellipse cx="60" cy="46" rx="16" ry="3.2" fill="#f2f2f2"/></svg>',

    'loneliness':
      '<svg viewBox="0 0 178 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<ellipse cx="94" cy="72" rx="66" ry="14" fill="#000" opacity=".4"/>' +
        '<path d="M40 66 L120 40 L150 56 L70 84 Z" fill="#141414" stroke="#3a3a3a" stroke-width="2"/>' +
        '<path class="mw-before-visit" d="M50 65 L118 44 L140 56 L72 78 Z" fill="#2e2e2e"/>' +
      '</g></svg>',

    'emotional-overload':
      '<svg viewBox="0 0 142 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<rect x="4" y="4" width="134" height="92" fill="#2e2e2e" stroke="#141414" stroke-width="4"/>' +
        '<rect x="14" y="14" width="26" height="20" fill="#bdbdbd" transform="rotate(-6 27 24)"/>' +
        '<rect x="48" y="10" width="30" height="22" fill="#d0d0d0" transform="rotate(4 63 21)"/>' +
        '<rect x="86" y="16" width="24" height="24" fill="#a8a8a8" transform="rotate(-3 98 28)"/>' +
        '<rect x="24" y="44" width="34" height="22" fill="#c6c6c6" transform="rotate(7 41 55)"/>' +
        '<rect x="64" y="40" width="28" height="30" fill="#b4b4b4" transform="rotate(-9 78 55)"/>' +
        '<rect x="98" y="50" width="30" height="20" fill="#d4d4d4" transform="rotate(5 113 60)"/>' +
        '<rect x="10" y="70" width="28" height="20" fill="#a0a0a0" transform="rotate(-4 24 80)"/>' +
        '<rect x="46" y="72" width="36" height="18" fill="#c8c8c8" transform="rotate(3 64 81)"/>' +
        '<rect x="90" y="74" width="26" height="18" fill="#b8b8b8" transform="rotate(-7 103 83)"/>' +
      '</g></svg>',

    'lack-of-control':
      '<svg viewBox="0 0 124 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<circle cx="62" cy="50" r="44" fill="#1a1a1a"/>' +
        '<g class="mw-before-visit">' +
          '<circle cx="62" cy="50" r="38" fill="#cfcfcf"/>' +
          '<path d="M62 16 V22 M62 78 V84 M28 50 H34 M90 50 H96" stroke="#333" stroke-width="3"/>' +
          '<path d="M62 50 L62 22" stroke="#111" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M62 50 L48 72" stroke="#111" stroke-width="5" stroke-linecap="round"/>' +
        '</g>' +
      '</g></svg>',

    'social-comparison':
      '<svg viewBox="0 0 42 100" aria-hidden="true">' +
        '<defs><linearGradient id="mw-g-mirror" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#3c3c3c"/><stop offset="1" stop-color="#0e0e0e"/>' +
        '</linearGradient></defs>' +
        '<g filter="url(#mw-rough)">' +
          '<path d="M6 4 L38 2 L40 98 L2 98 Z" fill="#262626"/>' +
          '<path d="M9 8 L35 6 L36 94 L5 94 Z" fill="url(#mw-g-mirror)"/>' +
          '<ellipse cx="21" cy="40" rx="5" ry="6" fill="#0a0a0a" opacity=".7"/>' +
          '<path d="M11 70 Q21 48 31 70 Z" fill="#0a0a0a" opacity=".7"/>' +
          '<rect x="28" y="9" width="10" height="12" fill="#b8b8b8" transform="rotate(8 33 15)"/>' +
          '<rect x="1" y="28" width="10" height="12" fill="#a4a4a4" transform="rotate(-10 6 34)"/>' +
          '<rect x="31" y="58" width="10" height="12" fill="#c2c2c2" transform="rotate(5 36 64)"/>' +
        '</g></svg>',

    'uncertain-future':
      '<svg viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<path d="M14 58 L18 96 M34 62 L37 98 M60 56 L63 96 M82 60 L85 98" stroke="#9a9a9a" stroke-width=".8" opacity=".5"/>' +
        '<g fill="#8e8e8e">' +
          '<rect x="4" y="4" width="92" height="4"/><rect x="4" y="11" width="92" height="4"/>' +
          '<rect x="4" y="18" width="92" height="4"/><rect x="4" y="25" width="92" height="4"/>' +
          '<rect x="4" y="32" width="92" height="4"/><rect x="4" y="39" width="92" height="4"/>' +
          '<g class="mw-after-visit">' +
            '<rect x="4" y="46" width="92" height="4"/><rect x="4" y="53" width="92" height="4"/>' +
            '<rect x="4" y="60" width="92" height="4"/><rect x="4" y="67" width="92" height="4"/>' +
            '<rect x="4" y="74" width="92" height="4"/><rect x="4" y="81" width="92" height="4"/>' +
            '<rect x="4" y="88" width="92" height="4"/>' +
          '</g>' +
        '</g>' +
        '<path d="M88 6 V70" stroke="#555" stroke-width="1"/>' +
        // Lentes VR sobre el alféizar (el escape de esta situación)
        '<path d="M30 90 Q30 84 36 84 L64 84 Q70 84 70 90 L68 97 L54 97 L50 93 L46 97 L32 97 Z" fill="#141414" stroke="#3a3a3a" stroke-width="1"/>' +
        '<circle cx="40" cy="91" r="3.2" fill="#9a9a9a" opacity=".6"/><circle cx="60" cy="91" r="3.2" fill="#9a9a9a" opacity=".6"/>' +
      '</g></svg>',

    'family-expectations':
      '<svg viewBox="0 0 267 100" aria-hidden="true"><g filter="url(#mw-rough)">' +
        '<path d="M20 30 H60 Q58 62 40 66 Q22 62 20 30 Z M34 66 H46 V86 H34 Z M24 86 H56 V96 H24 Z" fill="#3a3a3a"/>' +
        '<path d="M210 44 H240 Q238 68 225 72 Q212 68 210 44 Z M220 72 H230 V88 H220 Z M212 88 H238 V96 H212 Z" fill="#333"/>' +
        '<g class="mw-before-visit">' +
          '<rect x="96" y="10" width="76" height="86" fill="#2a2a2a"/>' +
          '<rect x="104" y="18" width="60" height="70" fill="#9a9a9a"/>' +
          '<circle cx="118" cy="46" r="7" fill="#4a4a4a"/><circle cx="134" cy="42" r="7" fill="#4a4a4a"/>' +
          '<circle cx="150" cy="46" r="7" fill="#4a4a4a"/>' +
          '<path d="M108 88 Q118 56 128 88 M124 88 Q134 52 144 88 M140 88 Q150 56 160 88" fill="#4a4a4a"/>' +
        '</g>' +
        '<rect class="mw-after-visit" x="92" y="88" width="84" height="8" fill="#1c1c1c"/>' +
      '</g>' +
      '<circle class="mw-before-visit" cx="134" cy="62" r="8" fill="#6a6a6a" filter="url(#mw-blur)"/></svg>'
  };

  /* =======================================================================
     Construir los objetos de la habitación
     ======================================================================= */
  var objetos = {}; // id → { el, scene, luz actual }

  function construirObjetos() {
    cfg.MUTED_SCENES.forEach(function (scene) {
      var o = scene.roomObject;
      var nodo;

      if (scene.ready) {
        nodo = document.createElement('button');
        nodo.type = 'button';
        nodo.setAttribute('aria-label', o.ariaLabel);
        nodo.addEventListener('click', function () { MW.scenes.open(scene.id, nodo); });
        nodo.addEventListener('pointerenter', function () { objetos[scene.id].hot = true; pedirDibujo(); });
        nodo.addEventListener('pointerleave', function () { objetos[scene.id].hot = false; pedirDibujo(); });
        nodo.addEventListener('focus', function () {
          objetos[scene.id].hot = true;
          cursor.tx = o.light.x;
          cursor.ty = o.light.y;
          pedirDibujo();
        });
        nodo.addEventListener('blur', function () { objetos[scene.id].hot = false; pedirDibujo(); });
      } else {
        // Situación aún no construida: parte del decorado, sin interacción
        nodo = document.createElement('div');
        nodo.setAttribute('aria-hidden', 'true');
      }

      nodo.className = 'mw-object mw-object--' + scene.id;
      nodo.dataset.scene = scene.id;
      nodo.style.setProperty('--x', o.rect.x);
      nodo.style.setProperty('--y', o.rect.y);
      nodo.style.setProperty('--w', o.rect.w);
      nodo.style.setProperty('--h', o.rect.h);
      nodo.innerHTML = DIBUJOS[scene.id] || '';

      el.objects.appendChild(nodo);
      objetos[scene.id] = { el: nodo, scene: scene, hot: false, s: 0, r: o.light.r };
      actualizarHuella(scene.id);
    });

    construirPuerta();
  }

  /**
   * LA PUERTA = EL MUNDO REAL. No abre una situación ni lleva al mundo
   * imaginado: lleva a la rutina (routine.js) y se vuelve al cuarto.
   */
  function construirPuerta() {
    var puerta = cfg.ROUTINE && cfg.ROUTINE.door;
    if (!puerta) return;

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'mw-object mw-object--door';
    boton.setAttribute('aria-label', puerta.ariaLabel);
    boton.style.setProperty('--x', puerta.rect.x);
    boton.style.setProperty('--y', puerta.rect.y);
    boton.style.setProperty('--w', puerta.rect.w);
    boton.style.setProperty('--h', puerta.rect.h);

    // Para la iluminación funciona como un objeto más (con su propia luz)
    var pseudo = { id: 'door', ready: true, roomObject: { light: puerta.light, rect: puerta.rect } };
    objetos.door = { el: boton, scene: pseudo, hot: false, s: 0, r: puerta.light.r };

    boton.addEventListener('pointerenter', function () { objetos.door.hot = true; pedirDibujo(); });
    boton.addEventListener('pointerleave', function () { objetos.door.hot = false; pedirDibujo(); });
    boton.addEventListener('focus', function () {
      objetos.door.hot = true;
      cursor.tx = puerta.light.x;
      cursor.ty = puerta.light.y;
      pedirDibujo();
    });
    boton.addEventListener('blur', function () { objetos.door.hot = false; pedirDibujo(); });
    boton.addEventListener('click', function () {
      if (MW.scenes.isOpen() || MW.routine.isActive()) return;
      MW.routine.play({ alTerminar: function () { boton.focus({ preventScroll: true }); } });
    });

    el.objects.appendChild(boton);
  }

  function actualizarHuella(id) {
    var obj = objetos[id];
    if (obj) obj.el.classList.toggle('mw-object--visited', visitadas.indexOf(id) !== -1);
  }

  /* =======================================================================
     ILUMINACIÓN (canvas): oscuridad con huecos de luz
     ======================================================================= */
  var ctx = null;
  var ancho = 0;
  var alto = 0;
  var ESCALA_CANVAS = 0.5;     // media resolución: la luz es suave, no necesita más
  var cursor = { x: 50, y: 55, tx: 50, ty: 55, activo: false };
  var encendido = 0;           // 0 → 1 al entrar (la habitación "aparece")
  var dibujoPendiente = false;
  var animando = false;
  var polvo = [];

  function redimensionar() {
    var w = el.room.clientWidth;
    var h = el.room.clientHeight;
    ancho = el.light.width = Math.max(1, Math.round(w * ESCALA_CANVAS));
    alto = el.light.height = Math.max(1, Math.round(h * ESCALA_CANVAS));
    pedirDibujo();
  }

  /** Abre un hueco en la oscuridad: x, y, r en % del escenario. */
  function hueco(x, y, r, fuerza, sx, sy) {
    if (fuerza <= 0) return;
    var px = (x / 100) * ancho;
    var py = (y / 100) * alto;
    var radio = (r / 100) * ancho;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(sx || 1, sy || 1);
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, radio);
    g.addColorStop(0, 'rgba(0,0,0,' + fuerza + ')');
    g.addColorStop(0.45, 'rgba(0,0,0,' + (fuerza * 0.55) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-radio, -radio, radio * 2, radio * 2);
    ctx.restore();
  }

  /** Brillo blanco muy tenue (la fuente de luz se "ve"). */
  function brillo(x, y, r, alfa, sx, sy) {
    if (alfa <= 0) return;
    var px = (x / 100) * ancho;
    var py = (y / 100) * alto;
    var radio = (r / 100) * ancho;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(sx || 1, sy || 1);
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, radio);
    g.addColorStop(0, 'rgba(255,255,255,' + alfa + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-radio, -radio, radio * 2, radio * 2);
    ctx.restore();
  }

  function respirar(t, fase, cantidad) {
    return reducido ? 1 : 1 + Math.sin(t * 0.0007 + fase) * cantidad;
  }

  function dibujar(t) {
    if (!ctx) return;
    var lento = reducido ? 1 : 0.08;

    // Suavizado del foco y de la entrada
    cursor.x += (cursor.tx - cursor.x) * (reducido ? 1 : 0.07);
    cursor.y += (cursor.ty - cursor.y) * (reducido ? 1 : 0.07);
    encendido = Math.min(1, encendido + (reducido ? 1 : 0.006));

    // 1. Oscuridad: más densa cuantas más situaciones se visitaron
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ancho, alto);
    var densidad = Math.min(0.975, 0.93 + visitadas.length * 0.008);
    ctx.fillStyle = 'rgba(0,0,0,' + densidad + ')';
    ctx.fillRect(0, 0, ancho, alto);

    // 2. Huecos de luz
    ctx.globalCompositeOperation = 'destination-out';

    cfg.ROOM_LIGHTS.forEach(function (l, i) {
      hueco(l.x, l.y, l.r, l.strength * encendido * respirar(t, i * 2, l.breathe), l.stretchX, l.stretchY);
    });

    Object.keys(objetos).forEach(function (id, i) {
      var obj = objetos[id];
      var visitada = visitadas.indexOf(id) !== -1;
      var base = obj.scene.ready ? 0.42 : 0.22;
      if (id === 'academic-pressure') base = 0.55;         // la lámpara está encendida
      if (visitada) base *= 0.5;                           // huella: más oscuro
      var objetivo = obj.hot ? 0.85 : base;
      var radioObjetivo = obj.scene.roomObject.light.r * (obj.hot ? 1.35 : 1);
      obj.s += (objetivo - obj.s) * lento;
      obj.r += (radioObjetivo - obj.r) * lento;
      var l = obj.scene.roomObject.light;
      hueco(l.x, l.y, obj.r, obj.s * encendido * respirar(t, i, 0.04));
    });

    // Luces nuevas tras volver del mundo imaginado
    regresos.forEach(function (id, i) {
      var scene = cfg.getScene(id);
      if (scene && scene.returnLight) {
        var rl = scene.returnLight;
        hueco(rl.x, rl.y, rl.r * 2.2, 0.5 * encendido * respirar(t, 4 + i, 0.15));
      }
    });

    // Foco que sigue al cursor (revela, no ilumina del todo)
    var radioFoco = cursor.activo ? 13 : 9;
    hueco(cursor.x, cursor.y, radioFoco, 0.5 * encendido);

    // 3. Brillo de las fuentes de luz
    ctx.globalCompositeOperation = 'source-over';
    var lampara = cfg.getScene('academic-pressure');
    var lamparaVisitada = visitadas.indexOf('academic-pressure') !== -1;
    brillo(lampara.roomObject.light.x, 45, 4, (lamparaVisitada ? 0.08 : 0.18) * encendido * respirar(t, 1, 0.06));
    cfg.ROOM_LIGHTS.forEach(function (l, i) {
      brillo(l.x, l.y, l.r * 0.5, 0.07 * encendido * respirar(t, i * 3, l.breathe), l.stretchX, l.stretchY);
    });
    regresos.forEach(function (id, i) {
      var scene = cfg.getScene(id);
      if (scene && scene.returnLight) {
        var rl = scene.returnLight;
        brillo(rl.x, rl.y, rl.r, 0.55 * encendido * respirar(t, 4 + i, 0.2));
      }
    });

    // 4. Polvo: solo se ve donde hay luz
    dibujarPolvo();
  }

  /* ---------- Polvo flotando ---------- */
  function crearPolvo() {
    polvo = [];
    for (var i = 0; i < 48; i++) {
      polvo.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.008,
        vy: -0.004 - Math.random() * 0.01,
        r: 0.6 + Math.random() * 1.1
      });
    }
  }

  /** Cuánta luz hay en un punto (aprox.), para el brillo del polvo. */
  function luzEn(x, y) {
    var total = 0;
    function suma(lx, ly, lr, s) {
      var dx = x - lx;
      var dy = (y - ly) * 9 / 16;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < lr) total += s * (1 - d / lr);
    }
    suma(cursor.x, cursor.y, 13, 0.7);
    cfg.ROOM_LIGHTS.forEach(function (l) { suma(l.x, l.y, l.r, l.strength); });
    var lamp = cfg.getScene('academic-pressure').roomObject.light;
    suma(lamp.x, lamp.y, lamp.r * 1.4, 0.8);
    return Math.min(1, total);
  }

  function dibujarPolvo() {
    for (var i = 0; i < polvo.length; i++) {
      var p = polvo[i];
      if (!reducido) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -2) { p.y = 102; p.x = Math.random() * 100; }
        if (p.x < -2) p.x = 102;
        if (p.x > 102) p.x = -2;
      }
      var alfa = luzEn(p.x, p.y) * 0.55 * encendido;
      if (alfa < 0.02) continue;
      ctx.fillStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc((p.x / 100) * ancho, (p.y / 100) * alto, p.r * ESCALA_CANVAS * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- Bucle de animación ---------- */
  function bucle(t) {
    if (document.hidden || MW.scenes.isOpen()) { animando = false; return; }
    dibujar(t);
    requestAnimationFrame(bucle);
  }

  function arrancarBucle() {
    if (reducido) { pedirDibujo(); return; }
    if (!animando) {
      animando = true;
      requestAnimationFrame(bucle);
    }
  }

  /** Con movimiento reducido no hay bucle: se redibuja solo ante cambios. */
  function pedirDibujo() {
    if (!reducido) { arrancarBucle(); return; }
    if (dibujoPendiente) return;
    dibujoPendiente = true;
    requestAnimationFrame(function (t) { dibujoPendiente = false; dibujar(t); });
  }

  /* =======================================================================
     Entrada del cursor y desplazamiento
     ======================================================================= */
  function alMoverPuntero(evento) {
    var caja = el.room.getBoundingClientRect();
    cursor.tx = ((evento.clientX - caja.left) / caja.width) * 100;
    cursor.ty = ((evento.clientY - caja.top) / caja.height) * 100;
    cursor.activo = true;
    pedirDibujo();
  }

  /** La rueda vertical desplaza la habitación en horizontal si no cabe. */
  function alRueda(evento) {
    var vista = el.viewport;
    if (vista.scrollWidth <= vista.clientWidth) return;
    if (Math.abs(evento.deltaY) > Math.abs(evento.deltaX)) {
      vista.scrollLeft += evento.deltaY;
      evento.preventDefault();
    }
  }

  function centrar() {
    el.viewport.scrollLeft = (el.viewport.scrollWidth - el.viewport.clientWidth) / 2;
  }

  /* =======================================================================
     API usada por scenes.js
     ======================================================================= */
  function markVisited(id) {
    agregar(visitadas, cfg.STORAGE.visited, id);
    actualizarHuella(id);
  }

  /** Acerca (o devuelve) la habitación hacia el objeto de una situación. */
  function zoomTo(scene, entrando) {
    var r = scene.roomObject.rect;
    el.room.style.setProperty('--mw-zoom-x', (r.x + r.w / 2) + '%');
    el.room.style.setProperty('--mw-zoom-y', (r.y + r.h / 2) + '%');
    el.room.classList.toggle('mw-room--leaving', entrando);
    el.viewport.inert = entrando;
    if (!entrando) arrancarBucle();
  }

  /* =======================================================================
     Regreso desde el mundo imaginado: ?return=<scene>
     ======================================================================= */
  function leerRegreso() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get(cfg.RETURN_PARAM);
    if (!id || !cfg.getScene(id)) return false;

    agregar(visitadas, cfg.STORAGE.visited, id);
    agregar(regresos, cfg.STORAGE.returned, id);

    // Limpia la URL para que recargar no repita el regreso
    try { history.replaceState(null, '', window.location.pathname); } catch (e) { /* file:// */ }
    return true;
  }

  /* =======================================================================
     Pantalla de entrada (el audio solo arranca aquí)
     ======================================================================= */
  function entrar() {
    MW.audio.start();
    el.intro.classList.add('mw-intro--gone');
    el.viewport.inert = false;
    arrancarBucle();

    var primero = el.objects.querySelector('button.mw-object');
    if (primero) primero.focus({ preventScroll: true });
  }

  /* =======================================================================
     INICIO DE TODO EL MUTED WORLD
     ======================================================================= */
  function init() {
    el.viewport = document.getElementById('mw-room-viewport');
    el.room = document.getElementById('mw-room');
    el.objects = document.getElementById('mw-objects');
    el.light = document.getElementById('mw-light');
    el.intro = document.getElementById('mw-intro');
    ctx = el.light.getContext('2d');

    MW.grain.init();
    MW.audio.init();
    MW.scenes.init();
    MW.routine.init();

    var volvio = leerRegreso();
    if (volvio) {
      el.intro.querySelector('.mw-intro__enter').textContent = 'Click to return to your room';
    }

    MW.images.load(document.getElementById('mw-room-bg'), 'room.jpg', 'room');
    construirObjetos();
    crearPolvo();

    var botonEntrar = el.intro.querySelector('.mw-intro__enter');
    botonEntrar.addEventListener('click', entrar);
    botonEntrar.focus({ preventScroll: true });
    el.viewport.addEventListener('pointermove', alMoverPuntero, { passive: true });
    el.viewport.addEventListener('pointerdown', alMoverPuntero, { passive: true });
    el.viewport.addEventListener('wheel', alRueda, { passive: false });
    window.addEventListener('resize', function () { redimensionar(); centrar(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) arrancarBucle(); });

    redimensionar();
    centrar();
    dibujar(0);
  }

  MW.room = {
    init: init,
    markVisited: markVisited,
    zoomTo: zoomTo,
    getVisited: function () { return visitadas.slice(); }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
