/* =========================================================================
   IMAGINED WORLD · audio.js
   Sonido opcional. NUNCA hay autoplay: solo arranca con un clic del
   visitante ("Step in" o el botón de sonido). La experiencia funciona
   completa sin audio. Preferencia de silencio en localStorage.

   Capas: un acorde suave (pad) y agua/viento. Si existen archivos en
   assets/audio/ (ver AUDIO_SPEC.md) se usan; si no, se generan con
   Web Audio. Las campanitas de los descubrimientos siempre son código.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var CLAVE_SILENCIO = 'iw:muted';
  var RUTA = 'assets/audio/';

  // Escala pentatónica: cualquier combinación suena en armonía
  var NOTAS = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  var ctx = null;
  var master = null;
  var eco = null;
  var muted = leer();

  function leer() {
    try {
      var v = localStorage.getItem(CLAVE_SILENCIO);
      return v === null ? false : v === '1';
    } catch (e) { return false; }
  }

  function guardar() {
    try { localStorage.setItem(CLAVE_SILENCIO, muted ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
  }

  function ruido() {
    var largo = ctx.sampleRate * 4;
    var buffer = ctx.createBuffer(1, largo, ctx.sampleRate);
    var d = buffer.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < largo; i++) {
      // Ruido rosa aproximado: más suave que el blanco
      var w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099;
      b1 = 0.963 * b1 + w * 0.2965;
      b2 = 0.57 * b2 + w * 1.0527;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
    return buffer;
  }

  function bucle(buffer, destino) {
    var f = ctx.createBufferSource();
    f.buffer = buffer;
    f.loop = true;
    f.connect(destino);
    f.start();
  }

  /* ---------- Capas sintéticas (respaldo) ---------- */
  function padSintetico(destino) {
    // Acorde abierto y cálido, con un filtro que "respira"
    var filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 900;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    var lfoG = ctx.createGain();
    lfoG.gain.value = 400;
    lfo.connect(lfoG).connect(filtro.frequency);
    lfo.start();
    [220, 277.18, 329.63, 440].forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;
      var g = ctx.createGain();
      g.gain.value = 0.25 / (i + 1);
      o.connect(g).connect(filtro);
      o.start();
    });
    filtro.connect(destino);
  }

  function aguaSintetica(destino) {
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700;
    bp.Q.value = 0.5;
    var g = ctx.createGain();
    g.gain.value = 0.7;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    var lfoG = ctx.createGain();
    lfoG.gain.value = 0.3;
    lfo.connect(lfoG).connect(g.gain);
    lfo.start();
    bucle(ruido(), bp);
    bp.connect(g).connect(destino);
  }

  function capa(archivo, volumen, respaldo) {
    var g = ctx.createGain();
    g.gain.value = volumen;
    g.connect(master);
    if (location.protocol === 'file:' || !window.fetch) { respaldo(g); return; }
    fetch(RUTA + archivo)
      .then(function (r) { if (!r.ok) throw new Error('sin archivo'); return r.arrayBuffer(); })
      .then(function (d) { return ctx.decodeAudioData(d); })
      .then(function (b) { bucle(b, g); })
      .catch(function () { respaldo(g); });
  }

  /* ---------- API ---------- */
  function start() {
    if (ctx) { ctx.resume(); return; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Eco suave para las campanitas
    eco = ctx.createDelay(1);
    eco.delayTime.value = 0.34;
    var retro = ctx.createGain();
    retro.gain.value = 0.32;
    eco.connect(retro).connect(eco);
    eco.connect(master);

    capa('ambient-pad.mp3', 0.09, padSintetico);
    capa('water.mp3', 0.05, aguaSintetica);
    aplicar(3);
  }

  function aplicar(tiempo) {
    if (!ctx) return;
    master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, tiempo || 0.5);
  }

  /** Campanita al descubrir algo (i elige la nota). */
  function chime(i) {
    if (!ctx || muted) return;
    var t = ctx.currentTime;
    var f = NOTAS[Math.abs(i || 0) % NOTAS.length];
    [1, 2.01].forEach(function (mult, k) {
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mult;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(k ? 0.02 : 0.07, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g);
      g.connect(master);
      g.connect(eco);
      o.start(t);
      o.stop(t + 2.8);
    });
  }

  function setMuted(valor) {
    muted = !!valor;
    guardar();
    aplicar();
    actualizarBoton();
  }

  function actualizarBoton() {
    var b = document.getElementById('iw-mute');
    if (!b) return;
    var sonando = ctx && !muted;
    b.textContent = sonando ? 'sound on' : 'sound off';
    b.setAttribute('aria-pressed', sonando ? 'false' : 'true');
    b.setAttribute('aria-label', sonando ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on');
  }

  function init() {
    var b = document.getElementById('iw-mute');
    if (b) {
      b.addEventListener('click', function () {
        if (!ctx) { muted = false; start(); guardar(); actualizarBoton(); return; }
        setMuted(!muted);
      });
    }
    actualizarBoton();
  }

  /** "Step in": arranca el sonido salvo que el visitante lo haya silenciado antes. */
  function startIfAllowed() {
    if (muted) return;
    start();
    actualizarBoton();
  }

  IW.audio = { init: init, start: start, startIfAllowed: startIfAllowed, chime: chime, setMuted: setMuted };
})();
