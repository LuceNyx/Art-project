/* =========================================================================
   IMAGINED WORLD · media-pool.js
   Banco de videos públicos y populares de TikTok para el feed del CELULAR
   (como entrar a TikTok por primera vez, sin cuenta). Se mezclan con los
   links de media-links.js y se barajan en cada visita.

   ⚠ Ninguna plataforma (TikTok, Instagram, Facebook) ofrece una API
     pública para pedir videos "al azar" desde una página estática: por
     eso es una lista. Cada video se comprobó con la API del reproductor
     oficial de TikTok (player/api/v1/items) el 17/11/2026. Si un video
     se borra, el reproductor muestra un aviso y se pasa al siguiente.
   ✔ FILTRO PARA LA PRESENTACIÓN (17/11/2026): se sacaron los videos sin
     texto de cuentas desconocidas (no se sabe de qué tratan) y los que mencionan alcohol,
     ropa/cuerpo o influencers de contenido sugerente. Además, antes de
     mostrarse, cada video pasa por content-filter.js.
     Este banco cuenta como REVISADO. Si un video no convence, bórralo o
     agrégale revisado: false (y no saldrá en modo presentación).
   Para agregar más: copia la dirección completa del video
   (https://www.tiktok.com/@usuario/video/NÚMERO), el usuario y el texto.
   Los videos pertenecen a sus autores y se muestran con el reproductor
   oficial de TikTok.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  IW.mediaPool = [
    { url: "https://www.tiktok.com/@emiliopiano/video/7576083463913213206", author: "emiliopiano", caption: "This 4-year-old singer shocked everyone 🤯❤️" },
    { url: "https://www.tiktok.com/@zachking/video/7573719179098869006", author: "zachking", caption: "Jailbreak - Clue 5" },
    { url: "https://www.tiktok.com/@janeinsane_/video/7567771786490957069", author: "janeinsane_", caption: "CHICKENLEIGH, IT’S CHRISTMAS🎄🎄🎄 (music by the one the only all I want for Christmas is…" },
    { url: "https://www.tiktok.com/@haleyybaylee/video/7567576667166608654", author: "haleyybaylee", caption: "LOLA HAS ARRIVED costume glam hair Halloween here I come" },
    { url: "https://www.tiktok.com/@msrachelforlittles/video/7573896893558689037", author: "msrachelforlittles", caption: "Sweet girl 😭" },
    { url: "https://www.tiktok.com/@afvofficial/video/7567555325998402830", author: "afvofficial", caption: "" },
    { url: "https://www.tiktok.com/@dorisjocelyn/video/7568719622350933255", author: "dorisjocelyn", caption: "No sé si se repita alguna otra vez en la vida pero aquí les dejo un pedacito más…" },
    { url: "https://www.tiktok.com/@littlemanyu/video/7545792747177856270", author: "littlemanyu", caption: "Doggy SPA Day,Relax with ManYu~" },
    { url: "https://www.tiktok.com/@franflight/video/7547541608388889870", author: "franflight", caption: "Burp is currently in the process of being adopted and will be officially going home…" },
    { url: "https://www.tiktok.com/@izzyandmarysdad/video/7547923003355434253", author: "izzyandmarysdad", caption: "Crumbl Cookies of the week 9/8" },
    { url: "https://www.tiktok.com/@dylan.page/video/7545221251367767318", author: "dylan.page", caption: "i want to visit Cat Town in person! Invite me!!😂🙏" },
    { url: "https://www.tiktok.com/@bkharthun/video/7551586480691498295", author: "bkharthun", caption: "By people and I mean my wife and I" },
    { url: "https://www.tiktok.com/@dollievision/video/7208244986666585386", author: "dollievision", caption: "Makeup 💗✨" },
    { url: "https://www.tiktok.com/@scout2015/video/6718335390845095173", author: "scout2015", caption: "Scramble up ur name & I’ll try to guess it😍❤️" }
  ];
})();
