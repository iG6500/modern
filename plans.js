/*
 * MINTATERVEK ADATBÁZISA
 * ----------------------
 * FIGYELEM: az itt szereplő árak (Ft/m²), átfutási idők és műszaki tartalmak
 * TÁJÉKOZTATÓ, helykitöltő értékek. Éles használat előtt a cégnek ellenőriznie
 * és javítania kell őket. Az oldal minden más része innen számol, ezért elég
 * ezt a fájlt módosítani.
 *
 * rows:  egy szint alaprajza sorokban: { h: sormagasság (m), cells: [[helyiség, szélesség (m)], ...] }
 *        a szintek szélessége = a cellák szélességének összege (minden sorban azonos legyen)
 * finishes: átadási állapotok, m2 = Ft / m² irányár
 */
window.MK_CONFIG = {
  phone: '+36 XX XXX XXXX',          // TODO: valós telefonszám
  phoneHref: 'tel:+36000000000',     // TODO: valós telefonszám (tel: formátum)
  email: '',                         // TODO: ajánlatkérések címzettje (ha nincs űrlapszolgáltatás)
  formEndpoint: ''                   // TODO: pl. https://formspree.io/f/xxxxxxx – ha kitöltött, ide megy a POST
};

window.MK_SPECS = {
  haz: [
    ['Alapozás', 'Vasbeton sávalap, fagyhatár alatt, szigetelt lábazattal', 'szerk'],
    ['Falazat', '38 cm kerámia falazóblokk, vasbeton koszorúval', 'szerk'],
    ['Födém és tető', 'Vasbeton födém, fa fedélszerkezet, kerámia tetőcserép', 'szerk'],
    ['Nyílászárók', '3 rétegű üvegezésű műanyag nyílászárók, redőny-előkészítéssel', 'szerk'],
    ['Homlokzat', '15 cm grafitos hőszigetelés, vékonyvakolat', 'szerk'],
    ['Gépészet és villany', 'Teljes vezetékrendszer, kazán vagy hőszivattyú, szerelvényezés', 'kulcs'],
    ['Belső munkák', 'Gépi vakolat, esztrich, glettelés, festés, burkolás', 'kulcs'],
    ['Átadás', 'Használatbavételi dokumentáció, bejárás, hibajegyzék', 'kulcs']
  ],
  tetoter: [
    ['Szerkezet', 'Meglévő tetőszerkezet felmérése, szükség szerinti megerősítése', 'szerk'],
    ['Tetőablakok', 'Hőszigetelt tetőtéri ablakok, bádogozással', 'szerk'],
    ['Hőszigetelés', 'Szarufa közötti és alatti szigetelés, páratechnika', 'szerk'],
    ['Lépcső', 'Beltéri lépcső kialakítása, födémáttörés', 'szerk'],
    ['Gépészet és villany', 'Fűtés, víz- és elektromos hálózat bővítése', 'kulcs'],
    ['Belső munkák', 'Gipszkarton burkolat, glettelés, festés, burkolás', 'kulcs']
  ],
  bovites: [
    ['Alapozás', 'Vasbeton sávalap, kapcsolódás a meglévő épülethez', 'szerk'],
    ['Falazat és födém', 'Kerámia falazat, koszorú, födém vagy tetőszerkezet', 'szerk'],
    ['Nyílászárók', 'Hőszigetelt műanyag nyílászárók', 'szerk'],
    ['Csatlakozás', 'Átjárás kialakítása, homlokzati illesztés a meglévőhöz', 'szerk'],
    ['Gépészet és villany', 'Fűtés, víz- és elektromos hálózat bővítése', 'kulcs'],
    ['Belső munkák', 'Vakolás, esztrich, festés, burkolás', 'kulcs']
  ],
  felujitas: [
    ['Bontás és előkészítés', 'Szükséges bontások, törmelék elszállítása', 'szerk'],
    ['Falak és nedvesség', 'Falszárítás, utólagos vízszigetelés, javítás', 'szerk'],
    ['Nyílászárók', 'Régi nyílászárók cseréje hőszigetelt szerkezetekre', 'szerk'],
    ['Gépészet és villany', 'Vezetékek, csövek cseréje, korszerű fűtés', 'kulcs'],
    ['Belső munkák', 'Vakolás, glettelés, festés, burkolás, fürdő és konyha', 'kulcs']
  ],
  kicsi: [
    ['Alapozás', 'Vasbeton lemez- vagy sávalap', 'szerk'],
    ['Falazat', 'Kerámia vagy könnyűszerkezetes falazat, koszorú', 'szerk'],
    ['Tető', 'Fa fedélszerkezet, tetőfedés, bádogos munkák', 'szerk'],
    ['Nyílászárók', 'Kapuk, ajtók, ablakok az igénynek megfelelően', 'szerk'],
    ['Villany', 'Alapvető elektromos hálózat, szerelvényezés', 'kulcs'],
    ['Belső munkák', 'Vakolás, burkolat, festés', 'kulcs']
  ]
};

window.MK_CATS = [
  { id: 'haz', label: 'Családi ház' },
  { id: 'bovites', label: 'Bővítés' },
  { id: 'felujitas', label: 'Felújítás' },
  { id: 'kicsi', label: 'Kisebb épület' }
];

