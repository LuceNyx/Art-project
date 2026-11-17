/* =========================================================================
   IMAGINED WORLD · content-filter.js
   FILTRO de los reels ANTES de mostrarlos (el proyecto se presenta ante
   profesores: nada de alcohol, drogas, sexo, groserías ni violencia).

   Cada video pasa estas pruebas antes de entrar al feed:
   1. ID o cuenta en la lista negra → fuera.
   2. Una palabra bloqueada en el autor o en el texto (caption) → fuera.
   3. MODO PRESENTACIÓN (activado): solo entran videos REVISADOS por una
      persona: los del banco media-pool.js (ya curado) y los de
      media-links.js escritos como { url: "...", revisado: true }.
      Los links sueltos (solo la dirección) no se sabe qué muestran, así
      que no salen mientras el modo esté activo.

   ⚠ Ninguna plataforma deja consultar desde una página estática de qué
     trata un video (el oEmbed de TikTok responde "ok" incluso con un ID
     inventado y ya no trae el texto). Por eso el filtro es local: lo que
     decide es la lista revisada. Antes de presentar, mira una vez cada video.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  // ====================== AJUSTES (editar aquí) ==========================
  // true = solo videos revisados (recomendado para presentar)
  var MODO_PRESENTACION = true;

  // Palabras o frases bloqueadas (inglés y español; da igual tildes y
  // mayúsculas). Se buscan como palabras completas en el autor y el texto.
  var PALABRAS_BLOQUEADAS = [
    // sexo / contenido sugerente
    'sex', 'sexy', 'nsfw', 'onlyfans', 'thirst trap', 'thirsttrap', 'nude', 'nudes', 'naked',
    'porn', 'horny', 'lingerie', 'bikini', 'twerk', 'twerking', 'booty', 'boobs', '18+',
    'sexo', 'desnudo', 'desnuda', 'lenceria', 'piernas', 'escote', 'hot girl',
    // alcohol, drogas, tabaco
    'drunk', 'alcohol', 'beer', 'vodka', 'tequila', 'whiskey', 'wine', 'shots', 'take a shot',
    'weed', '420', 'drug', 'drugs', 'high af', 'vape', 'vaping', 'smoke', 'smoking', 'cocaine',
    'borracho', 'borracha', 'cerveza', 'trago', 'tragos', 'droga', 'drogas', 'marihuana', 'fumar',
    // groserías
    'fuck', 'fucking', 'shit', 'bitch', 'wtf', 'ass', 'dick', 'pussy', 'damn', 'hell nah',
    'puta', 'puto', 'mierda', 'verga', 'pendejo', 'cabron', 'carajo', 'joder', 'chinga',
    // violencia, sustos y temas delicados
    'kill', 'killed', 'murder', 'blood', 'gun', 'guns', 'shooting', 'fight', 'knife', 'gore',
    'horror', 'scary', 'jumpscare', 'suicide', 'self harm', 'dead', 'death',
    'matar', 'muerte', 'muerto', 'sangre', 'pelea', 'pistola', 'cuchillo', 'terror', 'suicidio',
    // apuestas
    'casino', 'betting', 'apuesta', 'apuestas'
  ];

  // Cuentas que nunca se muestran (sin la @)
  var AUTORES_BLOQUEADOS = [];

  // Videos que nunca se muestran (el número largo del link de TikTok,
  // o el código del link de Instagram / YouTube)
  var IDS_BLOQUEADOS = [];
  // =======================================================================

  /** minúsculas y sin tildes, para comparar */
  function normalizar(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function escaparRegex(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Palabra completa: sin letras ni números pegados a los lados
  // ("ass" bloquea "ass" pero no "class" ni "assassin")
  var patrones = PALABRAS_BLOQUEADAS.map(function (p) {
    return new RegExp('(^|[^a-z0-9])' + escaparRegex(normalizar(p)) + '(?=$|[^a-z0-9])');
  });

  /** La palabra que bloquea el texto, o '' si está limpio. */
  function palabraBloqueada(texto) {
    var t = normalizar(texto).replace(/[#_@.]/g, ' ');
    for (var i = 0; i < patrones.length; i++) {
      if (patrones[i].test(t)) return PALABRAS_BLOQUEADAS[i];
    }
    return '';
  }

  /** Motivo por el que un video NO se muestra, o '' si pasa. */
  function motivo(item) {
    if (item.id && IDS_BLOQUEADOS.map(String).indexOf(String(item.id)) !== -1) return 'video bloqueado';
    var autor = normalizar(item.author).replace(/^@/, '');
    if (autor && AUTORES_BLOQUEADOS.map(normalizar).indexOf(autor) !== -1) return 'cuenta bloqueada';
    var p = palabraBloqueada((item.author || '') + ' ' + (item.caption || ''));
    if (p) return 'palabra bloqueada: "' + p + '"';
    if (MODO_PRESENTACION && !item.revisado) return 'sin revisar (modo presentación)';
    return '';
  }

  /** Devuelve solo los videos que pasan el filtro (mismo orden). */
  function filtrar(items) {
    var fuera = [];
    var ok = items.filter(function (it) {
      var m = motivo(it);
      if (m) fuera.push((it.author ? '@' + it.author + ' ' : '') + (it.id || it.link) + ' → ' + m);
      return !m;
    });
    if (window.console && fuera.length) {
      console.info('[filtro] ' + ok.length + ' videos aprobados, ' + fuera.length + ' fuera:\n  ' + fuera.join('\n  '));
    }
    return ok;
  }

  IW.contentFilter = {
    filtrar: filtrar,
    motivo: motivo,
    palabraBloqueada: palabraBloqueada,
    modoPresentacion: MODO_PRESENTACION
  };
})();
