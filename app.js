(function () {
  'use strict';
  var CFG = window.MK_CONFIG, CATS = window.MK_CATS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var catLabel = {}; CATS.forEach(function (c) { catLabel[c.id] = c.label; });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- telefon ---------- */
  $$('[data-phone]').forEach(function (e) { e.textContent = CFG.phone; });
  $$('[data-phone-link]').forEach(function (e) { e.setAttribute('href', CFG.phoneHref); });

  /* ---------- fejléc, mobil sáv, aktív menü ---------- */
  var hdr = $('#hdr'), mbar = $('#mbar'), heroEl = $('#hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('scrolled', y > 24);
    mbar.classList.toggle('show', y > heroEl.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['szolgaltatasok', 'folyamat', 'munkak', 'korzet'].forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
  }

  /* ---------- megjelenési animáció + számlálók ---------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count'); if (reduce) return;
    var t0 = performance.now(), d = 1400;
    (function tick(t) { var p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
  }
  if ('IntersectionObserver' in window) {
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); rvIO.unobserve(e.target);
        $$('[data-count]', e.target).forEach(countUp);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; rvIO.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- hero ---------- */
  var HERO = {
    haz: { l: ['Családi ház.', 'Egy kézben.', 'Kulcsrakészen.'], s: 'Új családi házat építünk Baja 100 km-es körzetében, a felméréstől az átadásig egy kapcsolattartóval. Hagyja meg a számát, és 24 órán belül visszahívjuk.', c: ['Tételes írásos ajánlat', 'Szerkezetkész vagy kulcsrakész', 'Egy kapcsolattartó'] },
    bovites: { l: ['Bővítés.', 'Tetőtér, szárny,', 'új szoba.'], s: 'Tetőtér-beépítés, oldalszárny, plusz szoba: a meglévő házhoz illeszkedő bővítés, felmérésre épülő tételes ajánlattal.', c: ['Tetőtér-beépítés', 'Oldalszárny', 'Meglévő házhoz illesztve'] },
    felujitas: { l: ['Felújítás.', 'Régi falakból', 'új otthon.'], s: 'Szerkezet, gépészet, nyílászárók, fürdő, konyha: teljes körű felújítás, amit egy csapat szervez és végez el.', c: ['Szerkezeti rendbetétel', 'Korszerű gépészet', 'Belső terek'] },
    kicsi: { l: ['35 m²-ig.', 'Gyorsan.', 'Rendesen.'], s: 'Garázs, hétvégi ház, kis üzlethelyiség. Gyors átfutás és egyszerű folyamat a felméréstől az átadásig.', c: ['Garázs', 'Hétvégi ház', 'Kis üzlethelyiség'] }
  };
  var heroState = 'haz', heroTabs = $('#heroTabs');
  CATS.forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = c.label; b.dataset.id = c.id;
    b.addEventListener('click', function () { setHero(c.id); }); heroTabs.appendChild(b);
  });
  function setHero(id) {
    heroState = id; if (st) st.type = id; var h = HERO[id];
    $$('button', heroTabs).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    $('#heroTitle').innerHTML = h.l.map(function (t) { return '<span class="ln"><span>' + esc(t) + '</span></span>'; }).join('');
    var sub = $('#heroSub'); sub.textContent = h.s; sub.classList.remove('swap'); void sub.offsetWidth; sub.classList.add('swap');
    $('#heroChips').innerHTML = h.c.map(function (t, i) { return '<li style="animation-delay:' + (i * 80) + 'ms">' + esc(t) + '</li>'; }).join('');
  }
  setHero('haz');

  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    var bp = $('.blueprint');
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bp.style.transform = 'translate(' + (x * -22).toFixed(1) + 'px,' + (y * -16).toFixed(1) + 'px)';
    });
  }

  /* ---------- folyamat ---------- */
  var STEPS = [
    { n: '01', t: 'Felmérés', d: 'Kimegyünk a helyszínre, megnézzük a telket, a megközelítést és a közműveket, és meghallgatjuk, mire kell az épület.', dur: '[kb. X nap a hívástól]' },
    { n: '02', t: 'Ajánlat', d: 'Tételes, írásos ajánlatot kap, amiből látszik, mi mennyibe kerül, és mikorra készülünk el.', dur: '[X munkanapon belül]' },
    { n: '03', t: 'Kivitelezés', d: 'Ütemterv szerint haladunk, és fotókkal jelezzük, hol tart a munka, így nem kell kijárnia ellenőrizni.', dur: '[X hét]' },
    { n: '04', t: 'Átadás', d: 'Közösen bejárjuk az épületet, és csak akkor zárjuk le, ha minden rendben van.', dur: '[garancia: X év]' }
  ];
  var pi = 0, pList = $('#procList'), pPanel = $('#procPanel');
  pList.innerHTML = STEPS.map(function (s, i) { return '<li><button type="button" class="proc-btn" data-i="' + i + '"><span class="proc-n">' + s.n + '</span><span class="proc-t">' + esc(s.t) + '</span></button></li>'; }).join('');
  pList.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) setProc(+b.dataset.i); });
  function setProc(i) {
    pi = i; var s = STEPS[i];
    $$('.proc-btn', pList).forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    pPanel.dataset.n = s.n;
    pPanel.innerHTML = '<h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p><span class="proc-dur">' + esc(s.dur) + '</span>' +
      '<div class="proc-nav"><div class="proc-bar"><i style="width:' + (i + 1) * 25 + '%"></i></div>' +
      '<button type="button" class="round" data-d="-1" aria-label="Előző lépés"' + (i === 0 ? ' disabled' : '') + '>←</button>' +
      '<button type="button" class="round" data-d="1" aria-label="Következő lépés"' + (i === 3 ? ' disabled' : '') + '>→</button></div>';
  }
  pPanel.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (b && !b.disabled) setProc(pi + +b.dataset.d); });
  setProc(0);

  /* ---------- előtte–utána ---------- */
  var PROJ = ['[Település] · családi ház', '[Település] · bővítés', '[Település] · felújítás'];
  var baTabs = $('#baTabs'), baRange = $('#baRange'), baBefore = $('#baBefore'), baHandle = $('#baHandle');
  PROJ.forEach(function (p, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = 'Projekt ' + (i + 1);
    b.addEventListener('click', function () { $$('.chip', baTabs).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); $('#baName').textContent = p; setBa(50); });
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); baTabs.appendChild(b);
  });
  function setBa(v) { baRange.value = v; baBefore.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)'; baHandle.style.left = v + '%'; }
  baRange.addEventListener('input', function () { setBa(+baRange.value); });

  /* ---------- körzet ---------- */
  var BAJA = { lat: 46.1806, lon: 18.9547 };
  var CITIES = [['Baja', 46.1806, 18.9547], ['Kalocsa', 46.5290, 18.9840], ['Kiskunhalas', 46.4350, 19.4850], ['Szekszárd', 46.3500, 18.7060], ['Mohács', 45.9930, 18.6800], ['Kecskemét', 46.9070, 19.6910], ['Szeged', 46.2530, 20.1480], ['Pécs', 46.0727, 18.2323]];
  var radar = $('#radar'), chipsEl = $('#cityChips'), ans = $('#areaAnswer'), svg = '';
  svg += '<defs><radialGradient id="sw" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8fcb6e" stop-opacity=".0"/><stop offset="1" stop-color="#8fcb6e" stop-opacity=".28"/></radialGradient></defs>';
  svg += '<circle class="rd-ring main" r="100"/><circle class="rd-ring" r="75"/><circle class="rd-ring" r="50"/><circle class="rd-ring" r="25"/>';
  svg += '<path class="rd-sweep" d="M0 0 L100 0 A100 100 0 0 1 76.6 64.3 Z" fill="url(#sw)"/>';
  svg += '<text x="0" y="-104" text-anchor="middle" fill="#8fcb6e" font-size="9" font-weight="700" letter-spacing="1.5" font-family="Archivo,sans-serif">100 KM</text>';
  var pts = CITIES.map(function (c) {
    var x = (c[2] - BAJA.lon) * 76.8, y = (BAJA.lat - c[1]) * 111, d = Math.hypot(x, y);
    return { n: c[0], x: x, y: y, d: Math.round(d / 5) * 5 };
  });
  pts.forEach(function (c, i) {
    svg += '<g class="rd-city' + (i === 0 ? ' rd-home' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + c.n + '"><circle class="halo" cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="9"/><circle class="dot" cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="' + (i === 0 ? 5 : 3.6) + '"/><text x="' + (c.x + 8).toFixed(1) + '" y="' + (c.y + 3).toFixed(1) + '">' + c.n + '</text></g>';
  });
  radar.innerHTML = svg;
  CITIES.forEach(function (c, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip d'; b.textContent = c[0]; b.dataset.i = i; chipsEl.appendChild(b);
  });
  ans.innerHTML = '<span>Koppintson egy településre a térképen vagy a gombok között.</span>';
  function setCity(i) {
    var c = pts[i];
    $$('.chip', chipsEl).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'); b.style.background = +b.dataset.i === i ? '#fff' : ''; b.style.color = +b.dataset.i === i ? '#101610' : ''; });
    $$('.rd-city', radar).forEach(function (g) { g.classList.toggle('on', +g.dataset.i === i); });
    ans.innerHTML = '<span>Igen, <b>' + esc(c.n) + '</b> és környéke a körzetünkben van' + (c.d ? ' (kb. ' + c.d + ' km Bajától)' : '') + '.</span><a class="btn btn-lime" href="#ajanlat" data-town="' + esc(c.n) + '">Ajánlatot kérek</a>';
  }
  chipsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) setCity(+b.dataset.i); });
  radar.addEventListener('click', function (e) { var g = e.target.closest('.rd-city'); if (g) setCity(+g.dataset.i); });
  radar.addEventListener('keydown', function (e) { var g = e.target.closest('.rd-city'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setCity(+g.dataset.i); } });
  ans.addEventListener('click', function (e) { var a = e.target.closest('[data-town]'); if (a) { st.town = a.dataset.town; $('#fTown').value = st.town; } });

  /* ---------- ajánlatkérés (hero + alsó űrlap) ---------- */
  var FTYPES = CATS.concat([{ id: 'egyeb', label: 'Egyéb' }]);
  var WHEN = ['3 hónapon belül', '3–6 hónap múlva', '6–12 hónap múlva', 'Csak tájékozódom'];
  var NAMES = ['Épület', 'Helyszín és időpont', 'Elérhetőség'];
  var st = { step: 1, type: 'haz', when: WHEN[0], town: '' };
  var form = $('#quoteForm');
  var typeLabel = function (id) { return FTYPES.filter(function (t) { return t.id === id; })[0].label; };

  function tracking() {
    var o = {}, q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(function (k) { if (q.get(k)) o[k] = q.get(k); });
    if (document.referrer) o.referrer = document.referrer;
    return o;
  }
  /* Lead elküldése: végpont (ha van), különben e-mail program. Siker esetén ok(), hiba esetén fail(üzenet). */
  function sendLead(data, ok, fail) {
    var payload = Object.assign({}, data, tracking(), { oldal: location.origin + location.pathname });
    (window.dataLayer = window.dataLayer || []).push({ event: 'generate_lead', lead_type: data.tipus });
    function viaMail() {
      if (!CFG.email) { fail('Az elküldés nem sikerült. Kérjük, hívjon: ' + CFG.phone); return; }
      var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
      window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Ajánlatkérés – ' + data.tipus) + '&body=' + encodeURIComponent(body);
      ok('Megnyílt az e-mail programja a kitöltött kéréssel, kérjük, küldje el. 24 órán belül hívjuk a ' + data.telefon + ' számon.');
    }
    if (!CFG.formEndpoint) { viaMail(); return; }
    fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw 0; ok('24 órán belül hívjuk a ' + data.telefon + ' számon.'); })
      .catch(viaMail);
  }

  /* hero mini űrlap: a "Mit építene?" fülek adják a típust */
  var hForm = $('#heroForm');
  hForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#hName').value.trim(), phone = $('#hPhone').value.trim(), er = $('#hErr');
    if (!name || !phone || !$('#hConsent').checked) { er.textContent = 'Kérjük, adja meg a nevét és a telefonszámát, és fogadja el a tájékoztatót.'; er.hidden = false; return; }
    er.hidden = true; var btn = $('#hBtn'); btn.disabled = true;
    sendLead({ tipus: typeLabel(heroState), forras: 'hero', nev: name, telefon: phone }, function (note) {
      hForm.hidden = true; $('#heroDone').hidden = false; $('#heroDoneT').textContent = 'Köszönjük, ' + name + '!'; $('#heroDoneP').textContent = note;
    }, function (msg) { er.textContent = msg; er.hidden = false; btn.disabled = false; });
  });

  /* alsó, háromlépéses űrlap */
  function mkChips(el, items, key, isType) {
    el.innerHTML = '';
    items.forEach(function (it) {
      var id = isType ? it.id : it, label = isType ? it.label : it;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; b.dataset.v = id;
      b.addEventListener('click', function () { st[key] = id; syncForm(); }); el.appendChild(b);
    });
  }
  mkChips($('#fTypes'), FTYPES, 'type', true); mkChips($('#fWhen'), WHEN, 'when', false);
  function syncForm() {
    $$('#fTypes .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.type ? 'true' : 'false'); });
    $$('#fWhen .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.when ? 'true' : 'false'); });
    $$('.step', form).forEach(function (s) { s.hidden = String(s.dataset.step) !== String(st.step); });
    var n = st.step === 'done' ? 3 : st.step;
    $('#formBar').style.width = Math.round(n / 3 * 100) + '%';
    $('#stepName').textContent = st.step === 'done' ? 'Kész' : NAMES[n - 1]; $('#stepNum').textContent = n + ' / 3';
  }
  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) { st.step = Math.min(3, st.step + 1); syncForm(); }
    if (e.target.closest('[data-back]')) { st.step = Math.max(1, st.step - 1); $('#formErr').hidden = true; syncForm(); }
  });
  $('#fTown').addEventListener('input', function (e) { st.town = e.target.value; });
  function goForm(type, town) {
    if (type) st.type = type;
    if (town) { st.town = town; $('#fTown').value = town; }
    if (st.step === 'done') st.step = 1;
    else if (type && st.step === 1) st.step = 2;
    syncForm();
  }
  $$('[data-go-form]').forEach(function (a) { a.addEventListener('click', function () { goForm(); }); });
  $$('[data-type]').forEach(function (b) {
    b.addEventListener('click', function () { goForm(b.dataset.type); $('#ajanlat').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  });

  function showErr(msg) { var e = $('#formErr'); e.textContent = msg; e.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
    if (!name || !phone || !$('#fConsent').checked) { showErr('Kérjük, adja meg a nevét és a telefonszámát, és fogadja el a tájékoztatót.'); return; }
    var data = { tipus: typeLabel(st.type), forras: 'ajánlatkérő űrlap', telepules: st.town, mikorra: st.when, nev: name, telefon: phone };
    var sum = data.tipus + (st.town ? ' · ' + st.town : '') + ' · ' + st.when;
    $('#formErr').hidden = true; var btn = $('#submitBtn'); btn.disabled = true;
    sendLead(data, function (note) {
      $('#doneTitle').textContent = 'Köszönjük, ' + name + '!'; $('#doneText').textContent = note; $('#doneSum').textContent = sum;
      st.step = 'done'; syncForm(); btn.disabled = false;
    }, function (msg) { showErr(msg); btn.disabled = false; });
  });
  $('#formReset').addEventListener('click', function () {
    st = { step: 1, type: 'haz', when: WHEN[0], town: '' };
    $('#fName').value = ''; $('#fPhone').value = ''; $('#fTown').value = ''; $('#fConsent').checked = false; syncForm();
  });
  syncForm();
})();
