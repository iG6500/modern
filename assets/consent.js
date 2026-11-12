/* Süti-hozzájárulás. Az oldal alapvetően nem használ követő sütit.
   A látogatottsági statisztika (GoatCounter, sütimentes) csak hozzájárulás után töltődik be. */
(function () {
  'use strict';
  var KEY = 'mk-consent', GC = 'https://modernkonstrukt.goatcounter.com/count', GCSRC = '//gc.zgo.at/count.js';
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var loaded = false, box;
  var CSS = '.ck{position:fixed;left:16px;bottom:16px;z-index:90;max-width:420px;background:#111311;color:#E4E7E5;padding:20px 22px;border-radius:2px;box-shadow:0 18px 50px rgba(0,0,0,.35);font-family:"Inter Tight","Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.5}.ck[hidden]{display:none}.ck h2{margin:0 0 6px;font-size:16px;font-weight:700;color:#fff}.ck p{margin:0 0 14px;color:#E4E7E5}.ck a{color:#9CC077}.ck-b{display:flex;gap:8px;flex-wrap:wrap}.ck-b button{min-height:44px;padding:0 16px;border:1px solid #5F6461;background:transparent;color:#fff;font:600 13px/1 "Inter Tight",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.ck-b button.pri{background:#3F7A2A;border-color:#3F7A2A}.ck-b button:hover{border-color:#9CC077}@media (max-width:720px){.ck{left:8px;right:8px;bottom:66px;max-width:none}}';
  function loadStats() {
    if (loaded) return; loaded = true;
    var s = document.createElement('script');
    s.async = true; s.setAttribute('data-goatcounter', GC); s.src = GCSRC;
    document.head.appendChild(s);
  }
  function build() {
    if (!document.getElementById('ck-css')) { var st = document.createElement('style'); st.id = 'ck-css'; st.textContent = CSS; document.head.appendChild(st); }
    box = document.createElement('div');
    box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'ckT'); box.hidden = true;
    box.innerHTML = '<h2 id="ckT">Süti-beállítások</h2>' +
      '<p>Az oldal működéséhez nincs szükség követő sütikre. Névtelen látogatottsági statisztikát (GoatCounter) csak a hozzájárulásoddal mérünk. Részletek az <a href="adatkezelesi-tajekoztato.html">adatkezelési tájékoztatóban</a>.</p>' +
      '<div class="ck-b"><button type="button" class="pri" data-ck="all">Elfogadom</button><button type="button" data-ck="necessary">Csak a szükségesek</button></div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (!b) return;
      var v = b.getAttribute('data-ck'); set(v); box.hidden = true;
      if (v === 'all') loadStats();
    });
  }
  function open() { if (!box) build(); box.hidden = false; var b = box.querySelector('button'); if (b) b.focus(); }
  function init() {
    var c = get();
    if (c === 'all') loadStats();
    else if (!c) { build(); setTimeout(function () { box.hidden = false; }, 600); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cookie-settings]'); if (a) { e.preventDefault(); open(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
