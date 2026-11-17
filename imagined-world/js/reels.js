/* =========================================================================
   IMAGINED WORLD · reels.js
   CELULAR → REELS (Social comparison)
   Fluye como TikTok / Instagram, con los reproductores OFICIALES de cada
   plataforma (el video original, enlazado a su autor):
   - Orden: el primero al azar; luego una lista BARAJADA de todos los links
     de media-links.js, sin repetir ninguno hasta agotarlos. Al agotarlos se
     vuelve a barajar (y el último nunca queda primero).
   - Deslizar arriba/abajo (capa de gestos sobre el video), rueda, flechas,
     PageUp/PageDown y botones ▲ ▼. Se puede volver a los anteriores.
   - Autoplay y sonido por las vías oficiales: YouTube (API de iframe por
     postMessage: playVideo / unMute) y TikTok (/player/v1 + postMessage:
     play / unMute). Instagram y Facebook: lo que admiten sus embeds.
     Si el navegador bloquea el sonido: "tap for sound" y el primer toque o
     tecla lo enciende; luego se mantiene en los siguientes videos.
   - El que sale se pausa y se descarga; el siguiente se precarga.
   - Cada 5 videos, la tarjeta vacía (el residuo: la foto en blanco).
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VELOCIDAD_TIEMPO = 40;   // 1 s real = 40 s "de scroll"
  var CADA_VACIO = 5;          // cada 5 pasos, la tarjeta en blanco
  var PAUSA_GESTO = 650;       // ms mínimos entre cambios (rueda / gestos)
  var UMBRAL_SWIPE = 50;       // px para contar un deslizamiento

  /* =======================================================================
     Reconocer cada link → reproductor incrustado oficial
     ======================================================================= */

  /** URL del reproductor; autoplay=false se usa para PRECARGAR sin sonar. */
  function urlEmbed(item, autoplay) {
    var a = autoplay ? 1 : 0;
    if (item.platform === 'Shorts') {
      return 'https://www.youtube.com/embed/' + item.id + '?enablejsapi=1&autoplay=' + a +
        '&mute=1&loop=1&playlist=' + item.id + '&playsinline=1&rel=0&modestbranding=1&controls=1&origin=' +
        encodeURIComponent(location.origin === 'null' ? '*' : location.origin);
    }
    if (item.platform === 'TikTok') {
      // MODO DIRECTO (como con los primeros links, que sí se veían en
      // laptops): exactamente el reproductor del oEmbed oficial, silenciado
      // para que el autoplay funcione, y sin nada encima: el visitante toca
      // el propio reproductor de TikTok (play, sonido) como en su web.
      return 'https://www.tiktok.com/player/v1/' + item.id +
        '?embed_from=oembed&autoplay=1&muted=1&loop=1&music_info=1&description=1&rel=0';
    }
    if (item.platform === 'Instagram') return 'https://www.instagram.com/reel/' + item.id + '/embed/';
    if (item.platform === 'Facebook') {
      return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(item.original) +
        '&show_text=false&autoplay=true&mute=true&width=360';
    }
    return '';
  }

  /**
   * { platform, id, original } si se reproduce aquí,
   * { platform, link } si solo se puede abrir fuera, o null si no es un video.
   */
  function parse(texto) {
    if (typeof texto !== 'string') return null;
    var u;
    try { u = new URL(texto.trim()); } catch (e) { return null; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    var host = u.hostname.toLowerCase().replace(/^(www|m|web)\./, '');
    var m;

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/);
      var v = m ? m[1] : u.searchParams.get('v');
      return v && /^[\w-]{6,}$/.test(v) ? { platform: 'Shorts', id: v, original: 'https://www.youtube.com/shorts/' + v } : null;
    }
    if (host === 'youtu.be') {
      m = u.pathname.match(/^\/([\w-]{6,})/);
      return m ? { platform: 'Shorts', id: m[1], original: 'https://www.youtube.com/shorts/' + m[1] } : null;
    }
    if (host === 'tiktok.com') {
      m = u.pathname.match(/\/video\/(\d{8,})/) || u.pathname.match(/^\/(?:embed\/v2|player\/v1)\/(\d{8,})/);
      return m ? { platform: 'TikTok', id: m[1], original: 'https://www.tiktok.com/video/' + m[1] } : null;
    }
    if (host === 'vt.tiktok.com' || host === 'vm.tiktok.com') return { platform: 'TikTok', link: u.href };
    if (host === 'instagram.com') {
      m = u.pathname.match(/^\/(?:reel|reels|p|tv)\/([\w-]+)/);
      return m ? { platform: 'Instagram', id: m[1], original: 'https://www.instagram.com/reel/' + m[1] + '/' } : null;
    }
    if (host === 'facebook.com') {
      if (!/^\/(?:reel\/\d+|watch\/?$|[^/]+\/videos\/\d+)/.test(u.pathname)) return null;
      var limpio = 'https://www.facebook.com' + u.pathname + (u.pathname.indexOf('/watch') === 0 ? u.search : '');
      return { platform: 'Facebook', id: limpio, original: limpio };
    }
    if (host === 'fb.watch') return { platform: 'Facebook', link: u.href };
    return null;
  }

  /* =======================================================================
     Control de los reproductores (vías oficiales por postMessage)
     ======================================================================= */
  function enviar(reel, accion) {
    var f = reel && reel.querySelector('iframe');
    if (!f || !f.contentWindow) return;
    var p = reel.dataset.platform;
    try {
      if (p === 'Shorts') {
        var func = { play: 'playVideo', pause: 'pauseVideo', unMute: 'unMute', mute: 'mute' }[accion];
        f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
        if (accion === 'unMute') f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*');
      } else if (p === 'TikTok') {
        f.contentWindow.postMessage({ 'x-tiktok-player': true, type: accion, value: null }, '*');
      }
    } catch (e) { /* el reproductor aún no está listo */ }
  }

  /* =======================================================================
     Estado
     ======================================================================= */
  var el = {};
  var reproducibles = [];   // links que se reproducen aquí
  var soloEnlace = [];      // links que solo se abren fuera
  var bolsa = [];           // lista barajada en curso
  var historial = [];       // lo que ya se mostró: { tipo: 'video'|'card'|'blank'|'gen', item }
  var pos = -1;             // posición actual en el historial
  var pasos = 0;            // pasos hacia adelante (para la tarjeta vacía)
  var actual = null;        // elemento .iw-reel en pantalla
  var precargado = null;    // { entrada, nodo } del siguiente
  var sonidoOk = false;     // el visitante ya hizo un gesto (sonido permitido)
  var vistos = 0, likes = 0, segundos = 0;
  var abierto = false, ultimoCambio = 0;
  var motivoSrc = null;

  function barajar(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /**
   * Nueva vuelta de la lista. Los últimos que se vieron (hasta 3) van al
   * FINAL de la nueva vuelta y en el mismo orden en que se vieron: así el
   * último nunca queda primero y ningún video vuelve a los 2 o 3 pasos.
   */
  function rellenarBolsa() {
    // Solo lo que se reproduce aquí: el feed nunca manda fuera de la página.
    // (Los links cortos se muestran como tarjeta solo si no hay nada más.)
    var todos = reproducibles.length
      ? reproducibles.map(function (x) { return { tipo: 'video', item: x }; })
      : soloEnlace.map(function (x) { return { tipo: 'card', item: x }; });
    var recientes = [];
    for (var i = historial.length - 1; i >= 0 && recientes.length < Math.min(3, todos.length - 1); i--) {
      var it = historial[i].item;
      if (it && recientes.indexOf(it) === -1) recientes.unshift(it);   // del más antiguo al más nuevo
    }
    var resto = barajar(todos.filter(function (e) { return recientes.indexOf(e.item) === -1; }));
    var alFinal = recientes.map(function (it) {
      return todos.filter(function (e) { return e.item === it; })[0];
    }).filter(Boolean);
    bolsa = resto.concat(alFinal);
  }

  /** La siguiente entrada (sin repetir hasta agotar la lista). */
  function sacarSiguiente() {
    pasos++;
    if (motivoSrc && pasos > 1 && pasos % CADA_VACIO === 0) return { tipo: 'blank' };
    if (!reproducibles.length && !soloEnlace.length) return { tipo: 'gen' };
    if (!bolsa.length) rellenarBolsa();
    return bolsa.shift();
  }

  /* =======================================================================
     Construcción de cada reel
     ======================================================================= */
  function formatearTiempo(s) {
    var min = Math.floor(s / 60);
    if (min < 60) return min + ' min';
    return Math.floor(min / 60) + ' h ' + String(min % 60).padStart(2, '0') + ' min';
  }

  function actualizarContador() {
    el.meter.textContent = vistos + (vistos === 1 ? ' video' : ' videos') + ' · ' + formatearTiempo(segundos);
  }

  /** Capa de gestos: sobre todo el video (YouTube/TikTok) o solo en franjas (IG/FB). */
  function capaGestos(completa) {
    if (completa) return '<div class="iw-reel-gesture" aria-hidden="true"><span class="iw-reel-gesture__icon"></span></div>';
    return '<div class="iw-reel-gesture iw-reel-gesture--side iw-reel-gesture--left" aria-hidden="true"></div>' +
           '<div class="iw-reel-gesture iw-reel-gesture--side iw-reel-gesture--right" aria-hidden="true"></div>';
  }

  function texto(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function nodoDe(entrada, autoplay) {
    var r = document.createElement('div');
    r.className = 'iw-reel';

    if (entrada.tipo === 'video') {
      var it = entrada.item;
      // Capa de gestos completa solo en YouTube; en TikTok, IG y FB, franjas
      // laterales para deslizar y el centro libre para su propio reproductor.
      var controlable = it.platform === 'Shorts';
      r.dataset.platform = it.platform;
      var f = document.createElement('iframe');
      f.src = urlEmbed(it, autoplay);
      f.title = 'Short video from ' + it.platform;
      f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.addEventListener('load', function () {
        r.classList.add('iw-reel--loaded');
        // YouTube solo envía eventos después de este saludo de su API
        if (it.platform === 'Shorts') {
          try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) { /* nada */ }
        }
        // Si ya es el actual cuando termina de cargar: a sonar
        if (r === actual) arrancar(r);
      });
      // Todo pasa en esta página: la plataforma es una etiqueta, no un enlace.
      // Autor y texto (si se conocen) abajo, como en el feed de la app.
      var pie = '';
      if (it.author || it.caption) {
        pie = '<div class="iw-reel__info" aria-hidden="true">' +
          (it.author ? '<p class="iw-reel__author">@' + texto(it.author) + '</p>' : '') +
          (it.caption ? '<p class="iw-reel__caption">' + texto(it.caption) + '</p>' : '') +
        '</div>';
      }
      r.innerHTML = '<span class="iw-reel__loading" aria-hidden="true"></span>' +
        capaGestos(controlable) +
        '<span class="iw-reel__chip">' + it.platform + '</span>' + pie;
      r.insertBefore(f, r.firstChild);
      return r;
    }

    if (entrada.tipo === 'card') {
      r.classList.add('iw-reel--card');
      r.innerHTML = '<p class="iw-reel__platform">' + entrada.item.platform + '</p>' +
        '<p class="iw-reel__note">This one only plays on ' + entrada.item.platform + '.</p>' +
        '<a class="iw-reel__open" href="' + entrada.item.link + '" target="_blank" rel="noopener noreferrer">Open ↗</a>' +
        capaGestos(false);
      return r;
    }

    if (entrada.tipo === 'blank') {
      r.classList.add('iw-reel--blank');
      r.innerHTML = (motivoSrc ? '<img src="' + motivoSrc + '" alt="">' : '') +
        '<p>Nothing here.</p><p class="iw-reel__sub">Keep scrolling.</p>' + capaGestos(true);
      return r;
    }

    r.classList.add('iw-reel--gen');
    r.style.setProperty('--h', Math.floor(Math.random() * 360));
    r.innerHTML = '<span class="iw-reel__blob"></span><span class="iw-reel__blob iw-reel__blob--2"></span>' +
      '<p class="iw-reel__sub">Add your links in js/media-links.js</p>' + capaGestos(true);
    return r;
  }

  /** El actual empieza a sonar (si el visitante ya dio un gesto y no silenció). */
  function arrancar(r) {
    enviar(r, 'play');
    if (sonidoOk && !IW.audio.isMuted()) enviar(r, 'unMute');
    else enviar(r, 'mute');
    // Algunos reproductores tardan en aceptar órdenes: se repite un par de veces
    [400, 1200].forEach(function (ms) {
      setTimeout(function () {
        if (r !== actual) return;
        enviar(r, 'play');
        if (sonidoOk && !IW.audio.isMuted()) enviar(r, 'unMute');
      }, ms);
    });
  }

  /* =======================================================================
     Avanzar y retroceder
     ======================================================================= */
  function precargar() {
    if (precargado || pos !== historial.length - 1) return;
    var entrada = sacarSiguiente();
    // Un solo reproductor a la vez (como la primera versión): los videos se
    // eligen antes, pero el iframe se crea recién al llegar a pantalla.
    if (entrada.tipo === 'video') { precargado = { entrada: entrada, nodo: null }; return; }
    var nodo = nodoDe(entrada, false);
    nodo.classList.add('iw-reel--next');
    nodo.setAttribute('aria-hidden', 'true');
    el.screen.appendChild(nodo);
    precargado = { entrada: entrada, nodo: nodo };
  }

  function mostrar(nodo, direccion) {
    var viejo = actual;
    actual = nodo;
    nodo.classList.remove('iw-reel--next');
    nodo.removeAttribute('aria-hidden');
    if (!nodo.parentNode) el.screen.appendChild(nodo);
    if (!reducido) {
      nodo.classList.add(direccion > 0 ? 'iw-reel--in' : 'iw-reel--in-up');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { nodo.classList.remove('iw-reel--in', 'iw-reel--in-up'); });
      });
    }
    if (nodo.classList.contains('iw-reel--loaded')) arrancar(nodo);

    if (viejo) {
      // El que sale: pausa y se descarga
      enviar(viejo, 'pause');
      viejo.classList.add(direccion > 0 ? 'iw-reel--out' : 'iw-reel--out-down');
      setTimeout(function () { viejo.remove(); }, reducido ? 0 : 700);
    }
    vistos++;
    actualizarContador();
    setTimeout(precargar, 900);
  }

  function next() {
    var ahora = Date.now();
    if (ahora - ultimoCambio < PAUSA_GESTO) return;
    ultimoCambio = ahora;

    if (pos < historial.length - 1) {
      // Se había vuelto atrás: avanzar por el historial
      pos++;
      mostrar(nodoDe(historial[pos], true), 1);
      return;
    }
    var entrada, nodo;
    if (precargado) {
      entrada = precargado.entrada;
      nodo = precargado.nodo || nodoDe(entrada, true);
      precargado = null;
    } else {
      entrada = sacarSiguiente();
      nodo = nodoDe(entrada, true);
    }
    historial.push(entrada);
    pos = historial.length - 1;
    mostrar(nodo, 1);
  }

  function prev() {
    var ahora = Date.now();
    if (ahora - ultimoCambio < PAUSA_GESTO || pos <= 0) return;
    ultimoCambio = ahora;
    pos--;
    mostrar(nodoDe(historial[pos], true), -1);
  }

  /* =======================================================================
     Gestos: capa transparente sobre el video (los iframes se los "comen")
     ======================================================================= */
  var gesto = null;

  function alBajar(e) {
    if (!e.target.closest('.iw-reel-gesture')) return;
    gesto = { y: e.clientY, x: e.clientX, t: Date.now() };
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  }

  function alSubir(e) {
    if (!gesto) return;
    var dy = gesto.y - e.clientY;
    var dx = gesto.x - e.clientX;
    var corto = Date.now() - gesto.t < 300;
    gesto = null;
    if (Math.abs(dy) > UMBRAL_SWIPE && Math.abs(dy) > Math.abs(dx)) {
      if (dy > 0) next(); else prev();
    } else if (corto && Math.abs(dy) < 10 && e.target.closest('.iw-reel-gesture:not(.iw-reel-gesture--side)')) {
      alternarReproduccion();
    }
  }

  /** Toque sobre el video (YouTube/TikTok): pausa / sigue. */
  function alternarReproduccion() {
    if (!actual) return;
    var pausado = actual.classList.toggle('iw-reel--paused');
    enviar(actual, pausado ? 'pause' : 'play');
    if (!pausado && sonidoOk && !IW.audio.isMuted()) enviar(actual, 'unMute');
  }

  function alRueda(e) {
    if (!abierto) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) < 20) return;
    if (e.deltaY > 0) next(); else prev();
  }

  function alTeclado(e) {
    if (!abierto || (e.target && e.target.tagName === 'INPUT')) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') { e.preventDefault(); next(); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') { e.preventDefault(); prev(); }
  }

  /** El primer gesto del visitante en esta página permite el sonido. */
  function permitirSonido() {
    if (sonidoOk) return;
    sonidoOk = true;
    if (actual && !IW.audio.isMuted()) { enviar(actual, 'play'); enviar(actual, 'unMute'); }
  }

  /* ---------- Videos que fallan (borrados, enlace vencido…) ----------
     TikTok avisa con onPlayerError. Primero se recarga una vez (pide un
     enlace nuevo: "Player authentication failed" suele ser eso); si
     vuelve a fallar, el video sale de la lista y se pasa al siguiente.
     Si fallan demasiados seguidos se deja de saltar (evita un bucle). */
  var fallosSeguidos = 0;
  var MODO_DIRECTO = true;   // TikTok sin recargas ni saltos automáticos

  function reelDeFuente(fuente) {
    var candidatos = [actual, precargado && precargado.nodo];
    for (var i = 0; i < candidatos.length; i++) {
      var f = candidatos[i] && candidatos[i].querySelector('iframe');
      if (f && f.contentWindow === fuente) return candidatos[i];
    }
    return null;
  }

  function recargar(f) { f.src = f.src.replace(/&_r=\d+/, '') + '&_r=' + Date.now(); }

  /* Sin internet no es culpa del video: se espera a que vuelva la conexión
     y se recarga el que está en pantalla (no se saca de la lista). */
  var esperandoRed = false;
  function esperarConexion() {
    if (esperandoRed) return;
    esperandoRed = true;
    if (IW.ui && IW.ui.toast) IW.ui.toast('No connection. The feed will wait.', 3500);
    window.addEventListener('online', function vuelve() {
      window.removeEventListener('online', vuelve);
      esperandoRed = false;
      fallosSeguidos = 0;
      [actual, precargado && precargado.nodo].forEach(function (n) {
        var fr = n && n.querySelector('iframe');
        if (fr && n.dataset.fallo) { delete n.dataset.fallo; recargar(fr); }
      });
    });
  }

  function alFallar(fuente, valor) {
    var r = reelDeFuente(fuente);
    if (!r || r.dataset.fallo === 'fin') return;
    var f = r.querySelector('iframe');
    if (navigator.onLine === false) { r.dataset.fallo = 'red'; esperarConexion(); return; }
    if (r.dataset.fallo === 'red') delete r.dataset.fallo;
    // Modo directo: no se recarga ni se salta nada (como la primera versión);
    // el reproductor de TikTok muestra su propio aviso y el visitante sigue.
    if (window.console) console.info('[reels] TikTok avisó un error:', valor);
    if (MODO_DIRECTO) return;
    if (!r.dataset.fallo) {
      r.dataset.fallo = '1';
      setTimeout(function () { recargar(f); }, 1200);
      return;
    }
    r.dataset.fallo = 'fin';
    var id = f.src.match(/player\/v1\/(\d+)/);
    // Solo se quita de la lista si TikTok dice que el video no sirve; un
    // error de reproducción (red lenta, corte) puede salir bien más tarde.
    var deFondo = !(valor && valor.errorType === 'PLAYBACK_ERROR');
    if (id && deFondo) {
      reproducibles = reproducibles.filter(function (x) { return x.id !== id[1]; });
      bolsa = bolsa.filter(function (e) { return !e.item || e.item.id !== id[1]; });
    }
    if (window.console) console.info('[reels] TikTok no se pudo reproducir:', id && id[1], valor);
    fallosSeguidos++;
    if (fallosSeguidos > 4 || !reproducibles.length) return;
    if (r === actual) { ultimoCambio = 0; next(); }
    else if (precargado && r === precargado.nodo) { r.remove(); precargado = null; setTimeout(precargar, 300); }
  }

  /* ---------- Me gusta ---------- */
  function like() {
    likes++;
    el.likes.textContent = likes;
    el.like.classList.add('iw-reels__btn--liked');
    if (reducido) return;
    for (var i = 0; i < 6; i++) {
      var h = document.createElement('span');
      h.className = 'iw-reels__heart';
      h.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
      h.style.setProperty('--d', (0.9 + Math.random() * 0.6).toFixed(2) + 's');
      el.like.appendChild(h);
      setTimeout(h.remove.bind(h), 1600);
    }
  }

  /* =======================================================================
     Inicio
     ======================================================================= */
  function init(scene, motifId) {
    el.box = document.getElementById('iw-reels');
    if (!el.box) return;
    el.screen = document.getElementById('iw-reels-screen');
    el.meter = document.getElementById('iw-reels-meter');
    el.like = document.getElementById('iw-reels-like');
    el.likes = document.getElementById('iw-reels-likes');
    el.next = document.getElementById('iw-reels-next');
    el.prev = document.getElementById('iw-reels-prev');

    // Tus links (media-links.js) + el banco de videos populares (media-pool.js)
    var vistosId = {};
    (IW.mediaLinks || []).concat(IW.mediaPool || []).forEach(function (link) {
      var meta = link && typeof link === 'object' ? link : null;
      var item = parse(meta ? meta.url : link);
      if (!item) return;
      if (meta) { item.author = meta.author || ''; item.caption = meta.caption || ''; }
      var clave = item.id ? item.platform + ':' + item.id : item.link;
      if (vistosId[clave]) return;
      vistosId[clave] = true;
      if (item.id) reproducibles.push(item); else soloEnlace.push(item);
    });

    if (motifId && /^[a-z0-9-]+$/.test(motifId)) motivoSrc = IW.data.MOTIF_PATH + motifId + '.svg';

    el.next.addEventListener('click', next);
    if (el.prev) el.prev.addEventListener('click', prev);
    el.like.addEventListener('click', like);
    el.box.addEventListener('wheel', alRueda, { passive: false });
    el.screen.addEventListener('pointerdown', alBajar);
    el.screen.addEventListener('pointerup', alSubir);
    el.screen.addEventListener('pointercancel', function () { gesto = null; });
    document.addEventListener('keydown', alTeclado);
    ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) {
      window.addEventListener(ev, permitirSonido, { capture: true, once: true });
    });

    // El botón de sonido general también manda en los videos
    var boton = document.getElementById('iw-mute');
    if (boton) boton.addEventListener('click', function () {
      setTimeout(function () {
        if (!actual) return;
        if (IW.audio.isMuted()) enviar(actual, 'mute');
        else { sonidoOk = true; enviar(actual, 'unMute'); }
      }, 0);
    });

    // Los reproductores avisan cuando están listos: si es el actual, a sonar
    // El precargado (TikTok arranca solo) se pausa y silencia hasta que llegue.
    window.addEventListener('message', function (e) {
      if (!/tiktok\.com|youtube\.com/.test(e.origin)) return;
      var d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (d && d.type === 'onPlayerError') { alFallar(e.source, d.value); return; }
      if (d && d.type === 'onStateChange' && d.value === 1) fallosSeguidos = 0;   // 1 = reproduciendo
      if (!d || !(d.type === 'onPlayerReady' || d.event === 'onReady' || d.event === 'initialDelivery')) return;
      var fa = actual && actual.querySelector('iframe');
      if (fa && e.source === fa.contentWindow) { arrancar(actual); return; }
      var np = precargado && precargado.nodo;
      var fp = np && np.querySelector('iframe');
      if (fp && e.source === fp.contentWindow) { enviar(np, 'mute'); enviar(np, 'pause'); }
    });

    setInterval(function () {
      if (!abierto || document.hidden) return;
      segundos += VELOCIDAD_TIEMPO;
      actualizarContador();
    }, 1000);

    // "tap for sound" si el navegador bloquea el audio (convención del proyecto)
    IW.audio.start();

    // Abre con el primer video ya en la mano
    abierto = true;
    el.box.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.box.classList.add('iw-reels--on'); });
    });
    rellenarBolsa(null);
    ultimoCambio = 0;
    next();
    el.next.focus({ preventScroll: true });
  }

  IW.reels = { init: init, parse: parse, next: next, prev: prev };

  IW.experiences = IW.experiences || {};
  IW.experiences.feed = function (c) { init(c.scene, c.motifId); };
})();