window.MK_PLANS = [
  {
    id: 'kompakt', cat: 'haz', spec: 'haz', name: 'Kompakt', tag: 'Földszintes, 3 szobás',
    blurb: 'Egyszerű, jól kihasznált földszintes ház kisebb telekre és első otthonnak.',
    weeks: '26–32',
    levels: [{ label: 'Földszint', rows: [
      { h: 5, cells: [['Nappali', 5], ['Konyha-étkező', 4.5], ['Előszoba', 2.5]] },
      { h: 3, cells: [['Szoba', 4], ['Szoba', 3.5], ['Fürdő', 2.5], ['Gard.', 2]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 330000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 640000 }]
  },
  {
    id: 'csalad', cat: 'haz', spec: 'haz', name: 'Család', tag: 'Földszintes, 4 szobás',
    blurb: 'Tágas földszintes ház nagyobb családnak, külön gyerekszobákkal.',
    weeks: '30–38',
    levels: [{ label: 'Földszint', rows: [
      { h: 5.5, cells: [['Nappali', 6], ['Konyha-étkező', 4.5], ['Előszoba', 2.5]] },
      { h: 4, cells: [['Gyerekszoba', 4], ['Gyerekszoba', 3.5], ['Háló', 3.5], ['Fürdő', 2]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 330000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 640000 }]
  },
  {
    id: 'tetoteres', cat: 'haz', spec: 'haz', name: 'Tetőteres', tag: 'Két szint, 5 szobás',
    blurb: 'Tetőtér-beépítéses ház: élettér lent, hálók fent, kis építési alapterületen.',
    weeks: '34–42',
    levels: [
      { label: 'Földszint', rows: [
        { h: 4.5, cells: [['Nappali-étkező', 6], ['Konyha', 4]] },
        { h: 3.5, cells: [['Előszoba', 3], ['Fürdő', 2.5], ['Dolgozó', 4.5]] }
      ] },
      { label: 'Tetőtér', rows: [
        { h: 3, cells: [['Háló', 5], ['Gyerekszoba', 5]] },
        { h: 3, cells: [['Gyerekszoba', 4], ['Fürdő', 3], ['Lépcsőtér', 3]] }
      ] }
    ],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 340000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 660000 }]
  },
  {
    id: 'tetoter-beepites', cat: 'bovites', spec: 'tetoter', name: 'Tetőtér-beépítés', tag: 'Új szint a meglévő ház fölött',
    blurb: 'Kihasználatlan tetőtérből két szoba, fürdő és gardrób.',
    weeks: '10–14',
    levels: [{ label: 'Tetőtér', rows: [
      { h: 3, cells: [['Szoba', 4.5], ['Szoba', 4.5]] },
      { h: 2.5, cells: [['Fürdő', 3], ['Lépcsőtér', 3], ['Gardrób', 3]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 260000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 430000 }]
  },
  {
    id: 'oldalszarny', cat: 'bovites', spec: 'bovites', name: 'Oldalszárny', tag: 'Nappali- vagy szobabővítés',
    blurb: 'Földszinti toldás: nagyobb nappali, plusz dolgozó és vizesblokk.',
    weeks: '10–14',
    levels: [{ label: 'Földszint', rows: [
      { h: 3, cells: [['Nappali-bővítés', 6]] },
      { h: 2, cells: [['Dolgozó', 3.5], ['WC', 2.5]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 340000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 620000 }]
  },
  {
    id: 'parasztház', cat: 'felujitas', spec: 'felujitas', name: 'Parasztház', tag: 'Teljes körű felújítás',
    blurb: 'Régi vidéki ház átalakítása: szerkezeti rendbetétel, új gépészet, új belső terek.',
    weeks: '16–24',
    levels: [{ label: 'Földszint', rows: [
      { h: 3.5, cells: [['Nappali', 4.5], ['Konyha', 4], ['Kamra', 3.5]] },
      { h: 3, cells: [['Szoba', 4], ['Szoba', 4], ['Fürdő', 2.5], ['Előtér', 1.5]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezeti felújítás', m2: 220000 }, { id: 'kulcs', label: 'Teljes felújítás', m2: 380000 }]
  },
  {
    id: 'belso', cat: 'felujitas', spec: 'felujitas', name: 'Belső átalakítás', tag: 'Lakás és kisház belső felújítása',
    blurb: 'Új alaprajzi elrendezés, korszerű gépészet, fürdő és konyha cseréje.',
    weeks: '8–12',
    levels: [{ label: 'Lakótér', rows: [
      { h: 4, cells: [['Nappali-konyha', 5.5], ['Szoba', 3.5]] },
      { h: 3.5, cells: [['Szoba', 3.5], ['Fürdő', 2.5], ['Előszoba', 3]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Gépészet + felületek', m2: 240000 }, { id: 'kulcs', label: 'Teljes felújítás', m2: 360000 }]
  },
  {
    id: 'garazs', cat: 'kicsi', spec: 'kicsi', name: 'Garázs', tag: 'Egy autó + tároló',
    blurb: 'Egy autónak és szerszámoknak, külön tárolórésszel.',
    weeks: '5–7',
    levels: [{ label: 'Alaprajz', rows: [
      { h: 4, cells: [['Garázs', 4.5], ['Tároló', 1.5]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 290000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 400000 }]
  },
  {
    id: 'hetvegi', cat: 'kicsi', spec: 'kicsi', name: 'Hétvégi ház', tag: '35 m², szoba + fürdő',
    blurb: 'Kompakt hétvégi ház nappali-konyhával, fürdővel és külön hálóval.',
    weeks: '8–12',
    levels: [{ label: 'Alaprajz', rows: [
      { h: 3, cells: [['Nappali-konyha', 4.5], ['Fürdő', 2.5]] },
      { h: 2, cells: [['Háló', 7]] }
    ] }],
    finishes: [{ id: 'szerk', label: 'Szerkezetkész', m2: 380000 }, { id: 'kulcs', label: 'Kulcsrakész', m2: 690000 }]
  }
];
