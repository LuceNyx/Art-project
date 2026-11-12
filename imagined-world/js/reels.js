/* =========================================================================
   IMAGINED WORLD · reels.js
   Si se entra al mundo imaginado con el CELULAR (medium "feed"), lo primero
   que aparece es un reproductor vertical tipo reels / shorts con un video
   ELEGIDO AL AZAR de media-links.js.
   - "Next", la rueda, deslizar hacia arriba o ↓ eligen otro video al azar.
   - Un contador muestra los videos vistos y un tiempo que corre más
     rápido de lo real: horas que se van sin notarlo.
   - Cada pocos videos aparece una tarjeta en blanco: el motivo de la
     realidad (la foto vacía) se cuela en el feed.
   - "Put down" deja el celular y muestra el resto del mundo imaginado.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VELOCIDAD_TIEMPO = 40;   // 1 s real = 40 s "de scroll"
  var CADA_VACIO = 5;          // cada 5 videos, la tarjeta en blanco
  var PAUSA_RUEDA = 900;       // ms entre cambios con la rueda

  /* =======================================================================
     Reconocer cada link y convertirlo en un reproductor incrustado
     ======================================================================= */
  function youtube(id) {
    return {
      platform: 'Shorts',
      embed: 'https://www.youtube.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id +
        '&playsinline=1&rel=0&modestbranding=1',
      original: 'https://www.youtube.com/shorts/' + id
    };
  }

  /**
   * Devuelve { platform, embed, original } si se puede reproducir aquí,
   * { platform, link } si solo se puede abrir fuera, o null si no sirve.
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
      return v && /^[\w-]{6,}$/.test(v) ? youtube(v) : null;
    }
    if (host === 'youtu.be') {
      m = u.pathname.match(/^\/([\w-]{6,})/);
      return m ? youtube(m[1]) : null;
    }

    if (host === 'tiktok.com') {
      m = u.pathname.match(/\/video\/(\d{8,})/) || u.pathname.match(/^\/(?:embed\/v2|player\/v1)\/(\d{8,})/);
      if (!m) return null; // portada u otra página que no es un video
      return {
        platform: 'TikTok',
        // Mismo reproductor que da el oEmbed oficial de TikTok (silenciado para que el autoplay funcione)
        embed: 'https://www.tiktok.com/player/v1/' + m[1] + '?embed_from=oembed&autoplay=1&muted=1&loop=1&music_info=1&description=1&rel=0',
        original: 'https://www.tiktok.com/video/' + m[1]
      };
    }
    if (host === 'vt.tiktok.com' || host === 'vm.tiktok.com') return { platform: 'TikTok', link: u.href };

    if (host === 'instagram.com') {
      m = u.pathname.match(/^\/(?:reel|reels|p|tv)\/([\w-]+)/);
      if (!m) return null;
      return {
        platform: 'Instagram',
        embed: 'https://www.instagram.com/reel/' + m[1] + '/embed/',
        original: 'https://www.instagram.com/reel/' + m[1] + '/'
      };
    }

    if (host === 'facebook.com') {
      if (!/^\/(?:reel\/\d+|watch\/?$|[^/]+\/videos\/\d+)/.test(u.pathname)) return null;
      var limpio = 'https://www.facebook.com' + u.pathname + (u.pathname.indexOf('/watch') === 0 ? u.search : '');
      return {
        platform: 'Facebook',
        embed: 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(limpio) +
          '&show_text=false&autoplay=true&mute=true&width=360',
        original: limpio
      };
    }
    if (host === 'fb.watch') return { platform: 'Facebook', link: u.href };

    return null;
  }

  /* =======================================================================
     Estado y DOM
     ======================================================================= */
  var el = {};
  var reproducibles = [];
  var soloEnlace = [];
  var ultimo = -1;
  var vistos = 0;
  var likes = 0;
  var segundos = 0;
  var abierto = false;
  var motivoSrc = null;
  var ultimaRueda = 0;

  function formatearTiempo(s) {
    var min = Math.floor(s / 60);
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60);
    return h + ' h ' + String(min % 60).padStart(2, '0') + ' min';
  }

  function actualizarContador() {
    el.meter.textContent = vistos + (vistos === 1 ? ' video' : ' videos') + ' · ' + formatearTiempo(segundos);
  }

  /** Elige un índice al azar distinto del anterior. */
  function azar(lista) {
    if (lista.length === 1) return 0;
    var i;
    do { i = Math.floor(Math.random() * lista.length); } while (i === ultimo);
    ultimo = i;
    return i;
  }

  /* ---------- Construcción de cada "reel" ---------- */
  function reelVideo(item) {
    var r = document.createElement('div');
    r.className = 'iw-reel';
    var iframe = document.createElement('iframe');
    iframe.src = item.embed;
    iframe.title = 'Short video from ' + item.platform;
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.addEventListener('load', function () { r.classList.add('iw-reel--loaded'); });
    r.innerHTML = '<span class="iw-reel__loading" aria-hidden="true"></span>' +
      '<span class="iw-reel__chip" aria-hidden="true">' + item.platform + '</span>';
    r.insertBefore(iframe, r.firstChild);
    return r;
  }

  function reelEnlace(item) {
    var r = document.createElement('div');
    r.className = 'iw-reel iw-reel--card';
    r.innerHTML =
      '<p class="iw-reel__platform">' + item.platform + '</p>' +
      '<p class="iw-reel__note">This one only plays on ' + item.platform + '.</p>';
    var a = document.createElement('a');
    a.className = 'iw-reel__open';
    a.href = item.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Open ↗';
    r.appendChild(a);
    return r;
  }

  /** El residuo: una tarjeta vacía en medio del feed. */
  function reelVacio() {
    var r = document.createElement('div');
    r.className = 'iw-reel iw-reel--blank';
    r.innerHTML = (motivoSrc ? '<img src="' + motivoSrc + '" alt="">' : '') +
      '<p>Nothing here.</p><p class="iw-reel__sub">Keep scrolling.</p>';
    return r;
  }

  /** Sin links válidos: un feed generativo para que la experiencia no se rompa. */
  function reelGenerado() {
    var r = document.createElement('div');
    r.className = 'iw-reel iw-reel--gen';
    r.style.setProperty('--h', Math.floor(Math.random() * 360));
    r.innerHTML = '<span class="iw-reel__blob"></span><span class="iw-reel__blob iw-reel__blob--2"></span>' +
      '<p class="iw-reel__sub">Add your links in js/media-links.js</p>';
    return r;
  }

  function siguienteReel() {
    vistos++;
    if (motivoSrc && vistos > 1 && vistos % CADA_VACIO === 0) return reelVacio();
    if (reproducibles.length) return reelVideo(reproducibles[azar(reproducibles)]);
    if (soloEnlace.length) return reelEnlace(soloEnlace[azar(soloEnlace)]);
    return reelGenerado();
  }

  /** Cambia al siguiente reel con un deslizamiento hacia arriba. */
  function next() {
    var viejo = el.screen.querySelector('.iw-reel:not(.iw-reel--out)');
    var nuevo = siguienteReel();
    if (!reducido) nuevo.classList.add('iw-reel--in');
    el.screen.appendChild(nuevo);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { nuevo.classList.remove('iw-reel--in'); });
    });
    if (viejo) {
      viejo.classList.add('iw-reel--out');
      setTimeout(function () { viejo.remove(); }, reducido ? 0 : 700);
    }
    actualizarContador();
  }

  /* ---------- Me gusta: corazones que suben ---------- */
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

  /* ---------- Abrir y dejar el celular ---------- */
  function abrir() {
    if (abierto) return;
    abierto = true;
    el.box.hidden = false;
    el.reopen.hidden = true;
    document.body.classList.add('iw-reels-open');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.box.classList.add('iw-reels--on'); });
    });
    if (!el.screen.querySelector('.iw-reel')) next();
    el.next.focus({ preventScroll: true });
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    el.box.classList.remove('iw-reels--on');
    document.body.classList.remove('iw-reels-open');
    setTimeout(function () {
      el.box.hidden = true;
      // Se detiene el video (y su sonido) al dejar el celular
      el.screen.replaceChildren();
      el.reopen.hidden = false;
      var step = document.getElementById('iw-step');
      if (step) step.focus({ preventScroll: true });
    }, reducido ? 0 : 600);
    IW.ui.respond('You put the phone down. For now.');
  }

  /* ---------- Gestos ---------- */
  function alRueda(e) {
    if (!abierto) return;
    e.preventDefault();
    var ahora = Date.now();
    if (Math.abs(e.deltaY) < 30 || ahora - ultimaRueda < PAUSA_RUEDA) return;
    ultimaRueda = ahora;
    if (e.deltaY > 0) next();
  }

  var toqueY = null;
  function alTocar(e) { toqueY = e.touches[0].clientY; }
  function alSoltar(e) {
    if (toqueY === null) return;
    var dy = toqueY - e.changedTouches[0].clientY;
    toqueY = null;
    if (dy > 60) next();
  }

  function alTeclado(e) {
    if (!abierto) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') { e.preventDefault(); next(); }
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
  }

  /* =======================================================================
     Inicio (solo si se entró con el celular)
     ======================================================================= */
  function init(scene, motifId) {
    el.box = document.getElementById('iw-reels');
    if (!el.box) return;
    el.screen = document.getElementById('iw-reels-screen');
    el.meter = document.getElementById('iw-reels-meter');
    el.like = document.getElementById('iw-reels-like');
    el.likes = document.getElementById('iw-reels-likes');
    el.next = document.getElementById('iw-reels-next');
    el.reopen = document.getElementById('iw-reels-reopen');

    // Clasificar los links: los que se reproducen aquí y los que solo se abren fuera
    var vistosEmbed = {};
    (IW.mediaLinks || []).forEach(function (link) {
      var item = parse(link);
      if (!item) return;
      if (item.embed && !vistosEmbed[item.embed]) { vistosEmbed[item.embed] = true; reproducibles.push(item); }
      else if (item.link) soloEnlace.push(item);
    });

    if (motifId && /^[a-z0-9-]+$/.test(motifId)) motivoSrc = IW.data.MOTIF_PATH + motifId + '.svg';

    el.next.addEventListener('click', next);
    el.like.addEventListener('click', like);
    document.getElementById('iw-reels-close').addEventListener('click', cerrar);
    el.reopen.addEventListener('click', abrir);
    el.box.addEventListener('wheel', alRueda, { passive: false });
    el.box.addEventListener('touchstart', alTocar, { passive: true });
    el.box.addEventListener('touchend', alSoltar, { passive: true });
    document.addEventListener('keydown', alTeclado);

    // El tiempo "de scroll" corre más rápido que el real
    setInterval(function () {
      if (!abierto || document.hidden) return;
      segundos += VELOCIDAD_TIEMPO;
      actualizarContador();
    }, 1000);

    // Al terminar la transición, el celular ya está en la mano
    setTimeout(abrir, reducido ? 0 : 1400);
  }

  IW.reels = { init: init, parse: parse, open: abrir, close: cerrar };
})();
