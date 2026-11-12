/* =========================================================================
   IMAGINED WORLD · scene-data.js
   Cada situación del Muted World llega con un APARATO, y el aparato
   define la experiencia (js/exp-*.js y js/reels.js):

     medium   aparato                   experiencia
     video    portátil                  series (exp-video.js)
     online   mando                     juego en línea con amigos (exp-online.js)
     music    audífonos                 dentro de una canción (exp-music.js)
     choice   computadora               juego de decisiones (exp-choice.js)
     feed     celular                   reels con links al azar (reels.js)
     vr       lentes VR                 vuelo en realidad virtual (exp-vr.js)
     sandbox  consola portátil          construir con bloques (exp-sandbox.js)

   Campos (los textos que ve el visitante, en inglés):
     motif / motifDescription  el residuo de la realidad (SVG de muted-world)
     pleasure                  el goce: por qué se escapa
     reality                   mensajes del cuarto que muestra el portal
     residue                   lo que dice la experiencia al tocar el motivo
   Todo vive dentro de window.ImaginedWorld.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  var MOTIF_PATH = '../muted-world/assets/motifs/';
  var RETURN_URL = '../muted-world/index.html';

  var SCENES = {
    'academic-pressure': {
      medium: 'video',
      motif: 'stacked-paper',
      motifDescription: 'the stack of paper from your desk',
      pleasure: 'The next episode starts on its own.',
      reality: ['Due 8:00 AM', 'It was due yesterday.', 'p. 1 / 312'],
      residue: 'The pile is still there, in the reflection.'
    },
    'loneliness': {
      medium: 'online',
      motif: 'unanswered-bubble',
      motifDescription: 'the unanswered message',
      pleasure: 'Your friends are online.',
      reality: ['Seen 11:42 PM', 'hey', 'are you up?'],
      residue: 'Still no reply.'
    },
    'emotional-overload': {
      medium: 'music',
      motif: 'pinned-note',
      motifDescription: 'the pinned note from the board',
      pleasure: 'The music is louder than the room.',
      reality: ['Reply to her.', "Don't forget.", 'Smile more.'],
      residue: 'The note is still pinned there.'
    },
    'lack-of-control': {
      medium: 'choice',
      motif: 'stopped-clock',
      motifDescription: 'the clock that stopped at seven',
      pleasure: 'Here, every choice works.',
      reality: ['7:00 AM', 'Choose.', 'Again.'],
      residue: 'It still says seven.'
    },
    'social-comparison': {
      medium: 'feed',
      motif: 'blank-polaroid',
      motifDescription: 'the blank photo from the mirror',
      pleasure: 'The feed never ends.',
      reality: ['Where were you?', 'You look tired.', 'Best summer ever.'],
      residue: 'Nothing here.'
    },
    'uncertain-future': {
      medium: 'vr',
      motif: 'lit-window',
      motifDescription: 'the single lit window',
      pleasure: 'Here, the world has a map.',
      reality: ['What do you want to be?', 'Not yet.', 'Ask again later.'],
      residue: 'Still far away. Still lit.'
    },
    'family-expectations': {
      medium: 'sandbox',
      motif: 'facedown-frame',
      motifDescription: 'the frame lying face down',
      pleasure: 'In this world, you build the rules.',
      reality: ['Your cousin got in.', "Don't let us down.", 'We gave up so much.'],
      residue: 'It is still face down.'
    }
  };

  // Sin situación: el celular (lo más común)
  var DEFAULT_SCENE = {
    medium: 'feed',
    motif: null,
    motifDescription: '',
    pleasure: 'Just one more.',
    reality: ['Your room is still there.'],
    residue: ''
  };

  /** Devuelve { id, data } de la situación, o la situación por defecto. */
  function resolve(id) {
    if (id && Object.prototype.hasOwnProperty.call(SCENES, id)) return { id: id, data: SCENES[id] };
    return { id: null, data: DEFAULT_SCENE };
  }

  IW.data = { MOTIF_PATH: MOTIF_PATH, RETURN_URL: RETURN_URL, SCENES: SCENES, resolve: resolve };
  IW.experiences = IW.experiences || {};
})();
