/* =========================================================================
   IMAGINED WORLD · music-tracks.js
   ╔══════════════════════════════════════════════════════════════════╗
   ║  LAS CANCIONES DE LOS AUDÍFONOS. La pantalla se llena con estas    ║
   ║  portadas y suena una vista previa oficial de 30 s de cada una.    ║
   ╚══════════════════════════════════════════════════════════════════╝

   Portadas, vistas previas y enlaces vienen de Apple Music (API pública
   de búsqueda de iTunes: https://itunes.apple.com/search?term=...).
   Para AGREGAR una canción: busca en
     https://itunes.apple.com/search?term=ARTISTA+TITULO&entity=song&limit=5
   y copia artworkUrl100 (cambia "100x100bb" por "600x600bb"), previewUrl
   y trackViewUrl en un objeto como los de abajo. El género es libre: se
   convierte en un filtro arriba de la pantalla.
   Para QUITAR una canción: borra su objeto.
   ========================================================================= */

(function () {
  'use strict';

  var IW = (window.ImaginedWorld = window.ImaginedWorld || {});

  IW.musicTracks = [
    // —— Pop ——
    { title: "Blinding Lights", artist: "The Weeknd", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/19/d6/60/19d660ff-e3a9-8377-15a3-ce4b28e89cac/mzaf_18422426156481158187.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/blinding-lights/1499378108?i=1499378607" },
    { title: "Espresso", artist: "Sabrina Carpenter", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a1/1c/ca/a11ccab6-7d4c-e041-d028-998bcebeb709/24UMGIM61704.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/99/da/ff/99daffce-cdde-59c6-5ae0-7f922ce411a8/mzaf_5621292401829922816.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/espresso/1752214909?i=1752214923" },
    { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/ae/f2/11aef294-f57c-bab9-c9fc-529162984e62/24UMGIM85348.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/6a/99/076a99ed-b946-431b-6f1f-54fa187ca5bd/mzaf_8102882277995122875.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/die-with-a-smile/1762656724?i=1762656732" },
    { title: "BIRDS OF A FEATHER", artist: "Billie Eilish", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/31/d3/3431d34e-847f-5d66-df83-0bce688d997e/mzaf_18106743962423782018.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/birds-of-a-feather/1739659134?i=1739659142" },
    { title: "Good Luck, Babe!", artist: "Chappell Roan", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/29/a7/c4/29a7c478-351d-25eb-a116-3e68118cdab8/24UMGIM31246.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/6d/4f/c36d4f23-b87f-046d-7a0e-e3e05d180b2a/mzaf_17235999651335214399.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/good-luck-babe/1737497078?i=1737497080" },
    { title: "As It Was", artist: "Harry Styles", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/as-it-was/1615584999?i=1615585008" },
    { title: "Anti-Hero", artist: "Taylor Swift", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/anti-hero/1649434004?i=1649434293" },
    { title: "Flowers", artist: "Miley Cyrus", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/9e/f7/689ef7fe-14fe-a846-c87f-7d3b2d6344b1/mzaf_4167137058064023087.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/flowers/1674691585?i=1674691586" },
    { title: "Levitating", artist: "Dua Lipa", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/levitating/1538003494?i=1538003843" },
    { title: "drivers license", artist: "Olivia Rodrigo", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/ed/8c/02ed8cab-c089-2fdd-7ce6-ab334a9a4e19/21UMGIM26093.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/36/62/61/366261be-0996-d73d-de6f-03417867c800/mzaf_8201528327761821135.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/drivers-license/1560734944?i=1560735480" },
    { title: "Shape of You", artist: "Ed Sheeran", genre: "Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/shape-of-you/1193701079?i=1193701392" },

    // —— Latin ——
    { title: "Despacito", artist: "Luis Fonsi & Daddy Yankee", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0d/cb/ec/0dcbec41-5e9e-bd09-7cdd-fdff44acdf78/mzaf_17345185466754008149.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/despacito/1447401519?i=1447401620" },
    { title: "Ella Baila Sola", artist: "Eslabon Armado & Peso Pluma", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b1/9b/95/b19b9506-5696-ad86-1c85-d198503adfbf/816144021906_Cover.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8d/2a/20/8d2a20dd-7391-afd1-c543-009c87414265/mzaf_10873691963030604339.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/ella-baila-sola/1677446404?i=1677446410" },
    { title: "Gasolina", artist: "Daddy Yankee", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2f/66/f0/2f66f0f1-c3c2-9dc0-8391-04804cabc8cf/24CRGIM46808.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6c/56/33/6c5633cf-a5f0-d489-f3e2-4fdd9b821ef3/mzaf_417409533127729756.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/gasolina/1785999696?i=1786000124" },
    { title: "MÍA (feat. Drake)", artist: "Bad Bunny", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/cf/3a/db/cf3adbe6-8ea1-f60f-60fd-713eefda3962/193483317984.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/72/ad/b6/72adb69d-18a8-a7cd-4534-bba34deb9486/mzaf_14761776520883767907.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/m%C3%ADa-feat-drake/1447554595?i=1447555315" },
    { title: "Después de la Playa", artist: "Bad Bunny", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3e/04/eb/3e04ebf6-370f-f59d-ec84-2c2643db92f1/196626945068.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f6/c6/a0/f6c6a092-1690-3328-907d-280a8ba6adac/mzaf_4195200870757777362.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/despu%C3%A9s-de-la-playa/1622045624?i=1622045626" },
    { title: "PROVENZA", artist: "KAROL G", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4b/91/32/4b91325f-a1ae-05d8-523d-011549d20a42/22UMGIM40133.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c8/02/c7/c802c7f5-6700-8d24-b429-a2ad609d3a4a/mzaf_16971361264385394488.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/provenza/1619425403?i=1619425410" },
    { title: "Shakira: Bzrp Music Sessions, Vol. 53", artist: "Bizarrap & Shakira", genre: "Latin",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/55/0e/5e/550e5ecc-3fe4-50df-c5a3-a019b67008c3/196871854894.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0a/e1/0e/0ae10eda-19d6-9acb-2dd4-3a8f87c076c9/mzaf_11017736900654766444.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/shakira-bzrp-music-sessions-vol-53/1731059947?i=1731060236" },

    // —— Hip-Hop ——
    { title: "Not Like Us", artist: "Kendrick Lamar", genre: "Hip-Hop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/31/3a/3f/313a3fbc-bb8f-80c7-b5a2-e226869a38cd/24UMGIM51924.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2d/e0/e8/2de0e874-cd0b-e9a9-e876-76be13a86662/mzaf_12385336780649591409.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/not-like-us/1781353928?i=1781353929" },
    { title: "God's Plan", artist: "Drake", genre: "Hip-Hop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/6d/8f/bb6d8f67-6d04-10b5-dd62-eb5809ac54fc/00602567879152.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c6/4a/be/c64abe74-adb4-cff5-005d-0fab3d72a806/mzaf_10276154697254415719.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/gods-plan/1406109769?i=1406109863" },
    { title: "SICKO MODE", artist: "Travis Scott", genre: "Hip-Hop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e7/49/8f/e7498f65-df8f-bead-d6e3-2a8d4d642a79/886447235317.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d3/91/a1/d391a141-256f-726f-9da1-8aa4e42b3236/mzaf_17761183103753218003.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/sicko-mode/1421658111?i=1421658123" },
    { title: "Lose Yourself", artist: "Eminem", genre: "Hip-Hop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf51d9f800/00606949351229.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/13/5a/61/135a6154-8ca2-0523-1fa2-f4ac0ea9e1e7/mzaf_13242749689945681184.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/lose-yourself/1440903339?i=1440903439" },

    // —— K-Pop ——
    { title: "APT.", artist: "ROSÉ & Bruno Mars", genre: "K-Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/1a/7d/2d1a7d91-587e-0ceb-d434-327bd66d9e86/075679628312.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7a/15/38/7a1538f3-f41a-a2eb-0f24-8eb6712ee043/mzaf_7740628412097685267.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/apt/1773452219?i=1773452221" },
    { title: "Dynamite", artist: "BTS", genre: "K-Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f7/68/9c/f7689ce3-6d41-60cd-62d2-57a91ddf5b9d/196922067341_Cover.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/43/06/1e/43061eb6-9052-60da-7e95-aed315c0b34c/mzaf_2639750113226374892.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/dynamite/1627573936?i=1627575419" },
    { title: "How You Like That", artist: "BLACKPINK", genre: "K-Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c3/64/46/c364465f-6271-8aae-93a8-b9979d2befe5/20UMGIM82075.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8f/b2/b1/8fb2b1a2-2498-9490-82f8-0226abfa9dc9/mzaf_9379484322617408629.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/how-you-like-that/1533894050?i=1533894669" },
    { title: "Super Shy", artist: "NewJeans", genre: "K-Pop",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/63/e5/e2/63e5e2e4-829b-924d-a1dc-8058a1d69bd4/196922462702_Cover.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a0/0c/47/a00c4790-3bbe-c669-fc8b-d8779508b512/mzaf_4170831274187670095.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/super-shy/1692686264?i=1692686518" },

    // —— R&B ——
    { title: "Kill Bill", artist: "SZA", genre: "R&B",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bd/3b/a9/bd3ba9fb-9609-144f-bcfe-ead67b5f6ab3/196589564931.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/2b/ea/452bead6-c7f5-82d4-f5f7-ec876014b4cc/mzaf_2905911853279084717.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/kill-bill/1657869377?i=1657869393" },
    { title: "Rolling in the Deep", artist: "Adele", genre: "R&B",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/4f/03/4c4f032a-3d2b-853d-da81-996602355b42/mzaf_11625850023134180491.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/rolling-in-the-deep/1544491232?i=1544491233" },
    { title: "Billie Jean", artist: "Michael Jackson", genre: "R&B",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/dc/bc/8a/dcbc8a3e-4ce1-c00d-cc02-eda2212053c7/mzaf_8347559338388601510.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/billie-jean/269572838?i=269573364" },
    { title: "Uptown Funk (feat. Bruno Mars)", artist: "Mark Ronson", genre: "R&B",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7e/30/c5/7e30c572-aa47-5f7b-c6fd-42d50cd2c56d/886444959797.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/91/99/1f/91991fe5-aa77-87e4-edbc-6d68c95e5f18/mzaf_10685317694850942114.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/uptown-funk-feat-bruno-mars/943946661?i=943946671" },

    // —— Rock ——
    { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/0a/ea/8b0aea60-6f4a-195b-5958-cdf459c2333b/602527644271.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/83/09/4b8309c3-e3b2-10bd-ea80-ec017d832503/mzaf_9752264660400108875.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/bohemian-rhapsody/6781024026?i=6781024437" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Rock",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/65/49/4e/65494e02-b6d3-26d8-6b0c-9bd98dcf4d5d/mzaf_7665413316386155700.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/smells-like-teen-spirit/1440783617?i=1440783625" },
    { title: "Do I Wanna Know?", artist: "Arctic Monkeys", genre: "Rock",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/69/9c/b5/699cb5d6-115c-ff73-9d26-e57ea4350d72/887828031795.png/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/cb/ba/71cbbaa1-016b-0e73-dfc2-9f4ede9ddfc0/mzaf_16266777024198047150.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/do-i-wanna-know/663097964?i=663097965" },
    { title: "Numb", artist: "LINKIN PARK", genre: "Rock",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/13/44/05/134405bd-9e27-a678-8953-b5f724201f95/093624948988.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1f/9d/28/1f9d2810-2ac3-efbd-ef02-623691ff9cd2/mzaf_17560018091772095942.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/numb/590423275?i=590423552" },
    { title: "Believer", artist: "Imagine Dragons", genre: "Rock",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c0/3f/36/c03f367a-b66b-fd0a-a54c-30f8250c4410/mzaf_12768434238801682952.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/believer/1411625594?i=1411628233" },

    // —— Electronic ——
    { title: "Wake Me Up", artist: "Avicii", genre: "Electronic",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/5b/1e/185b1ef5-5d97-19d8-aebf-8e29e41874ef/13UAAIM59255.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/1e/60/681e601f-e1f2-4ebb-37de-adf00bdf57b6/mzaf_8266263075137964740.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/wake-me-up/1440872730?i=1440872929" },
    { title: "Get Lucky", artist: "Daft Punk, Pharrell Williams & Nile Rodgers", genre: "Electronic",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e8/43/5f/e8435ffa-b6b9-b171-40ab-4ff3959ab661/886443919266.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/57/a5/85/57a585aa-f1bc-7619-881b-f8a04a5541d5/mzaf_6906185026678279401.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/get-lucky/617154241?i=617154366" },
    { title: "Summer", artist: "Calvin Harris", genre: "Electronic",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/da/50/cc/da50cc80-3515-a38d-369b-0d700ffd249d/886444820448.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/32/f1/c332f138-aa3c-52b8-c414-e85111b58bf5/mzaf_12226515580236242706.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/summer/922876176?i=922876189" },

    // —— Afrobeats ——
    { title: "Calm Down", artist: "Rema & Selena Gomez", genre: "Afrobeats",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ee/f1/dc/eef1dc82-f516-fd0f-581c-3f952a0e2243/22UMGIM92113.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/c7/54/c3c754cd-6680-4818-9182-e08a719d59ba/mzaf_1190051474475595816.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/calm-down/1640501237?i=1640501238" },

    // —— Indie ——
    { title: "Heat Waves", artist: "Glass Animals", genre: "Indie",
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/600x600bb.jpg",
      preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a3/4c/b9/a34cb911-40fc-5f0c-e862-14bd171a77aa/mzaf_384792072030970151.plus.aac.p.m4a",
      link: "https://music.apple.com/us/album/heat-waves/1508562310?i=1508562516" },
  ];
})();
