/* =========================================================================
   IMAGINED WORLD · audio.js
   Motor de sonido compartido por todas las experiencias (Web Audio, sin
   archivos). NUNCA hay autoplay: arranca con el primer "Play" / "Start"
   de cada aparato. Preferencia de silencio en localStorage.

   API:
     IW.audio.start()             crea el contexto (llamar desde un clic)
     IW.audio.ctx / .out          contexto y nodo de salida (para conectar)
     IW.audio.tone({...})         una nota (frecuencia, duración, forma…)
     IW.audio.noise({...})        un golpe de ruido filtrado (batería, explosión)
     IW.audio.loop(bpm, paso)     secuenciador: llama paso(n, tiempo) cada 1/16
     IW.audio.setLevel(0..1)      volumen general de la experiencia
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  var CLAVE = 'iw:muted';

  var ctx = null;
  var master = null;
  var nivel = null;
  var bufferRuido = null;
  var muted = leer();
  var bucles = [];

  function leer() {
    try { return localStorage.getItem(CLAVE) === '1'; } catch (e) { return false; }
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, muted ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
  }

  function start() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    ctx = new C();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    nivel = ctx.createGain();
    nivel.gain.value = 0.8;
    nivel.connect(master).connect(comp).connect(ctx.destination);

    var largo = ctx.sampleRate * 2;
    bufferRuido = ctx.createBuffer(1, largo, ctx.sampleRate);
    var d = bufferRuido.getChannelData(0);
    for (var i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1;

    IW.audio.ctx = ctx;
    IW.audio.out = nivel;   // pasa por el volumen de la experiencia
    IW.audio.bus = master;  // directo (solo lo afecta el silencio)

    // Si el navegador no deja sonar sin un gesto en esta página,
    // el primer toque o tecla (en cualquier parte) lo desbloquea.
    if (ctx.state === 'suspended') {
      var desbloquear = function () {
        ctx.resume().then(actualizarBoton);
        ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { window.removeEventListener(ev, desbloquear, true); });
      };
      ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { window.addEventListener(ev, desbloquear, true); });
      ctx.addEventListener('statechange', actualizarBoton);
    }
    actualizarBoton();
    return true;
  }

  /** Una nota con envolvente suave. */
  function tone(o) {
    if (!ctx) return null;
    var t = o.when || ctx.currentTime;
    var dur = o.dur || 0.3;
    var osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f || 440, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    if (o.detune) osc.detune.value = o.detune;
    var g = ctx.createGain();
    var vol = o.vol === undefined ? 0.2 : o.vol;
    var ataque = o.attack || 0.01;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var salida = g;
    if (o.filter) {
      var f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.filter;
      g.connect(f);
      salida = f;
    }
    osc.connect(g);
    salida.connect(o.dest || nivel);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    return osc;
  }

  /** Golpe de ruido filtrado (hi-hat, caja, explosión, roce). */
  function noise(o) {
    if (!ctx) return;
    var t = o.when || ctx.currentTime;
    var dur = o.dur || 0.1;
    var src = ctx.createBufferSource();
    src.buffer = bufferRuido;
    var f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 2000;
    f.Q.value = o.q || 0.8;
    var g = ctx.createGain();
    g.gain.setValueAtTime(o.vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(o.dest || nivel);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  /** Bombo sintético. */
  function kick(when, vol) {
    if (!ctx) return;
    var t = when || ctx.currentTime;
    var o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g).connect(nivel);
    o.start(t);
    o.stop(t + 0.35);
  }

  /**
   * Secuenciador: llama paso(n, tiempo) en cada semicorchea (1/16).
   * Devuelve { stop(), setBpm(bpm) }.
   */
  function loop(bpm, paso) {
    if (!ctx) return { stop: function () {}, setBpm: function () {} };
    var n = 0;
    var siguiente = ctx.currentTime + 0.08;
    var dur = 60 / bpm / 4;
    var id = setInterval(function () {
      while (siguiente < ctx.currentTime + 0.12) {
        paso(n, siguiente);
        n++;
        siguiente += dur;
      }
    }, 25);
    var b = { stop: function () { clearInterval(id); }, setBpm: function (v) { dur = 60 / v / 4; } };
    bucles.push(b);
    return b;
  }

  function setLevel(v) {
    if (nivel) nivel.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.1);
  }

  function setMuted(v) {
    muted = !!v;
    guardar();
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.2);
    actualizarBoton();
  }

  function actualizarBoton() {
    var b = document.getElementById('iw-mute');
    if (!b) return;
    var sonando = ctx && !muted;
    var bloqueado = ctx && ctx.state === 'suspended' && !muted;
    // Si el navegador aún no deja sonar: una pista discreta, no una pantalla
    b.classList.toggle('iw-mute--hint', !!bloqueado);
    b.textContent = bloqueado ? 'tap for sound' : sonando ? 'sound on' : 'sound off';
    b.setAttribute('aria-pressed', sonando ? 'false' : 'true');
    b.setAttribute('aria-label', sonando ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on');
  }

  function init() {
    var b = document.getElementById('iw-mute');
    if (b) {
      b.addEventListener('click', function () {
        if (!ctx) { muted = false; guardar(); start(); return; }
        // Si estaba bloqueado, este toque ya lo desbloqueó: no silenciar
        if (b.classList.contains('iw-mute--hint')) { ctx.resume().then(actualizarBoton); return; }
        setMuted(!muted);
      });
    }
    actualizarBoton();
  }

  IW.audio = {
    ctx: null,
    out: null,
    init: init,
    start: start,
    tone: tone,
    noise: noise,
    kick: kick,
    loop: loop,
    setLevel: setLevel,
    setMuted: setMuted,
    isMuted: function () { return muted; },
    isOn: function () { return !!ctx; }
  };
})();
