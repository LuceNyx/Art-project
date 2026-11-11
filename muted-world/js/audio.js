/* =========================================================================
   MUTED WORLD · audio.js
   Ambiente sutil por escena. NUNCA hay autoplay: el audio arranca con
   la primera interacción (el botón "Click to enter your room").

   Cada capa intenta cargar un archivo de assets/audio/ (ver AUDIO_SPEC.md).
   Si no existe (o la página se abrió con doble clic), se genera con la
   Web Audio API: ruido filtrado y osciladores suaves.
   La experiencia funciona completa sin audio.
   ========================================================================= */

(function () {
  'use strict';

  var MW = (window.MutedWorld = window.MutedWorld || {});
  var AUDIO_PATH = 'assets/audio/';

  // Capas: archivo opcional + volumen base (muy bajo)
  var CAPAS = {
    roomTone:  { file: 'room-tone.mp3',       base: 0.09 },
    rain:      { file: 'rain.mp3',            base: 0.035 },
    hum:       { file: 'lamp-hum.mp3',        base: 0.014 },
    tick:      { file: 'clock-tick.mp3',      base: 0.05 },
    vibration: { file: 'phone-vibration.mp3', base: 0.05 },
    voices:    { file: 'muffled-voices.mp3',  base: 0.06 }
  };

  // Mezcla de cada perfil (0 a 1 por capa)
  var PERFILES = {
    room:                     { roomTone: 0.55, rain: 0.3,  hum: 0.15, tick: 0.25, vibration: 0.35, voices: 0 },
    'academic-pressure':      { roomTone: 0.35, rain: 0.08, hum: 0.8,  tick: 0.12, vibration: 0,    voices: 0 },
    'loneliness':             { roomTone: 0.7,  rain: 0.15, hum: 0,    tick: 0.08, vibration: 1,    voices: 0 },
    'emotional-overload':     { roomTone: 0.5,  rain: 0.05, hum: 0.25, tick: 0.45, vibration: 0.2,  voices: 0.25 },
    'lack-of-control':        { roomTone: 0.4,  rain: 0.08, hum: 0,    tick: 1,    vibration: 0,    voices: 0 },
    'lack-of-control-hidden': { roomTone: 0.4,  rain: 0.08, hum: 0,    tick: 0,    vibration: 0,    voices: 0 },
    'social-comparison':      { roomTone: 0.45, rain: 0.05, hum: 0.45, tick: 0.1,  vibration: 0.3,  voices: 0 },
    'uncertain-future':       { roomTone: 0.4,  rain: 1,    hum: 0,    tick: 0.05, vibration: 0,    voices: 0 },
    'family-expectations':    { roomTone: 0.4,  rain: 0.1,  hum: 0,    tick: 0.2,  vibration: 0,    voices: 1 }
  };

  var ctx = null;
  var master = null;
  var filtro = null;
  var gains = {};
  var sinteticas = {};     // capas generadas en código (tick y vibración por temporizador)
  var perfilActual = 'room';
  var apagado = false;     // "dampened": la escena se ocultó (evasión)
  var muted = leerMute();

  /* ---------- Preferencia de silencio (localStorage, con try/catch) ---------- */
  function leerMute() {
    try { return localStorage.getItem(MW.config.STORAGE.muted) === '1'; }
    catch (e) { return false; }
  }

  function guardarMute() {
    try { localStorage.setItem(MW.config.STORAGE.muted, muted ? '1' : '0'); }
    catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  /* ---------- Ruido ---------- */
  function bufferRuido(tipo) {
    var largo = ctx.sampleRate * 4;
    var buffer = ctx.createBuffer(1, largo, ctx.sampleRate);
    var datos = buffer.getChannelData(0);
    var ultimo = 0;
    for (var i = 0; i < largo; i++) {
      var blanco = Math.random() * 2 - 1;
      if (tipo === 'brown') {
        ultimo = (ultimo + 0.02 * blanco) / 1.02;
        datos[i] = ultimo * 3.5;
      } else {
        datos[i] = blanco;
      }
    }
    return buffer;
  }

  function fuenteEnBucle(buffer) {
    var fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.loop = true;
    fuente.start();
    return fuente;
  }

  /* ---------- Capas sintéticas (respaldo) ---------- */
  function sintetizar(nombre, destino) {
    if (nombre === 'roomTone') {
      // Respiración del cuarto: ruido grave con un vaivén muy lento
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      var respiracion = ctx.createGain();
      respiracion.gain.value = 0.75;
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.25;
      lfo.connect(lfoGain).connect(respiracion.gain);
      lfo.start();
      fuenteEnBucle(bufferRuido('brown')).connect(lp).connect(respiracion).connect(destino);
    }

    if (nombre === 'rain') {
      // Lluvia lejana al otro lado de la ventana
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1700;
      bp.Q.value = 0.6;
      var hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 600;
      fuenteEnBucle(bufferRuido('white')).connect(bp).connect(hp).connect(destino);
    }

    if (nombre === 'hum') {
      // Zumbido de la lámpara: fundamental y armónicos, apenas desafinados
      [[100, 1], [200, 0.5], [300.6, 0.18]].forEach(function (par) {
        var osc = ctx.createOscillator();
        osc.frequency.value = par[0];
        var g = ctx.createGain();
        g.gain.value = par[1];
        osc.connect(g).connect(destino);
        osc.start();
      });
    }

    if (nombre === 'tick') {
      // Tic-tac: dos clics cortos que alternan
      var par = false;
      sinteticas.tick = setInterval(function () {
        par = !par;
        golpe(destino, par ? 3200 : 2600, 0.03, 1);
      }, 1000);
    }

    if (nombre === 'voices') {
      // Voces apagadas al otro lado de la pared: ruido grave filtrado con
      // ritmo de sílabas y pausas (no se entiende ninguna palabra)
      var banda = ctx.createBiquadFilter();
      banda.type = 'bandpass';
      banda.frequency.value = 360;
      banda.Q.value = 2.2;
      var silabas = ctx.createGain();
      silabas.gain.value = 0;
      fuenteEnBucle(bufferRuido('brown')).connect(banda).connect(silabas).connect(destino);
      var restantes = 0;
      sinteticas.voices = setInterval(function () {
        var t = ctx.currentTime;
        if (restantes <= 0 && Math.random() < 0.05) restantes = 8 + Math.round(Math.random() * 22);
        if (restantes > 0) {
          restantes--;
          silabas.gain.setTargetAtTime(Math.random() < 0.25 ? 0.05 : 0.45 + Math.random() * 0.55, t, 0.04);
        } else {
          silabas.gain.setTargetAtTime(0, t, 0.2);
        }
      }, 140);
    }

    if (nombre === 'vibration') {
      // Vibración apagada del celular contra el colchón
      sinteticas.vibration = setInterval(function () {
        zumbido(destino, 0);
        zumbido(destino, 0.5);
      }, 9000);
    }
  }

  /** Golpe corto de ruido filtrado (tic, roce). */
  function golpe(destino, frecuencia, duracion, volumen) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var fuente = ctx.createBufferSource();
    fuente.buffer = golpe.buffer || (golpe.buffer = bufferRuido('white'));
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = frecuencia;
    bp.Q.value = 0.9;
    var env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(volumen, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    fuente.connect(bp).connect(env).connect(destino);
    fuente.start(t, Math.random() * 3);
    fuente.stop(t + duracion + 0.05);
  }

  function zumbido(destino, retraso) {
    var t = ctx.currentTime + retraso;
    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 150;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    var env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.04);
    env.gain.setValueAtTime(0.5, t + 0.3);
    env.gain.linearRampToValueAtTime(0, t + 0.36);
    osc.connect(lp).connect(env).connect(destino);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /** Intenta cargar el archivo de la capa; si falla, la genera en código. */
  function crearCapa(nombre) {
    var g = ctx.createGain();
    g.gain.value = 0;
    g.connect(filtro);
    gains[nombre] = g;

    var url = AUDIO_PATH + CAPAS[nombre].file;
    var respaldo = function () { sintetizar(nombre, g); };

    if (location.protocol === 'file:' || !window.fetch) { respaldo(); return; }

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('sin archivo'); return r.arrayBuffer(); })
      .then(function (datos) { return ctx.decodeAudioData(datos); })
      .then(function (buffer) { fuenteEnBucle(buffer).connect(g); })
      .catch(respaldo);
  }

  /* ---------- Mezcla ---------- */
  function aplicarPerfil(transicion) {
    if (!ctx) return;
    var mezcla = PERFILES[perfilActual] || PERFILES.room;
    var t = ctx.currentTime;
    Object.keys(CAPAS).forEach(function (nombre) {
      var destino = (mezcla[nombre] || 0) * CAPAS[nombre].base;
      gains[nombre].gain.setTargetAtTime(destino, t, transicion);
    });
  }

  function aplicarMaster() {
    if (!ctx) return;
    var t = ctx.currentTime;
    var volumen = muted ? 0 : (apagado ? 0.55 : 1);
    master.gain.setTargetAtTime(volumen, t, 0.6);
    filtro.frequency.setTargetAtTime(apagado ? 900 : 14000, t, 0.8);
  }

  /* ---------- API pública ---------- */

  /** Se llama desde el primer clic del visitante. */
  function start() {
    if (ctx) { ctx.resume(); return; }
    var Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;

    ctx = new Contexto();
    master = ctx.createGain();
    master.gain.value = 0;
    filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 14000;
    filtro.connect(master).connect(ctx.destination);

    Object.keys(CAPAS).forEach(crearCapa);
    aplicarPerfil(2.5); // entrada lenta
    aplicarMaster();
  }

  /** Cambia el ambiente: 'room' o el id de una situación. */
  function setProfile(nombre) {
    perfilActual = PERFILES[nombre] ? nombre : 'room';
    aplicarPerfil(1.5);
  }

  /** Escena oculta (evasión): todo suena más lejos y más bajo. */
  function setDampened(valor) {
    apagado = !!valor;
    aplicarMaster();
  }

  /** Roce de una hoja de papel al caer. */
  function rustle() {
    if (!ctx || muted) return;
    golpe(filtro, 2400 + Math.random() * 900, 0.45, 0.035);
  }

  function setMuted(valor) {
    muted = !!valor;
    guardarMute();
    aplicarMaster();
    actualizarBoton();
  }

  function actualizarBoton() {
    var boton = document.getElementById('mw-mute');
    if (!boton) return;
    boton.setAttribute('aria-pressed', muted ? 'true' : 'false');
    boton.textContent = muted ? 'sound off' : 'sound on';
    boton.setAttribute('aria-label', muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off');
  }

  function init() {
    var boton = document.getElementById('mw-mute');
    if (boton) {
      boton.addEventListener('click', function () {
        start();
        setMuted(!muted);
      });
    }
    actualizarBoton();
  }

  MW.audio = {
    init: init,
    start: start,
    setProfile: setProfile,
    setDampened: setDampened,
    rustle: rustle,
    setMuted: setMuted,
    isMuted: function () { return muted; }
  };
})();
