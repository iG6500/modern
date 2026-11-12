/* Süti- és követés-hozzájárulás.
   Az oldal alapvetően nem használ követő sütit. Két választható kategória van:
   - statisztika: GoatCounter (sütimentes, névtelen látogatottságmérés)
   - marketing: Meta Pixel (Facebook / Instagram hirdetésmérés és -célzás)
   Mindkettő csak hozzájárulás után töltődik be. A döntés a böngésző localStorage-ában tárolódik. */
(function () {
  'use strict';
  var KEY = 'mk-consent';
  var GC = 'https://modernkonstrukt.goatcounter.com/count', GCSRC = '//gc.zgo.at/count.js';
  var PIXEL_ID = '1729964652028619';
  var CSS = '.ck{position:fixed;left:16px;bottom:16px;z-index:90;max-width:440px;background:#111311;color:#E4E7E5;padding:20px 22px;border-radius:2px;box-shadow:0 18px 50px rgba(0,0,0,.35);font-family:"Inter Tight","Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.5}.ck[hidden]{display:none}.ck h2{margin:0 0 6px;font-size:16px;font-weight:700;color:#fff}.ck p{margin:0 0 14px;color:#E4E7E5}.ck a{color:#9CC077}.ck-b{display:flex;gap:8px;flex-wrap:wrap}.ck-b button{min-height:44px;padding:0 16px;border:1px solid #5F6461;background:transparent;color:#fff;font:600 13px/1 "Inter Tight",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.ck-b button.pri{background:#3F7A2A;border-color:#3F7A2A}.ck-b button:hover{border-color:#9CC077}.ck-opts{margin:0 0 14px;padding:12px 0;border-block:1px solid #2A2E2B}.ck-opts[hidden]{display:none}.ck-opts label{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;cursor:pointer}.ck-opts label:last-child{margin:0}.ck-opts input{margin:3px 0 0;width:18px;height:18px;accent-color:#3F7A2A;flex:none}.ck-opts b{display:block;color:#fff}.ck-opts span{color:#B9BEBA;font-size:13px}@media (max-width:720px){.ck{left:8px;right:8px;bottom:66px;max-width:none;max-height:calc(100vh - 80px);overflow:auto}}';

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && v.v === 2) return v;
    } catch (e) {}
    return null;   // nincs vagy régi formátumú döntés: újra megkérdezzük
  }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify({ v: 2, stats: !!o.stats, marketing: !!o.marketing })); } catch (e) {} }

  var loadedStats = false, loadedPixel = false, box, state = read();

  function loadStats() {
    if (loadedStats) return; loadedStats = true;
    var s = document.createElement('script');
    s.async = true; s.setAttribute('data-goatcounter', GC); s.src = GCSRC;
    document.head.appendChild(s);
  }
  function loadPixel() {
    if (loadedPixel) return; loadedPixel = true;
    /* Meta Pixel alapkód (hozzájárulás után) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }
  function apply(prev, next) {
    if (next.stats) loadStats();
    if (next.marketing) loadPixel();
    /* hozzájárulás visszavonása: a már betöltött követőt az újratöltés szünteti meg */
    if (prev && ((prev.stats && !next.stats && loadedStats) || (prev.marketing && !next.marketing && loadedPixel))) {
      try { if (window.fbq) window.fbq('consent', 'revoke'); } catch (e) {}
      setTimeout(function () { location.reload(); }, 150);
    }
  }

  function build() {
    if (!document.getElementById('ck-css')) { var st = document.createElement('style'); st.id = 'ck-css'; st.textContent = CSS; document.head.appendChild(st); }
    box = document.createElement('div');
    box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'ckT'); box.hidden = true;
    box.innerHTML = '<h2 id="ckT">Süti-beállítások</h2>' +
      '<p>Az oldal működéséhez nincs szükség követő sütikre. A hozzájárulásoddal névtelen látogatottsági statisztikát mérünk, és a Meta Pixel segítségével a hirdetéseink hatékonyságát mérjük, illetve a Facebookon és az Instagramon releváns hirdetéseket jeleníthetünk meg. Részletek az <a href="adatkezelesi-tajekoztato.html#suti">adatkezelési tájékoztatóban</a>.</p>' +
      '<div class="ck-opts" hidden>' +
      '<label><input type="checkbox" checked disabled><span><b>Szükséges</b>Az oldal működéséhez és a döntésed megjegyzéséhez. Mindig aktív.</span></label>' +
      '<label><input type="checkbox" data-opt="stats"><span><b>Statisztika</b>Névtelen látogatottságmérés (GoatCounter, sütimentes).</span></label>' +
      '<label><input type="checkbox" data-opt="marketing"><span><b>Marketing</b>Meta Pixel: hirdetésmérés és -célzás a Facebookon és az Instagramon (sütiket használ).</span></label>' +
      '</div>' +
      '<div class="ck-b"><button type="button" class="pri" data-ck="all">Mindet elfogadom</button><button type="button" data-ck="necessary">Csak a szükségesek</button><button type="button" data-ck="settings">Beállítások</button></div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (!b) return;
      var a = b.getAttribute('data-ck'), opts = box.querySelector('.ck-opts');
      if (a === 'settings') {
        if (opts.hidden) { opts.hidden = false; b.textContent = 'Mentés'; b.className = 'pri'; box.querySelector('[data-ck="all"]').className = ''; return; }
        commit({ stats: box.querySelector('[data-opt="stats"]').checked, marketing: box.querySelector('[data-opt="marketing"]').checked });
      } else if (a === 'all') commit({ stats: true, marketing: true });
      else commit({ stats: false, marketing: false });
    });
  }
  function commit(next) {
    var prev = state; state = next; write(next); box.hidden = true; apply(prev, next);
  }
  function open() {
    if (!box) build();
    var s = state || { stats: false, marketing: false };
    box.querySelector('[data-opt="stats"]').checked = !!s.stats;
    box.querySelector('[data-opt="marketing"]').checked = !!s.marketing;
    var opts = box.querySelector('.ck-opts'); opts.hidden = false;
    var sb = box.querySelector('[data-ck="settings"]'); sb.textContent = 'Mentés'; sb.className = 'pri';
    box.querySelector('[data-ck="all"]').className = '';
    box.hidden = false; sb.focus();
  }
  function init() {
    if (state) apply(null, state);
    else { build(); setTimeout(function () { box.hidden = false; }, 600); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cookie-settings]'); if (a) { e.preventDefault(); open(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
