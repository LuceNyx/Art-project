/* =========================================================================
   MUTED WORLD · config.js
   Configuración y CONTRATO DE INTEGRACIÓN con la transición y el
   imagined world. Ver muted-world/INTEGRATION.md.

   Todo vive dentro de window.MutedWorld (no hay otras variables globales).
   Otras partes del proyecto pueden leer estos datos cargando este archivo:
     <script src="../muted-world/js/config.js"></script>
     window.MutedWorld.config.MUTED_SCENES
   ========================================================================= */

(function () {
  'use strict';

  // URL de la transición (parte de mis compañeros). Al escapar se navega a:
  //   TRANSITION_URL + '?from=<scene>&motif=<motif>'
  // (solo si nadie llamó a event.preventDefault() en el evento 'muted:escape')
  var TRANSITION_URL = '../transition/index.html';

  var MW = (window.MutedWorld = window.MutedWorld || {});

  /*
   * Coordenadas: TODAS en porcentaje del escenario 16:9 (1920×1080).
   *   rect  → zona del objeto interactivo en la habitación { x, y, w, h }
   *   light → punto de luz que guía la mirada hacia el objeto { x, y, r }
   *   returnLight → luz nueva que aparece al volver del mundo imaginado
   * ready: false → el objeto se dibuja en la habitación pero no se puede abrir
   * (útil para añadir situaciones nuevas poco a poco).
   */
  var MUTED_SCENES = [
    {
      id: 'academic-pressure',
      title: 'Academic pressure',
      ready: true,
      roomObject: {
        name: 'Desk lamp and notebook',
        ariaLabel: 'A desk lamp over an open notebook',
        rect: { x: 14, y: 41, w: 22, h: 20 },
        light: { x: 21, y: 52, r: 10 }
      },
      hideAction: 'Close the notebook',
      escapeObject: {
        name: 'Laptop',
        ariaLabel: 'A half-closed laptop, light leaking from under the lid',
        description: 'A half-closed laptop; a thin line of light leaks from under the lid.'
      },
      motif: {
        id: 'stacked-paper',
        description: 'A crooked stack of paper that keeps growing.',
        file: 'assets/motifs/stacked-paper.svg'
      },
      image: 'scene-academic-pressure.jpg',
      lines: ['Just one more page.', 'It was due yesterday.', "You'll start tomorrow.", 'Again.'],
      returnLight: { x: 31, y: 63, r: 3 }
    },
    {
      id: 'loneliness',
      title: 'Loneliness',
      ready: true,
      roomObject: {
        name: 'Phone on the bed',
        ariaLabel: 'A phone lying on the bed',
        rect: { x: 58, y: 66, w: 7, h: 7 },
        light: { x: 61.5, y: 69.5, r: 5 }
      },
      hideAction: 'Turn the phone face down',
      escapeObject: {
        name: 'Game controller',
        ariaLabel: 'A game controller on the floor, its small light on',
        description: 'A controller on the floor with its small white light on.'
      },
      motif: {
        id: 'unanswered-bubble',
        description: 'An empty message bubble marked "Seen".',
        file: 'assets/motifs/unanswered-bubble.svg'
      },
      image: 'scene-loneliness.jpg',
      lines: ['hey', 'are you up?', 'Seen 11:42 PM.', "Nobody's typing."],
      returnLight: { x: 54, y: 88, r: 3 }
    },
    {
      id: 'emotional-overload',
      title: 'Emotional overload',
      ready: true,
      roomObject: {
        name: 'Corkboard',
        ariaLabel: 'A corkboard covered in notes',
        rect: { x: 37, y: 20, w: 16, h: 20 },
        light: { x: 45, y: 30, r: 8 }
      },
      hideAction: 'Pull a sheet over the board',
      escapeObject: {
        name: 'Headphones',
        ariaLabel: 'Headphones hanging from a pin, a thread of light inside',
        description: 'Headphones hanging from a pin, with a thread of light.'
      },
      motif: {
        id: 'pinned-note',
        description: 'A crumpled note held by a single pin.',
        file: 'assets/motifs/pinned-note.svg'
      },
      image: 'scene-emotional-overload.jpg',
      lines: ['Reply to her.', 'Smile more.', "Don't forget.", 'Everyone else can.', 'Why are you like this?'],
      returnLight: { x: 54, y: 24, r: 2.5 }
    },
    {
      id: 'lack-of-control',
      title: 'Lack of control',
      ready: true,
      roomObject: {
        name: 'Wall clock',
        ariaLabel: 'A wall clock above the door',
        rect: { x: 85, y: 10.5, w: 7, h: 10 },
        light: { x: 88.5, y: 15.5, r: 5 }
      },
      hideAction: 'Turn the clock to the wall',
      // La puerta YA NO es un escape: lleva a la rutina (ver ROUTINE más abajo)
      escapeObject: {
        name: 'Computer',
        ariaLabel: 'An old computer on standby, its power light pulsing',
        description: 'A computer on standby; the power light pulses like it is waiting.'
      },
      motif: {
        id: 'stopped-clock',
        description: 'A clock stopped at 7:00.',
        file: 'assets/motifs/stopped-clock.svg'
      },
      image: 'scene-lack-of-control.jpg',
      lines: ['7:00 AM.', 'Choose.', "You chose. It's 7:00 AM.", 'Again.'],
      returnLight: { x: 82, y: 20, r: 2.5 }
    },
    {
      id: 'social-comparison',
      title: 'Social comparison',
      ready: true,
      roomObject: {
        name: 'Mirror with photos',
        ariaLabel: 'A tall mirror with photos tucked into the frame',
        rect: { x: 2.5, y: 44, w: 8, h: 34 },
        light: { x: 6.5, y: 58, r: 7 }
      },
      hideAction: 'Cover the mirror with a shirt',
      escapeObject: {
        name: 'Phone',
        ariaLabel: 'A phone lying by the mirror, its screen lit with an endless feed',
        description: 'A phone by the mirror; its screen keeps playing short videos.'
      },
      motif: {
        id: 'blank-polaroid',
        description: 'An instant photo with nothing on it.',
        file: 'assets/motifs/blank-polaroid.svg'
      },
      image: 'scene-social-comparison.jpg',
      lines: ['Best summer ever.', 'So proud of her.', 'Where were you?', 'You look tired.'],
      returnLight: { x: 11, y: 50, r: 2.5 }
    },
    {
      id: 'uncertain-future',
      title: 'Uncertain future',
      ready: true,
      roomObject: {
        name: 'Window with blinds',
        ariaLabel: 'A small window with half-lowered blinds, rain outside',
        rect: { x: 58, y: 17, w: 14, h: 25 },
        light: { x: 65, y: 30, r: 9 }
      },
      hideAction: 'Lower the blinds',
      escapeObject: {
        name: 'VR headset',
        ariaLabel: 'A VR headset resting on the windowsill, its lenses faintly lit',
        description: 'A VR headset on the windowsill; the lenses glow faintly.'
      },
      motif: {
        id: 'lit-window',
        description: 'A single lit rectangle in a dark building.',
        file: 'assets/motifs/lit-window.svg'
      },
      image: 'scene-uncertain-future.jpg',
      lines: ['What do you want to be?', 'Everyone has a plan.', 'Not yet.', 'Ask again later.'],
      returnLight: { x: 74, y: 22, r: 2.5 }
    },
    {
      id: 'family-expectations',
      title: 'Family expectations',
      ready: true,
      roomObject: {
        name: 'Family photo on the shelf',
        ariaLabel: 'A framed family photo between small trophies',
        rect: { x: 20, y: 29, w: 12, h: 8 },
        light: { x: 26, y: 33, r: 5 }
      },
      hideAction: 'Turn the frame face down',
      escapeObject: {
        name: 'Handheld console',
        ariaLabel: 'A handheld console hidden behind the trophies, its screen on',
        description: 'A handheld console hidden behind the trophies, screen on.'
      },
      motif: {
        id: 'facedown-frame',
        description: 'A picture frame lying face down.',
        file: 'assets/motifs/facedown-frame.svg'
      },
      image: 'scene-family-expectations.jpg',
      lines: ['Your cousin got in.', 'We gave up so much.', "Don't let us down."],
      returnLight: { x: 32, y: 30, r: 2.5 }
    }
  ];

  // Luces fijas de la habitación (no interactivas): ventana, rendija de la puerta
  var ROOM_LIGHTS = [
    { id: 'window', x: 65, y: 29, r: 11, strength: 0.42, breathe: 0.05 },
    { id: 'door-slit', x: 90, y: 80, r: 7, strength: 0.6, stretchX: 2.6, stretchY: 0.25, breathe: 0.08 }
  ];

  /*
   * LA PUERTA = EL MUNDO REAL (no es un escape).
   * En la habitación y en "Lack of control", la puerta lleva a la rutina:
   * el tiempo pasa muy rápido (js/routine.js) y se vuelve al cuarto.
   */
  var ROUTINE = {
    door: {
      ariaLabel: 'The door. Go out and face the day',
      rect: { x: 83.5, y: 21.5, w: 13, h: 58.5 },
      light: { x: 90, y: 60, r: 8 }
    },
    // Una jornada que se repite (inglés: lo ve el visitante)
    steps: ['7:00 AM', 'Bus.', 'Work.', '12:30. Lunch at the desk.', 'Work.', '6:40 PM', 'Bus.', '11:58 PM'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ending: 'Again.'
  };

  MW.config = {
    TRANSITION_URL: TRANSITION_URL,
    ESCAPE_EVENT: 'muted:escape',
    RETURN_PARAM: 'return',
    IMG_PATH: 'assets/img/',
    STAGE: { width: 1920, height: 1080 },
    STORAGE: { muted: 'mw:muted', visited: 'mw:visited', returned: 'mw:returned' },
    MUTED_SCENES: MUTED_SCENES,
    ROOM_LIGHTS: ROOM_LIGHTS,
    ROUTINE: ROUTINE,

    /** Busca una situación por id (o null). */
    getScene: function (id) {
      for (var i = 0; i < MUTED_SCENES.length; i++) {
        if (MUTED_SCENES[i].id === id) return MUTED_SCENES[i];
      }
      return null;
    }
  };
})();
