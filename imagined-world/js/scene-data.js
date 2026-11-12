/* =========================================================================
   IMAGINED WORLD · scene-data.js
   Configuración de las siete situaciones: textos (en inglés), paleta,
   elementos para descubrir y cómo reaparece el motivo de la realidad.
   Los ids (scene y motif) coinciden con muted-world/js/config.js.
   Todo vive dentro de window.ImaginedWorld.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  // Rutas hacia el Muted World (los motivos NO se duplican)
  var MOTIF_PATH = '../muted-world/assets/motifs/';
  var RETURN_URL = '../muted-world/index.html';

  /*
   * Cada situación:
   *   motif        → id del motivo que llega desde la realidad
   *   medium       → forma de escapismo (la misma de transition/): video,
   *                  online, music, choice, feed, vr, sandbox
   *   pleasure     → el goce: por qué se escapa (frase sobre la llegada)
   *   reality      → mensajes de la realidad que muestra el portal de regreso
   *   palette      → ligera variación de color del cielo y la luz
   *   arrival      → frase de llegada (The Threshold)
   *   kind         → tipo de elemento interactivo del Open World
   *   discoveries  → elementos: { x, y } en % de la zona, label (aria),
   *                  text (lo que muestran), response (lo que responde el mundo)
   *   afterAll     → frase cuando se descubre todo
   *   motifSpot    → dónde aparece el motivo en el Open World { x, y, size }
   *   motifText    → lo que dice el mundo al tocar el motivo (no desaparece)
   *   edge         → líneas de The Quiet Edge, antes de volver
   */
  var SCENES = {
    'academic-pressure': {
      motif: 'stacked-paper',
      motifDescription: 'the stack of paper from your desk',
      medium: 'video',
      pleasure: 'The next episode started on its own.',
      reality: ['Due 8:00 AM', 'It was due yesterday.', 'p. 1 / 312'],
      palette: { skyTop: '#1c2a66', skyMid: '#5a4ea6', horizon: '#ffb48c', sun: '#ffd98a' },
      arrival: 'Nothing is due here.',
      kind: 'lantern',
      discoveries: [
        { x: 22, y: 62, label: 'A lantern: one page', text: 'One page.', response: 'Done. That was enough.' },
        { x: 46, y: 56, label: 'A lantern: a glass of water', text: 'A glass of water.', response: 'Done.' },
        { x: 68, y: 64, label: 'A lantern: five minutes of rest', text: 'Five minutes of rest.', response: 'Done. Look how it rises.' }
      ],
      afterAll: 'Small things count, too.',
      motifSpot: { x: 86, y: 46, size: 20 },
      motifText: 'The pile came with you. It is still there.',
      edge: ['You can rest here.', "The pile didn't leave.", 'But it looks smaller from here.']
    },

    'loneliness': {
      motif: 'unanswered-bubble',
      motifDescription: 'the unanswered message',
      medium: 'online',
      pleasure: 'Your friends are online.',
      reality: ['Seen 11:42 PM', 'hey', 'are you up?'],
      palette: { skyTop: '#16224f', skyMid: '#3d4f9a', horizon: '#9fd6d2', sun: '#e6f4ff' },
      arrival: 'Something here noticed you came.',
      kind: 'firefly',
      discoveries: [
        { x: 18, y: 50, label: 'A small light', text: '', response: 'Hi.' },
        { x: 38, y: 42, label: 'A small light', text: '', response: "I'm here." },
        { x: 60, y: 54, label: 'A small light', text: '', response: 'Stay a while.' },
        { x: 80, y: 46, label: 'A small light', text: '', response: "We'll walk with you." }
      ],
      afterAll: 'You are not walking alone here.',
      motifSpot: { x: 88, y: 30, size: 16 },
      motifText: 'Still no reply.',
      edge: ['The lights stayed with you.', 'The message is still unanswered.', 'Maybe someone else is awake, too.']
    },

    'emotional-overload': {
      motif: 'pinned-note',
      motifDescription: 'the pinned note from the board',
      medium: 'music',
      pleasure: 'The music is louder than the room.',
      reality: ['Reply to her.', "Don't forget.", 'Smile more.'],
      palette: { skyTop: '#1a3358', skyMid: '#4f7fa0', horizon: '#c9e8d6', sun: '#fff1c9' },
      arrival: 'Everything is quiet here.',
      kind: 'stone',
      discoveries: [
        { x: 14, y: 76, label: 'A loose stone', text: '', response: 'Here.' },
        { x: 30, y: 82, label: 'A loose stone', text: '', response: 'And here.' },
        { x: 70, y: 74, label: 'A loose stone', text: '', response: 'One thing at a time.' },
        { x: 86, y: 82, label: 'A loose stone', text: '', response: 'Now there is room.' }
      ],
      afterAll: 'There is room to breathe.',
      motifSpot: { x: 52, y: 34, size: 13 },
      motifText: 'The note is still pinned there.',
      edge: ['Nothing here is asking you for anything.', 'The note is still pinned.', 'You can read it later.']
    },

    'lack-of-control': {
      motif: 'stopped-clock',
      motifDescription: 'the clock that stopped at seven',
      medium: 'choice',
      pleasure: 'Here, every choice works.',
      reality: ['7:00 AM', 'Choose.', 'Again.'],
      palette: { skyTop: '#22204f', skyMid: '#6a4f9c', horizon: '#ffc59a', sun: '#ffe1a6' },
      arrival: 'Here, things listen.',
      kind: 'lever',
      discoveries: [
        { x: 18, y: 74, label: 'A lever', text: '', response: 'It moved.' },
        { x: 28, y: 77, label: 'A lever', text: '', response: 'Because you chose.' },
        { x: 38, y: 74, label: 'A lever', text: '', response: 'The way is open.' }
      ],
      afterAll: 'You chose, and the world changed.',
      motifSpot: { x: 90, y: 34, size: 15 },
      motifText: 'It still says seven.',
      edge: ['You chose, and something changed.', "The clock hasn't moved.", 'Time is waiting for you.']
    },

    'social-comparison': {
      motif: 'blank-polaroid',
      motifDescription: 'the blank photo from the mirror',
      medium: 'feed',
      pleasure: 'The feed never ends.',
      reality: ['Where were you?', 'You look tired.', 'Best summer ever.'],
      palette: { skyTop: '#2a1f5a', skyMid: '#8a5aa8', horizon: '#ffc2c9', sun: '#fff0d4' },
      arrival: 'Nobody is counting here.',
      kind: 'flower',
      discoveries: [
        { x: 14, y: 76, label: 'A closed flower', text: '', response: 'Different.' },
        { x: 30, y: 70, label: 'A closed flower', text: '', response: 'Also different.' },
        { x: 46, y: 78, label: 'A closed flower', text: '', response: 'None of them is better.' },
        { x: 62, y: 71, label: 'A closed flower', text: '', response: 'Nobody is keeping score.' },
        { x: 76, y: 77, label: 'A closed flower', text: '', response: 'Just open.' }
      ],
      afterAll: 'Nothing here needs to be compared.',
      motifSpot: { x: 90, y: 40, size: 14 },
      motifText: 'Still blank. Nothing to compare it to.',
      edge: ['No one is watching.', 'The photo is still empty.', 'Maybe it is yours to fill.']
    },

    'uncertain-future': {
      motif: 'lit-window',
      motifDescription: 'the single lit window',
      medium: 'vr',
      pleasure: 'Here, the world has a map.',
      reality: ['What do you want to be?', 'Not yet.', 'Ask again later.'],
      palette: { skyTop: '#152a5e', skyMid: '#3f6fa6', horizon: '#ffd0a0', sun: '#fff0c2' },
      arrival: 'The horizon is wide here.',
      kind: 'path',
      discoveries: [
        { x: 24, y: 0, label: 'A path to the left', text: '', response: 'This way, maybe.' },
        { x: 50, y: 0, label: 'A path straight ahead', text: '', response: 'Or this one.' },
        { x: 76, y: 0, label: 'A path to the right', text: '', response: 'They all go somewhere.' }
      ],
      afterAll: 'You do not have to choose only one.',
      motifSpot: { x: 50, y: 52, size: 4 },
      motifText: 'Still far away. Still lit.',
      edge: ["You don't have to choose tonight.", 'The window is still lit.', 'Far, but not gone.']
    },

    'family-expectations': {
      motif: 'facedown-frame',
      motifDescription: 'the frame lying face down',
      medium: 'sandbox',
      pleasure: 'In this world, you build the rules.',
      reality: ['Your cousin got in.', "Don't let us down.", 'We gave up so much.'],
      palette: { skyTop: '#1f2a5a', skyMid: '#5f5aa6', horizon: '#ffcfa8', sun: '#ffe6b0' },
      arrival: 'Here, you decide.',
      kind: 'block',
      discoveries: [
        { x: 12, y: 78, label: 'A block shaped like an arch', text: 'arch', response: 'Yours.' },
        { x: 20, y: 80, label: 'A tall block', text: 'tower', response: 'Also yours.' },
        { x: 28, y: 77, label: 'A round block', text: 'circle', response: "It doesn't have to be anything." },
        { x: 36, y: 79, label: 'A square block', text: 'square', response: 'You built this.' }
      ],
      afterAll: 'No one is grading this.',
      motifSpot: { x: 84, y: 80, size: 13 },
      motifText: 'It is still face down.',
      edge: ['Nothing here is a test.', 'The frame is still face down.', 'You can turn it over someday.']
    }
  };

  // Si se llega sin situación (o con una que no existe)
  var DEFAULT_SCENE = {
    motif: null,
    motifDescription: '',
    medium: 'screen',
    pleasure: 'You left the room.',
    reality: ['Your room is still there.'],
    palette: { skyTop: '#1c2a66', skyMid: '#5a4ea6', horizon: '#ffb48c', sun: '#ffd98a' },
    arrival: 'You came from somewhere.',
    kind: 'lantern',
    discoveries: [
      { x: 28, y: 60, label: 'A lantern', text: 'Breathe.', response: 'There.' },
      { x: 56, y: 56, label: 'A lantern', text: 'Look up.', response: 'There.' }
    ],
    afterAll: 'Nothing here is urgent.',
    motifSpot: null,
    motifText: '',
    edge: ['You can stay here.', 'Or you can go back.', 'Both are allowed.']
  };

  /** Devuelve { id, data } de la situación, o la situación por defecto. */
  function resolve(id) {
    if (id && Object.prototype.hasOwnProperty.call(SCENES, id)) {
      return { id: id, data: SCENES[id] };
    }
    return { id: null, data: DEFAULT_SCENE };
  }

  IW.data = {
    MOTIF_PATH: MOTIF_PATH,
    RETURN_URL: RETURN_URL,
    SCENES: SCENES,
    resolve: resolve
  };
})();
