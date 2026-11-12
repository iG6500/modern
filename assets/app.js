/* Modern Konstrukt – oldal-interakciók (vanilla JS, nincs függőség) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TYPE_LABEL = { haz: 'Családi ház', bovites: 'Bővítés', felujitas: 'Felújítás', kicsi: 'Kisebb épület' };

  /* ---------- ajánlatkérő panel ---------- */
  var st = { type: 'haz', size: '', when: '', town: '' };
  var lead = $('#lpLead'), q = $('#lpQ'), done = $('#lpDone');
  var phone = $('#lpPhone'), consent = $('#lpConsent'), err = $('#lpErr'), sendErr = $('#lpSendErr'), town = $('#lpTown');
  var phases = { lead: lead, q: q, done: done };

  function show(name) { Object.keys(phases).forEach(function (k) { phases[k].hidden = k !== name; }); }
  function setType(t) {
    st.type = t;
    $$('#lpTypes .mk-chip').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-type') === t ? 'true' : 'false'); });
  }
  $('#lpTypes').addEventListener('click', function (e) { var b = e.target.closest('[data-type]'); if (b) setType(b.getAttribute('data-type')); });

  /* szolgáltatás-kártyák: típus előválasztása, a link az űrlapra görget */
  $$('a.mk-svc[data-type]').forEach(function (a) {
    a.addEventListener('click', function () { setType(a.getAttribute('data-type')); show('lead'); });
  });

  q.addEventListener('click', function (e) {
    var b = e.target.closest('.mk-chip-s'); if (!b) return;
    var key = b.getAttribute('data-key'); st[key] = b.getAttribute('data-val');
    $$('.mk-chip-s[data-key="' + key + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  });
  town.addEventListener('input', function () { st.town = town.value; });

  lead.addEventListener('submit', function (e) {
    e.preventDefault();
    var digits = phone.value.replace(/\D/g, '').length >= 8;
    if (!digits || !consent.checked) { err.hidden = false; phone.classList.toggle('bad', !digits); return; }
    err.hidden = true; phone.classList.remove('bad');
    var btn = $('.lp-submit', lead); btn.disabled = true;
    sendErr.hidden = true; show('q');
    window.MKLead.send({ tipus: TYPE_LABEL[st.type], forras: 'hero – telefonszám', telefon: phone.value.trim() }, function (okSend) {
      btn.disabled = false; if (!okSend) sendErr.hidden = false;
    });
  });

  $$('[data-finish]', q).forEach(function (b) {
    b.addEventListener('click', function () {
      show('done');
      $('#lpSummary').textContent = [TYPE_LABEL[st.type], phone.value.trim(), st.size, st.when, st.town].filter(Boolean).join(' · ');
      if (st.size || st.when || st.town) {
        window.MKLead.send({ tipus: TYPE_LABEL[st.type], forras: 'hero – kiegészítő kérdések', telefon: phone.value.trim(), alapterulet: st.size, mikorra: st.when, telepules: st.town }, function () {});
      }
    });
  });
  $('#lpReset').addEventListener('click', function () {
    st = { type: 'haz', size: '', when: '', town: '' };
    phone.value = ''; consent.checked = false; town.value = ''; err.hidden = true; sendErr.hidden = true;
    $$('.mk-chip-s').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    setType('haz'); show('lead');
  });

  /* ---------- „négy lépés” folyamat ---------- */
  var list = $('#pgList');
  if (list) {
    var items = $$('.ps', list), bars = $$('#pgBars .pgb'), groups = {}, P = 0, hold = false;
    $$('#pgSvg g[data-st]').forEach(function (g) { groups[g.getAttribute('data-st')] = g; });
    var ALT = ['Kitűzött telek, mérőműszer', 'Szaggatott vonalas terv és tételes ajánlat', 'Épülő szerkezet állvánnyal és daruval', 'Kész, átadott ház'];
    var DUR = items.map(function (li) { return $('.ps-dur', li).textContent; });
    var setStep = function (i) {
      P = i;
      items.forEach(function (li, k) {
        li.classList.toggle('on', k === i); li.classList.toggle('past', k < i);
        $('button', li).setAttribute('aria-expanded', k === i ? 'true' : 'false');
        $('.ps-ic', li).textContent = k === i ? '—' : '+';
      });
      bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
      var v = { stakes: i === 0 ? 1 : (i === 1 ? 0.3 : 0), plan: i === 1 ? 1 : 0, planbox: i === 1 ? 1 : 0, build: i >= 2 ? 1 : 0, scaffold: i === 2 ? 1 : 0, done: i === 3 ? 1 : 0 };
      Object.keys(v).forEach(function (k) { if (groups[k]) groups[k].style.opacity = v[k]; });
      $('#pgNum').textContent = i + 1; $('#pgDur').textContent = DUR[i];
      $('#pgSvg').setAttribute('aria-label', ALT[i]);
    };
    list.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) { hold = true; setStep(+b.getAttribute('data-i')); } });
    setStep(0);
    if (!reduce) setInterval(function () { if (!hold) setStep((P + 1) % 4); }, 3800);
  }

  /* ---------- képnagyítás (lightbox) ---------- */
  (function () {
    var imgs = $$('img[data-zoom]');
    if (!imgs.length) return;
    var CSS = '.lb{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(10,12,10,.92);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s}' +
      '.lb.on{opacity:1;visibility:visible}' +
      '.lb-fig{margin:0;max-width:min(94vw,1500px);max-height:92vh;display:flex;flex-direction:column;align-items:center;gap:12px;transform:scale(.9);transition:transform .45s cubic-bezier(.2,.8,.2,1)}' +
      '.lb.on .lb-fig{transform:scale(1)}' +
      '.lb-img{display:block;max-width:100%;max-height:calc(92vh - 48px);width:auto;height:auto;object-fit:contain;background:#1b1e1c;box-shadow:0 30px 80px rgba(0,0,0,.5);touch-action:pan-y}' +
      '.lb-cap{color:#D6DAD7;font:500 13px/1.4 "Inter Tight",Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-align:center;min-height:1.4em}' +
      '.lb-b{position:absolute;display:grid;place-items:center;width:52px;height:52px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:rgba(17,19,17,.6);color:#fff;font:400 26px/1 Arial,sans-serif;cursor:pointer;transition:background .2s,border-color .2s}' +
      '.lb-b:hover{background:#3F7A2A;border-color:#3F7A2A}.lb-b:focus-visible{outline:2px solid #9CC077;outline-offset:3px}' +
      '.lb-x{top:18px;right:18px}.lb-p{left:18px;top:50%;margin-top:-26px}.lb-n{right:18px;top:50%;margin-top:-26px}.lb-b[hidden]{display:none}' +
      '@media (max-width:720px){.lb-p,.lb-n{top:auto;bottom:18px;margin:0}.lb-p{left:calc(50% - 64px)}.lb-n{right:calc(50% - 64px)}.lb-fig{max-height:84vh}.lb-img{max-height:calc(84vh - 48px)}}' +
      '@media (prefers-reduced-motion:reduce){.lb,.lb-fig{transition:none}}';
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Képnagyítás');
    lb.innerHTML = '<button type="button" class="lb-b lb-x" aria-label="Bezárás">×</button>' +
      '<button type="button" class="lb-b lb-p" aria-label="Előző kép">‹</button>' +
      '<button type="button" class="lb-b lb-n" aria-label="Következő kép">›</button>' +
      '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>';
    document.body.appendChild(lb);
    var big = $('.lb-img', lb), cap = $('.lb-cap', lb), prev = $('.lb-p', lb), next = $('.lb-n', lb), closeBtn = $('.lb-x', lb);
    var group = [], idx = 0, opener = null;

    function show(i) {
      idx = (i + group.length) % group.length;
      var el = group[idx];
      big.src = el.getAttribute('data-zoom'); big.alt = el.getAttribute('alt') || '';
      cap.textContent = el.getAttribute('data-caption') || '';
      var multi = group.length > 1; prev.hidden = next.hidden = !multi;
      var n = group[(idx + 1) % group.length]; if (n && n !== el) { var pre = new Image(); pre.src = n.getAttribute('data-zoom'); }
    }
    function open(el, trigger) {
      var g = el.getAttribute('data-group');
      group = imgs.filter(function (x) { return x.getAttribute('data-group') === g; });
      opener = trigger || el;
      show(group.indexOf(el));
      lb.classList.add('on'); document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      lb.classList.remove('on'); document.body.style.overflow = '';
      if (opener && opener.focus) opener.focus();
    }
    imgs.forEach(function (im) {
      var scope = im.getAttribute('data-scope') === 'card' ? (im.closest('.mk-zoomcard') || im.parentNode) : (im.closest('.mk-img') || im.parentNode);
      scope.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); open(im, scope); });
      if (scope.classList.contains('mk-zoomcard')) {
        scope.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(im, scope); } });
      }
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
    closeBtn.addEventListener('click', close);
    prev.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') {
        var f = [closeBtn, prev, next].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    /* érintéses lapozás */
    var sx = null;
    big.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    big.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50 && group.length > 1) show(idx + (dx < 0 ? 1 : -1));
    });
  })();
})();
