/* =========================================================================
   IMAGINED WORLD · exp-music.js
   AUDÍFONOS → MÚSICA (Emotional overload)
   La pantalla entera es una pared de portadas de canciones exitosas de
   muchos géneros (lista en js/music-tracks.js). Abajo, el reproductor de
   siempre: anterior · pausa · siguiente, progreso y volumen.
   Suena una vista previa oficial de 30 s de cada canción (Apple Music) y,
   al terminar, empieza la siguiente sola: nunca hay silencio.
   Si se pausa, las voces de la realidad vuelven a oírse... y a verse.
   Residuo: entre las portadas hay una gris: la nota clavada.
   Teclado: Espacio = pausa, ← → = anterior / siguiente.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.experiences = IW.experiences || {};

  var ICONOS = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
  };

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function mezclar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  IW.experiences.music = function (c) {
    var todas = (IW.musicTracks || []).filter(function (t) { return t && t.preview && t.cover; });
    var generos = ['All'];
    todas.forEach(function (t) { if (generos.indexOf(t.genre) === -1) generos.push(t.genre); });
    var voces = c.scene.reality.concat(['Everyone else can.', 'Why are you like this?']);

    c.root.innerHTML =
      '<div class="iw-mp">' +
        '<div class="iw-mp__bg" id="iw-mp-bg" aria-hidden="true"></div>' +
        '<nav class="iw-mp__genres" id="iw-mp-genres" aria-label="Genres"></nav>' +
        '<div class="iw-mp__grid" id="iw-mp-grid" role="list" aria-label="Songs"></div>' +
        '<div class="iw-mp__voices" aria-hidden="true">' +
          voces.map(function (v, i) {
            return '<span style="--i:' + i + ';--x:' + (6 + (i * 37) % 70) + '%;--y:' + (14 + (i * 23) % 56) + '%">' + esc(v) + '</span>';
          }).join('') +
        '</div>' +
        '<div class="iw-mp__bar">' +
          '<div class="iw-mp__now">' +
            '<img class="iw-mp__now-cover" id="iw-mp-cover" alt="">' +
            '<div class="iw-mp__now-text">' +
              '<p class="iw-mp__now-title" id="iw-mp-title">—</p>' +
              '<p class="iw-mp__now-artist" id="iw-mp-artist"></p>' +
              '<a class="iw-mp__now-link" id="iw-mp-link" target="_blank" rel="noopener noreferrer">Listen on Apple Music ↗</a>' +
            '</div>' +
          '</div>' +
          '<div class="iw-mp__center">' +
            '<div class="iw-mp__buttons">' +
              '<button class="iw-mp__btn" id="iw-mp-prev" type="button" aria-label="Previous song">' + ICONOS.prev + '</button>' +
              '<button class="iw-mp__btn iw-mp__btn--main" id="iw-mp-play" type="button" aria-label="Play">' + ICONOS.play + '</button>' +
              '<button class="iw-mp__btn" id="iw-mp-next" type="button" aria-label="Next song">' + ICONOS.next + '</button>' +
            '</div>' +
            '<div class="iw-mp__progress">' +
              '<span id="iw-mp-cur">0:00</span>' +
              '<div class="iw-mp__track" id="iw-mp-seek" role="slider" aria-label="Song position" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="iw-mp-fill"></span></div>' +
              '<span id="iw-mp-dur">0:30</span>' +
            '</div>' +
          '</div>' +
          '<label class="iw-mp__vol">' +
            '<span>Turn it up</span>' +
            '<input type="range" id="iw-mp-vol" min="0" max="100" value="80" aria-label="Volume">' +
          '</label>' +
        '</div>' +
        '<p class="iw-mp__credit">Previews courtesy of Apple Music · 30 s each</p>' +
      '</div>';

    var root = c.root.querySelector('.iw-mp');
    var $ = function (id) { return root.querySelector('#' + id); };
    var el = {
      bg: $('iw-mp-bg'), genres: $('iw-mp-genres'), grid: $('iw-mp-grid'), cover: $('iw-mp-cover'),
      title: $('iw-mp-title'), artist: $('iw-mp-artist'), link: $('iw-mp-link'),
      prev: $('iw-mp-prev'), play: $('iw-mp-play'), next: $('iw-mp-next'),
      cur: $('iw-mp-cur'), dur: $('iw-mp-dur'), seek: $('iw-mp-seek'), fill: $('iw-mp-fill'), vol: $('iw-mp-vol')
    };

    var audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.8;
    // El botón de sonido general también silencia las canciones
    audio.muted = IW.audio.isMuted();
    var botonSonido = document.getElementById('iw-mute');
    if (botonSonido) botonSonido.addEventListener('click', function () {
      setTimeout(function () { audio.muted = IW.audio.isMuted(); }, 0);
    });

    var cola = mezclar(todas);     // orden de reproducción
    var filtro = 'All';
    var actual = -1;               // índice en cola
    var pendiente = false;         // el navegador bloqueó el autoplay
    var tocadas = 0;

    /* ---------- Pared de portadas ---------- */
    function pintarGeneros() {
      el.genres.innerHTML = generos.map(function (g) {
        return '<button type="button" class="iw-mp__chip" aria-pressed="' + (g === filtro) + '" data-g="' + esc(g) + '">' + esc(g) + '</button>';
      }).join('');
    }

    function pintarPared() {
      var visibles = cola.filter(function (t) { return filtro === 'All' || t.genre === filtro; });
      var html = visibles.map(function (t) {
        var i = cola.indexOf(t);
        return '<button type="button" class="iw-mp__tile" role="listitem" data-i="' + i + '" aria-label="' + esc(t.title + ' by ' + t.artist) + '">' +
          '<img src="' + esc(t.cover) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="iw-mp__tile-genre">' + esc(t.genre) + '</span>' +
          '<span class="iw-mp__tile-info"><b>' + esc(t.title) + '</b><i>' + esc(t.artist) + '</i></span>' +
          '<span class="iw-mp__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '</button>';
      });
      // El residuo: una portada gris entre todas (la nota clavada)
      var src = IW.motif.src(c.motifId);
      if (src && filtro === 'All') {
        var pos = Math.min(html.length, 7);
        html.splice(pos, 0, '<button type="button" class="iw-mp__tile iw-mp__tile--residue" role="listitem" aria-label="Something from your room: ' + esc(c.scene.motifDescription) + '">' +
          '<img src="' + src + '" alt=""><span class="iw-mp__tile-info"><b>Reply to her.</b><i>still pinned</i></span></button>');
      }
      el.grid.innerHTML = html.join('') || '<p class="iw-mp__empty">Add songs in js/music-tracks.js</p>';
      marcarActual();
    }

    function marcarActual() {
      el.grid.querySelectorAll('.iw-mp__tile').forEach(function (b) {
        var on = Number(b.dataset.i) === actual;
        b.classList.toggle('iw-mp__tile--on', on);
        b.classList.toggle('iw-mp__tile--paused', on && audio.paused);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
    }

    /* ---------- Reproducción ---------- */
    function cargar(i, tocar) {
      if (!cola.length) return;
      actual = (i + cola.length) % cola.length;
      var t = cola[actual];
      audio.src = t.preview;
      el.cover.src = t.cover;
      el.title.textContent = t.title;
      el.artist.textContent = t.artist;
      el.link.href = t.link || 'https://music.apple.com/';
      el.bg.style.backgroundImage = 'url("' + t.cover.replace(/"/g, '') + '")';
      el.fill.style.transform = 'scaleX(0)';
      el.cur.textContent = '0:00';
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new window.MediaMetadata({ title: t.title, artist: t.artist, artwork: [{ src: t.cover, sizes: '600x600' }] });
        } catch (e) { /* no disponible */ }
      }
      marcarActual();
      if (tocar) reproducir();
    }

    function reproducir() {
      var p = audio.play();
      if (p && p.catch) {
        p.then(function () { pendiente = false; tocadas++; }).catch(function () {
          // Autoplay bloqueado: el botón de play late hasta el primer toque
          pendiente = true;
          actualizarBoton();
        });
      }
    }

    function alternar() {
      if (actual < 0) { cargar(0, true); return; }
      if (audio.paused) reproducir(); else audio.pause();
    }

    function siguiente() { cargar(actual + 1, true); }

    function anterior() {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      cargar(actual - 1, true);
    }

    function actualizarBoton() {
      var pausado = audio.paused;
      el.play.innerHTML = pausado ? ICONOS.play : ICONOS.pause;
      el.play.setAttribute('aria-label', pausado ? 'Play' : 'Pause');
      el.play.classList.toggle('iw-mp__btn--waiting', pausado && pendiente);
      // En silencio, la realidad vuelve
      root.classList.toggle('iw-mp--paused', pausado);
      marcarActual();
    }

    audio.addEventListener('play', actualizarBoton);
    audio.addEventListener('pause', actualizarBoton);
    audio.addEventListener('ended', siguiente);           // nunca hay silencio
    // Si una vista previa falla, se pasa a la siguiente; si fallan varias
    // seguidas (el navegador no reproduce AAC), se detiene y se avisa.
    var fallos = 0;
    audio.addEventListener('playing', function () { fallos = 0; });
    audio.addEventListener('error', function () {
      fallos++;
      if (fallos >= 4) {
        IW.ui.toast("This browser can't play these previews. Try Chrome, Edge or Safari.", 6000);
        return;
      }
      setTimeout(siguiente, 400);
    });
    audio.addEventListener('loadedmetadata', function () { el.dur.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', function () {
      var d = audio.duration || 30;
      el.cur.textContent = fmt(audio.currentTime);
      el.fill.style.transform = 'scaleX(' + Math.min(1, audio.currentTime / d).toFixed(3) + ')';
      el.seek.setAttribute('aria-valuenow', Math.round((audio.currentTime / d) * 100));
    });

    /* ---------- Controles ---------- */
    el.play.addEventListener('click', alternar);
    el.next.addEventListener('click', siguiente);
    el.prev.addEventListener('click', anterior);
    el.vol.addEventListener('input', function () {
      audio.volume = el.vol.value / 100;
      root.style.setProperty('--vol', (el.vol.value / 100).toFixed(2));
    });
    el.seek.addEventListener('click', function (e) {
      var r = el.seek.getBoundingClientRect();
      if (audio.duration) audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    el.grid.addEventListener('click', function (e) {
      var b = e.target.closest('.iw-mp__tile');
      if (!b) return;
      if (b.classList.contains('iw-mp__tile--residue')) { IW.ui.toast(c.scene.residue); return; }
      var i = Number(b.dataset.i);
      if (i === actual) alternar(); else cargar(i, true);
    });

    el.genres.addEventListener('click', function (e) {
      var b = e.target.closest('.iw-mp__chip');
      if (!b) return;
      filtro = b.dataset.g;
      pintarGeneros();
      pintarPared();
      // Al elegir un género, suena una canción de ese género
      if (filtro !== 'All') {
        var primera = cola.findIndex(function (t) { return t.genre === filtro; });
        if (primera >= 0 && cola[actual] && cola[actual].genre !== filtro) cargar(primera, true);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' && e.key === ' ')) return;
      if (e.key === ' ') { e.preventDefault(); alternar(); }
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    });

    // El primer toque en cualquier parte arranca la música si estaba bloqueada
    window.addEventListener('pointerdown', function () { if (pendiente && audio.paused) reproducir(); }, { capture: true });

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('nexttrack', siguiente);
        navigator.mediaSession.setActionHandler('previoustrack', anterior);
      } catch (e) { /* no disponible */ }
    }

    /* ---------- Inicio: suena sola al llegar ---------- */
    pintarGeneros();
    pintarPared();
    actualizarBoton();

    IW.ui.startCard().then(function () {
      if (!cola.length) return;
      cargar(0, true);
      el.play.focus({ preventScroll: true });
    });
  };
})();
