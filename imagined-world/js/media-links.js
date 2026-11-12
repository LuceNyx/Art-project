/* =========================================================================
   IMAGINED WORLD · media-links.js
   ╔══════════════════════════════════════════════════════════════════╗
   ║  PEGA AQUÍ TUS 10 LINKS (TikTok, Instagram Reels, Facebook Reels  ║
   ║  o YouTube Shorts). Al entrar al mundo imaginado con el CELULAR   ║
   ║  se elige uno al azar; "Next" o deslizar elige otro.              ║
   ╚══════════════════════════════════════════════════════════════════╝

   Formatos que se pueden reproducir dentro de la página:
     TikTok     https://www.tiktok.com/@usuario/video/1234567890123456789
     Instagram  https://www.instagram.com/reel/CODIGO/   (o /reels/ o /p/)
     Facebook   https://www.facebook.com/reel/1234567890  (también web.facebook.com)
     YouTube    https://www.youtube.com/shorts/ID   (o youtu.be/ID)

   ⚠ Los links CORTOS (vt.tiktok.com, vm.tiktok.com, fb.watch) no se
     pueden incrustar: ábrelos en el navegador y copia la dirección
     completa. Si se dejan, se muestran como una tarjeta "Open ↗".
   ⚠ Los textos de ejemplo ("LINK_7"…) y las páginas que no son un
     video (p. ej. https://www.tiktok.com/es/) se ignoran solos.
   ========================================================================= */

(function () {
  'use strict';

  // ======================= TUS LINKS (editar aquí) =======================
  const mediaLinks = [
    // Original: https://vt.tiktok.com/ZSp92HKA4/ (link corto → dirección completa)
    "https://www.tiktok.com/@aldoxiito.exe/video/7706683463226674454",
    "https://vt.tiktok.com/ZSp92HKA4/",
    "https://www.instagram.com/reels/DfiRwgnPwQe/",
    "https://web.facebook.com/reel/1150944893945530",
    "https://www.tiktok.com/es/",
    "https://www.tiktok.com/@thefrutinovela/video/7705128262665571617?q=fruta%20novelas&t=1794495569486",
    "LINK_7",
    "LINK_8",
    "LINK_9",
    "LINK_10"
  ];
  // =======================================================================

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.mediaLinks = mediaLinks;
})();
