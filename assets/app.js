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
})();
