/* =========================================================================
   IMAGINED WORLD · media-links.js
   ╔══════════════════════════════════════════════════════════════════╗
   ║  PEGA AQUÍ TUS LINKS (TikTok, Instagram Reels, Facebook Reels     ║
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
     completa. Si se dejan, se ignoran (el feed no saca de la página).
   ➕ El banco de videos populares (media-pool.js) está APAGADO: el feed
     usa solo esta lista. Para volver a mezclarlo, descomenta su <script>
     en imagined-world/index.html.
   🛡 FILTRO (content-filter.js, modo presentación activado): solo se
     muestran los links marcados revisado: true, después de que alguien
     los vea enteros. Un link suelto ("https://...") NO sale. Formato:
       { url: "https://www.tiktok.com/@usuario/video/123...", revisado: true },
     (opcional: author: "usuario", caption: "texto"; el filtro también
     revisa esas palabras).
   ⚠ Los textos de ejemplo ("LINK_7"…) y las páginas que no son un
     video (p. ej. https://www.tiktok.com/es/) se ignoran solos.
   ========================================================================= */

(function () {
  'use strict';

  // ======================= TUS LINKS (editar aquí) =======================
  const mediaLinks = [
    { url: "https://www.tiktok.com/@tiggien/video/7688467046278941974", revisado: true },
    { url: "https://www.tiktok.com/@laika_012345/video/7706669227968679190", revisado: true },
    { url: "https://www.tiktok.com/@una.frase.para.ti7/video/7707825517726027030", revisado: true },
    { url: "https://www.tiktok.com/@lenguaaprista/video/7690045836427791636", revisado: true },
    { url: "https://www.tiktok.com/@nkolsx855/video/7687947613483715854", revisado: true },
    { url: "https://www.tiktok.com/@user4586906149617/video/7689124742393122078", revisado: true },
    { url: "https://www.tiktok.com/@michilovies/video/7707459652312681746", revisado: true },
    { url: "https://www.tiktok.com/@subwaysurfers/video/7608242750542335254", revisado: true },
    { url: "https://www.instagram.com/reels/DfiRwgnPwQe/", revisado: true },
    { url: "https://web.facebook.com/reel/1150944893945530", revisado: true }
  ];
  // =======================================================================

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});
  IW.mediaLinks = mediaLinks;
})();
