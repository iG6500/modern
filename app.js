(function () {
  'use strict';
  var CFG = window.MK_CONFIG, PLANS = window.MK_PLANS, SPECS = window.MK_SPECS, CATS = window.MK_CATS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var catLabel = {}; CATS.forEach(function (c) { catLabel[c.id] = c.label; });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmtNum = function (n) { return Math.round(n).toLocaleString('hu-HU'); };
  var fmtM = function (v) { return (v / 1e6).toFixed(1).replace('.', ',') + ' M Ft'; };
  var fmtA = function (n) { return (Math.round(n * 10) / 10).toString().replace('.', ','); };

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
    ['mintatervek', 'szolgaltatasok', 'folyamat', 'munkak', 'korzet'].forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });
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

  /* ---------- alaprajz rajzoló ---------- */
  function levelGeom(level) {
    var W = 0, D = 0, rooms = [];
    level.rows.forEach(function (r) {
      var x = 0;
      r.cells.forEach(function (c) { rooms.push({ n: c[0], x: x, y: D, w: c[1], h: r.h, a: c[1] * r.h }); x += c[1]; });
      W = Math.max(W, x); D += r.h;
    });
    return { W: W, D: D, rooms: rooms };
  }
  function planArea(p) { return p.levels.reduce(function (s, l) { return s + levelGeom(l).rooms.reduce(function (a, r) { return a + r.a; }, 0); }, 0); }
  function planBeds(p) { var n = 0; p.levels.forEach(function (l) { levelGeom(l).rooms.forEach(function (r) { if (/szoba|háló/i.test(r.n)) n++; }); }); return n; }
  function planPrice(p, fid) { var f = p.finishes.filter(function (x) { return x.id === fid; })[0] || p.finishes[0]; return Math.round(planArea(p) * f.m2 / 50000) * 50000; }

  function floorplan(level, mode) {
    var g = levelGeom(level), s = 40, pad = mode === 'full' ? 34 : 14, fsN = mode === 'full' ? 16 : 17, fsA = mode === 'full' ? 14 : 19;
    var VW = g.W * s + pad * 2, VH = g.D * s + pad * 2, o = '';
    g.rooms.forEach(function (r, i) {
      var x = pad + r.x * s, y = pad + r.y * s, w = r.w * s, h = r.h * s;
      o += '<rect class="fp-room' + (i % 2 ? ' alt' : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>';
      var fitN = mode === 'full' && w >= r.n.length * fsN * 0.56 + 12 && h >= 52, fitA = w >= 56 && h >= 34;
      var cx = x + w / 2, cy = y + h / 2;
      if (fitN) {
        o += '<text class="fp-t" x="' + cx + '" y="' + (cy - 2) + '" font-size="' + fsN + '">' + esc(r.n) + '</text><text class="fp-a" x="' + cx + '" y="' + (cy + fsA + 2) + '" font-size="' + fsA + '">' + fmtA(r.a) + ' m²</text>';
      } else if (fitA) {
        o += '<text class="fp-a" x="' + cx + '" y="' + (cy + fsA * 0.35) + '" font-size="' + fsA + '">' + fmtA(r.a) + '</text>';
      }
    });
    o += '<rect class="fp-wall" x="' + pad + '" y="' + pad + '" width="' + g.W * s + '" height="' + g.D * s + '"/>';
    if (mode === 'full') {
      var top = pad - 16, left = pad - 16;
      o += '<line class="fp-dim" x1="' + pad + '" y1="' + top + '" x2="' + (pad + g.W * s) + '" y2="' + top + '"/><text class="fp-dt" x="' + (pad + g.W * s / 2) + '" y="' + (top - 5) + '">' + fmtA(g.W) + ' m</text>';
      o += '<line class="fp-dim" x1="' + left + '" y1="' + pad + '" x2="' + left + '" y2="' + (pad + g.D * s) + '"/><text class="fp-dt" transform="translate(' + (left - 6) + ' ' + (pad + g.D * s / 2) + ') rotate(-90)">' + fmtA(g.D) + ' m</text>';
    }
    return '<svg viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="Alaprajz: ' + esc(level.label) + '" preserveAspectRatio="xMidYMid meet">' + o + '</svg>';
  }

  /* ---------- hero ---------- */
  var HERO = {
    haz: { l: ['Családi ház.', 'Egy kézben.', 'Kulcsrakészen.'], s: 'Új családi házat építünk Baja 100 km-es körzetében. Mintatervekből, ismert műszaki tartalommal és átlátható árral, az átadásig egy kapcsolattartóval.', c: ['Fix műszaki tartalom', 'Szerkezetkész vagy kulcsrakész', 'Egy kapcsolattartó'] },
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
    heroState = id; var h = HERO[id];
    $$('button', heroTabs).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    $('#heroTitle').innerHTML = h.l.map(function (t) { return '<span class="ln"><span>' + esc(t) + '</span></span>'; }).join('');
    var sub = $('#heroSub'); sub.textContent = h.s; sub.classList.remove('swap'); void sub.offsetWidth; sub.classList.add('swap');
    $('#heroChips').innerHTML = h.c.map(function (t, i) { return '<li style="animation-delay:' + (i * 80) + 'ms">' + esc(t) + '</li>'; }).join('');
  }
  $('#heroCta').addEventListener('click', function () { setFilter(heroState); });
  setHero('haz');

  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    var bp = $('.blueprint');
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bp.style.transform = 'translate(' + (x * -22).toFixed(1) + 'px,' + (y * -16).toFixed(1) + 'px)';
    });
  }

  /* ---------- mintaterv rács ---------- */
  var filter = 'all', grid = $('#planGrid'), filt = $('#planFilters');
  function filterChip(id, label, count) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.id = id;
    b.innerHTML = esc(label) + ' <small>' + count + '</small>';
    b.addEventListener('click', function () { setFilter(id, true); }); filt.appendChild(b);
  }
  filterChip('all', 'Mind', PLANS.length);
  CATS.forEach(function (c) { filterChip(c.id, c.label, PLANS.filter(function (p) { return p.cat === c.id; }).length); });
  function setFilter(id) {
    filter = id;
    $$('.chip', filt).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    var list = PLANS.filter(function (p) { return id === 'all' || p.cat === id; });
    grid.innerHTML = list.map(function (p, i) {
      var a = planArea(p), beds = planBeds(p), from = planPrice(p, p.finishes[0].id);
      return '<button type="button" class="plan" data-id="' + p.id + '" style="animation-delay:' + (i * 60) + 'ms">' +
        '<div class="plan-fig"><span class="plan-cat">' + esc(catLabel[p.cat]) + '</span>' + floorplan(p.levels[0], 'area') + '</div>' +
        '<div class="plan-info"><div><h3>' + esc(p.name) + '</h3><div class="tag">' + esc(p.tag) + '</div></div>' +
        '<div class="plan-facts"><span><b>' + fmtA(a) + ' m²</b></span>' + (beds ? '<span><b>' + beds + '</b> szoba</span>' : '') + '<span><b>' + p.levels.length + '</b> szint</span><span>' + esc(p.weeks) + ' hét</span></div>' +
        '<div class="plan-price"><div><small>Irányár, innen</small><b>' + fmtM(from) + '</b></div><span class="plan-go" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></div></button>';
    }).join('');
    $$('.plan', grid).forEach(function (el) { el.addEventListener('click', function () { openPlan(el.dataset.id); }); });
  }
  setFilter('all');
  $$('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () { setFilter(b.dataset.filter); $('#mintatervek').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  });

  /* ---------- részletek fiók ---------- */
  var wrapEl = $('#drawerWrap'), drawer = $('#drawer'), dBody = $('#dBody'), lastFocus = null, cur = null, priceAnim = 0;
  function openPlan(id) {
    var p = PLANS.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    cur = { p: p, lv: 0, fin: p.finishes[p.finishes.length - 1].id };
    lastFocus = document.activeElement; renderDrawer(true);
    wrapEl.hidden = false; document.body.classList.add('lock'); drawer.scrollTop = 0; drawer.focus();
  }
  function closeDrawer() { wrapEl.hidden = true; document.body.classList.remove('lock'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  wrapEl.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeDrawer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !wrapEl.hidden) closeDrawer();
    if (e.key === 'Tab' && !wrapEl.hidden) {
      var f = $$('button,a[href],input,select,textarea', drawer).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === drawer)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function renderDrawer(full) {
    var p = cur.p, a = planArea(p), f = p.finishes.filter(function (x) { return x.id === cur.fin; })[0], price = planPrice(p, cur.fin), beds = planBeds(p);
    var spec = SPECS[p.spec].map(function (s) {
      var on = s[2] === 'szerk' || cur.fin === p.finishes[p.finishes.length - 1].id;
      return '<li class="' + (on ? '' : 'off') + '"><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span><em>' + (on ? 'benne van' : 'nem tartalmazza') + '</em></li>';
    }).join('');
    if (full) {
      dBody.innerHTML =
        '<div class="d-head"><span class="eyebrow">' + esc(catLabel[p.cat]) + '</span><h2 id="dTitle">' + esc(p.name) + '</h2><p>' + esc(p.blurb) + '</p></div>' +
        '<div class="d-fig">' + (p.levels.length > 1 ? '<div class="lv" id="dLv">' + p.levels.map(function (l, i) { return '<button type="button" data-lv="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(l.label) + '</button>'; }).join('') + '</div>' : '') + '<div id="dFig"></div></div>' +
        '<div class="facts"><div class="fact"><small>Alapterület</small><b>' + fmtA(a) + ' m²</b></div><div class="fact"><small>Szobák</small><b>' + (beds || '–') + '</b></div><div class="fact"><small>Szintek</small><b>' + p.levels.length + '</b></div><div class="fact"><small>Átfutás</small><b>' + esc(p.weeks) + ' hét</b></div></div>' +
        '<div class="pricebox"><div class="seg2" id="dFin" role="group" aria-label="Átadási állapot">' + p.finishes.map(function (x) { return '<button type="button" data-fin="' + x.id + '" aria-pressed="false">' + esc(x.label) + '</button>'; }).join('') + '</div>' +
        '<div class="price-row"><div class="price-big" id="dPrice">' + fmtM(price) + '</div><div class="price-sub"><span>Irányár</span><b id="dM2"></b></div></div>' +
        '<p class="d-note">Tájékoztató irányár. A telek adottságaitól és az egyedi igényektől függően felmérés után pontosítjuk.</p></div>' +
        '<div class="d-sec"><h3>Műszaki tartalom</h3><ul class="spec" id="dSpec"></ul></div>' +
        '<div class="d-cta"><span id="dSum"></span><button type="button" class="btn btn-lime" id="dGo">Ajánlatot kérek erre a tervre <span class="arr">→</span></button></div>';
      $('#dFig').innerHTML = floorplan(p.levels[0], 'full');
      $('#dLv') && $('#dLv').addEventListener('click', function (e) {
        var b = e.target.closest('[data-lv]'); if (!b) return; cur.lv = +b.dataset.lv;
        $$('button', $('#dLv')).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $('#dFig').innerHTML = floorplan(p.levels[cur.lv], 'full');
      });
      $('#dFin').addEventListener('click', function (e) { var b = e.target.closest('[data-fin]'); if (!b) return; cur.fin = b.dataset.fin; renderDrawer(false); });
      $('#dGo').addEventListener('click', function () { selectPlanInForm(); });
    }
    $$('button', $('#dFin')).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fin === cur.fin ? 'true' : 'false'); });
    $('#dSpec').innerHTML = spec;
    $('#dM2').textContent = fmtNum(f.m2) + ' Ft/m²';
    $('#dSum').innerHTML = '<b>' + esc(p.name) + '</b> · ' + esc(f.label) + ' · ' + fmtM(price);
    var el = $('#dPrice'), from = parseFloat(el.dataset.v || price), t0 = performance.now(); el.dataset.v = price;
    cancelAnimationFrame(priceAnim);
    if (reduce) { el.textContent = fmtM(price); return; }
    (function tick(t) { var k = Math.min(1, (t - t0) / 450), v = from + (price - from) * (1 - Math.pow(1 - k, 3)); el.textContent = fmtM(v); if (k < 1) priceAnim = requestAnimationFrame(tick); })(t0);
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

  /* ---------- ajánlatkérő űrlap ---------- */
  var FTYPES = CATS.concat([{ id: 'egyeb', label: 'Egyéb' }]);
  var WHEN = ['3 hónapon belül', '3–6 hónap múlva', '6–12 hónap múlva', 'Csak tájékozódom'];
  var NAMES = ['Épület', 'Helyszín és időpont', 'Elérhetőség'];
  var st = { step: 1, type: 'haz', when: WHEN[0], town: '', plan: null };
  var form = $('#quoteForm'), badge = $('#planBadge');
  form.insertBefore(badge, $('.step', form));
  function mkChips(el, items, key, isType) {
    el.innerHTML = '';
    items.forEach(function (it) {
      var id = isType ? it.id : it, label = isType ? it.label : it;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; b.dataset.v = id;
      b.addEventListener('click', function () { st[key] = id; if (isType) st.plan = null; syncForm(); }); el.appendChild(b);
    });
  }
  mkChips($('#fTypes'), FTYPES, 'type', true); mkChips($('#fWhen'), WHEN, 'when', false);
  function syncForm() {
    $$('#fTypes .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.type ? 'true' : 'false'); });
    $$('#fWhen .chip').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.when ? 'true' : 'false'); });
    if (st.plan) { badge.hidden = false; badge.innerHTML = '<span>Kiválasztott terv: <b>' + esc(st.plan.name) + '</b> · ' + esc(st.plan.fin) + ' · ' + fmtM(st.plan.price) + '</span><button type="button" id="planClear">Eltávolít</button>'; }
    else badge.hidden = true;
    $$('.step', form).forEach(function (s) { s.hidden = String(s.dataset.step) !== String(st.step); });
    var n = st.step === 'done' ? 3 : st.step;
    $('#formBar').style.width = Math.round(n / 3 * 100) + '%';
    $('#stepName').textContent = st.step === 'done' ? 'Kész' : NAMES[n - 1]; $('#stepNum').textContent = n + ' / 3';
  }
  badge.addEventListener('click', function (e) { if (e.target.id === 'planClear') { st.plan = null; syncForm(); } });
  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) { st.step = Math.min(3, st.step + 1); syncForm(); }
    if (e.target.closest('[data-back]')) { st.step = Math.max(1, st.step - 1); $('#formErr').hidden = true; syncForm(); }
  });
  $('#fTown').addEventListener('input', function (e) { st.town = e.target.value; });
  function selectPlanInForm() {
    var p = cur.p, f = p.finishes.filter(function (x) { return x.id === cur.fin; })[0];
    st.type = p.cat; st.plan = { name: p.name, fin: f.label, price: planPrice(p, cur.fin) }; st.step = 2; syncForm();
    closeDrawer(); $('#ajanlat').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('[data-go-form]').forEach(function (a) { a.addEventListener('click', function () { if (st.step === 'done') { st.step = 1; syncForm(); } }); });

  function showErr(msg) { var e = $('#formErr'); e.textContent = msg; e.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
    if (!name || !phone || !$('#fConsent').checked) { showErr('Kérjük, adja meg a nevét és a telefonszámát, és fogadja el a tájékoztatót.'); return; }
    var typeL = FTYPES.filter(function (t) { return t.id === st.type; })[0].label;
    var data = { tipus: typeL, terv: st.plan ? st.plan.name + ' · ' + st.plan.fin + ' · ' + fmtM(st.plan.price) : '', telepules: st.town, mikorra: st.when, nev: name, telefon: phone };
    var sum = typeL + (st.plan ? ' · ' + st.plan.name : '') + (st.town ? ' · ' + st.town : '') + ' · ' + st.when;
    function ok(note) {
      $('#doneTitle').textContent = 'Köszönjük, ' + name + '!';
      $('#doneText').textContent = note; $('#doneSum').textContent = sum; st.step = 'done'; syncForm();
    }
    $('#formErr').hidden = true;
    if (CFG.formEndpoint) {
      var btn = $('#submitBtn'); btn.disabled = true;
      fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; ok('24 órán belül hívjuk a ' + phone + ' számon.'); })
        .catch(function () { showErr('Az elküldés nem sikerült. Kérjük, próbálja újra, vagy hívjon: ' + CFG.phone); })
        .then(function () { btn.disabled = false; });
    } else if (CFG.email) {
      var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
      window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('Ajánlatkérés – ' + typeL) + '&body=' + encodeURIComponent(body);
      ok('Megnyitottuk az e-mail programját a kitöltött kéréssel. Kérjük, küldje el, és 24 órán belül hívjuk a ' + phone + ' számon.');
    } else {
      showErr('Az online ajánlatkérés még nincs bekötve. Kérjük, hívjon: ' + CFG.phone);
    }
  });
  $('#formReset').addEventListener('click', function () {
    st = { step: 1, type: 'haz', when: WHEN[0], town: '', plan: null };
    $('#fName').value = ''; $('#fPhone').value = ''; $('#fTown').value = ''; $('#fConsent').checked = false; syncForm();
  });
  syncForm();
})();
